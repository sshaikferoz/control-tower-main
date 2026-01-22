import { GaugeWidgetConfig } from '@/widgets/chart/gauge-chart/GaugeConfig.types';

// Supported KPI visual types
export type KpiType = 'number' | 'numberWithDelta' | 'progress' | 'donut' | 'radialBar' | 'status' | 'bullet';

// Extend the gauge widget config for KPI so we can choose a visual type
export interface KpiWidgetConfig extends GaugeWidgetConfig {
    kpiType?: KpiType;
}

