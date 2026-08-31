import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';

export const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Dev-only convenience: expose the store for debugging / e2e inspection.
// (Redux DevTools is already enabled by configureStore in development.)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    (window as unknown as { __store?: typeof store }).__store = store;
}
