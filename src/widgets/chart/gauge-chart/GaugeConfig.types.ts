export interface ColorRange {
    min: number;
    max: number;
    color: string;
    label?: string;
}

export interface GaugeWidgetConfig {
    // Scale configuration
    minValue: number;
    maxValue: number;
    colorRanges: ColorRange[];

    // Data selection
    valueKey?: string;  // Value key to extract the single value from query result

    // Display options
    showLabels?: boolean;
    showTitle?: boolean; // Enable/disable the title display
    valueFormat?: 'currency' | 'non-currency';
    transparentBackground?: boolean; // Disable background and make it transparent
    // BEX query configuration
    queryName?: string;
}
