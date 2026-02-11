export interface VariableMapping {
    filterVariableName: string; // Variable name from filter event (e.g., "VAR1")
    bexVariableName: string; // Variable name to use in BEX query (e.g., "VAR_NAME_1")
}

export interface MultiMetricItem {
    id: string;
    title: string;
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
    // Event listening configuration
    listenToEvent?: string; // Event name to listen to (from filter panel)
    variableMappings?: VariableMapping[]; // Map filter variables to BEX query variables
}

export interface MultiMetricWidgetConfig {
    metrics: MultiMetricItem[];
    layout?: 'horizontal' | 'vertical';
    showDividers?: boolean;
    transparentBackground?: boolean; // Disable background and make it transparent
}
