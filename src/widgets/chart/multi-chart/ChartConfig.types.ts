export const CHART_TYPES = [
    'line',
    'bar',
    'area',
    'composed',
    'scatter',
    'pie',
    'donut',
    'radar',
    'horizontal-bar',
    'table',
] as const;

export type ChartType = (typeof CHART_TYPES)[number];

export type SeriesType = 'line' | 'bar' | 'area' | 'scatter' | 'pie' | 'donut' | 'radar' | 'horizontal-bar';

export type LineType = 'solid' | 'dashed' | 'dotted' | 'dashDot';

export type GridLineStyle = 'solid' | 'dashed-short' | 'dashed-medium' | 'dashed-long' | 'dotted' | 'dash-dot';

export interface PointerStyle {
    showPointers?: boolean;              // Show/hide pointers (dots)
    pointerSize?: number;                 // Radius of regular pointers (default: 4)
    pointerColor?: string;                // Color of pointers (defaults to line color)
    pointerStrokeColor?: string;          // Border color of pointers
    pointerStrokeWidth?: number;          // Border width of pointers
    activePointerSize?: number;           // Radius of active/hovered pointers (default: 8)
    activePointerStrokeColor?: string;    // Border color of active pointers (default: '#ffffff')
    activePointerStrokeWidth?: number;    // Border width of active pointers (default: 2)
    showGlow?: boolean;                   // Show glow effect on active pointers (default: true)
}

export interface SeriesConfig {
    name: string;
    dataKey: string;
    color: string;
    type?: SeriesType;
    lineType?: LineType; // Line style for line/area charts
    barOpacity?: number; // Opacity for bar charts (0-1)
    barEdgeColor?: string; // Color for the top edge of bars
    barEdgeWidth?: number; // Width of the top edge of bars (in pixels)
}

export interface GroupConfig {
    enabled?: boolean;           // Whether this group is visible
    measureColors?: Record<string, string>; // Color for each measure: { measureKey: color }
    colorPalette?: string[];     // Color palette for this group's measures (fallback)
    colorVariantId?: string;     // Selected color variant ID for this group (fallback)
}

export interface ChartWidgetConfig {
    chartType: ChartType;

    xAxisKey: string;            // CalendarYearMonth
    groupByKey?: string;         // Group (optional)

    measures: string[];          // ["ActualInventory"]
    stacked?: boolean;
    charKeys?: string[];
    valueFormat?: 'currency' | 'non-currency';
    showLegend?: boolean;
    // showTitle?: boolean;          // Enable/disable the title display
    title?: string;              // Title text from configuration
    showGridLines?: boolean;     // Show/hide grid lines behind the chart
    gridLineStyle?: GridLineStyle; // Style of grid lines (solid, dashed, dotted, etc.)
    showDataLabels?: boolean;   // Show/hide data value labels at each data point (default: false)
    pointerStyle?: PointerStyle;  // Configuration for pointer (dot) styles
    colorPalette?: string[];     // Color palette for chart series (fallback when no groupByKey)
    colorVariantId?: string;     // Selected color variant ID (fallback when no groupByKey)
    transparentBackground?: boolean; // Disable background and make it transparent
    groupConfigs?: Record<string, GroupConfig>; // Group-specific configurations: { groupValue: { enabled, colorPalette, colorVariantId } }
    listenToEvent?: string; // Event name to listen for filter updates

    /**
     * Optional formatting options for Y-series numeric values.
     * Mirrors the precision formatting concept used in other widgets.
     */
    ySeriesFormatting?: {
        decimalPrecision?: number;
    };

    seriesConfig?: {
        series: SeriesConfig[];
    };
}
