import { ChartWidgetConfig } from './ChartConfig.types';

type MultiChartDatum = {
    name: string;
    label?: string;
    groupKey?: string;
    [key: string]: string | number | undefined;
};

type MultiChartSeries = {
    name: string;
    dataKey: string;
    color: string;
    type?: 'line' | 'bar' | 'area';
    lineType?: 'solid' | 'dashed' | 'dotted' | 'dashDot';
    hide?: boolean;
    barOpacity?: number;
    barEdgeColor?: string;
    barEdgeWidth?: number;
};

type TransformBexToChartResult = {
    data: MultiChartDatum[];
    series: MultiChartSeries[];
    groupByField?: string;
    xAxisLabel?: string;
    charKeys?: string[];
    headerText: Record<string, string>;
};

export function transformBexToChart(
    response: any,
    config: ChartWidgetConfig
): TransformBexToChartResult {
    const safeResponse = response && typeof response === 'object' ? response : {}
    const {
        chartData,
        headerText,
    } = safeResponse as Record<string, unknown>;

    const {
        xAxisKey,
        groupByKey,
        measures,
        seriesConfig,
        colorPalette,
        chartType,
        charKeys: configCharKeys,
    } = config;

    // ---------- SERIES ----------
    let series: MultiChartSeries[] = [];

    // Use seriesConfig if available, otherwise generate from measures
    if (seriesConfig?.series && seriesConfig.series.length > 0) {
        /**
         * NOTE:
         * Group-expansion in this transform (appending group suffixes to measures + merging by x-axis)
         * is intentionally DISABLED to avoid conflicts with MultiChart’s own grouping implementation.
         *
         * We still return `groupByField: groupByKey` so MultiChart can group using the raw rows.
         */
        series = seriesConfig.series.map((s) => ({
            name: s.name,
            dataKey: s.dataKey,
            color: s.color,
            type: s.type === 'line' || s.type === 'bar' || s.type === 'area' ? s.type : undefined,
            lineType: s.lineType,
            barOpacity: s.barOpacity,
            barEdgeColor: s.barEdgeColor,
            barEdgeWidth: s.barEdgeWidth,
        }));
    } else {
        // Fallback to auto-generating series from measures
        const defaultColors = colorPalette || ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8'];
        const safeMeasures = Array.isArray(measures) ? measures : [];

        // Same note as above: don't expand measures by group here.
        series = safeMeasures.map((m, index) => ({
            name: (headerText as Record<string, string> | undefined)?.[m] || m,
            dataKey: m,
            color: defaultColors[index % defaultColors.length],
        }));
    }

    // ---------- DATA ----------
    let data: MultiChartDatum[] = [];
    const safeChartData = Array.isArray(chartData) ? chartData : [];
    const safeHeaderText: Record<string, string> =
        headerText && typeof headerText === 'object'
            ? Object.fromEntries(
                Object.entries(headerText as Record<string, unknown>).filter(
                    ([, value]) => typeof value === 'string'
                )
            ) as Record<string, string>
            : {};

    // Always return raw rows. MultiChart can handle grouping via `groupByField`.
    data = safeChartData.map((row: unknown) => {
        const safeRow = row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
        const normalizedRow: MultiChartDatum = {
            name: xAxisKey ? String(safeRow[xAxisKey] ?? '') : '',
        };

        Object.entries(safeRow).forEach(([key, value]) => {
            if (typeof value === 'string' || typeof value === 'number' || value === undefined) {
                normalizedRow[key] = value;
            } else if (value === null) {
                normalizedRow[key] = undefined;
            }
        });

        return normalizedRow;
    });

    // Resolve char keys for table configuration:
    // - Only expose charKeys when the chart type is 'table'
    // - Only use the user-selected keys from config.charKeys
    const resolvedCharKeys =
        chartType === 'table'
            ? (configCharKeys ?? [])
            : undefined;
    return {
        data,
        series,
        groupByField: groupByKey,
        xAxisLabel: safeHeaderText[xAxisKey] || xAxisKey,
        ...(chartType === 'table' && { charKeys: resolvedCharKeys }),
        headerText: safeHeaderText,
    };
}




