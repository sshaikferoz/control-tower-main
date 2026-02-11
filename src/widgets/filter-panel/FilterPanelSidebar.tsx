'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    XMarkIcon,
    ChevronRightIcon,
    ListBulletIcon,
    UserIcon,
    BriefcaseIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    UserGroupIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    CurrencyDollarIcon,
    BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useFilterPanelSidebar } from './FilterPanelSidebarContext';
import { FilterPanelContent } from './FilterPanel';
import type { FilterComponent } from './FilterPanelConfig.types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    lists: ListBulletIcon,
    name: UserIcon,
    'job titles': BriefcaseIcon,
    persona: UserIcon,
    company: BuildingOfficeIcon,
    location: MapPinIcon,
    employees: UserGroupIcon,
    industry: ChartBarIcon,
    owner: UserIcon,
    technologies: Cog6ToothIcon,
    revenue: CurrencyDollarIcon,
    funding: BanknotesIcon,
    'job changes': BriefcaseIcon,
};

function getFilterIcon(component: FilterComponent) {
    const key = component.label.toLowerCase().trim();
    return ICON_MAP[key] ?? (component.type === 'list' ? ListBulletIcon : component.type === 'datePicker' ? ChartBarIcon : UserIcon);
}

/**
 * Absolute sidebar panel: left = filter list, right = content for selected filter.
 * Place this component in your dashboard layout (e.g. DashboardBuilder, DashboardSection).
 */
export const FilterPanelSidebar: React.FC = () => {
    const ctx = useFilterPanelSidebar();
    if (!ctx || !ctx.state.isOpen || !ctx.state.config) return null;

    const { state, closeFilterSidebar } = ctx;
    const config = ctx.state.config;
    const components = config.components ?? [];
    const [selectedId, setSelectedId] = useState<string | null>(() => components[0]?.id ?? null);
    const applyFilterRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const firstId = components[0]?.id ?? null;
        setSelectedId((prev) => (components.some((c) => c.id === prev) ? prev : firstId));
    }, [config, components]);

    const selectedComponent = useMemo(
        () => components.find((c) => c.id === selectedId) ?? components[0],
        [components, selectedId]
    );

    const backgroundColor = state.backgroundColor || '#00214E';
    const defaultLighterColor = `${backgroundColor}80`;
    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${backgroundColor}, ${defaultLighterColor})`,
        color: '#ffffff',
    };

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/30"
                aria-hidden
                onClick={closeFilterSidebar}
            />
            <div
                className="fixed left-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col shadow-2xl md:max-w-3xl"
                style={backgroundStyle}
                role="dialog"
                aria-label="Filter panel"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-1 min-h-0">
                    {/* Left: Filter list */}
                    <div className="flex w-56 shrink-0 flex-col border-r border-white/20 md:w-64">
                        <div className="flex items-center justify-between gap-2 border-b border-white/20 px-3 py-2.5">
                            <h2 className="text-base font-bold text-white truncate">{state.title}</h2>
                            <button
                                type="button"
                                onClick={() => applyFilterRef.current?.()}
                                className="shrink-0 rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                            >
                                Apply Filter
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto py-2">
                            {components.map((component) => {
                                const Icon = getFilterIcon(component);
                                const isSelected = selectedId === component.id;
                                return (
                                    <button
                                        key={component.id}
                                        type="button"
                                        onClick={() => setSelectedId(component.id)}
                                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${isSelected ? 'bg-cyan-500/20 text-white' : 'text-white/90 hover:bg-white/10'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5 shrink-0 text-white/80" />
                                        <span className="min-w-0 flex-1 truncate text-sm font-medium">{component.label}</span>
                                        <ChevronRightIcon className="h-4 w-4 shrink-0 text-white/60" />
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right: Content for selected filter */}
                    <div className="flex min-w-0 flex-1 flex-col bg-white/5">
                        {selectedComponent ? (
                            <>
                                <div className="flex items-center justify-between border-b border-white/20 px-4 py-3">
                                    <h3 className="text-lg font-semibold text-white">{selectedComponent.label}</h3>
                                    <button
                                        type="button"
                                        onClick={closeFilterSidebar}
                                        className="rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                                        aria-label="Close filter panel"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    <FilterPanelContent
                                        filterPanelConfig={config}
                                        title={state.title}
                                        backgroundColor={backgroundColor}
                                        selectedComponentId={selectedComponent.id}
                                        onApplyRef={applyFilterRef}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center p-4 text-white/60 text-sm">
                                Select a filter from the list
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
