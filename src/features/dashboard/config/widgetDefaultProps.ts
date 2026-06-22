/**
 * Widget Default Props Configuration
 *
 * This file contains default props for all widget types.
 * These props are used when a widget is first created or when no data is available.
 */

// Default color for multi-metric widgets
export const DEFAULT_MULTI_METRIC_COLOR = '#00214E';

/**
 * Default widget sizes (width and height in grid units)
 */
export const widgetSizes: Record<string, { w: number; h: number }> = {
    'multi-metric': { w: 3, h: 2 },
    'multi-metric-comparison-chart': { w: 6, h: 3 },
    'news-feed': { w: 12, h: 3 },
    'multi-chart-bex': { w: 6, h: 3 },
    'blank-widget': { w: 2, h: 2 },
    'dashboard-menu': { w: 3, h: 3 },
    'alert-notifications': { w: 4, h: 3 },
};

/**
 * Default props for each widget type
 * These are used when initializing a new widget or when no data is available
 */
export const defaultPropsMapping: Record<string, any> = {
    'multi-metric': {
        multiMetricConfig: {
            metrics: [],
            layout: 'horizontal',
            showDividers: true,
            showTitle: true,
        },
        backgroundColor: DEFAULT_MULTI_METRIC_COLOR,
    },
    'multi-metric-comparison-chart': {
        comparisonConfig: {
            series: [],
            chartType: 'bar',
            showHeadlineMetrics: true,
            showLegend: true,
            showGridLines: true,
            showDataLabels: false,
        },
        backgroundColor: DEFAULT_MULTI_METRIC_COLOR,
    },
    'multi-chart-bex': {
        queryName: '',
        title: 'Widget Title',
        chartConfig: {
            chartType: 'line',
            xAxisKey: '',
            measures: [],
            stacked: true,
            valueFormat: 'non-currency',
            showLegend: true,
            groupByKey: '',
            seriesConfig: {
                series: [],
            },
        },
    },
    'news-feed': {
        title: 'News Feed',
        items: [],
    },
    'blank-widget': {
        title: '',
        showTitle: false,
    },
    'dashboard-menu': {
        dashboardMenuConfig: {
            items: [],
            displayMode: 'multiple',
            layout: 'list',
        },
    },
    'alert-notifications': {
        alertConfig: {
            categories: [],
            transparentBackground: false,
        },
        backgroundColor: DEFAULT_MULTI_METRIC_COLOR,
    },
};

/**
 * Get default props for a widget by name
 * @param widgetName - The name of the widget
 * @returns Default props for the widget, or empty object if not found
 */
export const getDefaultWidgetProps = (widgetName: string): any => {
    return defaultPropsMapping[widgetName] || {};
};

/**
 * Get default size for a widget by name
 * @param widgetName - The name of the widget
 * @returns Default size (width and height) for the widget, or default 2x2 if not found
 */
export const getDefaultWidgetSize = (widgetName: string): { w: number; h: number } => {
    return widgetSizes[widgetName] || { w: 2, h: 2 };
};
