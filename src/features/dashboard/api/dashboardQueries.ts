import { useQuery } from '@tanstack/react-query';
import { sapODataService } from '@/services/sapODataService';
import type { MenuItem } from '@/types';

/**
 * Server-state (TanStack React Query) hooks for the dashboard feature. These
 * wrap the existing `sapODataService` calls and are the canonical pattern for
 * remote data — React Query owns loading/error/caching/refetch.
 *
 * The query functions degrade gracefully when the SAP backend is unreachable
 * (e.g. local dev with no proxy): they log and return a safe fallback rather
 * than letting the network rejection propagate — mirroring the resilient
 * behaviour of the legacy `useMenuItems` / `useAdminCheck` hooks. `retry: false`
 * avoids hammering an unavailable backend.
 */

/** Namespaced query keys so the feature's cache entries stay grouped. */
export const dashboardKeys = {
    all: ['dashboard'] as const,
    menuItems: () => [...dashboardKeys.all, 'menuItems'] as const,
    isAdmin: () => [...dashboardKeys.all, 'isAdmin'] as const,
};

/** Dashboard tabs / menu items, sorted by their configured order. */
export function useMenuItemsQuery() {
    return useQuery({
        queryKey: dashboardKeys.menuItems(),
        queryFn: async (): Promise<MenuItem[]> => {
            try {
                return (await sapODataService.fetchMenuItems()) as MenuItem[];
            } catch (err) {
                console.warn('[dashboard] menu items unavailable:', err);
                return [];
            }
        },
        select: (items) => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        retry: false,
    });
}

/** Whether the current user has the admin role. */
export function useAdminQuery() {
    return useQuery({
        queryKey: dashboardKeys.isAdmin(),
        queryFn: async (): Promise<boolean> => {
            try {
                return await sapODataService.checkAdminRole();
            } catch (err) {
                console.warn('[dashboard] admin check unavailable:', err);
                return false;
            }
        },
        retry: false,
    });
}
