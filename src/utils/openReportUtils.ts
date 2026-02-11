import { TargetReportConfig } from '@/helpers/types';
import { sapODataService } from '@/services/sapODataService';

/**
 * Resolve the URL for a target report (Bex, Lumira, WAD, Web Link).
 * Used by DashboardMenu and by search results to open menu item links.
 */
export async function buildReportUrl(targetReport: TargetReportConfig): Promise<string> {
    if (!targetReport?.technicalId) return '';

    switch (targetReport.type) {
        case 'Bex Query': {
            const bexUrl = await sapODataService.getServiceUrl('BexQuery');
            return bexUrl ? `${bexUrl}${targetReport.technicalId}` : '';
        }
        case 'Lumira': {
            const lumiraUrl = await sapODataService.getServiceUrl('Lumira');
            return lumiraUrl ? `${lumiraUrl}${targetReport.technicalId}` : '';
        }
        case 'WAD Template': {
            const wadUrl = await sapODataService.getServiceUrl('WADTemplate');
            return wadUrl ? `${wadUrl}${targetReport.technicalId}` : '';
        }
        case 'Web Link':
            return targetReport.technicalId;
        default:
            return '';
    }
}

/**
 * Open a target report in a new tab. Uses buildReportUrl for non-Web Link types.
 */
export async function openReport(targetReport: TargetReportConfig): Promise<void> {
    if (!targetReport?.technicalId) return;

    try {
        const url = await buildReportUrl(targetReport);
        if (!url && targetReport.type !== 'Web Link') {
            // eslint-disable-next-line no-alert
            alert('Unable to retrieve service URL for this report type.');
            return;
        }
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    } catch (error) {
        // eslint-disable-next-line no-console, no-alert
        console.error('Error opening report:', error);
        // eslint-disable-next-line no-alert
        alert('Error opening report. Please try again.');
    }
}
