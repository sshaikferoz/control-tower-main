import type { RootState } from '@/store/store';

/** Colocated, typed selectors for the dashboard UI slice. */
export const selectDashboardUi = (state: RootState) => state.dashboard;
export const selectSelectedMenuItemId = (state: RootState) => state.dashboard.selectedMenuItemId;
export const selectIsEditMode = (state: RootState) => state.dashboard.isEditMode;
export const selectConfigDialogOpen = (state: RootState) => state.dashboard.configDialogOpen;
export const selectSelectedWidgetIds = (state: RootState) => state.dashboard.selectedWidgetIds;
