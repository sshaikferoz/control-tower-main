import { useState, useEffect } from 'react';
import { MenuItem } from '../../types';

interface UseDashboardStateProps {
    menuItems: MenuItem[];
    isStandaloneAllowed: boolean;
    urlParams: URLSearchParams | null;
}

export const useDashboardState = ({
    menuItems,
    isStandaloneAllowed,
    urlParams,
}: UseDashboardStateProps) => {
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

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

    // Update document title when menu item changes
    useEffect(() => {
        if (selectedMenuItem) {
            const tabName = selectedMenuItem.name || 'Dashboard';
            document.title = tabName;
        }
    }, [selectedMenuItem]);

    const handleMenuItemSelect = (item: MenuItem) => {
        setSelectedMenuItem(item);
    };

    return {
        selectedMenuItem,
        handleMenuItemSelect,
    };
};

