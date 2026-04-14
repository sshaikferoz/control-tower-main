/**
 * Alert Notifications Widget – configuration types
 * Supports categories, alerts per category, query-driven values,
 * threshold-based criticality (W/N/C), and icon selection (same approach as dashboard menu).
 */

/** Criticality derived from value vs threshold: W = Warning, N = Normal, C = Critical */
export type AlertCriticality = 'W' | 'N' | 'C';

/** Icon id from the alert icon list (same as dashboard menu: public/icons) */
export type AlertIconType = string;

/**
 * Icons available for alert items (same approach as multi metric / dashboard menu).
 * Users pick one; color is applied by criticality in the widget.
 */
export const ALERT_NOTIFICATION_ICONS = [
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

export type AlertIconId = (typeof ALERT_NOTIFICATION_ICONS)[number]['id'];

/** How threshold is applied: above = higher value is worse, below = lower value is worse */
export type ThresholdMode = 'above' | 'below';

export interface AlertItemConfig {
    id: string;
    /** Display title for the alert (e.g. "Suppliers Capacity Constraint") */
    title: string;
    /** BEX query name to fetch the value */
    queryName: string;
    /** Field key in query result (chartData row) to use as value */
    valueKey?: string;
    /** Suffix after the value (e.g. "Suppliers", "Item", "Items", "%") */
    suffix?: string;
    /** When value is above/below this, show Warning */
    warningThreshold?: number;
    /** When value is above/below this, show Critical */
    criticalThreshold?: number;
    /** Whether threshold is "above" (value >= critical = C) or "below" (value <= critical = C) */
    thresholdMode?: ThresholdMode;
    /** Use currency formatting ($, M/MM/B) */
    isCurrencyFormat?: boolean;
    /** Decimal precision for the value */
    precision?: number;
    /** Icon id from ALERT_NOTIFICATION_ICONS (same approach as dashboard menu single-view icon) */
    iconType?: AlertIconType;
    /**
     * Whether this alert is enabled. Disabled alerts are hidden when the
     * dashboard is rendered but still appear in the configuration panel.
     * @default true
     */
    enabled?: boolean;
}

export interface AlertCategoryConfig {
    id: string;
    /** Category heading (e.g. "Procurement", "Warehouse & Logistics") */
    title: string;
    /** Alerts in this category */
    alerts: AlertItemConfig[];
    /**
     * Optional list of role names that are allowed to see this category.
     * If empty or undefined, the category is visible to all users (subject to
     * any widget-level role checks).
     */
    roles?: string[];
    /**
     * Whether this category is enabled. Disabled categories are hidden when the
     * dashboard is rendered but still appear in the configuration panel.
     * @default true
     */
    enabled?: boolean;
}

export interface AlertNotificationsWidgetConfig {
    /** Categories, each containing multiple alerts */
    categories: AlertCategoryConfig[];
    /** Optional: listen to filter event for all queries */
    listenToEvent?: string;
    /** Transparent widget background */
    transparentBackground?: boolean;
}
