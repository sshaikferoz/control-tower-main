/**
 * Multi Metric Comparison Chart
 *
 * A sibling of the Multi Metric widget. Instead of pulling a single value from a
 * single query, this widget accepts MULTIPLE queries (one per series) and lets
 * the user pick which fields to read from each one. The values are shown both as
 * headline metrics (one big number per series) and combined into a single
 * comparison chart (grouped bars / lines / areas) sharing a common category axis.
 */

export type ComparisonChartType = 'bar' | 'horizontal-bar' | 'line' | 'area';

export type ComparisonAggregation =
    | 'sum'
    | 'average'
    | 'last'
    | 'first'
    | 'max'
    | 'min';

export type ComparisonSortDirection = 'asc' | 'desc';

export interface ComparisonSeries {
    id: string;
    /** BEx query that backs this series. */
    queryName: string;
    /** Series display name (legend + headline label). */
    label: string;
    /** Where the series label comes from. */
    labelSource?: 'manual' | 'query';
    /** Query field used to derive the label when labelSource === 'query'. */
    labelFieldKey?: string;
    /** Series color used for both the headline dot and the chart geometry. */
    color: string;
    /** Field used for the shared category / x-axis (e.g. CalendarMonth). */
    categoryKey?: string;
    /** Key figure field whose value is plotted and aggregated. */
    valueKey?: string;
    /** How the headline number is rolled up across the category rows. */
    headlineAggregation?: ComparisonAggregation;
    valueFormat?: 'currency' | 'non-currency';
    decimalPrecision?: number;
    /** Optional unit suffix shown next to the headline value (e.g. %, USD). */
    unit?: string;
}

export interface MultiMetricComparisonConfig {
    series: ComparisonSeries[];
    chartType?: ComparisonChartType;
    /** Show the row of big headline numbers above the chart. */
    showHeadlineMetrics?: boolean;
    showLegend?: boolean;
    showGridLines?: boolean;
    /** Render the numeric value on top of each bar / point. */
    showDataLabels?: boolean;
    /**
     * Series id of the key figure to sort the shared category axis by.
     * Empty / undefined keeps the source (first-seen) order.
     */
    sortByKeyFigure?: string;
    /** Direction applied when sortByKeyFigure is set. Defaults to 'desc'. */
    sortDirection?: ComparisonSortDirection;
    /** Optional secondary line shown under the widget title. */
    subtitle?: string;
    transparentBackground?: boolean;
    /** Single event name shared by every series query (filter panel wiring). */
    listenToEvent?: string;
}

/** Default color rotation applied to new series. */
export const DEFAULT_SERIES_COLORS = [
    '#84BD00',
    '#E0A52E',
    '#8C7AE6',
    '#00B8D9',
    '#FF6B6B',
    '#36B37E',
    '#F78DA7',
    '#4C9AFF',
];
