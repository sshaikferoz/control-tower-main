//app page.tsx
// Simplified Dashboard component - only handles Section type menu items
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useURLParams } from '../hooks/useURLParams';
import { useAdminCheck } from '../hooks/useAdminCheck';
import { useMenuItems } from '../hooks/useMenuItems';
import { useConfiguration } from '../hooks/useConfiguration';
import { Sidebar } from '@/components/layout/Sidebar';
import { ConfigurationDialog } from '@/components/dialogs/ConfigurationDialog';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorScreen } from '@/components/ui/ErrorScreen';
import Home from '@/components/pages/Home';

const Dashboard: React.FC = () => {
    const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
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

    // Check if edit mode is allowed based on admin status and URL parameter
    const isEditModeAllowed = useMemo(() => {
        if (!isAdmin) return false;
        return urlParams?.get('view') === 'edit';
    }, [isAdmin, urlParams]);

    // Check if standalone mode is allowed based on URL params
    const isStandaloneAllowed = useMemo(() => {
        return !!urlParams?.get('appId'); // Just check if appId exists
    }, [urlParams]);

    // Default to first menu item when menuItems are loaded
    useEffect(() => {
        if (menuItems.length > 0 && !selectedMenuItem && !isStandaloneAllowed) {
            // Sort menu items by order to ensure we get the first one
            const sortedMenuItems = [...menuItems].sort((a, b) => (a.order || 0) - (b.order || 0));
            const firstMenuItem = sortedMenuItems[0];
            setSelectedMenuItem(firstMenuItem);
        }
    }, [menuItems, selectedMenuItem, isStandaloneAllowed]);

    // If standalone mode, force the selectedMenuItem to appId
    useEffect(() => {
        if (isStandaloneAllowed) {
            const appId = urlParams?.get('appId');
            if (appId && menuItems.length > 0) {
                // Find the menu item that matches the appId
                const matchedItem = menuItems.find((item) => item.appid === appId);
                if (matchedItem) {
                    setSelectedMenuItem(matchedItem);
                }
            }
        }
    }, [isStandaloneAllowed, urlParams, menuItems]);

    useEffect(() => {
        if (selectedMenuItem) {
            const tabName = selectedMenuItem.name || selectedMenuItem.tabname || 'Dashboard';
            document.title = tabName;
        }
    }, [selectedMenuItem]);

    // Handle menu item selection
    const handleMenuItemSelect = (item: any) => {
        setSelectedMenuItem(item);
    };

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

    // Generate background style based on configuration
    const backgroundStyle = useMemo(() => {
        if (!configuration.background.enabled) {
            return {
                background: 'linear-gradient(to bottom right, #0a1a35, #1a3a6b)',
            };
        }

        const backgroundImage =
            configuration.background.useBase64 && configuration.background.imageBase64
                ? configuration.background.imageBase64
                : configuration.background.imageUrl;

        return {
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: configuration.background.opacity / 100,
        };
    }, [configuration.background]);

    // Render content - always render Home component for Section type
    const renderContent = () => {
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
                onOpenConfigDialog={handleOpenConfigDialog}
            />
        );
    };

    // Show loading screen while checking admin status or loading configuration
    if (adminCheckLoading || configLoading || isLoading) {
        return (
            <LoadingScreen
                title="Loading..."
                message="Checking user permissions and loading configuration..."
            />
        );
    }

    // Show error message if there's an error
    if (error || adminCheckError) {
        return (
            <ErrorScreen
                title="Warning"
                message={error || adminCheckError || 'An error occurred'}
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <div
            className="flex h-screen bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]"
            style={backgroundStyle}
        >
            {/* Show sidebar (hide in standalone mode) */}
            {!isStandaloneAllowed && (
                <Sidebar
                    selectedItem={selectedMenuItem?.id || ''}
                    onItemSelect={handleMenuItemSelect}
                    menuItems={menuItems}
                    onMenuItemsChange={setMenuItems}
                    isLoading={isLoading}
                    isEditModeAllowed={isEditModeAllowed}
                />
            )}

            {renderContent()}

            {/* Configuration Dialog for admin users with edit permission */}
            {isEditModeAllowed && (
                <ConfigurationDialog
                    visible={configDialogVisible}
                    onHide={handleCloseConfigDialog}
                    configuration={configuration}
                    onSave={handleSaveConfiguration}
                    onReset={handleResetConfiguration}
                />
            )}
        </div>
    );
};

export default Dashboard;
