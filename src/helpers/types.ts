import { FormatConfig } from './formatConfig';


export interface TypographyConfig {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    letterSpacing?: string;
    lineHeight?: string;
}

export interface WidgetTypographyConfig {
    title?: TypographyConfig;
    value?: TypographyConfig;
    label?: TypographyConfig;
    description?: TypographyConfig;
    name?: TypographyConfig;
    metric1?: TypographyConfig;
    metric2?: TypographyConfig;
    value1?: TypographyConfig;
    value2?: TypographyConfig;
    date?: TypographyConfig;
    header?: TypographyConfig;
    cell?: TypographyConfig;
    legend?: TypographyConfig;
    [key: string]: TypographyConfig | undefined;
}


export type FormTransformHeaders = {
    type: string;
    label: string;
    fieldName: string;
    axisType?: string; // Added for chart axis mapping
    displayStyle?: string;
};

export type FormTransformChartData = Record<string, any>;

export type FormTransformInputType = {
    header: FormTransformHeaders[];
    chartData: FormTransformChartData[];
};

export type TransformedData = {
    FormStructure: Record<string, any>;
    FormMetadata: Record<string, FormTransformHeaders>;
};

// Path notation for accessing nested objects
export type ObjectPath = string;

// Enhanced widget configuration types
export interface WidgetFieldMapping {
    fieldPath: ObjectPath; // Path to the data in FormStructure
    inputType: 'manual' | 'mapped';
    mappedConfig?: {
        chaField: string; // Character field (e.g., ZSCMCMD)
        chaValue: string; // The specific value (e.g., "OCTG")
        kfField: string; // Numeric/key figure field (e.g., VALUE002)
    };
    manualValue?: any; // For manually entered values
    formatConfig?: FormatConfig;
}

export interface Field {
    field: string;
    type: 'CHA' | 'KF';
}
export interface ChartAxisMapping {
    xAxis: {
        fields?: any;
        field: string;
        type: 'CHA' | 'KF';
    };
    yAxis: {
        // Now it accepts an array of axis objects
        fields?: any;
        field: string;
        type: 'CHA' | 'KF';
    };
}

export interface ComparisonChartAxisMapping {
    xAxis: {
        field: string;
        type: 'CHA' | 'KF';
    };
    yAxes: Array<{
        field: string;
        type: 'CHA' | 'KF';
        color: string;
    }>;
}

export interface TableColumnMapping {
    columns: {
        field: string;
        header: string;
        formatConfig?: FormatConfig; // NEW
    }[];
}

// Detailed Report Configuration Interface
export interface TargetReportConfig {
    type: 'Bex Query' | 'Lumira' | 'WAD Template' | 'Web Link';
    technicalId: string;
    name: string;
    description: string;
}

export interface WidgetMappingConfig {
    quadrantConfig: any;
    seriesConfig: any;
    reportName: string;
    targetReport?: TargetReportConfig; // Add this new property
    mappingType: 'simple' | 'chart' | 'table' | 'comparison-chart' | 'quadrant';
    fields: Record<string, WidgetFieldMapping>;
    chartConfig?: ChartAxisMapping;
    comparisonChartConfig?: ComparisonChartAxisMapping;
    tableConfig?: TableColumnMapping;
    chaField?: string;
    chaValue?: string;
    kfField?: string;
    endpoint?: string;
    entity?: string;
    typography?: WidgetTypographyConfig;
}

// Widget types for specific configurations
export type WidgetTypes =
    | 'one-metric'
    | 'one-metric-date'
    | 'two-metrics'
    | 'two-metrics-linechart'
    | 'two-metrics-piechart'
    | 'one-metric-table'
    | 'bar-chart'
    | 'stacked-bar-chart'
    | 'orders-line-chart'
    | 'dual-line-chart'
    | 'pie-chart-total'
    | 'quadrant-metrics'
    | 'loans-app-tray'
    | 'announcement'
    | 'pie-chart'
    | 'column-chart'
    | 'prediction-chart'
    | 'radar-chart'
    | 'multi-chart';

