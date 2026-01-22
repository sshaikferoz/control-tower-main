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
    const { data } = await axios.get<string>(
        process.env.NODE_ENV === 'development'
            ? `/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${queryName}`
            : `/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${queryName}`
    )


    if (options.parser === 'new') {
        return bexToJsonFastParser(data)
    }
    return parseXMLToJson(data)
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
    const { parser, ...queryOptions } = options

    return useQuery<BexQueryResult, Error>({
        queryKey: ['Bex', queryName, parser],
        queryFn: () => fetchBexQuery(queryName, { parser }),
        ...queryOptions,
    })
}

