'use client';

import React, { useMemo, useEffect, useState } from 'react';
import useBexJson from '@/hooks/useBexJson';
import {
    AlertNotificationsWidgetConfig,
    AlertCategoryConfig,
    AlertItemConfig,
    AlertCriticality,
    ALERT_NOTIFICATION_ICONS,
} from './AlertNotificationsConfig.types';
import { formatNumber } from '@/helpers/numberFormatting';
import { applyTypographyStyles } from '@/helpers/typographyHelper';
import { useAppSelector } from '@/store/hooks';
import { buildVariableParams } from '@/utils/buildVariableParams';
import { sapODataService } from '@/services/sapODataService';

const ALERT_ICON_IDS = new Set(ALERT_NOTIFICATION_ICONS.map((i) => i.id));
const ICON_BASE_URL = `${process.env.NEXT_PUBLIC_BSP_NAME || ''}/icons`;

interface AlertNotificationsProps {
    title?: string;
    alertConfig?: AlertNotificationsWidgetConfig;
    backgroundColor?: string;
    typography?: any;
}

function getCriticality(
    value: number | null,
    warningThreshold: number | undefined,
    criticalThreshold: number | undefined,
    mode: 'above' | 'below'
): AlertCriticality {
    if (value === null || (warningThreshold === undefined && criticalThreshold === undefined)) {
        return 'N';
    }
    const above = mode === 'above';
    if (criticalThreshold !== undefined) {
        const isCritical = above ? value >= criticalThreshold : value <= criticalThreshold;
        if (isCritical) return 'C';
    }
    if (warningThreshold !== undefined) {
        const isWarning = above ? value >= warningThreshold : value <= warningThreshold;
        if (isWarning) return 'W';
    }
    return 'N';
}

const CRITICALITY_COLORS: Record<AlertCriticality, string> = {
    W: '#F59E0B', // amber/warning
    N: '#3B82F6', // blue/normal
    C: '#EF4444', // red/critical
};

function AlertIcon({
    iconType,
    criticality,
}: {
    iconType?: string;
    criticality: AlertCriticality;
}) {
    const color = CRITICALITY_COLORS[criticality];
    const isValidIcon = iconType && ALERT_ICON_IDS.has(iconType as any);

    if (isValidIcon) {
        return (
            <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: color }}
            >
                <img
                    src={`${ICON_BASE_URL}/${iconType}`}
                    alt=""
                    className="h-4 w-4 object-contain brightness-0 invert"
                />
            </span>
        );
    }

    // Default alert/bell icon with criticality color
    return (
        <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: color }}
        >
            <svg
                className="h-4 w-4 text-white"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M8 2a4 4 0 0 1 4 4v2.5l.5.8a1 1 0 0 1-.2 1.2L11 11v1a1 1 0 0 1-2 0v-1H7v1a1 1 0 0 1-2 0v-1l-1.3-1a1 1 0 0 1-.2-1.2L4 8.5V6a4 4 0 0 1 4-4z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="8" cy="12" r="1.2" fill="currentColor" />
            </svg>
        </span>
    );
}

