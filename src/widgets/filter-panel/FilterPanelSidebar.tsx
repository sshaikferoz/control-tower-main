'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    XMarkIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useFilterPanelSidebar } from './FilterPanelSidebarContext';
import { FilterPanelContent } from './FilterPanel';
import { useAppSelector } from '@/store/hooks';
import type { FilterValue } from '@/store/filterSlice';

function isValueApplied(value: FilterValue | undefined): boolean {
    if (value == null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if ('nodeKey' in value) return value.nodeKey.trim().length > 0;
    return Boolean(value.from?.trim() || value.to?.trim());
}

function formatAppliedValue(value: FilterValue | undefined): string {
    if (value == null) return '';
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) return value.map((v) => (typeof v === 'string' ? v : v.nodeKey)).join(', ');
    if ('nodeKey' in value) return value.nodeKey.trim();
    if (!isValueApplied(value)) return '';
    const from = value.from?.trim() ?? '';
    const to = value.to?.trim() ?? '';
    if (from && to) return `${from} to ${to}`;
    if (from) return `From ${from}`;
    return `To ${to}`;
}

/**
 * Absolute sidebar panel: left = filter list, right = content for selected filter.
 * Place this component in your dashboard layout (e.g. DashboardBuilder, DashboardSection).
 */
export const FilterPanelSidebar: React.FC = () => {
    const ctx = useFilterPanelSidebar();
    const state = ctx?.state;
    const config = state?.config ?? null;
    const components = config?.components ?? [];
    const appliedFilterState = useAppSelector((rootState) => rootState.filters);
    const [selectedId, setSelectedId] = useState<string | null>(() => components[0]?.id ?? null);
    const applyFilterRef = useRef<(() => void) | null>(null);
    const clearFilterRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const firstId = components[0]?.id ?? null;
        setSelectedId((prev) => (components.some((c) => c.id === prev) ? prev : firstId));
    }, [config, components]);

    const selectedComponent = useMemo(
        () => components.find((c) => c.id === selectedId) ?? components[0],
        [components, selectedId]
    );
    const appliedVariables = useMemo(() => {
        if (!config || appliedFilterState.eventName !== config.eventName) return {};
        return appliedFilterState.variables;
    }, [appliedFilterState.eventName, appliedFilterState.variables, config]);
    const selectedAppliedText = useMemo(() => {
        if (!selectedComponent) return '';
        return formatAppliedValue(appliedVariables[selectedComponent.variableName]);
    }, [appliedVariables, selectedComponent]);

    if (!ctx || !state?.isOpen || !config) return null;

    const { closeFilterSidebar } = ctx;

    const backgroundColor = state.backgroundColor || '#00214E';
    const defaultLighterColor = `${backgroundColor}80`;
    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${backgroundColor}, ${defaultLighterColor})`,
        color: '#ffffff',
    };

    return (
        <>
            <div
                className="filter-panel-sidebar-overlay fixed inset-0 z-40 bg-slate-950/55"
                aria-hidden
                onClick={closeFilterSidebar}
            />
            <div
                className="filter-panel-sidebar-panel fixed left-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col border-r border-white/15 md:max-w-3xl"
                style={backgroundStyle}
                role="dialog"
                aria-label="Filter panel"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-1 min-h-0">
                    {/* Left: Filter list */}
                    <div className="filter-panel-sidebar-nav flex w-56 shrink-0 flex-col border-r border-white/15 bg-[#011734]/35 md:w-64">
                        <div className="filter-panel-title-bar flex items-center justify-between gap-2 border-b border-white/15 px-3 py-3">
                            <h2 className="text-base font-semibold text-white truncate tracking-tight">{state.title}</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => clearFilterRef.current?.()}
                                    className="filter-panel-btn-secondary shrink-0 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:border-white/35 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFilterRef.current?.()}
                                    className="filter-panel-btn-primary shrink-0 rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold transition-all hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
                            {components.map((component) => {
                                const isSelected = selectedId === component.id;
                                const hasAppliedValue = isValueApplied(appliedVariables[component.variableName]);
                                return (
                                    <button
                                        key={component.id}
                                        type="button"
                                        onClick={() => setSelectedId(component.id)}
                                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${isSelected
                                            ? 'filter-panel-nav-item-selected border border-cyan-300/35 bg-cyan-300/15 text-white'
                                            : 'border border-transparent text-white/90 hover:border-white/15 hover:bg-white/10'
                                            }`}
                                    >
                                        <span className="min-w-0 flex-1 truncate text-sm font-medium">{component.label}</span>
                                        {hasAppliedValue && (
                                            <span className="filter-panel-applied-badge rounded-full border border-cyan-300/40 bg-cyan-300/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-100">
                                                Applied
                                            </span>
                                        )}
                                        <ChevronRightIcon className={`filter-panel-nav-chevron h-4 w-4 shrink-0 transition-transform ${isSelected ? 'text-cyan-100' : 'text-white/45 group-hover:translate-x-0.5 group-hover:text-white/70'}`} />
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right: Content for selected filter */}
                    <div className="filter-panel-sidebar-content-inner flex min-w-0 flex-1 flex-col bg-[#031e45]/30">
                        {selectedComponent ? (
                            <>
                                <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
                                    <h3 className="filter-panel-label text-lg font-semibold tracking-tight text-white">{selectedComponent.label}</h3>
                                    <button
                                        type="button"
                                        onClick={closeFilterSidebar}
                                        className="filter-panel-close-btn rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                                        aria-label="Close filter panel"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="border-b border-white/10 bg-white/[0.03] px-5 py-2.5">
                                    <p className="filter-panel-hint text-xs text-cyan-50/90">
                                        {selectedAppliedText
                                            ? `Applied filter: ${selectedAppliedText}`
                                            : 'No applied filter yet. Update values and click Apply.'}
                                    </p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-5">
                                    <FilterPanelContent
                                        filterPanelConfig={config}
                                        title={state.title}
                                        backgroundColor={backgroundColor}
                                        selectedComponentId={selectedComponent.id}
                                        onApplyRef={applyFilterRef}
                                        onClearRef={clearFilterRef}
                                        showQueryDebugErrors={state.showQueryDebugErrors === true}
                                        debugWidgetName={state.debugWidgetName}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="filter-panel-empty-msg flex flex-1 items-center justify-center p-4 text-sm text-white/60">
                                Select a filter from the list
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
