import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MenuItem } from '@/types';

interface DashboardLayoutProps {
    children: React.ReactNode;
    backgroundStyle: React.CSSProperties;
    isStandaloneAllowed: boolean;
    selectedMenuItem: MenuItem | null;
    menuItems: MenuItem[];
    onMenuItemSelect: (item: MenuItem) => void;
    onMenuItemsChange: (items: MenuItem[]) => void;
    isLoading: boolean;
    isEditModeAllowed: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    backgroundStyle,
    isStandaloneAllowed,
    selectedMenuItem,
    menuItems,
    onMenuItemSelect,
    onMenuItemsChange,
    isLoading,
    isEditModeAllowed,
}) => {
    return (
        <div
            className="flex h-screen bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]"
            style={backgroundStyle}
        >
            {/* Show sidebar (hide in standalone mode) */}
            {!isStandaloneAllowed && (
                <Sidebar
                    selectedItem={selectedMenuItem?.id || ''}
                    onItemSelect={onMenuItemSelect}
                    menuItems={menuItems}
                    onMenuItemsChange={onMenuItemsChange}
                    isLoading={isLoading}
                    isEditModeAllowed={isEditModeAllowed}
                />
            )}

            {children}
        </div>
    );
};

