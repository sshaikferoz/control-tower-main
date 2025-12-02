import React from 'react';
import Home from '@/components/pages/Home';
import { MenuItem } from '@/types';
import { UIConfiguration } from '@/types/configuration';

interface DashboardContentProps {
    selectedMenuItem: MenuItem | null;
    isAdmin: boolean;
    isEditModeAllowed: boolean;
    configuration: UIConfiguration;
    onOpenConfigDialog: () => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
    selectedMenuItem,
    isAdmin,
    isEditModeAllowed,
    configuration,
    onOpenConfigDialog,
}) => {
    // Don't render content if no menu item is selected yet
    if (!selectedMenuItem) {
        return null;
    }

    const selectedMenuItemId = selectedMenuItem?.id;

    return (
        <Home
            selectedMenuItemId={selectedMenuItemId}
            isAdmin={isAdmin}
            isEditModeAllowed={isEditModeAllowed}
            configuration={configuration}
            onOpenConfigDialog={onOpenConfigDialog}
        />
    );
};

