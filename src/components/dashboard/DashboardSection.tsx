//DashboardSection.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Tooltip,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import MappingIcon from '@mui/icons-material/Map';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import RGL, { WidthProvider } from 'react-grid-layout/legacy';
import { DashboardSectionProps } from '@/types/dashboard';
import { LazyWidgetContent } from '@/widgets/LazyWidgetContent';
import { WidgetDetailsDialog } from '@/components/dialogs/WidgetDetailsDialog';
import { DataManager } from '@/services/DataManager';
import { processWidgetMappings, fetchAndTransformMultiChartData } from '@/helpers/transformHelpers';
import { defaultPropsMapping, widgetMapping } from '@/constants/widgetConfig';

import { sapODataService } from '@/services/sapODataService';
import mirageServer from '@/lib/mirage/mirageServer';
import { DASHBOARD_MENU_ICONS } from '@/widgets/dashboard-menu/DashboardMenuConfig.types';

const GridLayout = WidthProvider(RGL);
const SECTION_ICON_BASE_URL = `${process.env.NEXT_PUBLIC_BSP_NAME || ''}/icons`;
const MENU_ICON_IDS = new Set<string>(DASHBOARD_MENU_ICONS.map((i) => i.id));

/** Section header icon: shows custom icon from section or default document icon (light/dark themed) */
const SectionHeaderIcon: React.FC<{ iconId?: string }> = ({ iconId }) => {
    const isValidIcon = iconId && MENU_ICON_IDS.has(iconId);
    if (isValidIcon) {
        return (
            <span
                className="mr-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: 'var(--widget-surface)', color: 'var(--section-icon)' }}
            >
                <img
                    src={`${SECTION_ICON_BASE_URL}/${iconId}`}
                    alt=""
                    className="h-5 w-5 object-contain"
                    style={{ filter: 'var(--section-icon-filter)' }}
                />
            </span>
        );
    }
    return (
        <span
            className="mr-2 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'var(--widget-surface)', color: 'var(--section-icon)' }}
        >
            <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M5 3.5C5 3.22386 5.22386 3 5.5 3H9.5L11.5 5V12.5C11.5 12.7761 11.2761 13 11 13H5C4.72386 13 4.5 12.7761 4.5 12.5V3.5C4.5 3.22386 4.72386 3 5 3Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M8 7H6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M9.5 9H6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path
                    d="M10.5 4L9 5.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
};

// Updated interface to include highlighting props
interface ExtendedDashboardSectionProps extends DashboardSectionProps {
    // Optional highlighting props
    highlightSectionId?: string;
    highlightWidgetIds?: string[];
    // Dashboard configuration
    dashboardType?: 'Sections' | 'Report';
}
if (process.env.NODE_ENV === 'development') mirageServer();
export const DashboardSection: React.FC<ExtendedDashboardSectionProps> = ({
    section,
    index,
    isAdmin = false,
    isEditMode,
    onDragStart,
    onDragEnter,
    onDragEnd,
    onDragOver,
    onEditSection,
    onDeleteSection,
    onOpenMapping,
    onAddWidgets,
    isWidgetPreferenceEditMode = false,
    sectionWidgetPreferences = {},
    onWidgetLayoutPreferenceChange,
    // New highlighting props
    highlightSectionId,
    highlightWidgetIds = [],
    // Dashboard configuration
    dashboardType = 'Sections',
}) => {
    const [reportData, setReportData] = useState<Record<string, any>>({});
    const [widgetProps, setWidgetProps] = useState<Record<string, any>>({});
    const [loadingWidgets, setLoadingWidgets] = useState<Set<string>>(new Set());
    const [errorReports, setErrorReports] = useState<Set<string>>(new Set());
    const [visibleWidgets, setVisibleWidgets] = useState<Set<string>>(new Set());
    const [isExpanded, setIsExpanded] = useState<boolean>(() => {
        // Use visible property to control expanded/collapsed state
        // If visible is false, section should be collapsed
        const originalSection = section.originalSection;
        if (originalSection?.visible !== undefined) {
            return originalSection.visible;
        }
        // Fallback to expanded property if visible is not set
        return section.expanded !== undefined ? section.expanded.toLowerCase() === 'true' : true;
    });

    const [widgetDetailsDialog, setWidgetDetailsDialog] = useState({
        open: false,
        widget: null,
    });

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
    const showQueryDebugErrors = isAdmin && isEditMode;

    const sectionRef = useRef<HTMLDivElement>(null);
    const dataManager = useMemo(() => DataManager.getInstance(), []);
    const sectionId = section.id || section.originalSection?.id || '';
    const allWidgets = section.widgets || [];
    const visibleByPreference = (widgetId: string) => {
        const pref = sectionWidgetPreferences?.[widgetId];
        return !pref?.hidden;
    };
    const getWidgetOrder = (widgetId: string, fallbackIndex: number) => {
        const pref = sectionWidgetPreferences?.[widgetId];
        return pref?.order ?? fallbackIndex;
    };
    const getWidgetLayoutPreference = (widgetId: string) => {
        return sectionWidgetPreferences?.[widgetId]?.layout;
    };
    const orderedAllWidgets = [...allWidgets].sort((a: any, b: any) => {
        const indexA = allWidgets.findIndex((item: any) => item.id === a.id);
        const indexB = allWidgets.findIndex((item: any) => item.id === b.id);
        return getWidgetOrder(a.id, indexA) - getWidgetOrder(b.id, indexB);
    });
    const orderedRenderableWidgets = orderedAllWidgets.filter((widget: any) => visibleByPreference(widget.id));
    const announcementWidgets = orderedRenderableWidgets.filter((w: any) => w.name === 'announcement');
    // When rendering the dashboard, hide widgets with active === false (IsActive '')
    const gridWidgets = orderedRenderableWidgets.filter(
        (w: any) => w.name !== 'announcement' && w.active !== false
    );

    // Check if this section should be highlighted
    const isSectionHighlighted =
        highlightSectionId === section.id || highlightSectionId === section.originalSection?.id;

    // Check if any widgets in this section should be highlighted
    const hasHighlightedWidgets =
        section.widgets?.some((widget: any) => highlightWidgetIds.includes(widget.id)) || false;

    // Function to check if a specific widget should be highlighted
    const isWidgetHighlighted = (widgetId: string) => {
        return highlightWidgetIds.includes(widgetId);
    };

    // Function to check if a widget should be dimmed (when highlighting is active but this widget is not highlighted)
    const isWidgetDimmed = (widgetId: string) => {
        const isHighlightingActive = highlightWidgetIds.length > 0;
        return isHighlightingActive && !highlightWidgetIds.includes(widgetId);
    };

    // Function to check if the section should be dimmed
    const isSectionDimmed = () => {
        const isHighlightingActive = highlightSectionId || highlightWidgetIds.length > 0;
        return isHighlightingActive && !isSectionHighlighted && !hasHighlightedWidgets;
    };

    // Sync expanded state with section's visible property
    useEffect(() => {
        const originalSection = section.originalSection;
        if (originalSection?.visible !== undefined) {
            setIsExpanded(originalSection.visible);
        }
    }, [section.originalSection?.visible]);

    // Initialize widget props with saved or default values
    useEffect(() => {
        const initialWidgetProps: Record<string, any> = {};

        section.widgets?.forEach((widget: any) => {
            if (widget.props && Object.keys(widget.props).length > 0) {
                const { configType, widgetCategory, ...cleanProps } = widget.props;
                initialWidgetProps[widget.id] = cleanProps;
            } else {
                initialWidgetProps[widget.id] = defaultPropsMapping[widget.name] || {};
            }
        });

        setWidgetProps(initialWidgetProps);
    }, [section.widgets]);

    // Handle widget visibility and trigger data loading
    const handleWidgetVisible = useCallback(
        async (widgetId: string) => {
            if (visibleWidgets.has(widgetId)) return;

            setVisibleWidgets((prev) => new Set([...prev, widgetId]));

            const widget = section.widgets?.find((w: any) => w.id === widgetId);
            if (!widget) return;

            const mappingConfig = section.fieldMappings?.[widgetId];
            if (!mappingConfig?.reportName) return;

            const reportName = mappingConfig.reportName;

            // Special handling for multi-chart widget - fetch query and transform if mapped
            // Only proceed if widget is mapped to a query (has reportName and chartConfig)
            if (widget.name === 'multi-chart' && mappingConfig.chartConfig && mappingConfig.reportName) {
                try {
                    setLoadingWidgets((prev) => new Set([...prev, widgetId]));
                    setErrorReports((prev) => {
                        const newSet = new Set([...prev]);
                        newSet.delete(reportName);
                        return newSet;
                    });

                    // Use existing props to preserve structure (series, title, chartType, etc.)
                    const existingProps = widget.props && Object.keys(widget.props).length > 0
                        ? widget.props
                        : defaultPropsMapping[widget.name] || {};

                    // Ensure chartConfig has the required structure
                    if (!mappingConfig.chartConfig.xAxis?.field || !mappingConfig.chartConfig.yAxis?.fields) {
                        console.warn(`Multi-chart widget ${widgetId} is missing required chartConfig fields`);
                        return;
                    }

                    // Fetch the query and transform the data
                    const transformedProps = await fetchAndTransformMultiChartData(
                        reportName,
                        mappingConfig.chartConfig,
                        existingProps
                    );

                    setWidgetProps((prev) => ({ ...prev, [widgetId]: transformedProps }));
                } catch (error) {
                    console.error(`Error loading data for multi-chart widget ${widgetId}:`, error);
                    setErrorReports((prev) => new Set([...prev, reportName]));
                    // Keep existing props on error
                    if (widget.props && Object.keys(widget.props).length > 0) {
                        setWidgetProps((prev) => ({ ...prev, [widgetId]: widget.props }));
                    }
                } finally {
                    setLoadingWidgets((prev) => {
                        const newSet = new Set([...prev]);
                        newSet.delete(widgetId);
                        return newSet;
                    });
                }
                return;
            }

            // For other widgets, use existing logic
            if (widget.props && Object.keys(widget.props).length > 0) {
                console.log(`Widget ${widgetId} already has saved props, skipping data fetch`);
                return;
            }

            try {
                setLoadingWidgets((prev) => new Set([...prev, widgetId]));
                setErrorReports((prev) => {
                    const newSet = new Set([...prev]);
                    newSet.delete(reportName);
                    return newSet;
                });

                const transformedData = await dataManager.getData(reportName);
                setReportData((prev) => ({ ...prev, [reportName]: transformedData }));

                const processedProps = processWidgetMappings(widget, mappingConfig, transformedData);
                setWidgetProps((prev) => ({ ...prev, [widgetId]: processedProps }));
            } catch (error) {
                console.error(`Error loading data for widget ${widgetId}:`, error);
                setErrorReports((prev) => new Set([...prev, reportName]));
                setReportData((prev) => ({ ...prev, [reportName]: null }));
            } finally {
                setLoadingWidgets((prev) => {
                    const newSet = new Set([...prev]);
                    newSet.delete(widgetId);
                    return newSet;
                });
            }
        },
        [visibleWidgets, section.widgets, section.fieldMappings, dataManager]
    );

    const handleWidgetExpand = (widget: any) => {
        setWidgetDetailsDialog({
            open: true,
            widget,
        });
    };

    const handleWidgetDetailsClose = () => {
        setWidgetDetailsDialog({
            open: false,
            widget: null,
        });
    };

    const toggleExpanded = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded((prev) => !prev);
    };

    // Section menu handlers
    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        if (!isEditMode) return;
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditClick = () => {
        if (!isEditMode) return;
        handleMenuClose();
        onEditSection(section.originalSection);
    };

    const handleDeleteClick = () => {
        if (!isEditMode) return;
        handleMenuClose();
        onDeleteSection(section.originalSection);
    };

    const handleMappingClick = () => {
        if (!isEditMode) return;
        handleMenuClose();
        onOpenMapping(section.originalSection, isExpanded);
    };

    const handleAddWidgetsClick = () => {
        if (!isEditMode) return;
        onAddWidgets(section.originalSection, isExpanded);
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent) => {
        if (!isEditMode) return;
        e.dataTransfer.setData('text/plain', index.toString());
        setTimeout(() => {
            if (sectionRef.current) {
                sectionRef.current.style.opacity = '0.4';
            }
        }, 0);
        onDragStart(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!isEditMode) return;
        e.preventDefault();
        onDragOver(index);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        if (!isEditMode) return;
        e.preventDefault();
        onDragEnter(index);
    };

    const handleDragEnd = () => {
        if (!isEditMode) return;
        if (sectionRef.current) {
            sectionRef.current.style.opacity = '1';
        }
        onDragEnd();
    };

    const handleOpenReport = async (targetReport: any): Promise<void> => {
        if (!targetReport?.technicalId) {
            //   alert('No Detailed Report configured for this widget.');
            return;
        }

        let reportUrl = '';

        try {
            switch (targetReport.type) {
                case 'Bex Query':
                    const bexUrl = await sapODataService.getServiceUrl('BexQuery');
                    reportUrl = bexUrl ? `${bexUrl}${targetReport.technicalId}` : '';
                    break;
                case 'Lumira':
                    const lumiraUrl = await sapODataService.getServiceUrl('Lumira');
                    reportUrl = lumiraUrl ? `${lumiraUrl}${targetReport.technicalId}` : '';
                    break;
                case 'WAD Template':
                    const wadUrl = await sapODataService.getServiceUrl('WADTemplate');
                    reportUrl = wadUrl ? `${wadUrl}${targetReport.technicalId}` : '';
                    break;
                case 'Web Link':
                    reportUrl = targetReport.technicalId;
                    break;
                default:
                    alert('Unknown report type.');
                    return;
            }

            if (!reportUrl && targetReport.type !== 'Web Link') {
                alert('Unable to retrieve service URL for this report type.');
                return;
            }

            window.open(reportUrl, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Error opening report:', error);
            alert('Error opening report. Please try again.');
        }
    };

    // Handle widget click to open report
    const handleWidgetClick = (e: React.MouseEvent, widget: any) => {
        // Don't handle click in edit mode
        if (isEditMode || isWidgetPreferenceEditMode) return;

        // Check if the click target or its parent is an action button
        const target = e.target as HTMLElement;
        const isActionButton = target.closest('[data-action-button="true"]') !== null;

        if (isActionButton) {
            return; // Let the action button handle the click
        }

        e.preventDefault();
        e.stopPropagation();

        // Check for target report in widget's field mappings first
        let targetReport = widget.props?.targetReport;

        // If not found, check section-level field mappings
        if (!targetReport) {
            const sectionMapping = section.fieldMappings?.[widget.id];
            targetReport = sectionMapping?.targetReport;
        }

        if (targetReport) {
            handleOpenReport(targetReport);
        } else {
            console.log('No report configured for this widget');
        }
    };

    // Handle info icon click - prevent event bubbling
    const handleInfoClick = (e: React.MouseEvent, widget: any) => {
        e.stopPropagation(); // Prevent widget click
        e.preventDefault();
        handleWidgetExpand(widget);
    };

    // Handle launch icon click - prevent event bubbling and open report
    const handleLaunchClick = (e: React.MouseEvent, targetReport: any) => {
        e.stopPropagation(); // Prevent widget click
        e.preventDefault();
        handleOpenReport(targetReport);
    };

    const handleLayoutPreferenceChange = (newLayout: readonly any[]) => {
        if (!isWidgetPreferenceEditMode || !onWidgetLayoutPreferenceChange || !sectionId) return;
        const normalizedLayout = newLayout.map((item) => ({
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
        }));
        onWidgetLayoutPreferenceChange(sectionId, normalizedLayout);
    };

    const originalLayout = section.layout || [];

    // --- Widget grouping ---------------------------------------------------
    // Widgets tagged with the same props.groupId were grouped on the mapping
    // screen. At runtime the whole group renders inside a single grid tile so
    // it moves/resizes as one unit and its members keep their relative overlap.
    const getWidgetGroupId = (widget: any): string | undefined =>
        widget?.props?.groupId || widgetProps[widget.id]?.groupId;

    const getMemberRect = (widget: any) => {
        const gl = widget?.props?.groupLayout;
        if (gl && typeof gl.x === 'number') {
            return { x: gl.x, y: gl.y, w: gl.w, h: gl.h };
        }
        const item = originalLayout.find((l: any) => l.i === widget.id);
        return { x: item?.x ?? 0, y: item?.y ?? 0, w: item?.w ?? 4, h: item?.h ?? 3 };
    };

    const computeGroupBBox = (members: any[]) => {
        const rects = members.map(getMemberRect);
        const minX = Math.min(...rects.map((r) => r.x));
        const minY = Math.min(...rects.map((r) => r.y));
        const maxX = Math.max(...rects.map((r) => r.x + r.w));
        const maxY = Math.max(...rects.map((r) => r.y + r.h));
        return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
    };

    const ungroupedWidgets = gridWidgets.filter((w: any) => !getWidgetGroupId(w));
    const widgetGroups = (() => {
        const map = new Map<string, any[]>();
        gridWidgets.forEach((w: any) => {
            const gid = getWidgetGroupId(w);
            if (!gid) return;
            const arr = map.get(gid) || [];
            arr.push(w);
            map.set(gid, arr);
        });
        return map;
    })();

    const ungroupedLayout = ungroupedWidgets
        .map((widget: any) => {
            const item = originalLayout.find((l: any) => l.i === widget.id);
            const layoutPreference = getWidgetLayoutPreference(widget.id);
            if (!item && !layoutPreference) return null;
            return {
                ...(item || {}),
                i: widget.id,
                x: layoutPreference?.x ?? item?.x ?? 0,
                y: layoutPreference?.y ?? item?.y ?? 0,
                w: layoutPreference?.w ?? item?.w ?? 4,
                h: layoutPreference?.h ?? item?.h ?? 3,
            };
        })
        .filter(Boolean);

    // Each group contributes a single grid item keyed by its groupId. A runtime
    // move/resize is read back from the per-id layout preference store, exactly
    // like a normal widget; otherwise it falls back to the members' bounding box.
    const groupLayout = Array.from(widgetGroups.entries()).map(([groupId, members]) => {
        const bbox = computeGroupBBox(members);
        const layoutPreference = getWidgetLayoutPreference(groupId);
        return {
            i: groupId,
            x: layoutPreference?.x ?? bbox.x,
            y: layoutPreference?.y ?? bbox.y,
            w: layoutPreference?.w ?? bbox.w,
            h: layoutPreference?.h ?? bbox.h,
        };
    });

    const layout = [...ungroupedLayout, ...groupLayout];
    // Generate dynamic classes for section highlighting
    const getSectionClasses = () => {
        let classes = `transition-all duration-300 ease-in-out ${isEditMode ? 'cursor-move rounded-lg border-2 border-dashed border-blue-300' : ''
            }`;

        if (isSectionHighlighted) {
            classes += ' ring-1 ring-yellow-400 ring-opacity-70 scale-98 opacity-95';
        } else if (isSectionDimmed()) {
            classes += ' opacity-40';
        }

        return classes;
    };

    // Generate dynamic classes for widget highlighting
    const getWidgetClasses = (widgetId: string, baseClasses: string = '') => {
        let classes = `${baseClasses} transition-all duration-300 ease-in-out`;

        if (isWidgetHighlighted(widgetId)) {
            classes += ' ring-2 ring-yellow-400 ring-opacity-70  relative';
        } else if (isWidgetDimmed(widgetId)) {
            classes += ' opacity-40';
        }

        // Add cursor pointer when not in edit mode and has mapped report
        if (!isEditMode && !isWidgetPreferenceEditMode) {
            const widget = section.widgets?.find((w: any) => w.id === widgetId);
            const hasReport =
                widget?.fieldMappings?.targetReport || section.fieldMappings?.[widgetId]?.targetReport;
            if (hasReport) {
                classes += ' cursor-pointer';
            }
        }

        return classes;
    };

    // Renders a single widget's card. Shared by standalone grid widgets and by
    // members rendered inside a group tile. When `nested` the card fills its
    // absolutely-positioned wrapper inside the group.
    const renderWidgetCard = (widget: any, nested = false) => {
        const Component = widgetMapping[widget.name];
        const baseProps = widgetProps[widget.id] || defaultPropsMapping[widget.name] || {};
        const props = {
            ...baseProps,
            showQueryDebugErrors,
            debugWidgetName: widget.title || baseProps.title || widget.name,
            debugWidgetId: widget.id,
        };
        const isLoading = loadingWidgets.has(widget.id);
        const isFilterPanel = widget?.name === 'filter-panel';
        const isUnauthorized = widget.active === false;
        const isTransparentWidget =
            props.chartConfig?.transparentBackground === true ||
            props.kpiConfig?.transparentBackground === true ||
            props.multiMetricConfig?.transparentBackground === true ||
            props.comparisonConfig?.transparentBackground === true ||
            props.alertConfig?.transparentBackground === true;
        const fillClass = nested ? ' h-full w-full' : '';

        if (!Component) {
            console.error(`Component not found for widget type: ${widget.name}`);
            return (
                <div
                    key={widget.id}
                    className={getWidgetClasses(
                        widget.id,
                        `bg-opacity-30 relative flex items-center justify-center rounded-lg bg-red-500${fillClass}`
                    )}
                >
                    <div className="p-4 text-center text-white">
                        <p>Widget type not found: {widget.name}</p>
                        <p className="mt-2 text-xs">
                            Available types: {Object.keys(widgetMapping).join(', ')}
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div
                key={widget.id}
                className={getWidgetClasses(
                    widget.id,
                    `${isFilterPanel
                        ? 'relative rounded-xl transition-shadow duration-200 hover:cursor-pointer overflow-hidden'
                        : 'relative rounded-xl transition-shadow duration-200 overflow-hidden'}${isTransparentWidget ? ' transparent' : ''}${fillClass}`
                )}
                style={!isFilterPanel && !isTransparentWidget ? { background: 'var(--widget-bg)', boxShadow: 'var(--widget-shadow)' } : {}}
                data-widget-id={widget.id}
                onClick={(e) => (isFilterPanel || isUnauthorized ? null : handleWidgetClick(e, widget))}
            >
                {/* Action buttons overlay */}
                {(() => {
                    if (isFilterPanel) return null;
                    const targetReport =
                        widget.props?.targetReport ||
                        widget.fieldMappings?.targetReport ||
                        section.fieldMappings?.[widget.id]?.targetReport;
                    const showInfo = targetReport?.showInfo || props.showdescription;
                    const description =
                        targetReport?.description || widget.description || 'No description available';

                    return showInfo ? (
                        <div className="absolute top-2 right-2 flex space-x-1 z-10">
                            <Tooltip title={description} enterDelay={0} leaveDelay={0} placement="top" arrow>
                                <IconButton
                                    onClick={(e) => handleInfoClick(e, widget)}
                                    size="small"
                                    data-action-button="true"
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                                    }}
                                >
                                    <InfoIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        </div>
                    ) : null;
                })()}

                {/* Widget content */}
                {isUnauthorized ? (
                    <div className="flex h-full w-full flex-col rounded-xl bg-[var(--widget-bg)] p-4" style={{ color: 'var(--text-neutral)' }}>
                        <div className="flex flex-1 items-center justify-center">
                            <p className="text-center text-xs opacity-90">
                                You are not authorized to view this widget.
                            </p>
                        </div>
                    </div>
                ) : (
                    <LazyWidgetContent
                        widget={widget}
                        Component={Component}
                        props={props}
                        onVisible={() => handleWidgetVisible(widget.id)}
                        isLoading={isLoading}
                    />
                )}
            </div>
        );
    };

    return (
        <div
            ref={sectionRef}
            draggable={isEditMode}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            className={getSectionClasses()}
            data-index={index}
            data-section-id={section.id || section.originalSection?.id} // Added for scroll-to functionality
        >
            {/* Hide section header when dashboardType is 'Report' and not in edit mode */}
            {(dashboardType !== 'Report' || isEditMode) && (
                <div className="m-2 flex items-center gap-1 p-2">
                    {isEditMode && (
                        <div className="mr-2">
                            <DragIndicatorIcon sx={{ color: 'var(--section-title)' }} />
                        </div>
                    )}
                    <SectionHeaderIcon iconId={section.originalSection?.icon} />
                    <p className="text-[var(--section-title)]">{section.sectionName}</p>
                    <div className="h-px flex-grow" style={{ background: 'var(--section-line)' }}></div>

                    {isEditMode && (
                        <>
                            <IconButton
                                onClick={handleMenuClick}
                                size="small"
                                aria-label="section actions"
                                sx={{
                                    color: 'var(--section-title)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={menuOpen}
                                onClose={handleMenuClose}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MenuItem onClick={handleEditClick}>
                                    <ListItemIcon>
                                        <EditIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Edit Section</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleMappingClick}>
                                    <ListItemIcon>
                                        <MappingIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Section Mapping</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleDeleteClick}>
                                    <ListItemIcon>
                                        <DeleteIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Delete Section</ListItemText>
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                    <span className="cursor-pointer text-[var(--section-title)]" onClick={toggleExpanded}>
                        {isExpanded ? '▼' : '►'}
                    </span>
                </div>
            )}

            {/* FIXED: Conditionally render content based on isExpanded state */}
            {/* Always show content when header is hidden (Report mode, non-edit), otherwise respect isExpanded */}
            {((dashboardType === 'Report' && !isEditMode) || isExpanded) && (
                <>
                    {/* 🔔 Render announcement widgets outside the grid */}
                    {announcementWidgets.map((widget) => {
                        const Component = widgetMapping[widget.name];
                        const baseProps = widgetProps[widget.id] || defaultPropsMapping[widget.name] || {};
                        const props = {
                            ...baseProps,
                            showQueryDebugErrors,
                            debugWidgetName: widget.title || baseProps.title || widget.name,
                            debugWidgetId: widget.id,
                        };
                        const isLoading = loadingWidgets.has(widget.id);
                        const isTransparentWidget =
                            props.chartConfig?.transparentBackground === true ||
                            props.kpiConfig?.transparentBackground === true ||
                            props.multiMetricConfig?.transparentBackground === true;

                        if (!Component) return null;

                        return (
                            <div
                                key={widget.id}
                                className={getWidgetClasses(widget.id, `relative mb-2 rounded-xl overflow-hidden${isTransparentWidget ? ' transparent' : ''}`)}
                                style={!isTransparentWidget ? { background: 'var(--widget-bg)', boxShadow: 'var(--widget-shadow)' } : {}}
                                onClick={(e) => handleWidgetClick(e, widget)}
                            >
                                {/* Action buttons for announcements */}
                                {(() => {
                                    // Check for showInfo in multiple locations
                                    const targetReport =
                                        widget.props?.targetReport ||
                                        widget.fieldMappings?.targetReport ||
                                        section.fieldMappings?.[widget.id]?.targetReport;
                                    const showInfo = targetReport?.showInfo || props.showdescription;
                                    const description = targetReport?.description || widget.description || 'No description available';

                                    return showInfo ? (
                                        <div className="absolute top-2 right-2 z-50 flex space-x-1">
                                            <Tooltip
                                                title={description}
                                                enterDelay={0}
                                                leaveDelay={0}
                                                placement="top"
                                                arrow
                                            >
                                                <IconButton
                                                    onClick={(e) => handleInfoClick(e, widget)}
                                                    size="small"
                                                    data-action-button="true"
                                                    sx={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                        color: 'white',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                                        },
                                                    }}
                                                >
                                                    <InfoIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    ) : null;
                                })()}

                                <LazyWidgetContent
                                    widget={widget}
                                    Component={Component}
                                    props={props}
                                    onVisible={() => handleWidgetVisible(widget.id)}
                                    isLoading={isLoading}
                                />
                            </div>
                        );
                    })}

                    {/* 🧱 GridLayout for all other widgets */}
                    <GridLayout
                        className="layout w-full"
                        layout={layout}
                        cols={12}
                        rowHeight={80}
                        isResizable={isWidgetPreferenceEditMode}
                        isDraggable={isWidgetPreferenceEditMode}
                        allowOverlap={true}
                        resizeHandles={isWidgetPreferenceEditMode ? ['se', 'e', 's'] : []}
                        onLayoutChange={handleLayoutPreferenceChange}
                    >
                        {/* Standalone widgets */}
                        {ungroupedWidgets.map((widget: any) => renderWidgetCard(widget))}

                        {/* Grouped widgets — one grid tile per group, members
                            absolutely positioned relative to the group bbox so
                            they move and resize together as a single unit. */}
                        {Array.from(widgetGroups.entries()).map(([groupId, members]) => {
                            const bbox = computeGroupBBox(members);
                            return (
                                <div key={groupId} className="relative h-full w-full" data-group-id={groupId}>
                                    {members.map((member: any) => {
                                        const rect = getMemberRect(member);
                                        return (
                                            <div
                                                key={member.id}
                                                className="absolute"
                                                style={{
                                                    left: `${((rect.x - bbox.x) / bbox.w) * 100}%`,
                                                    top: `${((rect.y - bbox.y) / bbox.h) * 100}%`,
                                                    width: `${(rect.w / bbox.w) * 100}%`,
                                                    height: `${(rect.h / bbox.h) * 100}%`,
                                                }}
                                            >
                                                {renderWidgetCard(member, true)}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </GridLayout>
                </>
            )}

            <WidgetDetailsDialog
                open={widgetDetailsDialog.open}
                onClose={handleWidgetDetailsClose}
                widget={widgetDetailsDialog.widget as any}
                targetReport={
                    (widgetDetailsDialog.widget as any)?.props?.targetReport ||
                    (widgetDetailsDialog.widget as any)?.fieldMappings?.targetReport ||
                    section.fieldMappings?.[(widgetDetailsDialog.widget as any)?.id]?.targetReport ||
                    undefined
                }
                description={
                    (widgetDetailsDialog.widget as any)?.props?.targetReport?.description ||
                    (widgetDetailsDialog.widget as any)?.fieldMappings?.targetReport?.description ||
                    section.fieldMappings?.[(widgetDetailsDialog.widget as any)?.id]?.targetReport?.description ||
                    (widgetDetailsDialog.widget as any)?.description ||
                    ''
                }
            />
        </div>
    );
};
