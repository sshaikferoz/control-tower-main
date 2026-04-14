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
    isAdmin?: boolean;
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
    isAdmin = false,
}) => {
    return (
        <div
            className="dashboard-layout flex h-screen transition-colors duration-300"
            style={{ background: 'var(--dashboard-bg)', ...backgroundStyle }}
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
                    isAdmin={isAdmin}
                />
            )}

            {children}
        </div>
    );
};