// Mapping configurations for each widget type
export const widgetConfigFields: Record<
    WidgetTypes,
    { field: string; type: string; path: ObjectPath }[]
> = {
    'one-metric': [
        { field: 'name', type: 'string', path: 'name' },
        { field: 'value', type: 'number', path: 'value' },
    ],
    'one-metric-date': [
        { field: 'name', type: 'string', path: 'name' },
        { field: 'value', type: 'number', path: 'value' },
        { field: 'date', type: 'string', path: 'date' },
    ],
    'two-metrics': [
        { field: 'metric1', type: 'string', path: 'metric1' },
        { field: 'value1', type: 'string', path: 'value1' },
        { field: 'metric2', type: 'string', path: 'metric2' },
        { field: 'value2', type: 'string', path: 'value2' },
    ],
    'two-metrics-linechart': [
        { field: 'chart_data', type: 'array', path: 'data.chart_data' },
        { field: 'chart_yaxis', type: 'string', path: 'data.chart_yaxis' },
        // {
        //     field: 'metric_value',
        //     type: 'string',
        //     path: 'data.metric_data.metric_value',
        // },
        // {
        //     field: 'metric_variance',
        //     type: 'string',
        //     path: 'data.metric_data.metric_variance',
        // },
        // {
        //     field: 'metric_label',
        //     type: 'string',
        //     path: 'data.metric_data.metric_label',
        // },
        { field: 'widget_name', type: 'string', path: 'data.widget_name' },
    ],
    'two-metrics-piechart': [
        { field: 'data', type: 'array', path: 'data' },
        { field: 'amount', type: 'string', path: 'metrics.amount' },
        { field: 'percentage', type: 'string', path: 'metrics.percentage' },
        { field: 'label', type: 'string', path: 'metrics.label' },
    ],
    'one-metric-table': [
        // { field: 'totalAmount', type: 'string', path: 'totalAmount' },
        { field: 'data', type: 'array', path: 'data' },
        { field: 'title', type: 'string', path: 'title' },
    ],
    'bar-chart': [
        { field: 'data', type: 'array', path: 'data' },
        { field: 'title', type: 'string', path: 'title' },
        // { field: 'variance', type: 'string', path: 'variance' },
    ],
    'stacked-bar-chart': [
        { field: 'data', type: 'array', path: 'data' },
        { field: 'title', type: 'string', path: 'title' },
        { field: 'totalValue', type: 'string', path: 'totalValue' },
        { field: 'series', type: 'array', path: 'series' },
    ],
    'orders-line-chart': [
        { field: 'data', type: 'array', path: 'data' },
        { field: 'title', type: 'string', path: 'title' },
        // { field: 'totalValue', type: 'string', path: 'totalValue' },
    ],
    'dual-line-chart': [
        { field: 'data', type: 'array', path: 'data' },
        { field: 'title', type: 'string', path: 'title' },
        { field: 'series', type: 'array', path: 'series' },
    ],
    'pie-chart-total': [
        { field: 'data', type: 'array', path: 'data' },
        { field: 'title', type: 'string', path: 'title' },
        { field: 'totalValue', type: 'string', path: 'totalValue' },
        // { field: 'subValue', type: 'string', path: 'subValue' },
        // { field: 'variance', type: 'string', path: 'variance' },
    ],
    'quadrant-metrics': [
        {
            field: 'metrics',
            type: 'array',
            path: 'metrics',
        },
    ],
    'loans-app-tray': [
        { field: 'menuItems', type: 'array', path: 'menuItems' },
        { field: 'chartData', type: 'array', path: 'chartData' },
        { field: 'menuItemConfigs', type: 'object', path: 'menuItemConfigs' }, // New field
        { field: 'chartDataConfig', type: 'object', path: 'chartDataConfig' }, // New field
    ],
    announcement: [
        { field: 'title', type: 'string', path: 'title' },
        { field: 'announcement', type: 'string', path: 'announcement' },
    ],
    'pie-chart': [
        { field: 'data', type: 'array', path: 'data' },
        { field: 'title', type: 'string', path: 'title' },
    ],
    'column-chart': [
        { field: 'data', type: 'array', path: 'data' },
        { field: 'title', type: 'string', path: 'title' },
        { field: 'totalValue', type: 'string', path: 'totalValue' },
        { field: 'series', type: 'array', path: 'series' },
    ],
    'prediction-chart': [
        { field: 'data', type: 'array', path: 'data' },
        { field: 'title', type: 'string', path: 'title' },
        { field: 'totalValue', type: 'string', path: 'totalValue' },
        { field: 'series', type: 'array', path: 'series' },
    ],
    'radar-chart': [
        { field: 'data', type: 'array', path: 'data' },
        { field: 'title', type: 'string', path: 'title' },
        { field: 'totalValue', type: 'string', path: 'totalValue' },
        { field: 'series', type: 'array', path: 'series' },
    ],
    'multi-chart': [
        { field: 'data', type: 'array', path: 'data' },
        { field: 'title', type: 'string', path: 'title' },
        { field: 'totalValue', type: 'string', path: 'totalValue' },
        { field: 'series', type: 'array', path: 'series' },
        { field: 'chartType', type: 'string', path: 'chartType' },
        { field: 'showLegend', type: 'boolean', path: 'showLegend' },
        { field: 'stacked', type: 'boolean', path: 'stacked' },
        { field: 'selectedLabels', type: 'array', path: 'selectedLabels' },
    ],
};

