// Existing view/builder surface
export { DashboardRenderer } from './DashboardRenderer';
export { DashboardBuilder, DashboardGrid } from './builder';
export type { Widget, LayoutItem, DashboardProps } from './dashboard.types';

// Reference feature: shell (Redux UI state + React Query server state + MUI/Tailwind)
export { DashboardShell } from './components/DashboardShell';
export { DashboardToolbar } from './components/DashboardToolbar';
export { useDashboardShell } from './hooks/useDashboardShell';
export { useMenuItemsQuery, useAdminQuery, dashboardKeys } from './api/dashboardQueries';

// Store surface
export {
    default as dashboardReducer,
    setSelectedMenuItem,
    setEditMode,
    toggleEditMode,
    openConfigDialog,
    closeConfigDialog,
    toggleWidgetSelection,
    clearWidgetSelection,
    resetDashboardUi,
} from './store/dashboardSlice';
export * from './store/dashboard.selectors';
export type { DashboardUiState } from './store/dashboardSlice';
