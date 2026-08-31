import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * A BEx hierarchy-node restriction. When a hierarchy filter (e.g. cost center)
 * is applied, the selected entry is a hierarchy node rather than a plain value:
 * the request must carry the node key and its node InfoObject name so the query
 * restricts by node (VAR_NODE_IOBJNM) instead of an EQ value comparison.
 */
export interface HierarchyNodeValue {
    /** Node key, sent as VAR_VALUE_EXT (e.g. "999930002978"). */
    nodeKey: string;
    /** Node InfoObject name, sent as VAR_NODE_IOBJNM (e.g. "0HIER_NODE"). */
    nodeIObjNm: string;
}

export type FilterValue =
    | string
    | string[]
    | { from: string; to: string }
    | HierarchyNodeValue
    // A hierarchy multi-select can mix parent nodes (sent as VAR_NODE_IOBJNM
    // node restrictions) and leaf nodes (sent as plain EQ values), so the
    // applied array is heterogeneous.
    | (string | HierarchyNodeValue)[]
    | null;

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
