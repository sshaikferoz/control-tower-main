'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FilterPanelWidgetConfig } from './FilterPanelConfig.types';

interface FilterPanelSidebarState {
    isOpen: boolean;
    config: FilterPanelWidgetConfig | null;
    title: string;
    backgroundColor?: string;
}

interface FilterPanelSidebarContextValue {
    state: FilterPanelSidebarState;
    openFilterSidebar: (config: FilterPanelWidgetConfig, title?: string, backgroundColor?: string) => void;
    closeFilterSidebar: () => void;
}

const FilterPanelSidebarContext = createContext<FilterPanelSidebarContextValue | null>(null);

export const FilterPanelSidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<FilterPanelSidebarState>({
        isOpen: false,
        config: null,
        title: 'Filter Panel',
    });

    const openFilterSidebar = useCallback(
        (config: FilterPanelWidgetConfig, title = 'Filter Panel', backgroundColor?: string) => {
            setState({ isOpen: true, config, title, backgroundColor });
        },
        []
    );

    const closeFilterSidebar = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const value: FilterPanelSidebarContextValue = {
        state,
        openFilterSidebar,
        closeFilterSidebar,
    };

    return (
        <FilterPanelSidebarContext.Provider value={value}>
            {children}
        </FilterPanelSidebarContext.Provider>
    );
};

export function useFilterPanelSidebar(): FilterPanelSidebarContextValue | null {
    return useContext(FilterPanelSidebarContext);
}
