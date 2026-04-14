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
    targetSource?: 'manual' | 'query';
    targetManualValue?: number;
    targetValueKey?: string;
    showTargetValueTop?: boolean;

    // Display options
    showLabels?: boolean;
    // showTitle?: boolean; // Enable/disable the title display
    valueFormat?: 'currency' | 'non-currency';
    decimalPrecision?: number;
    transparentBackground?: boolean; // Disable background and make it transparent
    // BEX query configuration
    queryName?: string;
    showTitle?: boolean;
    listenToEvent?: string;
}


// Supported KPI visual types
export type KpiType = 'number' | 'numberWithDelta' | 'progress' | 'donut' | 'radialBar' | 'status' | 'bullet' | 'gauge';

// Extend the gauge widget config for KPI so we can choose a visual type
export interface KpiWidgetConfig extends GaugeWidgetConfig {
    kpiType?: KpiType;
}

