'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FilterPanelWidgetConfig } from './FilterPanelConfig.types';
import type { FilterVariable } from './FilterPanelConfig.types';

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
    getDraftValues: (config: FilterPanelWidgetConfig) => Record<string, FilterVariable> | null;
    setDraftValues: (config: FilterPanelWidgetConfig, values: Record<string, FilterVariable>) => void;
    clearDraftValues: (config: FilterPanelWidgetConfig) => void;
}

const FilterPanelSidebarContext = createContext<FilterPanelSidebarContextValue | null>(null);

function getConfigKey(config: FilterPanelWidgetConfig): string {
    const componentSignature = config.components
        .map((component) => `${component.id}:${component.variableName}:${component.type}:${component.selectionMode}`)
        .join('|');
    return `${config.eventName}::${componentSignature}`;
}

export const FilterPanelSidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<FilterPanelSidebarState>({
        isOpen: false,
        config: null,
        title: 'Filter Panel',
    });
    const [draftValuesByConfig, setDraftValuesByConfig] = useState<Record<string, Record<string, FilterVariable>>>({});

    const openFilterSidebar = useCallback(
        (config: FilterPanelWidgetConfig, title = 'Filter Panel', backgroundColor?: string) => {
            setState({ isOpen: true, config, title, backgroundColor });
        },
        []
    );

    const closeFilterSidebar = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const getDraftValues = useCallback((config: FilterPanelWidgetConfig) => {
        return draftValuesByConfig[getConfigKey(config)] || null;
    }, [draftValuesByConfig]);

    const setDraftValues = useCallback((config: FilterPanelWidgetConfig, values: Record<string, FilterVariable>) => {
        const key = getConfigKey(config);
        setDraftValuesByConfig((prev) => {
            if (prev[key] === values) return prev;
            return {
                ...prev,
                [key]: values,
            };
        });
    }, []);

    const clearDraftValues = useCallback((config: FilterPanelWidgetConfig) => {
        const key = getConfigKey(config);
        setDraftValuesByConfig((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const value: FilterPanelSidebarContextValue = {
        state,
        openFilterSidebar,
        closeFilterSidebar,
        getDraftValues,
        setDraftValues,
        clearDraftValues,
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
