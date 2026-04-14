import { useState, useEffect } from 'react';
import { MenuItem } from '../../types';

interface UseDashboardStateProps {
    menuItems: MenuItem[];
    isStandaloneAllowed: boolean;
    isEditModeAllowed: boolean;
    urlParams: URLSearchParams | null;
}

export const useDashboardState = ({
    menuItems,
    isStandaloneAllowed,
    isEditModeAllowed,
    urlParams,
}: UseDashboardStateProps) => {
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

    // Default to first menu item when menuItems are loaded.
    // In admin edit mode, hidden items remain selectable.
    useEffect(() => {
        if (isStandaloneAllowed) return;

        const selectableItems = menuItems
            .filter((item) => !item.deleted)
            .filter((item) => isEditModeAllowed || item.visible)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        if (selectableItems.length === 0) {
            // No selectable items – clear selection
            if (selectedMenuItem !== null) {
                setSelectedMenuItem(null);
            }
            return;
        }

        // If nothing is selected yet OR the currently selected item is no longer selectable,
        // fall back to the first selectable item.
        const isCurrentStillSelectable = selectedMenuItem
            ? selectableItems.some((item) => item.id === selectedMenuItem.id)
            : false;

        if (!selectedMenuItem || !isCurrentStillSelectable) {
            setSelectedMenuItem(selectableItems[0]);
        }
    }, [menuItems, selectedMenuItem, isStandaloneAllowed, isEditModeAllowed]);

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