// Define type-safe interfaces matching the component props
export interface DataSeries {
    name: string;
    value: string | number;
    color: string;
}

export interface ChartDataPoint {
    period: string;
    [key: string]: string | number;
}

// Interface for chart generation options
export interface ChartGenerationOptions {
    excludeValues?: string[];
    colorPalette?: string[];
    dataLimits?: number;
    formatType?: 'currency' | 'percentage' | 'number' | 'none';
}

/**
 * Generate data for line charts
 *
 * @param formData - The transformed data from the backend
 * @param xAxisField - The field to use for X-axis (typically CHA field)
 * @param yAxisField - The field to use for Y-axis (typically KF field)
 * @param options - Additional options for chart generation
 * @returns Array of data points for a line chart
 */
export function generateLineChartData(
    formData: TransformedData,
    xAxisField: string,
    yAxisField: string,
    options: ChartGenerationOptions = {}
) {
    const { excludeValues = ['Overall Result'], dataLimits = 0 } = options;

    if (!formData.FormStructure[xAxisField]) {
        return [];
    }

    // Generate data points
    let chartData = Object.entries(formData.FormStructure[xAxisField])
        .filter(([chaValue]) => !excludeValues.includes(chaValue))
        .map(([chaValue, kfValues]: [string, any]) => {
            const value = kfValues[yAxisField];

            // Skip if value doesn't exist
            if (value === undefined || value === null || value === '') {
                return null;
            }

            return {
                date: chaValue, // For X-axis
                [yAxisField]: Number(value), // For Y-axis value
                unit: formData.FormMetadata[yAxisField]?.type || '%',
            };
        })
        .filter((item) => item !== null);

    // Sort data if it's date-based
    chartData.sort((a, b) => {
        // Try to parse as dates first
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            return dateA.getTime() - dateB.getTime();
        }

        // If not dates, try numeric comparison
        const numA = Number(a.date);
        const numB = Number(b.date);

        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }

        // Fall back to string comparison
        return a.date.localeCompare(b.date);
    });

    // Limit data points if requested
    if (dataLimits > 0 && chartData.length > dataLimits) {
        chartData = chartData.slice(0, dataLimits);
    }

    return chartData;
}

