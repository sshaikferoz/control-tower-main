import type { ComponentType } from 'react';

import NewsFeed from './NewsFeed';
import MultiChart from './MultiChart';
import MultiChartBex from './MultiChartBex';
import FilterWidget from './FilterWidget';
import TableMetric from './TableMetric';
import ListenerWidget from './ListenerWidget';
import PieChartWithTotal from './PieChartWithTotal';
import PieChart from './PieChart';
import StackedBarChart from './StackedBarChart';
import SingleLineChart from './SingleLineChart';
import SimpleMetricDate from './SimpleMetricDate';
import SimpleMetric from './SimpleMetric';
import RadarChart from './RadarChart';
import QuadrantMetrics from './QuadrantMetrics';
import Prediction from './Prediction';
import PieMetric from './PieMetric';
import OrdersLineChart from './OrdersLineChart';
import MultiMetricComparsionChart from './MultiMetricComparsionChart';
import LoansAppTrayConfig from './LoansAppTrayConfig';
import LoansAppTray from './LoansAppTray';
import GeoSpendMapWidget from './GeoSpendMapWidget';
import DualLineChart from './DualLineChart';
import ColumnChart from './ColumnChart';
import BarMetric from './BarMetric';
import Announcement1 from './Announcement1';
import Announcement from './Announcement';
import { LazyWidgetContent } from './LazyWidgetContent';
import { ChartConfigPanel } from './chart/multi-chart/ChartConfigPanel';
import MultiChartNested from './chart/multi-chart/MultiChart';

export type WidgetId =
    | 'newsFeed'
    | 'lazyWidgetContent'
    | 'multiChart'
    | 'multiChartBex'
    | 'filterWidget'
    | 'tableMetric'
    | 'listenerWidget'
    | 'pieChartWithTotal'
    | 'pieChart'
    | 'stackedBarChart'
    | 'singleLineChart'
    | 'simpleMetricDate'
    | 'simpleMetric'
    | 'radarChart'
    | 'quadrantMetrics'
    | 'prediction'
    | 'pieMetric'
    | 'ordersLineChart'
    | 'multiMetricComparsionChart'
    | 'loansAppTrayConfig'
    | 'loansAppTray'
    | 'geoSpendMapWidget'
    | 'dualLineChart'
    | 'columnChart'
    | 'barMetric'
    | 'announcement1'
    | 'announcement'
    | 'chartConfigPanel'
    | 'multiChartNested';

export interface WidgetDefinition {
    id: WidgetId;
    label: string;
    component: ComponentType<any>;
    description?: string;
    category?: string;
    icon?: string;
}

export const widgetsRegistry: Record<WidgetId, WidgetDefinition> = {
    newsFeed: {
        id: 'newsFeed',
        label: 'News Feed',
        component: NewsFeed,
    },
    lazyWidgetContent: {
        id: 'lazyWidgetContent',
        label: 'Lazy Widget Content',
        component: LazyWidgetContent,
    },
    multiChart: {
        id: 'multiChart',
        label: 'Multi Chart',
        component: MultiChart,
    },
    multiChartBex: {
        id: 'multiChartBex',
        label: 'Multi Chart (BEX)',
        component: MultiChartBex,
    },
    filterWidget: {
        id: 'filterWidget',
        label: 'Filter Widget',
        component: FilterWidget,
    },
    tableMetric: {
        id: 'tableMetric',
        label: 'Table Metric',
        component: TableMetric,
    },
    listenerWidget: {
        id: 'listenerWidget',
        label: 'Listener Widget',
        component: ListenerWidget,
    },
    pieChartWithTotal: {
        id: 'pieChartWithTotal',
        label: 'Pie Chart With Total',
        component: PieChartWithTotal,
    },
    pieChart: {
        id: 'pieChart',
        label: 'Pie Chart',
        component: PieChart,
    },
    stackedBarChart: {
        id: 'stackedBarChart',
        label: 'Stacked Bar Chart',
        component: StackedBarChart,
    },
    singleLineChart: {
        id: 'singleLineChart',
        label: 'Single Line Chart',
        component: SingleLineChart,
    },
    simpleMetricDate: {
        id: 'simpleMetricDate',
        label: 'Simple Metric Date',
        component: SimpleMetricDate,
    },
    simpleMetric: {
        id: 'simpleMetric',
        label: 'Simple Metric',
        component: SimpleMetric,
    },
    radarChart: {
        id: 'radarChart',
        label: 'Radar Chart',
        component: RadarChart,
    },
    quadrantMetrics: {
        id: 'quadrantMetrics',
        label: 'Quadrant Metrics',
        component: QuadrantMetrics,
    },
    prediction: {
        id: 'prediction',
        label: 'Prediction',
        component: Prediction,
    },
    pieMetric: {
        id: 'pieMetric',
        label: 'Pie Metric',
        component: PieMetric,
    },
    ordersLineChart: {
        id: 'ordersLineChart',
        label: 'Orders Line Chart',
        component: OrdersLineChart,
    },
    multiMetricComparsionChart: {
        id: 'multiMetricComparsionChart',
        label: 'Multi Metric Comparison Chart',
        component: MultiMetricComparsionChart,
    },
    loansAppTrayConfig: {
        id: 'loansAppTrayConfig',
        label: 'Loans App Tray Config',
        component: LoansAppTrayConfig,
    },
    loansAppTray: {
        id: 'loansAppTray',
        label: 'Loans App Tray',
        component: LoansAppTray,
    },
    geoSpendMapWidget: {
        id: 'geoSpendMapWidget',
        label: 'Geo Spend Map Widget',
        component: GeoSpendMapWidget,
    },
    dualLineChart: {
        id: 'dualLineChart',
        label: 'Dual Line Chart',
        component: DualLineChart,
    },
    columnChart: {
        id: 'columnChart',
        label: 'Column Chart',
        component: ColumnChart,
    },
    barMetric: {
        id: 'barMetric',
        label: 'Bar Metric',
        component: BarMetric,
    },
    announcement1: {
        id: 'announcement1',
        label: 'Announcement 1',
        component: Announcement1,
    },
    announcement: {
        id: 'announcement',
        label: 'Announcement',
        component: Announcement,
    },
    chartConfigPanel: {
        id: 'chartConfigPanel',
        label: 'Chart Config Panel',
        component: ChartConfigPanel,
    },
    multiChartNested: {
        id: 'multiChartNested',
        label: 'Multi Chart (Nested)',
        component: MultiChartNested,
    },
};

export const allWidgets: WidgetDefinition[] = Object.values(widgetsRegistry);

export const getWidgetDefinition = (id: WidgetId): WidgetDefinition | undefined =>
    widgetsRegistry[id];

export default widgetsRegistry;


