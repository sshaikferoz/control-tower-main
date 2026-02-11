import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FilterValue = string | string[] | { from: string; to: string } | null;

export interface FilterState {
    eventName: string | null;
    variables: Record<string, FilterValue>;
}

const initialState: FilterState = {
    eventName: null,
    variables: {},
};

const filterSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setFilterState: (state, action: PayloadAction<FilterState>) => {
            state.eventName = action.payload.eventName;
            state.variables = action.payload.variables;
        },
        clearFilterState: (state) => {
            state.eventName = null;
            state.variables = {};
        },
    },
});

export const { setFilterState, clearFilterState } = filterSlice.actions;
export default filterSlice.reducer;
