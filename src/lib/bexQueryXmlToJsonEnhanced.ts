import { XMLParser } from 'fast-xml-parser'

// Type definitions
interface MetadataItem {
    SCRTEXT_L: string
    TYPE: string
    FIELDNAME: string
    ZBW_QUERY_OUTPUT_METADATA?: {
        SCRTEXT_L: string
    }
}

interface ParsedMetadata {
    description?: string
    load_date?: string
}

interface ParsedValues {
    metadata?: ParsedMetadata
    META: {
        ZBW_QUERY_OUTPUT_METADATA: MetadataItem[]
    }
    OUTPUT: {
        item: Array<Record<string, unknown>>
    }
}

interface ParsedAbap {
    error?: string
    values: ParsedValues
}

interface ParsedResult {
    abap: ParsedAbap
}

interface HeaderItem {
    keyField: string | null
    textField: string | null
    desc: string | null
    type: string | null
}

interface ParseSuccessResult {
    header: HeaderItem[]
    chartData: Array<Record<string, unknown>>
    headerKeys: string[]
    headerText: Record<string, string>
    keyFigureKeys: string[]
    charKeys: string[]
    charUniqueValues: Record<string, unknown[]>
    metadata: {
        description: string
        loadDate?: Date
    }
}

interface ParseErrorResult {
    error: string
}

export type ParseResult = ParseSuccessResult | ParseErrorResult

const options = {
    ignoreDeclaration: true,
    ignorePiTags: true,
    ignoreAttributes: true,
    removeNSPrefix: true,
    isArray: (arg: string): boolean => arg === 'item',
}
const parser = new XMLParser(options)

export default function parseBExQueryXML(xml: string): ParseResult {
    let error: string | null = null
    let result: ParsedResult | Record<string, never> = {}
    try {
        result = parser.parse(xml) as ParsedResult
        error = result.abap?.error || null
    } catch (e) {
        if (e && typeof e === 'object' && 'toString' in e) {
            error = e.toString()
        } else if (typeof e === 'string') {
            error = e
        } else {
            error = 'unknown error'
        }
    }
    if (error) return { error }

    if (!result.abap?.values) {
        return { error: 'Invalid XML structure: missing abap.values' }
    }

    let headerKeys: string[] = []
    let headerKeysExpanded: string[] = []
    let header: HeaderItem[] = []

    const { metadata = {} } = result.abap.values
    const { description = '', load_date = '' } = metadata
    let loadDate: Date | undefined
    if (load_date && new Date(load_date).toString().match(/invalid/i) === null) {
        loadDate = new Date(load_date)
    }

    const metadataArray = result.abap.values.META?.ZBW_QUERY_OUTPUT_METADATA || []

    metadataArray.forEach((i: MetadataItem) => {
        let headerItem: HeaderItem = { keyField: null, textField: null, desc: null, type: null }
        const key = i.SCRTEXT_L.replace(/[\W]/g, '')
        headerItem.desc = i.SCRTEXT_L
        headerItem.type = i.TYPE

        if (headerKeys.includes(key)) {
            headerKeys.push(i.FIELDNAME)
            headerItem.textField = i.FIELDNAME
        } else {
            headerKeys.push(key)
            headerItem.textField = key
        }

        if (i.ZBW_QUERY_OUTPUT_METADATA && i.ZBW_QUERY_OUTPUT_METADATA.SCRTEXT_L) {
            const expandedKey = `${i.ZBW_QUERY_OUTPUT_METADATA.SCRTEXT_L.replace(/[\W]/g, '')}Key`
            headerKeysExpanded.push(expandedKey)
            headerItem.keyField = expandedKey
        }
        header.push(headerItem)
    })

    const keyFigureKeys: string[] = metadataArray
        .map((i: MetadataItem, ind: number) => {
            if (i.TYPE === 'KF') return headerKeys[ind]
            return undefined
        })
        .filter((key): key is string => Boolean(key))

    let headerText: Record<string, string> = metadataArray.reduce(
        (cum: Record<string, string>, cur: MetadataItem, ind: number) => {
            return { ...cum, [headerKeys[ind]]: cur.SCRTEXT_L }
        },
        {}
    )

    //merge expanded keys into headerKeys
    headerKeysExpanded.forEach((extraKey: string) => {
        const found = headerKeys.findIndex((key: string) => extraKey?.startsWith(key))
        if (found !== -1) {
            headerKeys = [
                ...headerKeys.slice(0, found),
                extraKey,
                ...headerKeys.slice(found),
            ]
        }
    })

    // expand the text header also
    headerKeysExpanded.forEach((extraKey: string) => {
        const found = Object.keys(headerText).find((key: string) => extraKey?.startsWith(key))
        if (found) headerText = { ...headerText, [extraKey]: `${headerText[found]} Key` }
    })

    const outputItems = result.abap.values.OUTPUT?.item || []
    const chartData: Array<Record<string, unknown>> = outputItems
        .map((item: Record<string, unknown>) => {
            const values = Object.values(item)
            if (values.join('').includes('Overall Result')) return undefined
            return headerKeys.reduce((cum: Record<string, unknown>, cur: string, ind: number) => {
                cum[cur] = values[ind]
                return cum
            }, {})
        })
        .filter((item): item is Record<string, unknown> => Boolean(item))

    let charKeys: string[] = metadataArray
        .map((i: MetadataItem, ind: number) => {
            if (i.TYPE !== 'KF') {
                const filteredKeys = headerKeys.filter((k: string) => !headerKeysExpanded.includes(k))
                return filteredKeys[ind]
            }
            return undefined
        })
        .filter((key): key is string => Boolean(key))
        .sort((a: string, z: string) => {
            const uniqueCountForA = [...new Set(chartData.map((i: Record<string, unknown>) => i[a]))]
            const uniqueCountForZ = [...new Set(chartData.map((i: Record<string, unknown>) => i[z]))]
            const aCount = uniqueCountForA?.length || 0
            const zCount = uniqueCountForZ.length || 0
            return zCount - aCount
        })

    // expand the charKeys also
    headerKeysExpanded.forEach((extraKey: string) => {
        const found = charKeys.findIndex((key: string) => extraKey?.startsWith(key))
        if (found !== -1) {
            charKeys = [
                ...charKeys.slice(0, found),
                extraKey,
                ...charKeys.slice(found),
            ]
        }
    })

    const charUniqueValues: Record<string, unknown[]> = charKeys
        .map((i: string, ind: number) => {
            if (ind === 0) return undefined
            return { [i]: [...new Set(chartData.map((l: Record<string, unknown>) => l[i]))] }
        })
        .reduce((cum: Record<string, unknown[]>, cur: Record<string, unknown[]> | undefined) => {
            if (!cur || typeof cur !== 'object') return cum
            return { ...cum, ...cur }
        }, {})


    console.log('JSON', {
        header,
        chartData,
        headerKeys,
        headerText,
        keyFigureKeys,
        charKeys,
        charUniqueValues,
        metadata: { description, loadDate },
    }
    )
    return {
        header,
        chartData,
        headerKeys,
        headerText,
        keyFigureKeys,
        charKeys,
        charUniqueValues,
        metadata: { description, loadDate },
    }
}
