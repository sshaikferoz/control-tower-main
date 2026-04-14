export interface MultiMetricItem {
    id: string;
    title: string;
    titleSource?: 'manual' | 'query'; // Use manual title input or derive from query field label
    titleFieldKey?: string; // Query field key used to extract title value from query data
    queryName: string;
    valueKey?: string; // Field key to extract value from query result
    unit?: string; // Optional unit suffix to display next to the value (e.g. %, USD)
    titleAlignment?: 'left' | 'center' | 'right';
    valueAlignment?: 'left' | 'center' | 'right';
    decimalPrecision?: number;
    valueFormat?: 'currency' | 'non-currency';
    // Trend configuration (optional)
    enableTrend?: boolean;
    trendValue?: number; // Value to compare against
    invertTrend?: boolean; // If true, reverse the comparison logic
    // Layout for individual metric (how title and value are arranged)
    metricLayout?: 'horizontal' | 'vertical' | 'verticalTitleBelow';
}

export interface MultiMetricWidgetConfig {
    metrics: MultiMetricItem[];
    layout?: 'horizontal' | 'vertical';
    showDividers?: boolean;
    transparentBackground?: boolean; // Disable background and make it transparent
    listenToEvent?: string; // Single event name shared by all metric queries
}
