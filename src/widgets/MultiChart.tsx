// Re-export MultiChart from the chart folder
// This ensures a single source of truth for the MultiChart component
// The MultiChart component now handles BEX data fetching internally when queryName and chartConfig are provided
export { default } from '@/widgets/chart/multi-chart/MultiChart';
