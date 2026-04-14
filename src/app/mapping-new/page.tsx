'use client';

import React, { useState, useEffect } from 'react';
import { DashboardBuilder } from '@/features/dashboard';
import type { Widget, LayoutItem } from '@/features/dashboard';
import mirageServer from '@/lib/mirage/mirageServer';
import { Toast } from 'primereact/toast';
import { sapODataService, LayoutData } from '@/services/sapODataService';
import type { LayoutWidget } from '@/services/sapODataService';
import { getDefaultWidgetSize } from '@/features/dashboard/config/widgetDefaultProps';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useConfiguration } from '@/hooks/config/useConfiguration';
import { useBackgroundStyle } from '@/hooks/config/useBackgroundStyle';

if (process.env.NODE_ENV === 'development') mirageServer();

const MappingScreen: React.FC = () => {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [layout, setLayout] = useState<LayoutItem[]>([]);
    const [fieldMappings, setFieldMappings] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const toast = React.useRef<Toast>(null);

    const { configuration } = useConfiguration();
    const backgroundStyle = useBackgroundStyle(configuration);

    // Use useState to avoid hydration mismatch - these values are set on client side only
    const [sectionName, setSectionName] = useState<string>('Dashboard');
    const [sectionId, setSectionId] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState<string>('false');

    // Set URL params on client side only to avoid hydration mismatch
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            setSectionName(searchParams.get('sectionName') || 'Dashboard');
            setSectionId(searchParams.get('sectionId') || '');
            setIsExpanded(searchParams.get('expanded') || 'false');
        }
    }, []);

    // Load existing widgets from SAP OData service
    useEffect(() => {
        const loadExistingWidgets = async () => {
            if (sectionId && sectionId !== 'undefined' && sectionId !== '') {
                try {
                    setLoading(true);

                    const fetchedWidgets = await sapODataService.fetchWidgetsBySectionId(sectionId);

                    if (fetchedWidgets && fetchedWidgets.length > 0) {
                        // Include all non-deleted widgets so we can edit and toggle IsActive (inactive widgets stay visible on mapping screen)
                        const visibleWidgets = fetchedWidgets.filter(
                            (widget: any) => !widget.deleted
                        );

                        if (visibleWidgets.length > 0) {
                            // Transform widgets to match Widget type
                            const transformedWidgets: Widget[] = visibleWidgets.map((widget: any) => {
                                // Preserve the full role object to keep RoleId - same as old mapping page
                                const transformedRoles = widget.roles
                                    ? widget.roles.map((role: any) => {
                                        // If role is already an object with RoleId, keep it
                                        if (typeof role === 'object' && role.RoleId !== undefined) {
                                            return role;
                                        }
                                        // If role is just a string or object without RoleId, convert it
                                        return {
                                            Name: role.Name || role,
                                            RoleId: role.RoleId || '', // Empty for new roles
                                            Description: role.Description || '',
                                            Type: role.Type || 'Custom',
                                            DelFlag: role.DelFlag || '',
                                        };
                                    })
                                    : [];

                                return {
                                    id: widget.id,
                                    name: widget.type,
                                    props: {
                                        ...(widget.properties || {}),
                                        // Store roles in props.roles so WidgetConfigurationPanel can access them
                                        roles: transformedRoles,
                                        // Also expose description in props so it can be edited in the configuration panel
                                        description: widget.description || '',
                                        // IsActive: 'X' or '' - used by Info tab enable/disable and when saving
                                        IsActive: widget.active ? 'X' : '',
                                    },
                                    roles: transformedRoles, // Also keep on widget for backward compatibility
                                    Description: widget.description || '',
                                    deleted: widget.deleted || false,
                                    isNew: false, // Mark as existing widget
                                };
                            });

                            setWidgets(transformedWidgets);

                            // Transform layout
                            const transformedLayout: any = visibleWidgets.map(
                                (widget: any, index: number) => {
                                    const layoutConfig = widget.layoutConfig || {};
                                    const { w, h } = getDefaultWidgetSize(widget.type);

                                    return {
                                        i: widget.id,
                                        x: layoutConfig.x ?? (index * w) % 12,
                                        y: layoutConfig.y ?? Math.floor((index * w) / 12) * h,
                                        w: layoutConfig.w ?? w,
                                        h: layoutConfig.h ?? h,
                                        static: layoutConfig.static || false,
                                        minW: layoutConfig.minW,
                                        minH: layoutConfig.minH,
                                        maxW: layoutConfig.maxW,
                                        maxH: layoutConfig.maxH,
                                    };
                                }
                            );

                            setLayout(transformedLayout);

                            // Transform field mappings
                            const transformedFieldMappings: Record<string, any> = {};
                            visibleWidgets.forEach((widget: any) => {
                                if (widget.fieldMappings) {
                                    transformedFieldMappings[widget.id] = widget.fieldMappings;
                                }
                            });

                            setFieldMappings(transformedFieldMappings);
                        }
                    }

                    setLoading(false);
                } catch (error) {
                    console.error('Error loading existing widgets:', error);
                    setLoading(false);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load widgets from server.',
                        life: 3000,
                    });
                    // Reset to empty state on error
                    setWidgets([]);
                    setLayout([]);
                    setFieldMappings({});
                }
            }
        };

        loadExistingWidgets();
    }, [sectionId, sectionName]);

    const removeWidget = (id: string) => {
        const widget = widgets.find((w) => w.id === id);
        if (!widget) return;

        // If it's an existing widget (already saved), mark as deleted
        if (!widget.isNew) {
            setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, deleted: true } : w)));

            // Remove from layout but keep in widgets array for save operation
            setLayout((prev) => prev.filter((item) => item.i !== id));

            // Mark as deleted in field mappings
            setFieldMappings((prev) => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    deleted: true,
                },
            }));
        } else {
            // If it's a new widget (not saved yet), completely remove it
            setWidgets((prev) => prev.filter((w) => w.id !== id));
            setLayout((prev) => prev.filter((item) => item.i !== id));

            // Remove from field mappings
            const { [id]: removed, ...rest } = fieldMappings;
            setFieldMappings(rest);
        }
    };

    const saveLayout = async () => {
        if (!sectionId) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Section ID is required to save the layout.',
                life: 3000,
            });
            return;
        }

        if (widgets.length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No widgets to save.',
                life: 3000,
            });
            return;
        }

        setIsSaving(true);

        try {
            const updatedLayout: any = layout.map((item: any) => ({
                ...item,
                static: item.static ?? false,
            }));

            const cleanedFieldMappings = Object.entries(fieldMappings).reduce(
                (acc, [widgetId, config]) => {
                    acc[widgetId] = JSON.parse(JSON.stringify(config));
                    return acc;
                },
                {} as Record<string, any>
            );

            // Prepare widgets for saving
            const widgetsWithCompleteData: LayoutWidget[] = widgets.map((widget) => {
                // Get roles from props.roles (where WidgetConfigurationPanel stores them) or fall back to widget.roles
                // This matches how the old mapping page works - roles are stored in widgetConfigurations and then extracted
                const roles = widget.props?.roles || widget.roles || [];

                // Remove roles from props since they're handled separately in WidgetHeadRolesItem
                const { roles: _, ...propsWithoutRoles } = widget.props || {};

                // Filter out real-time data from props (especially for multi-chart widgets)
                const isMultiChart = widget.name === 'multi-chart' || widget.name === 'multi-chart-bex';
                let cleanedProps: Record<string, any>;

                if (isMultiChart) {
                    // Remove real-time data fields that should not be saved
                    const { bexResponse, data, series, ...configProps } = propsWithoutRoles;
                    cleanedProps = configProps;
                    // Keep chartConfig, queryName, and other configuration but remove real-time data
                } else {
                    // For other widgets, remove any potential real-time data fields
                    const { data, chartData, ...otherProps } = propsWithoutRoles;
                    cleanedProps = otherProps;
                }

                return {
                    id: widget.id,
                    name: widget.name,
                    props: cleanedProps,
                    roles: roles, // Use roles from props.roles (updated by WidgetConfigurationPanel) or widget.roles
                    // Prefer explicit Description field, fall back to description stored in props
                    Description: widget.Description || widget.props?.description || '',
                    widgetType: widget.name,
                    deleted: widget.deleted || false,
                    // IsActive from Info tab: 'X' = visible when dashboard is rendered, '' = hidden
                    active: (widget.props?.IsActive ?? 'X') === 'X',
                };
            });

            const layoutData: LayoutData = {
                sectionName: sectionName,
                layout: updatedLayout.map((item: any) => ({
                    i: item.i,
                    x: item.x,
                    y: item.y,
                    w: item.w,
                    h: item.h,
                    static: item.static ?? false,
                })),
                fieldMappings: cleanedFieldMappings,
                widgets: widgetsWithCompleteData,
                expanded: isExpanded,
            };

            const result = await sapODataService.saveWidgetLayout(layoutData, sectionId);

            // Save to sessionStorage for development
            let payload = JSON.parse(sessionStorage.getItem('payload') || '[]');
            if (typeof payload === 'string') {
                payload = JSON.parse(payload);
            }

            const newEntry = {
                sectionName: sectionName,
                layout: updatedLayout,
                fieldMappings: cleanedFieldMappings,
                widgets: widgetsWithCompleteData,
                expanded: isExpanded,
            };

            payload.push(newEntry);
            sessionStorage.setItem('payload', JSON.stringify(payload));

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Layout saved successfully!',
                life: 3000,
            });

            // After successful save, remove deleted widgets from the widgets array
            setWidgets((prev) => prev.filter((w) => !w.deleted));

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href =
                    process.env.NODE_ENV === 'development'
                        ? '/?view=edit'
                        : `${process.env.NEXT_PUBLIC_BSP_NAME}/index.html?view=edit`;
            }, 2000);
        } catch (error) {
            console.error('Error saving layout:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: `Failed to save layout: ${error instanceof Error ? error.message : 'Unknown error'}`,
                life: 5000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading state while fetching widgets
    if (loading) {
        return (
            <div className="relative min-h-screen w-full">
                <div className="absolute inset-0" style={backgroundStyle} aria-hidden />
                <Toast ref={toast} />
                <LoadingScreen />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full">
            <div className="absolute inset-0" style={backgroundStyle} aria-hidden />
            <Toast ref={toast} />
            <div className="relative z-10" style={{ color: 'var(--foreground)' }}>
                <DashboardBuilder
                    widgets={widgets}
                    layout={layout}
                    onWidgetsChange={setWidgets}
                    onLayoutChange={setLayout}
                    sectionName={sectionName}
                    cols={12}
                    rowHeight={80}
                    onSave={saveLayout}
                    isSaving={isSaving}
                    saveDisabled={!sectionId}
                    onWidgetRemove={removeWidget}
                    transparentBackground
                />
            </div>
        </div>
    );
};

export default MappingScreen;

