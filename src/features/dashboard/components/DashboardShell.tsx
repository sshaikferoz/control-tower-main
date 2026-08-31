'use client';

import { useMemo } from 'react';
import { CircularProgress, List, ListItemButton, ListItemText, Paper } from '@mui/material';
import { AppDialog } from '@/components/ui';
import { useDashboardShell } from '../hooks/useDashboardShell';
import { DashboardToolbar } from './DashboardToolbar';

/**
 * Reference feature: the dashboard shell rebuilt on the clean architecture.
 * - Server state (menu items / admin) via React Query.
 * - UI state (selection / edit mode / config dialog / widget selection) via the Redux slice.
 * - MUI components + Tailwind layout, colors from the CSS-variable theme.
 * - No PrimeReact (kept out of new code per ARCHITECTURE.md); the real widget
 *   renderer plugs into <WidgetArea/> below.
 *
 * Mounted at /dashboard-next; the existing homepage is untouched.
 */

// Placeholder "widgets" so the content area is demonstrable without a backend.
const DEMO_WIDGETS = [
    { id: 'kpi-overview', title: 'KPI Overview', subtitle: 'Key metrics at a glance' },
    { id: 'trend-analysis', title: 'Trend Analysis', subtitle: 'Rolling 12-month trend' },
    { id: 'alert-notifications', title: 'Alerts', subtitle: 'Open exceptions' },
    { id: 'inventory-health', title: 'Inventory Health', subtitle: 'Stock coverage by plant' },
    { id: 'supplier-scorecard', title: 'Supplier Scorecard', subtitle: 'On-time-in-full' },
    { id: 'spend-cube', title: 'Spend Cube', subtitle: 'Category spend breakdown' },
];

export function DashboardShell() {
    const {
        menuItems,
        isAdmin,
        configuration,
        isLoading,
        isError,
        selectedMenuItem,
        selectedMenuItemId,
        isEditMode,
        configDialogOpen,
        selectedWidgetIds,
        selectMenuItem,
        toggleEditMode,
        openConfig,
        closeConfig,
        toggleWidget,
    } = useDashboardShell();

    const visibleMenuItems = useMemo(
        () => menuItems.filter((item) => !item.deleted && (isAdmin || item.visible)),
        [menuItems, isAdmin]
    );

    if (isLoading) {
        return (
            <div
                className="flex h-screen w-full items-center justify-center"
                style={{ background: 'var(--dashboard-bg)' }}
            >
                <CircularProgress sx={{ color: 'var(--loader-color)' }} />
            </div>
        );
    }

    return (
        <div className="dashboard-layout flex h-screen w-full" style={{ background: 'var(--dashboard-bg)' }}>
            {/* Left nav — Tailwind chrome, MUI list */}
            <aside
                className="hidden w-64 shrink-0 flex-col border-r md:flex"
                style={{ borderColor: 'var(--border)', background: 'var(--widget-surface)' }}
            >
                <div
                    className="px-4 py-4 text-sm font-semibold tracking-wide uppercase"
                    style={{ color: 'var(--section-title)' }}
                >
                    Dashboards
                </div>
                <List disablePadding className="overflow-y-auto">
                    {visibleMenuItems.length === 0 ? (
                        <div className="px-4 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                            {isError ? 'Could not load dashboards' : 'No dashboards available'}
                        </div>
                    ) : (
                        visibleMenuItems.map((item) => (
                            <ListItemButton
                                key={item.id}
                                selected={item.id === selectedMenuItemId}
                                onClick={() => selectMenuItem(item.id)}
                                sx={{ '&.Mui-selected': { backgroundColor: 'rgba(0,163,224,0.15)' } }}
                            >
                                <ListItemText
                                    primary={item.name}
                                    slotProps={{ primary: { sx: { color: 'var(--foreground)', fontSize: 14 } } }}
                                />
                            </ListItemButton>
                        ))
                    )}
                </List>
            </aside>

            {/* Main column */}
            <div className="flex min-w-0 flex-1 flex-col">
                <DashboardToolbar
                    title={selectedMenuItem?.name ?? 'Dashboard'}
                    isAdmin={isAdmin}
                    isEditMode={isEditMode}
                    onToggleEditMode={toggleEditMode}
                    onOpenConfig={openConfig}
                />

                <main className="min-h-0 flex-1 overflow-auto p-4">
                    {isEditMode && (
                        <p className="mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                            Edit mode — click widgets to select them ({selectedWidgetIds.length} selected).
                        </p>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {DEMO_WIDGETS.map((widget) => {
                            const selected = selectedWidgetIds.includes(widget.id);
                            return (
                                <Paper
                                    key={widget.id}
                                    elevation={0}
                                    onClick={() => isEditMode && toggleWidget(widget.id)}
                                    className={`rounded-xl p-4 transition-colors ${isEditMode ? 'cursor-pointer' : ''}`}
                                    sx={{
                                        background: 'var(--widget-surface)',
                                        border: '2px solid',
                                        borderColor: selected ? 'var(--primary2)' : 'var(--widget-border)',
                                        color: 'var(--foreground)',
                                    }}
                                >
                                    <div className="text-base font-semibold">{widget.title}</div>
                                    <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                                        {widget.subtitle}
                                    </div>
                                    <div
                                        className="mt-4 flex h-24 items-center justify-center rounded-lg text-xs"
                                        style={{ background: 'var(--widget-surface-hover)', color: 'var(--text-muted)' }}
                                    >
                                        widget content
                                    </div>
                                </Paper>
                            );
                        })}
                    </div>
                </main>
            </div>

            {/* Config dialog — driven entirely by Redux UI state */}
            <AppDialog open={configDialogOpen} onClose={closeConfig} title="UI Configuration" maxWidth="md">
                <pre
                    className="max-h-[60vh] overflow-auto rounded-md p-3 text-xs"
                    style={{ background: 'var(--widget-surface)', color: 'var(--foreground)' }}
                >
                    {JSON.stringify(configuration, null, 2)}
                </pre>
            </AppDialog>
        </div>
    );
}
