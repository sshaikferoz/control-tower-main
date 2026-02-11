'use client';

import React, { useMemo, useState } from 'react';
import { DashboardMenuWidgetConfig, DashboardMenuItemConfig, DASHBOARD_MENU_ICONS } from './DashboardMenuConfig.types';
import { TargetReportConfig } from '@/helpers/types';
import { applyTypographyStyles } from '@/helpers/typographyHelper';
import { openReport } from '@/utils/openReportUtils';

const DASHBOARD_MENU_ICON_BASE_URL = `${process.env.NEXT_PUBLIC_BSP_NAME || ''}/icons`;

interface DashboardMenuProps {
    title?: string;
    dashboardMenuConfig?: DashboardMenuWidgetConfig;
    backgroundColor?: string;
    typography?: any;
}

const MENU_ICON_IDS: Set<string> = new Set(DASHBOARD_MENU_ICONS.map((i) => i.id));

const iconSizeClasses = { small: 'h-6 w-6', large: 'h-16 w-16' } as const;
const iconInnerClasses = { small: 'h-4 w-4', large: 'h-10 w-10' } as const;

const MenuIcon: React.FC<{
    type?: DashboardMenuItemConfig['iconType'];
    size?: 'small' | 'large';
}> = ({ type, size = 'small' }) => {
    const iconType = type || 'report';
    const outer = iconSizeClasses[size];
    const inner = iconInnerClasses[size];

    // Custom icon from public/icons (e.g. "dashboard-icon.png")
    if (iconType && typeof iconType === 'string' && MENU_ICON_IDS.has(iconType)) {
        return (
            <span className={`${outer} mr-2 inline-flex flex-shrink-0 items-center justify-center rounded-lg bg-white/10`}>
                <img
                    src={`${DASHBOARD_MENU_ICON_BASE_URL}/${iconType}`}
                    alt=""
                    className={`${inner} object-contain brightness-0 invert`}
                />
            </span>
        );
    }

    if (iconType === 'dashboard') {
        return (
            <span className={`${outer} mr-2 inline-flex items-center justify-center rounded-lg bg-white/10`}>
                <svg
                    className={size === 'large' ? 'h-8 w-8 text-cyan-300' : 'h-3.5 w-3.5 text-cyan-300'}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                </svg>
            </span>
        );
    }

    if (iconType === 'user') {
        return (
            <span className={`${outer} mr-2 inline-flex items-center justify-center rounded-lg bg-white/10`}>
                <svg
                    className={size === 'large' ? 'h-8 w-8 text-cyan-300' : 'h-3.5 w-3.5 text-cyan-300'}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                    <path
                        d="M3.5 12.5C4.2 10.8 5.9 9.75 8 9.75C10.1 9.75 11.8 10.8 12.5 12.5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                </svg>
            </span>
        );
    }

    // Default: report/document icon
    return (
        <span className={`${outer} mr-2 inline-flex items-center justify-center rounded-lg bg-white/10`}>
            <svg
                className={size === 'large' ? 'h-8 w-8 text-cyan-300' : 'h-3.5 w-3.5 text-cyan-300'}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M5 3.5C5 3.22386 5.22386 3 5.5 3H9.5L11.5 5V12.5C11.5 12.7761 11.2761 13 11 13H5C4.72386 13 4.5 12.7761 4.5 12.5V3.5C4.5 3.22386 4.72386 3 5 3Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M8 7H6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M9.5 9H6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
        </span>
    );
};

/** Single tile: logo at top, then title and description (for displayMode === 'single'). */
const SingleDashboardCard: React.FC<{
    item: DashboardMenuItemConfig;
}> = ({ item }) => {
    const { targetReport } = item;

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await openReport(targetReport);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="group flex h-full w-full cursor-pointer flex-col rounded-lg border border-transparent p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
            <div className="mb-3 flex flex-shrink-0 justify-start">
                <MenuIcon type={item.iconType} size="large" />
            </div>
            <div className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-white group-hover:text-cyan-200">
                    {targetReport.name || 'Untitled report'}
                </span>
                {targetReport.description && (
                    <span className="mt-0.5 block line-clamp-3 text-sm text-white/60">
                        {targetReport.description}
                    </span>
                )}
            </div>
        </button>
    );
};

