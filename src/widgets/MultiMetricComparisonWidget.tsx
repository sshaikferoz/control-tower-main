// Re-export MultiMetricComparison from the chart folder
// This keeps a single source of truth for the component. It accepts multiple
// queries (one per series) and renders both headline metrics and a combined
// comparison chart. Each series fetches its own BEX data internally.
export { default } from '@/widgets/chart/multi-metric-comparison/MultiMetricComparison';
