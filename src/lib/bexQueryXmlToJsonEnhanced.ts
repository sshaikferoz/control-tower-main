import { XMLParser } from 'fast-xml-parser';

const options = {
    ignoreDeclaration: true,
    ignorePiTags: true,
    ignoreAttributes: true,
    removeNSPrefix: true,
    isArray: (arg: string) => arg === 'item',
};
const parser = new XMLParser(options);

interface Metadata {
    description: string;
    loadDate?: Date;
}

interface ParsedResult {
    chartData: Record<string, any>[];
    headerKeys: string[];
    headerText: Record<string, string>;
    keyFigureKeys: string[];
    charKeys: string[];
    charUniqueValues: Record<string, any>;
    metadata: Metadata;
    error?: string;
}

export default function parseBExQueryXML(xml: string): ParsedResult {
    let error: string | null = null;
    let result: any = {};
    try {
        result = parser.parse(xml);
        error = result.abap?.error;
    } catch (e) {
        error = e instanceof Error ? e.toString() : 'unknown error';
    }
    if (error) return { error } as ParsedResult;

    let headerKeys: string[] = [];
    const headerKeysExpanded: string[] = [];

    const { metadata = {} } = result.abap.values;
    const { description = '', load_date = '' } = metadata;
    let loadDate: Date | undefined;
    if (!isNaN(Date.parse(load_date))) loadDate = new Date(load_date);

    result.abap.values.META.ZBW_QUERY_OUTPUT_METADATA.forEach((i: any) => {
        const key = i.SCRTEXT_L.replace(/\W/g, '');

        if (headerKeys.includes(key)) headerKeys.push(i.FIELDNAME);
        else headerKeys.push(key);

        if (i.ZBW_QUERY_OUTPUT_METADATA?.SCRTEXT_L) {
            headerKeysExpanded.push(`${i.ZBW_QUERY_OUTPUT_METADATA.SCRTEXT_L.replace(/\W/g, '')}Key`);
        }
    });

    const keyFigureKeys = result.abap.values.META.ZBW_QUERY_OUTPUT_METADATA.map(
        (i: any, ind: number) => (i.TYPE === 'KF' ? headerKeys[ind] : null)
    ).filter(Boolean) as string[];

    let headerText = result.abap.values.META.ZBW_QUERY_OUTPUT_METADATA.reduce(
        (cum: Record<string, string>, cur: any, ind: number) => {
            return { ...cum, [headerKeys[ind]]: cur.SCRTEXT_L };
        },
        {}
    );

    headerKeysExpanded.forEach((extraKey) => {
        const found = headerKeys.findIndex((key) => extraKey?.startsWith(key));
        headerKeys = [...headerKeys.slice(0, found), extraKey, ...headerKeys.slice(found)];
    });

    headerKeysExpanded.forEach((extraKey) => {
        const found = Object.keys(headerText).find((key) => extraKey?.startsWith(key));
        if (found) headerText = { ...headerText, [extraKey]: `${headerText[found]} Key` };
    });

    const chartData = result.abap.values.OUTPUT.item
        .map((item: any) => {
            const values = Object.values(item);
            if (values.join('').includes('Overall Result')) return null;
            return headerKeys.reduce((cum: Record<string, any>, cur: string, ind: number) => {
                cum[cur] = values[ind];
                return cum;
            }, {});
        })
        .filter(Boolean) as Record<string, any>[];

    let charKeys = result.abap.values.META.ZBW_QUERY_OUTPUT_METADATA.map((i: any, ind: number) => {
        if (i.TYPE !== 'KF') return headerKeys.filter((k) => !headerKeysExpanded.includes(k))[ind];
        return null;
    }).filter(Boolean) as string[];

    charKeys.sort((a, z) => {
        const uniqueCountForA = new Set(chartData.map((i) => i[a])).size;
        const uniqueCountForZ = new Set(chartData.map((i) => i[z])).size;
        return uniqueCountForZ - uniqueCountForA;
    });

    headerKeysExpanded.forEach((extraKey) => {
        const found = charKeys.findIndex((key) => extraKey?.startsWith(key));
        charKeys = [...charKeys.slice(0, found), extraKey, ...charKeys.slice(found)];
    });

    const charUniqueValues = charKeys
        .map((i, ind) => {
            if (ind === 0) return null;
            return { [i]: [...new Set(chartData.map((l) => l[i]))] };
        })
        .reduce((cum: Record<string, any>, cur) => {
            if (!cur || typeof cur !== 'object') return cum;
            return { ...cum, ...cur };
        }, {});

    return {
        chartData,
        headerKeys,
        headerText,
        keyFigureKeys,
        charKeys,
        charUniqueValues,
        metadata: { description, loadDate },
    };
}