function AlertRow({
    alert: config,
    value,
    isLoading,
    error,
    typography,
}: {
    alert: AlertItemConfig;
    value: number | null;
    isLoading: boolean;
    error: Error | null;
    typography?: any;
}) {
    const mode = config.thresholdMode || 'above';
    const criticality = getCriticality(
        value,
        config.warningThreshold,
        config.criticalThreshold,
        mode
    );

    const formattedValue = useMemo(() => {
        if (isLoading || error) return '—';
        if (value === null) return 'N/A';
        const opts: any = {
            format: config.isCurrencyFormat ? 'currency' : 'non-currency',
            decimalPrecision: config.precision,
        };
        return formatNumber(value, opts);
    }, [value, isLoading, error, config.isCurrencyFormat, config.precision]);

    const suffix = config.suffix ? ` ${config.suffix}` : '';

    const labelStyles = applyTypographyStyles('categoryTitle', typography);
    const valueStyles = applyTypographyStyles('value', typography);
    const suffixStyles = applyTypographyStyles('suffix', typography);

    return (
        <div className="alert-notifications-row flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <AlertIcon iconType={config.iconType} criticality={criticality} />
                <span
                    className="alert-notifications-label truncate text-sm font-medium text-white"
                    style={labelStyles}
                >
                    {config.title}
                </span>
            </div>
            <div className="flex flex-shrink-0 items-baseline gap-1">
                <span
                    className="alert-notifications-value text-base font-semibold text-white"
                    style={valueStyles}
                >
                    {formattedValue}
                </span>
                {suffix && (
                    <span
                        className="alert-notifications-suffix text-sm text-white/70"
                        style={suffixStyles}
                    >
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}

function AlertItemWrapper({
    alert: config,
    filterVariables,
    typography,
}: {
    alert: AlertItemConfig;
    filterVariables?: string;
    typography?: any;
}) {
    const { data: bexData, isLoading, error } = useBexJson(config.queryName || '', {
        parser: 'new',
        enabled: !!config.queryName,
        variables: filterVariables,
    });

    const value = useMemo(() => {
        if (!config.valueKey || !bexData) return null;
        const chartData = (bexData as any)?.chartData;
        if (!chartData?.length) return null;
        const raw = chartData[0][config.valueKey];
        if (raw === '' || raw === null || raw === undefined) return null;
        const n = typeof raw === 'string' ? Number(raw.trim()) : Number(raw);
        return Number.isFinite(n) ? n : null;
    }, [bexData, config.valueKey]);

    return (
        <AlertRow
            alert={config}
            value={value}
            isLoading={isLoading}
            error={error as Error | null}
            typography={typography}
        />
    );
}

function CategoryBlock({
    category,
    filterVariables,
    typography,
}: {
    category: AlertCategoryConfig;
    filterVariables?: string;
    typography?: any;
}) {
    const alerts = (category.alerts ?? []).filter((a) => a.enabled !== false);
    if (!alerts.length) return null;

    const categoryTitleStyles = applyTypographyStyles('categoryTitle', typography);

    return (
        <div className="mb-4 last:mb-0">
            <h4
                className="alert-notifications-category mb-2 text-sm font-bold tracking-wide text-white/90"
                style={categoryTitleStyles}
            >
                {category.title}
            </h4>
            <div className="space-y-1.5">
                {alerts.map((alert) => (
                    <AlertItemWrapper
                        key={alert.id}
                        alert={alert}
                        filterVariables={filterVariables}
                        typography={typography}
                    />
                ))}
            </div>
        </div>
    );
}

const AlertNotifications: React.FC<AlertNotificationsProps> = ({
    title,
    alertConfig,
    backgroundColor,
    typography,
}) => {
    const filterState = useAppSelector((state) => state.filters);
    const listenToEvent = alertConfig?.listenToEvent;
    const filterVariables = useMemo(() => {
        if (!listenToEvent || filterState.eventName !== listenToEvent) return undefined;
        return buildVariableParams(filterState.variables);
    }, [filterState.eventName, filterState.variables, listenToEvent]);

    const baseColor = backgroundColor || '#00214E';
    const lighterColor = backgroundColor ? `${backgroundColor}80` : '#0164B0';
    const isTransparent = alertConfig?.transparentBackground === true;
    const backgroundStyle = isTransparent
        ? { backgroundColor: 'transparent', color: 'inherit' }
        : {
            backgroundImage: `linear-gradient(to bottom, ${baseColor}, ${lighterColor})`,
            color: '#ffffff',
        };

    const [userRoles, setUserRoles] = useState<string[] | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [accessChecked, setAccessChecked] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadAccessData = async () => {
            try {
                const [adminFlag, roles] = await Promise.all([
                    sapODataService.checkAdminRole(),
                    sapODataService.fetchCurrentUserRoles(),
                ]);

                if (!isMounted) return;

                setIsAdmin(adminFlag);
                setUserRoles(roles);
            } finally {
                if (isMounted) {
                    setAccessChecked(true);
                }
            }
        };

        loadAccessData();

        return () => {
            isMounted = false;
        };
    }, []);

    const rawCategories = alertConfig?.categories ?? [];

    const categories = useMemo(() => {
        const enabledCategories = rawCategories.filter((cat) => cat.enabled !== false);

        if (isAdmin || !accessChecked || !userRoles) {
            return enabledCategories;
        }

        return enabledCategories.filter((cat) => {
            const roles = cat.roles || [];
            if (roles.length === 0) {
                return true;
            }
            return roles.some((role) => userRoles.includes(role));
        });
    }, [rawCategories, isAdmin, userRoles, accessChecked]);
    const hasCategories = categories.length > 0;
    const hasAlerts = categories.some((c) => c.alerts?.length > 0);

    if (!hasCategories || !hasAlerts) {
        return (
            <div className="relative h-full w-full">
                <div
                    className="alert-notifications-widget flex h-full min-h-[120px] flex-col rounded-xl p-4"
                    style={backgroundStyle}
                >
                    {title && (
                        <h3
                            className="alert-notifications-title mb-3 text-base font-bold text-white"
                            style={applyTypographyStyles('title', typography)}
                        >
                            {title}
                        </h3>
                    )}
                    <p className="alert-notifications-empty text-sm text-white/70">
                        No alert categories configured. Add categories and alerts in the configuration panel.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <div
                className="alert-notifications-widget flex h-full flex-col overflow-hidden rounded-xl p-4 text-white"
                style={backgroundStyle}
            >
                {title && (
                    <h3
                        className="alert-notifications-title mb-3 flex-shrink-0 text-base font-bold text-white"
                        style={applyTypographyStyles('title', typography)}
                    >
                        {title}
                    </h3>
                )}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    {categories.map((cat) => (
                        <CategoryBlock
                            key={cat.id}
                            category={cat}
                            filterVariables={filterVariables}
                            typography={typography}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlertNotifications;
