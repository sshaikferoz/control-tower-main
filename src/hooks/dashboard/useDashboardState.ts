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

    // Default to first *visible* (and not deleted) menu item when menuItems are loaded
    useEffect(() => {
        if (isStandaloneAllowed) return;

        // Only consider items that are not deleted and currently visible in the sidebar
        const visibleItems = menuItems
            .filter((item) => !item.deleted && item.visible)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        if (visibleItems.length === 0) {
            // No visible items – clear selection
            if (selectedMenuItem !== null) {
                setSelectedMenuItem(null);
            }
            return;
        }

        // If nothing is selected yet OR the currently selected item is no longer visible,
        // fall back to the first visible item.
        const isCurrentStillVisible = selectedMenuItem
            ? visibleItems.some((item) => item.id === selectedMenuItem.id)
            : false;

        if (!selectedMenuItem || !isCurrentStillVisible) {
            setSelectedMenuItem(visibleItems[0]);
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

