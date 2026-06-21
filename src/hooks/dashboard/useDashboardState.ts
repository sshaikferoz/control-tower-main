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

    // ?tabId=xxx allows admins to deep-link directly to any tab (including hidden ones).
    const tabIdParam = urlParams?.get('tabId') ?? null;

    // Default to first menu item when menuItems are loaded.
    // In admin edit mode, or when tabId URL param is set, hidden items remain selectable.
    useEffect(() => {
        if (isStandaloneAllowed) return;

        const selectableItems = menuItems
            .filter((item) => !item.deleted)
            .filter((item) => isEditModeAllowed || item.visible || item.id === tabIdParam)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        if (selectableItems.length === 0) {
            // No selectable items – clear selection
            if (selectedMenuItem !== null) {
                setSelectedMenuItem(null);
            }
            return;
        }

        // If tabId param is set, prefer that item as the initial selection.
        if (tabIdParam) {
            const tabIdItem = menuItems.find((item) => item.id === tabIdParam && !item.deleted);
            if (tabIdItem && selectedMenuItem?.id !== tabIdItem.id) {
                setSelectedMenuItem(tabIdItem);
                return;
            }
        }

        // If nothing is selected yet OR the currently selected item is no longer selectable,
        // fall back to the first selectable item.
        const isCurrentStillSelectable = selectedMenuItem
            ? selectableItems.some((item) => item.id === selectedMenuItem.id)
            : false;

        if (!selectedMenuItem || !isCurrentStillSelectable) {
            setSelectedMenuItem(selectableItems[0]);
        }
    }, [menuItems, selectedMenuItem, isStandaloneAllowed, isEditModeAllowed, tabIdParam]);

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

