---
name: Redux Filter Panel Store
overview: Implement Redux store for filter panel state management. On submit, filter panel values will be stored in Redux, making them globally accessible. Replace EventBus with Redux for all filter panel communication.
todos:
  - id: install-redux
    content: Install @reduxjs/toolkit and redux packages
    status: completed
  - id: create-store
    content: Create Redux store configuration in src/store/index.ts
    status: completed
  - id: create-slice
    content: Create filterPanelSlice with actions and reducers in src/store/slices/filterPanelSlice.ts
    status: completed
  - id: setup-provider
    content: Add Redux Provider to src/lib/providers.tsx
    status: completed
  - id: update-filter-panel
    content: Update FilterPanel.tsx to dispatch Redux actions on submit and remove EventBus
    status: in_progress
  - id: create-hooks
    content: Create custom hooks (useFilterValues, useFilterPanel) for easier Redux access
    status: completed
  - id: migrate-multimetric
    content: Update MultiMetric.tsx to use Redux useSelector instead of EventBus subscription
    status: pending
  - id: migrate-listener-widget
    content: Update ListenerWidget.tsx to use Redux instead of EventBus
    status: pending
  - id: migrate-filter-widget
    content: Update FilterWidget.tsx to use Redux instead of EventBus (if it subscribes to filter events)
    status: pending
  - id: test-integration
    content: Test Redux store integration and verify all widgets receive filter updates
    status: pending
isProject: false
---

# Redux Store Implementation for Filter Panel

## Overview

Implement a Redux store to manage filter panel state globally. When a filter panel is submitted, the filter values will be stored in Redux, making them accessible across the application. Replace EventBus with Redux for all filter panel communication - widgets will subscribe to filter changes via Redux useSelector instead of EventBus.

## Architecture

### State Structure

```typescript
{
  filterPanel: {
    filters: {
      [eventName: string]: {
        variables: Record<string, FilterVariable>;
        variablesString: string; // SAP BW variables format
        timestamp: number;
        eventName: string;
      }
    },
    activeFilters: string[]; // List of active event names
  }
}
```

### Data Flow

```
FilterPanel Component
  ↓ (on submit)
  ↓ dispatch(updateFilterValues({ eventName, variables, variablesString }))
  ↓
Redux Store (filterPanel slice)
  ↓
Other widgets subscribe via Redux useSelector
  ↓
Widgets automatically re-render when filter values change
```

## Implementation Steps

### 1. Install Dependencies

- Install `@reduxjs/toolkit` and `redux` (currently only `react-redux` is installed)
- Update `package.json` dependencies

### 2. Create Redux Store Structure

**Files to create:**

- `src/store/index.ts` - Store configuration and setup
- `src/store/slices/filterPanelSlice.ts` - Filter panel Redux slice with actions and reducers

**Key actions:**

- `updateFilterValues` - Update filter values for a specific event name
- `clearFilterValues` - Clear filter values for a specific event name
- `clearAllFilters` - Clear all filter values
- `resetFilterPanel` - Reset filter panel state

### 3. Set Up Redux Provider

**File to modify:**

- `src/lib/providers.tsx` - Add Redux Provider wrapper alongside QueryClientProvider

### 4. Update FilterPanel Component

**File to modify:**

- `src/widgets/filter-panel/FilterPanel.tsx`
  - Remove EventBus import and usage
  - Import Redux hooks (`useDispatch`)
  - Dispatch `updateFilterValues` action on submit (in `handleFilterClick`)
  - Remove `eventBus.publish()` call
  - Optionally sync local state with Redux store on mount

### 5. Create Custom Hooks

**Files to create:**

- `src/hooks/filters/useFilterValues.ts` - Custom hook to access filter values from Redux by event name
- `src/hooks/filters/useFilterPanel.ts` - Custom hook for filter panel operations (dispatch actions)

### 6. Migrate Widgets from EventBus to Redux

**Files to update:**

- `src/widgets/chart/multi-metric/MultiMetric.tsx`
  - Remove EventBus subscription in `MetricCardWrapper`
  - Use `useFilterValues` hook with `metric.listenToEvent` to get filter values
  - Use `useEffect` to watch Redux state changes instead of EventBus callbacks
- `src/widgets/ListenerWidget.tsx`
  - Replace EventBus subscription with Redux `useSelector` or `useFilterValues` hook
  - Update to react to Redux state changes
- `src/widgets/FilterWidget.tsx` (if it subscribes to filter events)
  - Replace EventBus subscription with Redux hooks

## File Structure

```
src/
├── store/
│   ├── index.ts                    # Store configuration
│   └── slices/
│       └── filterPanelSlice.ts    # Filter panel slice
├── hooks/
│   └── filters/
│       ├── useFilterValues.ts      # Hook to get filter values
│       └── useFilterPanel.ts       # Hook for filter operations
├── lib/
│   └── providers.tsx               # Add Redux Provider
└── widgets/
    └── filter-panel/
        └── FilterPanel.tsx         # Update to dispatch to Redux
```

## Key Design Decisions

1. **Redux Only**: Completely replace EventBus with Redux for filter panel communication
2. **Event Name as Key**: Use `eventName` from config as the key in Redux store (allows multiple filter panels)
3. **Normalized State**: Store both the structured variables object and the formatted variables string
4. **Type Safety**: Use TypeScript interfaces matching `FilterPanelConfig.types.ts`
5. **Redux Toolkit**: Use modern Redux Toolkit for cleaner code and better DX
6. **Reactive Updates**: Widgets automatically re-render when filter values change via Redux selectors

## Benefits

- **Global State**: Filter values accessible from any component
- **DevTools**: Redux DevTools for debugging and time-travel debugging
- **Reactive Updates**: Widgets automatically update when filters change
- **Type Safe**: Full TypeScript support
- **Scalable**: Easy to add more filter-related state in the future
- **Single Source of Truth**: All filter state in one place
- **Better Performance**: Redux optimizations with selectors and memoization

## Migration Notes

- Remove all `eventBus.subscribe()` calls related to filter panels
- Remove `eventBus.publish()` from FilterPanel
- Update widgets to use `useFilterValues(eventName)` hook instead of EventBus
- EventBus can remain in the codebase for other non-filter-panel use cases if needed

## Testing Considerations

- Test Redux actions and reducers
- Test FilterPanel dispatch on submit
- Test widgets receive filter updates via Redux
- Test multiple filter panels with different event names
- Test widget re-rendering when filter values change
- Verify no EventBus dependencies remain for filter panel functionality

