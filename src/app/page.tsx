'use client';
import React, { useState } from 'react';
import { useURLParams } from '../hooks/ui/useURLParams';
import { useAdminCheck } from '../hooks/auth/useAdminCheck';
import { useMenuItems } from '../hooks/dashboard/useMenuItems';
import { useConfiguration } from '../hooks/config/useConfiguration';
import { useDashboardState } from '../hooks/dashboard/useDashboardState';
import { useBackgroundStyle } from '../hooks/config/useBackgroundStyle';
import { useEditMode } from '../hooks/ui/useEditMode';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardConfiguration } from '@/components/dashboard/DashboardConfiguration';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { DashboardError } from '@/components/dashboard/DashboardError';

const Dashboard: React.FC = () => {
    const [configDialogVisible, setConfigDialogVisible] = useState(false);

    // Custom hooks
    const urlParams = useURLParams();
    const { isAdmin, adminCheckLoading, adminCheckError } = useAdminCheck();
    const { menuItems, setMenuItems, isLoading, error } = useMenuItems(isAdmin, adminCheckLoading);
    const {
        configuration,
        isLoading: configLoading,
        saveConfiguration,
        resetConfiguration,
    } = useConfiguration();

    // Edit mode and standalone mode logic
    const { isEditModeAllowed, isStandaloneAllowed } = useEditMode({
        isAdmin,
        urlParams,
    });

    // Dashboard state management (menu item selection)
    const { selectedMenuItem, handleMenuItemSelect } = useDashboardState({
        menuItems,
        isStandaloneAllowed,
        urlParams,
    });

    // Background style calculation
    const backgroundStyle = useBackgroundStyle(configuration);

    // Configuration handlers
    const handleOpenConfigDialog = () => {
        setConfigDialogVisible(true);
    };

    const handleCloseConfigDialog = () => {
        setConfigDialogVisible(false);
    };

    const handleSaveConfiguration = async (config: any) => {
        return await saveConfiguration(config);
    };

    const handleResetConfiguration = async () => {
        await resetConfiguration();
    };

    // Show loading screen while checking admin status or loading configuration
    if (adminCheckLoading || configLoading || isLoading) {
        return <DashboardLoading />;
    }

    // Show error message if there's an error
    if (error || adminCheckError) {
        return <DashboardError error={error || adminCheckError} />;
    }

    return (
        <DashboardLayout
            backgroundStyle={backgroundStyle}
            isStandaloneAllowed={isStandaloneAllowed}
            selectedMenuItem={selectedMenuItem}
            menuItems={menuItems}
            onMenuItemSelect={handleMenuItemSelect}
            onMenuItemsChange={setMenuItems}
            isLoading={isLoading}
            isEditModeAllowed={isEditModeAllowed}
        >
            <DashboardContent
                selectedMenuItem={selectedMenuItem}
                isAdmin={isAdmin}
                isEditModeAllowed={isEditModeAllowed}
                configuration={configuration}
                onOpenConfigDialog={handleOpenConfigDialog}
            />

            <DashboardConfiguration
                visible={configDialogVisible}
                isEditModeAllowed={isEditModeAllowed}
                configuration={configuration}
                onHide={handleCloseConfigDialog}
                onSave={handleSaveConfiguration}
                onReset={handleResetConfiguration}
            />
        </DashboardLayout>
    );
};

export default Dashboard;
