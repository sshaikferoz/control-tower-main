import { TargetReportConfig } from '@/helpers/types';

export type DashboardMenuItemType = TargetReportConfig['type'];

/** Built-in SVG icon types (legacy) or filename from public/icons (e.g. "dashboard-icon.png"). */
export type DashboardMenuIconType = 'report' | 'dashboard' | 'user' | (string & {});

/**
 * Icons available in public/icons for dashboard menu item selection.
 * Users pick one of these in the configuration panel.
 */
export const DASHBOARD_MENU_ICONS = [
    { id: 'activityStatus-icon.png', label: 'Activity Status' },
    { id: 'blocked-icon.png', label: 'Blocked' },
    { id: 'dashboard-icon.png', label: 'Dashboard' },
    { id: 'InProcess-Pending-icon.png', label: 'In Process / Pending' },
    { id: 'inventory-icon.png', label: 'Inventory' },
    { id: 'kpi-icon.png', label: 'KPI' },
    { id: 'map-icon.png', label: 'Map' },
    { id: 'ontime-icon.png', label: 'On Time' },
    { id: 'overdue-icon.png', label: 'Overdue' },
    { id: 'performance-icon.png', label: 'Performance' },
    { id: 'returned-icon.png', label: 'Returned' },
    { id: 'warehouse-icon.png', label: 'Warehouse' },
] as const;

export type DashboardMenuIconId = (typeof DASHBOARD_MENU_ICONS)[number]['id'];

export interface DashboardMenuItemConfig {
    id: string;
    /**
     * Per-item report configuration. This mirrors the widget-level
     * TargetReportConfig used in the global Report Config tab.
     */
    targetReport: TargetReportConfig;
    /**
     * Icon shown before the title in the list, so users can visually
     * distinguish report, dashboard, or user shortcuts.
     */
    iconType?: DashboardMenuIconType;
}

/**
 * Display mode for the dashboard menu widget.
 * - multiple: list of menu items (default).
 * - single: one card with large logo left, title and description (uses first item).
 */
export type DashboardMenuDisplayMode = 'single' | 'multiple';

export interface DashboardMenuWidgetConfig {
    items: DashboardMenuItemConfig[];
    /**
     * Single card (large logo + title/desc) vs multiple items list.
     * @default 'multiple'
     */
    displayMode?: DashboardMenuDisplayMode;
    /**
     * Optional layout mode – currently we only support a vertical list,
     * but this leaves room for future grid / compact variants.
     */
    layout?: 'list';
}