const DashboardMenuItem: React.FC<{
    item: DashboardMenuItemConfig;
}> = ({ item }) => {
    const { targetReport } = item;

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await openReport(targetReport);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="group flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
            <div className="flex flex-1 items-start gap-2">
                <MenuIcon type={item.iconType} />
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-200">
                        {targetReport.name || 'Untitled report'}
                    </span>
                    {targetReport.description && (
                        <span className="mt-0.5 line-clamp-2 text-[0.65rem] text-white/70">
                            {targetReport.description}
                        </span>
                    )}
                </div>
            </div>
            <span className="ml-3 flex items-center text-[0.65rem] text-cyan-300">
                Open
                <svg
                    className="ml-1 h-3 w-3"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4 12L12 4M7 4H12V9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
        </button>
    );
};

const DashboardMenu: React.FC<DashboardMenuProps> = ({
    title,
    dashboardMenuConfig,
    backgroundColor,
    typography,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const items = dashboardMenuConfig?.items || [];
    const displayMode = dashboardMenuConfig?.displayMode ?? 'multiple';
    const isSingle = displayMode === 'single';
    const firstItem = items[0];

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.trim().toLowerCase();
        return items.filter((item) => {
            const name = (item.targetReport?.name || '').toLowerCase();
            const desc = (item.targetReport?.description || '').toLowerCase();
            return name.includes(q) || desc.includes(q);
        });
    }, [items, searchQuery]);

    const base = backgroundColor || '#00214E';
    const light = backgroundColor ? `${backgroundColor}80` : '#0164B0';

    const backgroundStyle: React.CSSProperties = {
        backgroundImage: `linear-gradient(to bottom, ${base}, ${light})`,
        color: '#ffffff',
    };

    // Single card: show tile only when there is an item; no default "Dashboard Menu" title
    if (isSingle) {
        if (!firstItem) {
            return null;
        }
        return (
            <div className="relative h-full w-full">
                <div
                    className="flex h-full w-full flex-col rounded-xl border border-[#00214E] bg-[#00214E] text-white"
                    style={backgroundStyle}
                >
                    {title ? (
                        <div className="px-4 pt-3 pb-2">
                            <span
                                className="text-xs font-semibold uppercase tracking-wide text-white/80"
                                style={applyTypographyStyles('title', typography)}
                            >
                                {title}
                            </span>
                        </div>
                    ) : null}
                    <div className="flex-1 overflow-hidden px-4 pb-4">
                        <SingleDashboardCard item={firstItem} />
                    </div>
                </div>
            </div>
        );
    }

    // Multiple: list with search
    return (
        <div className="relative h-full w-full">
            <div
                className="flex h-full w-full flex-col rounded-xl border border-[#00214E] bg-[#00214E] text-white"
                style={backgroundStyle}
            >
                <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
                    <div className="flex flex-col min-w-0 flex-1">
                        <span
                            className="text-xs font-semibold uppercase tracking-wide text-white/80"
                            style={applyTypographyStyles('title', typography)}
                        >
                            {title || 'Dashboard Menu'}
                        </span>
                    </div>
                    <div className="flex-shrink-0 flex items-center rounded-md border border-white/20 bg-white/10 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 w-32 sm:w-40">
                        <span className="pointer-events-none pl-2.5 text-white/50" aria-hidden>
                            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                                <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                        </span>
                        <input
                            type="search"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full min-w-0 rounded-md bg-transparent px-2 py-1.5 pr-2 text-xs text-white placeholder:text-white/50 focus:outline-none"
                            aria-label="Search menu items"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1">
                    {items.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <span className="text-xs text-white/70">
                                No reports configured. Use the configuration panel to add menu
                                items.
                            </span>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <span className="text-xs text-white/70">
                                No items match &quot;{searchQuery}&quot;.
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {filteredItems.map((item) => (
                                <DashboardMenuItem key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardMenu;

