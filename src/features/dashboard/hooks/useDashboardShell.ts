'use client';

import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useConfiguration } from '@/hooks/config/useConfiguration';
import type { MenuItem } from '@/types';
import { useMenuItemsQuery, useAdminQuery } from '../api/dashboardQueries';
import {
    setSelectedMenuItem,
    setEditMode,
    toggleEditMode,
    openConfigDialog,
    closeConfigDialog,
    toggleWidgetSelection,
} from '../store/dashboardSlice';
import {
    selectSelectedMenuItemId,
    selectIsEditMode,
    selectConfigDialogOpen,
    selectSelectedWidgetIds,
} from '../store/dashboard.selectors';

/**
 * The dashboard shell's single composition point: server state from React Query
 * (menu items, admin status, configuration) + UI state from the Redux slice.
 * Components consume this and stay declarative.
 */
export function useDashboardShell() {
    const dispatch = useAppDispatch();

    // --- Server state (React Query) ---
    const menuItemsQuery = useMenuItemsQuery();
    const adminQuery = useAdminQuery();
    const { configuration } = useConfiguration(); // session-storage backed, not remote

    const menuItems = useMemo<MenuItem[]>(() => menuItemsQuery.data ?? [], [menuItemsQuery.data]);
    const isAdmin = adminQuery.data ?? false;

    // --- Client / UI state (Redux) ---
    const selectedMenuItemId = useAppSelector(selectSelectedMenuItemId);
    const isEditMode = useAppSelector(selectIsEditMode);
    const configDialogOpen = useAppSelector(selectConfigDialogOpen);
    const selectedWidgetIds = useAppSelector(selectSelectedWidgetIds);

    // Default selection to the first visible tab once data has loaded.
    useEffect(() => {
        if (selectedMenuItemId) return;
        const first = menuItems.find((item) => !item.deleted && item.visible) ?? menuItems[0];
        if (first) dispatch(setSelectedMenuItem(first.id));
    }, [dispatch, menuItems, selectedMenuItemId]);

    const selectedMenuItem = useMemo(
        () => menuItems.find((item) => item.id === selectedMenuItemId) ?? null,
        [menuItems, selectedMenuItemId]
    );

    return {
        // server state
        menuItems,
        isAdmin,
        configuration,
        isLoading: menuItemsQuery.isLoading || adminQuery.isLoading,
        isError: menuItemsQuery.isError || adminQuery.isError,
        // client / UI state
        selectedMenuItemId,
        selectedMenuItem,
        isEditMode,
        configDialogOpen,
        selectedWidgetIds,
        // actions (thin dispatch wrappers)
        selectMenuItem: (id: string) => dispatch(setSelectedMenuItem(id)),
        toggleEditMode: () => dispatch(toggleEditMode()),
        setEditMode: (value: boolean) => dispatch(setEditMode(value)),
        openConfig: () => dispatch(openConfigDialog()),
        closeConfig: () => dispatch(closeConfigDialog()),
        toggleWidget: (id: string) => dispatch(toggleWidgetSelection(id)),
    };
}
