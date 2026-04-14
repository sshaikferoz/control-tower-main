/**
 * Widget Default Props Configuration
 * 
 * This file contains default props for all widget types.
 * These props are used when a widget is first created or when no data is available.
 * 
 * Reference: src/app/mapping/page.tsx
 */

// Default color for multi-metric widgets
export const DEFAULT_MULTI_METRIC_COLOR = '#00214E';

/**
 * Default widget sizes (width and height in grid units)
 */
export const widgetSizes: Record<string, { w: number; h: number }> = {
    'multi-metric': { w: 3, h: 2 },
    'one-metric': { w: 2, h: 1.5 },
    'one-metric-date': { w: 2, h: 1.5 },
    'two-metrics-linechart': { w: 4, h: 3 },
    'two-metrics': { w: 2.5, h: 1.5 },
    'two-metrics-piechart': { w: 2.5, h: 1.5 },
    'one-metric-table': { w: 3, h: 3 },
    'bar-chart': { w: 2.5, h: 3 },
    'stacked-bar-chart': { w: 6, h: 3 },
    'orders-line-chart': { w: 4, h: 3 },
    'dual-line-chart': { w: 4, h: 3 },
    'pie-chart-total': { w: 2.5, h: 3 },
    'quadrant-metrics': { w: 4, h: 3 },
    'loans-app-tray': { w: 6, h: 3 },
    'news-feed': { w: 12, h: 3 },
    announcement: { w: 12, h: 3 },
    'pie-chart': { w: 4, h: 3 },
    'column-chart': { w: 6, h: 3 },
    'prediction-chart': { w: 6, h: 3 },
    'radar-chart': { w: 6, h: 3 },
    'multi-chart': { w: 6, h: 3 },
    'multi-chart-bex': { w: 6, h: 3 },
    'filter-widget': { w: 4, h: 4 },
    'listener-widget': { w: 4, h: 4 },
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
    'one-metric': {
        name: 'Active Contracts',
        value: 45,
    },
    'one-metric-date': {
        name: 'Open PO Orders',
        value: 18,
        date: '13-Aug-2024',
    },
    'two-metrics': {
        metric1: 'Long Form',
        value1: '12.3',
        metric2: 'Short & Mid-Form',
        value2: '135',
    },
    'two-metrics-linechart': {
        data: {
            chart_data: [
                { date: '01-01-2024', Actual: 50, unit: '%' },
                { date: '01-02-2024', Actual: 100, unit: '%' },
                { date: '01-03-2024', Actual: 90, unit: '%' },
                { date: '01-04-2024', Actual: 150, unit: '%' },
                { date: '01-05-2024', Actual: 120, unit: '%' },
                { date: '01-06-2024', Actual: 195, unit: '%' },
            ],
            chart_yaxis: 'Actual',
        },
        widget_name: 'Successful Payments',
    },
    'two-metrics-piechart': {
        data: [
            { label: 'Flaring Intensity', value: 30, fill: '#84BD00' },
            { label: 'SO2 Emissions', value: 70, fill: '#E1553F' },
        ],
        metrics: {
            amount: '$234K',
            percentage: '0.31%',
            label: 'Contracts Under Development',
        },
    },
    'one-metric-table': {
        title: 'Top Suppliers',
        data: [
            { supplier_name: 'Reliable Suppliers', contracts: 7, value: '52,345' },
            { supplier_name: 'Supply Solutions', contracts: 5, value: '42,345' },
        ],
    },
    'bar-chart': {
        data: [
            { name: '2024', value: 163000, fill: '#83bd01' },
            { name: '2025', value: 118000, fill: '#FFC846' },
        ],
        title: 'Spend Comparison',
        variance: '+5.40%',
    },
    'stacked-bar-chart': {
        data: [
            { name: 'Jan', Supplier1: 400, Supplier2: 240, Supplier3: 100 },
            { name: 'Feb', Supplier1: 300, Supplier2: 200, Supplier3: 150 },
            { name: 'Mar', Supplier1: 450, Supplier2: 220, Supplier3: 180 },
            { name: 'Apr', Supplier1: 470, Supplier2: 260, Supplier3: 120 },
            { name: 'May', Supplier1: 390, Supplier2: 210, Supplier3: 160 },
            { name: 'Jun', Supplier1: 520, Supplier2: 280, Supplier3: 220 },
        ],
        title: 'Top Spend Supplier',
        series: [
            { name: 'Supplier A', dataKey: 'Supplier1', color: '#84BD00' },
            { name: 'Supplier B', dataKey: 'Supplier2', color: '#FFC846' },
            { name: 'Supplier C', dataKey: 'Supplier3', color: '#8979FF' },
        ],
    },
    'column-chart': {
        data: [
            { name: 'Jan', Supplier1: 400, Supplier2: 240, Supplier3: 100 },
            { name: 'Feb', Supplier1: 300, Supplier2: 200, Supplier3: 150 },
            { name: 'Mar', Supplier1: 450, Supplier2: 220, Supplier3: 180 },
            { name: 'Apr', Supplier1: 470, Supplier2: 260, Supplier3: 120 },
            { name: 'May', Supplier1: 390, Supplier2: 210, Supplier3: 160 },
            { name: 'Jun', Supplier1: 520, Supplier2: 280, Supplier3: 220 },
        ],
        title: 'Top Spend Supplier',
        series: [
            { name: 'Supplier A', dataKey: 'Supplier1', color: '#84BD00' },
            { name: 'Supplier B', dataKey: 'Supplier2', color: '#FFC846' },
            { name: 'Supplier C', dataKey: 'Supplier3', color: '#8979FF' },
        ],
    },
    'orders-line-chart': {
        data: [
            { name: 'Jan', value: 120000 },
            { name: 'Feb', value: 150000 },
            { name: 'Mar', value: 180000 },
            { name: 'Apr', value: 140000 },
            { name: 'May', value: 160000 },
            { name: 'Jun', value: 190000 },
            { name: 'Jul', value: 175000 },
            { name: 'Aug', value: 195000 },
            { name: 'Sep', value: 165000 },
            { name: 'Oct', value: 185000 },
            { name: 'Nov', value: 205000 },
            { name: 'Dec', value: 220000 },
        ],
        title: 'Last 12 Months Orders',
        totalValue: '$235MM',
    },
    'dual-line-chart': {
        data: [
            { name: 'Jan', line1: 10000, line2: 15000 },
            { name: 'Feb', line1: 12000, line2: 18000 },
            { name: 'Mar', line1: 15000, line2: 14000 },
            { name: 'Apr', line1: 13000, line2: 19000 },
            { name: 'May', line1: 17000, line2: 16000 },
            { name: 'Jun', line1: 20000, line2: 21000 },
        ],
        title: 'Spend Trends',
        series: [
            { name: 'Contract Spend', dataKey: 'line1', color: '#5899DA' },
            { name: 'Material Spend', dataKey: 'line2', color: '#FFC846' },
        ],
    },
    'pie-chart-total': {
        data: [
            { name: 'Segment 1', value: 2000, fill: '#84BD00' },
            { name: 'Segment 2', value: 1128, fill: '#E1553F' },
        ],
        title: 'With P&SCM Buyers',
        totalValue: '$3,128B',
    },
    'quadrant-metrics': {
        metrics: [
            { title: 'In Process', value: '53', position: 'top-left' },
            { title: 'With Supplier', value: '18', position: 'top-right' },
            { title: 'B2B Order', value: '1,335', position: 'bottom-left' },
            { title: 'Completed Order', value: '1,247', position: 'bottom-right' },
        ],
    },
    'loans-app-tray': {
        title: 'Alerts Overview',
        menuItems: [
            {
                id: 1,
                iconName: 'Assignment',
                label: 'Open PR',
                count: 13,
            },
            {
                id: 2,
                iconName: 'Schedule',
                label: 'Contract Expiring',
                count: 85,
            },
            {
                id: 3,
                iconName: 'Pending',
                label: 'Pending SES',
                count: 32,
            },
            {
                id: 4,
                iconName: 'TrendingUp',
                label: 'Contract with 80%\nConsumed Values',
                count: 24,
            },
        ],
        chartData: [
            { name: 'PR', value: 86, color: '#449ca4' },
            { name: 'CE', value: 156, color: '#5899da' },
            { name: 'SES', value: 114, color: '#ffaa04' },
            { name: 'CV', value: 126, color: '#ff0000' },
        ],
        menuItemConfigs: {},
        chartDataConfig: {},
    },
    announcement: {
        title: 'Welcome to Our Platform! 🎉',
        announcement: [
            '🚧 Important Update! System maintenance scheduled for 2 AM.',
            "⚠️ New Feature! We've just released a new dashboard.",
            '🔒 Security Alert! Please update your password for better security.',
        ],
    },
    'pie-chart': {
        data: [
            { label: 'Segment 1', value: 400, fill: '#84BD00' },
            { label: 'Segment 2', value: 300, fill: '#E1553F' },
            { label: 'Segment 3', value: 200, fill: '#5899DA' },
            { label: 'Segment 4', value: 100, fill: '#FFC846' },
        ],
        title: 'Distribution Chart',
    },
    'radar-chart': {
        data: [
            { name: 'Speed', actual: 80, predicted: 75 },
            { name: 'Quality', actual: 95, predicted: 90 },
            { name: 'Efficiency', actual: 70, predicted: 85 },
            { name: 'Innovation', actual: 85, predicted: 80 },
            { name: 'Reliability', actual: 90, predicted: 88 },
            { name: 'Cost', actual: 75, predicted: 82 },
        ],
        title: 'Performance Metrics',
        series: [
            { name: 'Actual', dataKey: 'actual', color: '#8884d8' },
            { name: 'Predicted', dataKey: 'predicted', color: '#82ca9d' },
        ],
    },
    'multi-chart': {
        data: [
            { name: 'Jan', sales: 1200000, marketing: 800000, operations: 650000 },
            { name: 'Feb', sales: 950000, marketing: 720000, operations: 500000 },
            { name: 'Mar', sales: 2100000, marketing: 1600000, operations: 900000 },
            { name: 'Apr', sales: 1780000, marketing: 1200000, operations: 870000 },
            { name: 'May', sales: 2500000, marketing: 1900000, operations: 1100000 },
        ],
        title: 'Multi Chart Widget',
        series: [
            { name: 'Sales', dataKey: 'sales', color: '#8884d8', type: 'line' },
            { name: 'Marketing', dataKey: 'marketing', color: '#82ca9d', type: 'line' },
            { name: 'Operations', dataKey: 'operations', color: '#ffc658', type: 'line' },
        ],
        chartType: 'line',
        showLegend: true,
        stacked: false,
        selectedLabels: [],
        valueFormat: 'non-currency',
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
    'prediction-chart': {
        data: [],
        title: 'Prediction Chart',
    },
    'filter-widget': {
        reportName: '',
        eventName: 'filter-changed',
    },
    'listener-widget': {
        reportName: '',
        listenToEvent: 'filter-changed',
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

