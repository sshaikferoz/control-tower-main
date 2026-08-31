import axios from 'redaxios'
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import bexToJsonFastParser, { ParseResult as EnhancedParseResult } from '@/lib/bexQueryXmlToJsonEnhanced'
import { parseXMLToJson } from '@/lib/bexQueryXmlToJson'
import { parseHierarchyXMLToJson } from '@/lib/bexHierarchyXmlToJson'

// Type for the old parser result
interface OldParserResult {
    header?: Array<{
        type?: string
        fieldName?: string
        label?: string
        axisType?: string
        displayStyle?: string
    }>
    chartData?: Array<Record<string, unknown>>
    error?: string
}

// Union type for all possible parser results
type BexQueryResult = EnhancedParseResult | OldParserResult

// Server-side paging window for table-type queries. When provided, the request
// asks the backend for a single page (num_records per page_no) and to return the
// total record count via <PAGING_INFO>.
export interface BexPagination {
    numRecords: number // Records per page (num_records); defaults to 20 upstream
    pageNo: number // 1-based page index (page_no)
}

// Options for the fetch function
interface BexQueryOptions {
    parser?: 'new' | 'old'
    variables?: string // SAP BW variables string (e.g., "VAR_NAME_1=VAR1&VAR_OPERATOR_1=EQ&VAR_VALUE_EXT_1=VALUE1")
    displayKey?: boolean // Appends display_key=X to include key metadata/columns
    hierarchy?: boolean
    pagination?: BexPagination // Appends num_records/page_no/title_grouping/paging for table paging
    [key: string]: unknown
}

const ABAP_ERROR_REGEX = /<(?:(?:\w+):)?error>([\s\S]*?)<\/(?:(?:\w+):)?error>/i

function buildFallbackResult(message: string): OldParserResult {
    return {
        header: [],
        chartData: [],
        error: message,
    }
}

function extractAbapError(xmlPayload: string): string | null {
    const match = xmlPayload.match(ABAP_ERROR_REGEX)
    if (!match || !match[1]) return null
    const normalized = match[1]
        .replace(/\s+/g, ' ')
        .trim()
    return normalized || 'Error returned by SAP data provider'
}

function normalizeParserResult(result: unknown): BexQueryResult {
    if (!result || typeof result !== 'object') {
        return buildFallbackResult('Invalid query response format')
    }

    const maybeError = (result as { error?: unknown }).error
    if (typeof maybeError === 'string' && maybeError.trim().length > 0) {
        return buildFallbackResult(maybeError.trim())
    }

    const normalized = result as Record<string, unknown>
    const header = Array.isArray(normalized.header) ? normalized.header : []
    const chartData = Array.isArray(normalized.chartData) ? normalized.chartData : []

    return {
        ...normalized,
        header,
        chartData,
    } as BexQueryResult
}

// Type for react-query options (excluding queryFn and queryKey which we handle)
type UseBexJsonOptions = Omit<
    UseQueryOptions<BexQueryResult, Error>,
    'queryKey' | 'queryFn'
> &
    BexQueryOptions

/**
 * Fetches BEx query data from SAP and parses the XML response
 * @param queryName - Name of the BEx query to execute
 * @param options - Options including parser type ('new' or 'old') and react-query options
 * @returns Parsed query data
 */
const fetchBexQuery = async (
    queryName: string,
    options: BexQueryOptions = {}
): Promise<BexQueryResult> => {
    const useSapDb =
        process.env.NEXT_PUBLIC_USE_SAP_DB ?? process.env.USE_SAP_DB
    const sapDbBaseUrl =
        process.env.NEXT_PUBLIC_PROXY_BASE_URL_SAP_DB ??
        process.env.PROXY_BASE_URL_SAP_DB

    let url = process.env.NODE_ENV === 'development' && useSapDb !== 'true'
        ? `/api/sap/bc/bsp/sap/zbw_reporting/${options.hierarchy ? 'execute_report_oo_hier.htm' : 'execute_report_oo.htm'}?query=${queryName}`
        : `${sapDbBaseUrl || ''}/sap/bc/bsp/sap/zbw_reporting/${options.hierarchy ? 'execute_report_oo_hier.htm' : 'execute_report_oo.htm'}?query=${queryName}`

    // Append variables if provided
    if (options.variables) {
        url += `&variables=${encodeURIComponent(options.variables)}`
    }
    if (options.displayKey) {
        url += '&display_key=X'
    }
    // Server-side paging: request one page and ask for the total via PAGING_INFO.
    if (options.pagination) {
        const { numRecords, pageNo } = options.pagination
        url += `&num_records=${numRecords}&page_no=${pageNo}&title_grouping=x&paging=x`
    }

    try {
        const { data } = await axios.get<string>(url)

        const xmlPayload = typeof data === 'string' ? data : String(data ?? '')
        const abapError = extractAbapError(xmlPayload)
        if (abapError) {
            return buildFallbackResult(abapError)
        }

        let parsed: BexQueryResult
        if (options.hierarchy) {
            parsed = parseHierarchyXMLToJson(xmlPayload)
        } else if (options.parser === 'new') {
            parsed = bexToJsonFastParser(xmlPayload)
        } else {
            parsed = parseXMLToJson(xmlPayload)
        }

        return normalizeParserResult(parsed)
    } catch (err) {
        // If the query is not executed or responds with an error,
        // return an empty result so downstream logic does not break.
        // We use the "old" parser shape for the fallback because it is the loosest.
        const message =
            err instanceof Error ? err.message : 'Failed to execute BEx query'
        return buildFallbackResult(message)
    }
}

/**
 * React hook to fetch and parse BEx query data
 * @param queryName - Name of the BEx query to execute
 * @param options - Options including parser type and react-query configuration
 * @returns React Query result with parsed BEx data
 */
export default function useBexJson(
    queryName: string = '',
    options: UseBexJsonOptions = {}
): UseQueryResult<BexQueryResult, Error> {
    const { parser, variables, displayKey, hierarchy, pagination, ...queryOptions } = options

    return useQuery<BexQueryResult, Error>({
        queryKey: ['Bex', queryName, parser, variables, displayKey, hierarchy, pagination?.numRecords, pagination?.pageNo],
        queryFn: () => fetchBexQuery(queryName, { parser, variables, displayKey, hierarchy, pagination }),
        ...queryOptions,
    })
}

