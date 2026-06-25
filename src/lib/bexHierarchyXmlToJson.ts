import { XMLParser } from 'fast-xml-parser'

interface HierarchyParseResult {
    header: Array<{
        type?: string
        fieldName?: string
        label?: string
    }>
    chartData: Array<Record<string, unknown>>
}

const parser = new XMLParser({
    ignoreDeclaration: true,
    ignorePiTags: true,
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
    // Keep all values as strings. SAP node keys are codes (often all-digits with
    // leading zeros, e.g. "00000000000000000000999930002946"); number parsing
    // would drop the leading zeros and lose precision on long keys.
    parseTagValue: false,
    parseAttributeValue: false,
})

function stripXsltPrefix(value: string): string {
    if (value.startsWith('XSLT_0')) return value.replace(/^XSLT_0/, '')
    if (value.startsWith('XSLT_')) return value.replace(/^XSLT_/, '')
    return value
}

function asArray<T>(value: T | T[] | undefined): T[] {
    if (value == null) return []
    return Array.isArray(value) ? value : [value]
}

function collectHeaderColumns(column: unknown, out: HierarchyParseResult['header']) {
    if (!column || typeof column !== 'object') return
    const colObj = column as Record<string, unknown>
    const techNameRaw = colObj.techname
    const captionRaw = colObj.caption
    const typeRaw = colObj['@_type']

    if (typeof techNameRaw === 'string') {
        out.push({
            type: typeof typeRaw === 'string' ? typeRaw : undefined,
            fieldName: stripXsltPrefix(techNameRaw),
            label: typeof captionRaw === 'string' ? captionRaw : undefined,
        })
    } else if (techNameRaw && typeof techNameRaw === 'object') {
        const techObj = techNameRaw as Record<string, unknown>
        const fieldName = typeof techObj['#text'] === 'string' ? techObj['#text'] : ''
        if (fieldName) {
            out.push({
                type: typeof typeRaw === 'string' ? typeRaw : undefined,
                fieldName: stripXsltPrefix(fieldName),
                label: typeof captionRaw === 'string' ? captionRaw : undefined,
            })
        }
    }

    asArray(colObj.column).forEach((child) => collectHeaderColumns(child, out))
}

function flattenNode(nodeName: string, nodeValue: unknown, target: Record<string, unknown>) {
    const cleanName = stripXsltPrefix(nodeName)
    if (nodeValue == null) return

    if (typeof nodeValue !== 'object') {
        target[cleanName] = String(nodeValue)
        return
    }

    const obj = nodeValue as Record<string, unknown>
    const textValue = obj['#text']
    if (textValue != null && typeof textValue !== 'object' && String(textValue).trim() !== '') {
        target[cleanName] = String(textValue)
    } else if (typeof obj['@_txt'] === 'string' && (obj['@_txt'] as string).trim() !== '') {
        // BEx hierarchy node elements (e.g. <XSLT_COSTCENTER key="0COSTCENTER"
        // txt="SAUDI ARAMCO" ...>) carry their caption in the `txt` attribute
        // rather than as text content. Use it so the node label is populated.
        target[cleanName] = obj['@_txt'] as string
    }

    // Preserve the node's hierarchy InfoObject name (e.g. "0COSTCENTER") so the
    // filter can emit it as VAR_NODE_IOBJNM when building a node restriction.
    if (typeof obj['@_key'] === 'string' && (obj['@_key'] as string).trim() !== '') {
        target[`${cleanName}_NODE_IOBJNM`] = obj['@_key'] as string
    }

    Object.entries(obj).forEach(([childKey, childValue]) => {
        if (childKey === '#text' || childKey.startsWith('@_')) return
        const children = asArray(childValue)
        if (children.length === 1) {
            flattenNode(childKey, children[0], target)
            return
        }
        children.forEach((item, index) => flattenNode(`${childKey}_${index + 1}`, item, target))
    })
}

function toBoolean(value: unknown): boolean {
    return String(value).toLowerCase() === 'true'
}

function collectRowsDepthFirst(rowNode: unknown, out: Array<Record<string, unknown>>) {
    if (!rowNode || typeof rowNode !== 'object') return

    const row = rowNode as Record<string, unknown>
    const output: Record<string, unknown> = {
        __hierarchyLevel: Number(row['@_level'] || 0),
        __hasChildren: toBoolean(row['@_hasChildren']),
        __drill: row['@_drill'] || '',
        __index: Number(row['@_index'] || 0),
    }

    Object.entries(row).forEach(([key, value]) => {
        if (key.startsWith('@_') || key === 'row') return
        flattenNode(key, value, output)
    })

    out.push(output)

    asArray(row.row).forEach((childRow) => {
        collectRowsDepthFirst(childRow, out)
    })
}

export function parseHierarchyXMLToJson(xmlString: string): HierarchyParseResult {
    const parsed = parser.parse(xmlString) as any
    const report = parsed?.report || {}

    const header: HierarchyParseResult['header'] = []
    const rootHeaderColumn = report?.header?.column
    if (rootHeaderColumn) {
        collectHeaderColumns(rootHeaderColumn, header)
    }

    const rows = asArray(report?.data?.row)
    const chartData: Array<Record<string, unknown>> = []
    rows.forEach((row) => {
        collectRowsDepthFirst(row, chartData)
    })

    return { header, chartData }
}