/**
 * Generate data for pie charts
 *
 * @param formData - The transformed data from the backend
 * @param chaField - The field to use for segments (typically CHA field)
 * @param kfField - The field to use for values (typically KF field)
 * @param options - Additional options for chart generation
 * @returns Array of data points for a pie chart
 */
export function generatePieChartData(
    formData: TransformedData,
    chaField: string,
    kfField: string,
    options: ChartGenerationOptions = {}
) {
    const {
        excludeValues = ['Overall Result'],
        colorPalette = ['#84BD00', '#E1553F', '#2D7FF9', '#FFA500', '#8E44AD', '#16A085'],
    } = options;

    if (!formData.FormStructure[chaField]) {
        return [];
    }

    // Find total value for percentage calculation
    let total = 0;
    Object.entries(formData.FormStructure[chaField])
        .filter(([chaValue]) => !excludeValues.includes(chaValue))
        .forEach(([chaValue, kfValues]: [string, any]) => {
            const value = kfValues[kfField];
            if (value !== undefined && value !== null && value !== '') {
                total += Number(value);
            }
        });

    // Generate pie segments
    const pieData = Object.entries(formData.FormStructure[chaField])
        .filter(([chaValue]) => !excludeValues.includes(chaValue))
        .map(([chaValue, kfValues]: [string, any], index) => {
            const value = kfValues[kfField];

            // Skip if value doesn't exist
            if (value === undefined || value === null || value === '') {
                return null;
            }

            const numValue = Number(value);
            const percentage = total > 0 ? (numValue / total) * 100 : 0;

            return {
                label: chaValue,
                value: numValue,
                percentage: percentage.toFixed(1),
                fill: colorPalette[index % colorPalette.length],
            };
        })
        .filter((item) => item !== null);

    return pieData;
}

/**
 * Generate data for comparison charts
 *
 * @param formData - The transformed data from the backend
 * @param xAxisField - The field to use for X-axis (typically CHA field)
 * @param yAxisFields - Array of fields to use for Y-axis with their configurations
 * @param options - Additional options for chart generation
 * @returns Array of data points for a comparison chart
 */
export function generateComparisonChartData(
    formData: TransformedData,
    xAxisField: string,
    yAxisFields: Array<{ field: string; type: string; color: string }>,
    options: ChartGenerationOptions = {}
) {
    const { excludeValues = ['Overall Result'] } = options;

    if (!formData.FormStructure[xAxisField]) {
        return [];
    }

    // Generate data points with multiple series
    const chartData = Object.entries(formData.FormStructure[xAxisField])
        .filter(([chaValue]) => !excludeValues.includes(chaValue))
        .map(([chaValue, kfValues]: [string, any]) => {
            const dataPoint: Record<string, any> = {
                period: chaValue, // X-axis label
            };

            // Add each y-axis field as a separate series in the data point
            yAxisFields.forEach((axis) => {
                const value = kfValues[axis.field];
                dataPoint[axis.field] = value !== undefined ? Number(value) : 0;
            });

            return dataPoint;
        });

    return chartData;
}

/**
 * Generate data for tables
 *
 * @param formData - The transformed data from the backend
 * @param chaField - The field to use for rows (typically CHA field)
 * @param kfFields - The fields to use for columns (typically KF fields)
 * @param options - Additional options for table generation
 * @returns Array of row objects for a table
 */
