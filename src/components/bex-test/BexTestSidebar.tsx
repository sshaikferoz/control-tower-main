'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { ScrollPanel } from 'primereact/scrollpanel';
import { classNames } from 'primereact/utils';
import PSCLogo from '@/assets/PSCLogo';

export interface BexTestMenuItem {
    id: string;
    name: string;
    label: string;
    icon?: string;
    description?: string;
}

interface BexTestSidebarProps {
    visible?: boolean;
    onItemClick?: (item: BexTestMenuItem) => void;
    menuItems?: BexTestMenuItem[];
    className?: string;
}

const defaultMenuItems: BexTestMenuItem[] = [
    { id: 'bex-query-1', name: 'YPDO_IPR_FILTER_XML', label: 'IPR Filter Query', description: 'Filter query for IPR data' },
    { id: 'bex-query-2', name: 'YCUS_ON_HAND_INV_DTL_03', label: 'On Hand Inventory', description: 'Inventory detail query' },
    { id: 'bex-query-3', name: 'YPDO_PO_HEADER', label: 'PO Header Query', description: 'Purchase order header data' },
    { id: 'bex-query-4', name: 'YPDO_CONTRACT_DETAILS', label: 'Contract Details', description: 'Contract information query' },
];

export const BexTestSidebar: React.FC<BexTestSidebarProps> = ({
    visible = true,
    onItemClick,
    menuItems = defaultMenuItems,
    className = '',
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check for theme preference
        const checkTheme = () => {
            const root = document.documentElement;
            const isDarkMode = root.classList.contains('dark') ||
                (!root.classList.contains('light') &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches);
            setIsDark(isDarkMode);
        };

        checkTheme();

        // Watch for theme changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        // Watch for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => checkTheme();
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) {
            return menuItems;
        }
        const searchLower = searchTerm.toLowerCase();
        return menuItems.filter((item) =>
            item.name.toLowerCase().includes(searchLower) ||
            item.label.toLowerCase().includes(searchLower) ||
            (item.description && item.description.toLowerCase().includes(searchLower))
        );
    }, [menuItems, searchTerm]);

    const handleItemClick = (item: BexTestMenuItem) => {
        setSelectedItem(item.id);
        onItemClick?.(item);
    };

    const sidebarClasses = classNames(
        'bex-test-sidebar',
        'h-screen',
        'flex',
        'flex-col',
        'w-64',
        'min-w-64',
        'max-w-64',
        'flex-shrink-0',
        {
            'bg-gradient-to-b from-[#00214E] to-[#0164B0]': !isDark,
            'bg-gradient-to-b from-gray-900 to-gray-800': isDark,
        },
        className
    );

    const headerClasses = classNames(
        'flex',
        'h-16',
        'flex-shrink-0',
        'flex-row',
        'items-center',
        'space-x-2',
        'px-4',
        'pt-4',
        {
            'text-white': true,
        }
    );

    const searchInputClasses = classNames(
        'w-full',
        'p-inputtext-sm',
        {
            'bg-white/20 border-white/30 text-white placeholder:text-gray-300': !isDark,
            'bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400': isDark,
        }
    );

    const menuItemClasses = (itemId: string) => classNames(
        'cursor-pointer',
        'rounded-lg',
        'px-4',
        'py-3',
        'mb-2',
        'transition-all',
        'duration-200',
        {
            'bg-white text-gray-900': selectedItem === itemId && !isDark,
            'bg-gray-700 text-white': selectedItem === itemId && isDark,
            'bg-white/10 text-white hover:bg-white/20': selectedItem !== itemId && !isDark,
            'bg-gray-800/50 text-gray-200 hover:bg-gray-700/70': selectedItem !== itemId && isDark,
        }
    );

    return (
        <div className={sidebarClasses}>
            {/* Header */}
            <div className={headerClasses}>
                <PSCLogo className="h-[31px] w-[29px] shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col">
                    <h1 className="text-lg leading-tight font-semibold">P&SC</h1>
                    <h1 className="text-lg leading-tight font-semibold">BEX Test</h1>
                </div>
            </div>

            {/* Search */}
            <div className="px-4 pt-4 flex-shrink-0">
                <span className="p-input-icon-left w-full block">
                    <i className={classNames('pi pi-search absolute left-3 top-1/2 -translate-y-1/2', {
                        'text-gray-300': !isDark,
                        'text-gray-400': isDark,
                    })} />
                    <InputText
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search BEX Query..."
                        className={searchInputClasses}
                        style={{
                            paddingLeft: '2.5rem',
                        }}
                    />
                </span>
            </div>

            {/* Navigation */}
            <div className="flex-1 mt-4 min-h-0 overflow-hidden">
                <ScrollPanel style={{ height: '100%', width: '100%' }}>
                    <div className="px-4 space-y-2">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={menuItemClasses(item.id)}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-sm capitalize">
                                                {item.label}
                                            </span>
                                            {selectedItem === item.id && (
                                                <i className="pi pi-check-circle text-sm" />
                                            )}
                                        </div>
                                        <span className="text-xs opacity-75 font-mono">
                                            {item.name}
                                        </span>
                                        {item.description && (
                                            <span className="text-xs opacity-60 mt-1">
                                                {item.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <i className="pi pi-search text-2xl mb-2" />
                                <p className="text-sm">No queries found</p>
                            </div>
                        )}
                    </div>
                </ScrollPanel>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-white/10">
                <div className="text-xs text-white/60 text-center">
                    {filteredItems.length} of {menuItems.length} queries
                </div>
            </div>
        </div>
    );
};

export default BexTestSidebar;

