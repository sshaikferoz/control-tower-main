'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PSCLogo from '@/assets/PSCLogo';
import { WIDGETS } from '../config/widgets.config';
import { WidgetItem } from './WidgetItem';

interface WidgetSidebarProps {
    onItemClick: (widgetName: string) => void;
    theme?: 'light' | 'dark';
}

// Theme colors for sidebar
const sidebarThemeColors = {
    light: {
        '--sidebar-bg': 'linear-gradient(to bottom, #00214E, #0164B0)',
        '--sidebar-text': '#ffffff',
        '--sidebar-search-bg': 'rgba(255, 255, 255, 0.2)',
        '--sidebar-search-placeholder': '#d1d5db',
        '--sidebar-item-hover': 'rgba(255, 255, 255, 0.3)',
        '--sidebar-item-selected-bg': '#ffffff',
        '--sidebar-item-selected-text': '#000000',
    },
    dark: {
        '--sidebar-bg': 'linear-gradient(to bottom, #1a4d8f, #2a5ca0)',
        '--sidebar-text': '#ededed',
        '--sidebar-search-bg': 'rgba(255, 255, 255, 0.15)',
        '--sidebar-search-placeholder': '#9ca3af',
        '--sidebar-item-hover': 'rgba(255, 255, 255, 0.25)',
        '--sidebar-item-selected-bg': '#ffffff',
        '--sidebar-item-selected-text': '#000000',
    },
};

export const WidgetSidebar: React.FC<WidgetSidebarProps> = ({ onItemClick, theme = 'light' }) => {
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    // Filter widgets based on search
    const filteredWidgets = WIDGETS.filter((widget) =>
        widget.name.toLowerCase().includes(search.toLowerCase()) ||
        widget.displayName.toLowerCase().includes(search.toLowerCase())
    );

    const handleWidgetClick = (widgetName: string) => {
        setSelectedItem(widgetName);
        onItemClick(widgetName);
    };

    const colors = sidebarThemeColors[theme];

    return (
        <div
            className="flex h-screen w-64 max-w-64 min-w-64 flex-shrink-0 flex-col p-4"
            style={{
                ...colors,
                background: 'var(--sidebar-bg)',
                color: 'var(--sidebar-text)',
            } as React.CSSProperties}
        >
            {/* Header - Fixed height to prevent shifts */}
            <div className="flex h-16 flex-shrink-0 flex-row items-center space-x-2">
                <PSCLogo className="h-[31px] w-[29px] shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col">
                    <h1 className="text-lg leading-tight font-semibold">P&SC</h1>
                    <h1 className="text-lg leading-tight font-semibold">Intelligence Centre</h1>
                </div>
            </div>

            {/* Search - Fixed height */}
            <div className="relative mt-4 flex-shrink-0">
                <style>{`
          .widget-search-input::placeholder {
            color: var(--sidebar-search-placeholder);
          }
        `}</style>
                <MagnifyingGlassIcon
                    className="pointer-events-none absolute top-3 left-3 h-5 w-5"
                    style={{ color: 'var(--sidebar-search-placeholder)' }}
                />
                <input
                    type="text"
                    placeholder="Search Widget"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="widget-search-input w-full rounded-md p-2 pl-10 outline-none"
                    style={{
                        backgroundColor: 'var(--sidebar-search-bg)',
                        color: 'var(--sidebar-text)',
                    }}
                />
            </div>

            {/* Navigation - Scrollable content */}
            <nav className="mt-6 min-h-0 flex-1">
                <ul className="h-full space-y-2 overflow-x-hidden overflow-y-auto">
                    {filteredWidgets.map((widget) => (
                        <WidgetItem
                            key={widget.id}
                            widget={widget}
                            isSelected={selectedItem === widget.name}
                            onClick={handleWidgetClick}
                            theme={theme}
                        />
                    ))}
                </ul>
            </nav>
        </div>
    );
};