export function generateTableData(
    formData: TransformedData,
    chaField: string,
    kfFields: string[],
    columnHeaders: string[],
    options: ChartGenerationOptions = {}
) {
    const { excludeValues = ['Overall Result'], formatType = 'currency' } = options;

    if (!formData.FormStructure[chaField]) {
        return [];
    }

    // Generate table rows
    const tableData = Object.entries(formData.FormStructure[chaField])
        .filter(([chaValue]) => !excludeValues.includes(chaValue))
        .map(([chaValue, kfValues]: [string, any]) => {
            // Start with the CHA value as the first column
            const row: Record<string, any> = {
                supplier_name: chaValue,
            };

            // Add each KF value as a column
            kfFields.forEach((kfField, index) => {
                const value = kfValues[kfField];

                // Format value based on column type
                const columnName = columnHeaders[index + 1] || kfField;

                if (
                    columnName.toLowerCase().includes('contract') ||
                    columnName.toLowerCase().includes('count') ||
                    columnName.toLowerCase().includes('number')
                ) {
                    // Integer columns
                    row.contracts = value !== undefined && value !== null && value !== '' ? Number(value) : 0;
                } else {
                    // Value columns with currency formatting
                    row.value = formatValue(value, formatType);
                }
            });

            return row;
        });

    return tableData;
}

/**
 * Format values for display
 *
 * @param value - The value to format
 * @param type - The type of formatting to apply
 * @returns Formatted value string
 */
export function formatValue(
    value: any,
    type: 'currency' | 'percentage' | 'number' | 'none' = 'number'
): string {
    if (value === undefined || value === null || value === '') {
        return '';
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
        return String(value);
    }

    switch (type) {
        case 'currency':
            if (numValue >= 1000000) {
                return `$${(numValue / 1000000).toFixed(1)}M`;
            } else if (numValue >= 1000) {
                return `$${(numValue / 1000).toFixed(1)}K`;
            } else {
                return `$${numValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        case 'percentage':
            return `${numValue.toFixed(2)}%`;
        case 'number':
            return numValue.toLocaleString();
        case 'none':
            return String(numValue);
        default:
            return String(value);
    }
}

/**
 * Calculate metric variance (percentage change)
 *
 * @param currentValue - The current value
 * @param previousValue - The previous value for comparison
 * @returns Formatted variance string with sign
 */
export function calculateVariance(currentValue: number, previousValue: number): string {
    if (previousValue === 0) {
        return '+∞%';
    }

    const variance = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
    const sign = variance >= 0 ? '+' : '';
    return `${sign}${variance.toFixed(2)}%`;
}

/**
 * Get the "Overall Result" or summary value from data
 *
 * @param formData - The transformed data from the backend
 * @param chaField - The CHA field name
 * @param kfField - The KF field name
 * @returns The summary value
 */
export function getSummaryValue(
    formData: TransformedData,
    chaField: string,
    kfField: string
): number | null {
    try {
        const value = formData.FormStructure[chaField]['Overall Result'][kfField];
        return value !== undefined && value !== null && value !== '' ? Number(value) : null;
    } catch (error) {
        return null;
    }
}


// Add new interface for menu item configuration
export interface LoansAppTrayMenuItemConfig {
    id: number;
    label: string;
    iconName: string; // MUI icon name
    queryConfig: {
        reportName: string;
        mappedConfig?: {
            chaField: string;
            chaValue: string;
            kfField: string;
        };
        manualValue?: number;
        inputType: 'manual' | 'mapped';
    };
}

// Add new interface for chart data configuration
export interface LoansAppTrayChartConfig {
    reportName: string;
    chartConfig?: {
        xAxis: { field: string; type: 'CHA' | 'KF' };
        yAxis: { field: string; type: 'CHA' | 'KF' };
    };
    inputType: 'manual' | 'mapped';
    manualData?: Array<{ name: string; value: number; color: string }>;
}

// Update the WidgetMappingConfig to include loans-app-tray specific config
export interface LoansAppTrayMappingConfig {
    reportName: string;
    mappingType: 'loans-app-tray';
    menuItems: LoansAppTrayMenuItemConfig[];
    chartConfig: LoansAppTrayChartConfig;
    fields: Record<string, WidgetFieldMapping>;
    targetReport?: TargetReportConfig;
}


