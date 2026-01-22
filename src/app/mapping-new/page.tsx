'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { DashboardBuilder } from '@/features/dashboard';
import type { Widget, LayoutItem } from '@/features/dashboard';
import mirageServer from '@/lib/mirage/mirageServer';
import { Toast } from 'primereact/toast';
import { sapODataService, LayoutData } from '@/services/sapODataService';
import type { LayoutWidget } from '@/services/sapODataService';
import { getDefaultWidgetSize } from '@/features/dashboard/config/widgetDefaultProps';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

if (process.env.NODE_ENV === 'development') mirageServer();

const MappingScreen: React.FC = () => {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [layout, setLayout] = useState<LayoutItem[]>([]);
    const [fieldMappings, setFieldMappings] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const toast = React.useRef<Toast>(null);

    // Get section info from URL params
    const { sectionName, sectionId, isExpanded } = useMemo(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            return {
                sectionName: searchParams.get('sectionName') || 'Dashboard',
                sectionId: searchParams.get('sectionId') || '',
                isExpanded: searchParams.get('expanded') || 'false',
            };
        }
        return {
            sectionName: 'Dashboard',
            sectionId: '',
            isExpanded: 'false',
        };
    }, []);

    // Load existing widgets from SAP OData service
    useEffect(() => {
        const loadExistingWidgets = async () => {
            if (sectionId && sectionId !== 'undefined' && sectionId !== '') {
                try {
                    setLoading(true);

                    const fetchedWidgets = await sapODataService.fetchWidgetsBySectionId(sectionId);

                    if (fetchedWidgets && fetchedWidgets.length > 0) {
                        // Filter only active and non-deleted widgets
                        const activeWidgets = fetchedWidgets.filter(
                            (widget: any) => widget.active && !widget.deleted
                        );

                        if (activeWidgets.length > 0) {
                            // Transform widgets to match Widget type
                            const transformedWidgets: Widget[] = activeWidgets.map((widget: any) => {
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
                                    },
                                    roles: transformedRoles, // Also keep on widget for backward compatibility
                                    Description: widget.description || '',
                                    deleted: widget.deleted || false,
                                    isNew: false, // Mark as existing widget
                                };
                            });

                            setWidgets(transformedWidgets);

                            // Transform layout
                            const transformedLayout: LayoutItem[] = activeWidgets.map(
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
                            activeWidgets.forEach((widget: any) => {
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
            const updatedLayout = layout.map((item) => ({
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
                    active: !widget.deleted,
                };
            });

            const layoutData: LayoutData = {
                sectionName: sectionName,
                layout: updatedLayout.map((item) => ({
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

            // // Redirect after a short delay
            // setTimeout(() => {
            //     window.location.href =
            //         process.env.NODE_ENV === 'development'
            //             ? '/?view=edit'
            //             : `${process.env.NEXT_PUBLIC_BSP_NAME}/index.html?view=edit`;
            // }, 2000);
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
            <>
                <Toast ref={toast} />
                <LoadingScreen title="Loading widgets..." message="Please wait while we load your dashboard configuration." />
            </>
        );
    }

    return (
        <>
            <Toast ref={toast} />
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
            />
        </>
    );
};

export default MappingScreen;

