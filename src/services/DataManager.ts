import { TransformedData } from '@/helpers/types';
import { parseXMLToJson } from '@/lib/bexQueryXmlToJson';
import { transformFormMetadata } from '@/helpers/transformHelpers';

export class DataManager {
    private static instance: DataManager;
    private cache: Map<string, { data: TransformedData; timestamp: number }> = new Map();
    private pendingRequests: Map<string, Promise<TransformedData>> = new Map();
    private subscribers: Map<string, Set<(data: TransformedData | null) => void>> = new Map();

    static getInstance(): DataManager {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }
        return DataManager.instance;
    }

    private constructor() { }

    subscribe(reportName: string, callback: (data: TransformedData | null) => void) {
        if (!this.subscribers.has(reportName)) {
            this.subscribers.set(reportName, new Set());
        }
        this.subscribers.get(reportName)!.add(callback);

        return () => {
            const subs = this.subscribers.get(reportName);
            if (subs) {
                subs.delete(callback);
                if (subs.size === 0) {
                    this.subscribers.delete(reportName);
                }
            }
        };
    }

    private notifySubscribers(reportName: string, data: TransformedData | null) {
        const subs = this.subscribers.get(reportName);
        if (subs) {
            subs.forEach((callback) => callback(data));
        }
    }

    async getData(reportName: string): Promise<TransformedData> {
        // Check cache first (with 5 minute TTL)
        const cached = this.cache.get(reportName);
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
            return cached.data;
        }

        // Check if request is already pending
        const pending = this.pendingRequests.get(reportName);
        if (pending) {
            return pending;
        }

        // Create new request
        const request = this.fetchData(reportName);
        this.pendingRequests.set(reportName, request);

        try {
            const data = await request;
            this.cache.set(reportName, { data, timestamp: Date.now() });
            this.notifySubscribers(reportName, data);
            return data;
        } catch (error) {
            this.notifySubscribers(reportName, null);
            throw error;
        } finally {
            this.pendingRequests.delete(reportName);
        }
    }

    private async fetchData(reportName: string): Promise<TransformedData> {
        const response = await fetch(
            process.env.NODE_ENV === 'development' && process.env.USE_SAP_DB !== 'true'
                ? `/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${reportName}`
                : `${process.env.PROXY_BASE_URL_SAP_DB || ''}/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${reportName}`
        );
        const data = await response.text();
        const parsedJSON = parseXMLToJson(data);
        return transformFormMetadata(parsedJSON);
    }

    clearCache() {
        this.cache.clear();
        this.pendingRequests.clear();
    }
}
