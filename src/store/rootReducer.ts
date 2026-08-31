import { combineReducers } from '@reduxjs/toolkit';
import filterReducer from './filterSlice';
import dashboardReducer from '@/features/dashboard/store/dashboardSlice';

/**
 * Single registry for all feature reducers. Register a feature's slice here
 * (import the slice's reducer *directly*, not via the feature barrel, to keep
 * the store free of runtime import cycles).
 */
export const rootReducer = combineReducers({
    filters: filterReducer,
    dashboard: dashboardReducer,
});

export type RootReducer = typeof rootReducer;
