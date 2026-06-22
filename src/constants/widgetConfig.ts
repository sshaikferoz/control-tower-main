import { lazy } from 'react';

// Lazy load all widget components
const MultiMetricWidget = lazy(() => import('@/widgets/MultiMetricWidget'));
const MultiMetricComparisonWidget = lazy(() => import('@/widgets/MultiMetricComparisonWidget'));
const NewsFeed = lazy(() => import('@/widgets/NewsFeed'));
const FilterPanel = lazy(() => import('@/widgets/filter-panel/FilterPanel'));
const MultiChartWidget = lazy(() => import('@/widgets/chart/multi-chart/MultiChart'));
const BlankWidget = lazy(() => import('@/widgets/blank-widget/BlankWidget'));
const KpiChart = lazy(() => import('@/widgets/chart/kpi-chart/KpiChart'));
const DashboardMenu = lazy(() => import('@/widgets/dashboard-menu/DashboardMenu'));
const AlertNotifications = lazy(() => import('@/widgets/alert-notifications/AlertNotifications'));

// Component mappings with lazy loading
export const widgetMapping: Record<string, React.ComponentType<any>> = {
    'multi-metric': MultiMetricWidget,
    'multi-metric-comparison-chart': MultiMetricComparisonWidget,
    'news-feed': NewsFeed,
    'filter-panel': FilterPanel,
    'multi-chart-bex': MultiChartWidget,
    'blank-widget': BlankWidget,
    'kpi-chart': KpiChart,
    'dashboard-menu': DashboardMenu,
    'alert-notifications': AlertNotifications,
};

// Default widget props for when data isn't available
export const defaultPropsMapping: Record<string, any> = {
    'multi-metric': {
        items: [
            { id: 'metric-1', title: 'Metric One', value: '120' },
            { id: 'metric-2', title: 'Metric Two', value: '87' },
            { id: 'metric-3', title: 'Metric Three', value: '42' },
        ],
    },
    'multi-metric-comparison-chart': {
        comparisonConfig: {
            series: [],
            chartType: 'bar',
            showHeadlineMetrics: true,
            showLegend: true,
            showGridLines: true,
        },
    },
    'news-feed': {
        title: 'News Feed',
        items: [],
    },
    'blank-widget': {
        title: 'Blank Widget',
    },
    'dashboard-menu': {
        dashboardMenuConfig: {
            items: [],
            layout: 'list',
        },
    },
    'alert-notifications': {
        alertConfig: {
            categories: [],
        },
    },
};
