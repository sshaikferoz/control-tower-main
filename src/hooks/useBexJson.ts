import axios from 'redaxios'
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import bexToJsonFastParser, { ParseResult as EnhancedParseResult } from '@/lib/bexQueryXmlToJsonEnhanced'
import { parseXMLToJson } from '@/lib/bexQueryXmlToJson'

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

// Options for the fetch function
interface BexQueryOptions {
    parser?: 'new' | 'old'
    variables?: string // SAP BW variables string (e.g., "VAR_NAME_1=VAR1&VAR_OPERATOR_1=EQ&VAR_VALUE_EXT_1=VALUE1")
    [key: string]: unknown
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
    let url = process.env.NODE_ENV === 'development'
        ? `/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${queryName}`
        : `/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${queryName}`

    // Append variables if provided
    if (options.variables) {
        url += `&variables=${encodeURIComponent(options.variables)}`
    }

    try {
        const { data } = await axios.get<string>(url)

        if (options.parser === 'new') {
            return bexToJsonFastParser(data)
        }
        return parseXMLToJson(data)
    } catch (err) {
        // If the query is not executed or responds with an error,
        // return an empty result so downstream logic does not break.
        // We use the "old" parser shape for the fallback because it is the loosest.
        const message =
            err instanceof Error ? err.message : 'Failed to execute BEx query'

        return {
            header: [],
            chartData: [],
            error: message,
        }
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
    const { parser, variables, ...queryOptions } = options

    return useQuery<BexQueryResult, Error>({
        queryKey: ['Bex', queryName, parser, variables],
        queryFn: () => fetchBexQuery(queryName, { parser, variables }),
        ...queryOptions,
    })
}

