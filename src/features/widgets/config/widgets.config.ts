import { Widget } from '../types';

export const WIDGETS: Widget[] = [
    { id: 'multi-metric', name: 'multi-metric', displayName: 'Multi Metric' },
    { id: 'one-metric', name: 'one-metric', displayName: 'One Metric' },
    { id: 'one-metric-date', name: 'one-metric-date', displayName: 'One Metric Date' },
    { id: 'two-metrics-linechart', name: 'two-metrics-linechart', displayName: 'Two Metrics Line Chart' },
    { id: 'two-metrics', name: 'two-metrics', displayName: 'Two Metrics' },
    { id: 'two-metrics-piechart', name: 'two-metrics-piechart', displayName: 'Two Metrics Pie Chart' },
    { id: 'one-metric-table', name: 'one-metric-table', displayName: 'One Metric Table' },
    { id: 'bar-chart', name: 'bar-chart', displayName: 'Bar Chart' },
    { id: 'stacked-bar-chart', name: 'stacked-bar-chart', displayName: 'Stacked Bar Chart' },
    { id: 'quadrant-metrics', name: 'quadrant-metrics', displayName: 'Quadrant Metrics' },
    { id: 'loans-app-tray', name: 'loans-app-tray', displayName: 'Alert Widget' },
    { id: 'news-feed', name: 'news-feed', displayName: 'News Feed' },
    { id: 'pie-chart', name: 'pie-chart', displayName: 'Pie Chart' },
    { id: 'column-chart', name: 'column-chart', displayName: 'Column Chart' },
    { id: 'multi-chart', name: 'multi-chart', displayName: 'Multi Chart' },
    { id: 'multi-chart-bex', name: 'multi-chart-bex', displayName: 'Multi Chart BEX' },
    { id: 'filter-widget', name: 'filter-widget', displayName: 'Filter Widget' },
    { id: 'listener-widget', name: 'listener-widget', displayName: 'Listener Widget' },
    { id: 'blank-widget', name: 'blank-widget', displayName: 'Blank Widget' },
] as const;

