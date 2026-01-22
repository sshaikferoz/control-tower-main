import { ChartWidgetConfig } from './ChartConfig.types';

export function transformBexToChart(
    response: any,
    config: ChartWidgetConfig
) {
    const {
        chartData,
        headerText,
        charUniqueValues,
    } = response;

    const { xAxisKey, groupByKey, measures, seriesConfig, colorPalette } = config;

    // ---------- SERIES ----------
    let series: any[] = [];

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
            type: s.type,
            lineType: s.lineType,
            barOpacity: s.barOpacity,
            barEdgeColor: s.barEdgeColor,
            barEdgeWidth: s.barEdgeWidth,
        }));
    } else {
        // Fallback to auto-generating series from measures
        const defaultColors = colorPalette || ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8'];

        // Same note as above: don't expand measures by group here.
        series = measures.map((m, index) => ({
            name: headerText[m] || m,
            dataKey: m,
            color: defaultColors[index % defaultColors.length],
        }));
    }

    // ---------- DATA ----------
    let data = [];

    // Always return raw rows. MultiChart can handle grouping via `groupByField`.
    data = chartData.map((row: any) => ({
        name: row[xAxisKey],
        ...row,
    }));

    return {
        data,
        series,
        groupByField: groupByKey,
    };
}




