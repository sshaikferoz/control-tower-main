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
        // Use configured series, but handle grouping if needed
        if (!groupByKey) {
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
            const groups = charUniqueValues[groupByKey] || [];
            const baseSeries = seriesConfig.series;

            groups.forEach((g: string) => {
                baseSeries.forEach((s) => {
                    const measureKey = s.dataKey;
                    series.push({
                        name: `${g} - ${s.name}`,
                        dataKey: `${measureKey}${g}`,
                        color: s.color,
                        type: s.type,
                        lineType: s.lineType,
                        barOpacity: s.barOpacity,
                        barEdgeColor: s.barEdgeColor,
                        barEdgeWidth: s.barEdgeWidth,
                    });
                });
            });
        }
    } else {
        // Fallback to auto-generating series from measures
        const defaultColors = colorPalette || ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8'];

        if (!groupByKey) {
            series = measures.map((m, index) => ({
                name: headerText[m] || m,
                dataKey: m,
                color: defaultColors[index % defaultColors.length],
            }));
        } else {
            const groups = charUniqueValues[groupByKey] || [];

            groups.forEach((g: string) => {
                measures.forEach((m, index) => {
                    series.push({
                        name: `${g} - ${headerText[m] || m}`,
                        dataKey: `${m}${g}`,
                        color: defaultColors[index % defaultColors.length],
                    });
                });
            });
        }
    }

    // ---------- DATA ----------
    let data = [];

    if (!groupByKey) {
        data = chartData.map((row: any) => ({
            name: row[xAxisKey],
            ...row,
        }));
    } else {
        // Group data by groupKey first, then format key figures
        const groupedData: Record<string, any[]> = {};

        chartData.forEach((row: any) => {
            const groupKey = row[groupByKey];
            if (!groupKey) return;

            if (!groupedData[groupKey]) {
                groupedData[groupKey] = [];
            }

            // Format key figures by appending groupKey (matching reference pattern)
            const formattedRow: any = { ...row };
            measures.forEach((m) => {
                if (row[m] !== undefined) {
                    formattedRow[`${m}${groupKey}`] = row[m] === '' || row[m] == null ? null : Number(row[m]);
                }
            });

            groupedData[groupKey].push(formattedRow);
        });

        // Flatten and group by x-axis, then merge
        const allFormattedRows = Object.values(groupedData).flat();
        const groupedByXAxis: Record<string, any[]> = {};

        allFormattedRows.forEach((row: any) => {
            const xValue = row[xAxisKey];
            if (!xValue) return;

            if (!groupedByXAxis[xValue]) {
                groupedByXAxis[xValue] = [];
            }
            groupedByXAxis[xValue].push(row);
        });

        // Merge all groups for each x-axis value
        data = Object.keys(groupedByXAxis).map((xValue) => {
            const rows = groupedByXAxis[xValue];
            const merged: any = { name: xValue };

            rows.forEach((row: any) => {
                Object.keys(row).forEach((key) => {
                    if (key !== xAxisKey) {
                        // Merge: use new value if current is undefined, otherwise keep existing
                        if (merged[key] === undefined) {
                            merged[key] = row[key];
                        } else if (row[key] !== undefined && row[key] !== null) {
                            merged[key] = row[key];
                        }
                    }
                });
            });

            return merged;
        });
    }

    return {
        data,
        series,
        groupByField: groupByKey,
    };
}
