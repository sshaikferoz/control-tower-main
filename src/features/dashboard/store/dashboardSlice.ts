import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Client / UI state for the dashboard shell. Server data (menu items, admin
 * status, configuration) lives in React Query — NOT here. This slice only holds
 * transient view state that the user drives.
 */
export interface DashboardUiState {
    /** Currently selected dashboard tab (menu item) id. */
    selectedMenuItemId: string | null;
    /** Whether the layout edit mode is active. */
    isEditMode: boolean;
    /** Whether the UI configuration dialog is open. */
    configDialogOpen: boolean;
    /** Ids of widgets currently selected in edit mode. */
    selectedWidgetIds: string[];
}

const initialState: DashboardUiState = {
    selectedMenuItemId: null,
    isEditMode: false,
    configDialogOpen: false,
    selectedWidgetIds: [],
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setSelectedMenuItem: (state, action: PayloadAction<string | null>) => {
            state.selectedMenuItemId = action.payload;
            // Selection is per-tab; drop it when switching tabs.
            state.selectedWidgetIds = [];
        },
        setEditMode: (state, action: PayloadAction<boolean>) => {
            state.isEditMode = action.payload;
        },
        toggleEditMode: (state) => {
            state.isEditMode = !state.isEditMode;
        },
        openConfigDialog: (state) => {
            state.configDialogOpen = true;
        },
        closeConfigDialog: (state) => {
            state.configDialogOpen = false;
        },
        toggleWidgetSelection: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            state.selectedWidgetIds = state.selectedWidgetIds.includes(id)
                ? state.selectedWidgetIds.filter((w) => w !== id)
                : [...state.selectedWidgetIds, id];
        },
        clearWidgetSelection: (state) => {
            state.selectedWidgetIds = [];
        },
        resetDashboardUi: () => initialState,
    },
});

export const {
    setSelectedMenuItem,
    setEditMode,
    toggleEditMode,
    openConfigDialog,
    closeConfigDialog,
    toggleWidgetSelection,
    clearWidgetSelection,
    resetDashboardUi,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
