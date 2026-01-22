'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { ThemeToggleButton } from '@/components/ui/ThemeToggleButton';
import {
    EyeIcon,
    PencilIcon,
    DocumentDuplicateIcon,
    ClipboardDocumentListIcon,
    ArrowDownOnSquareIcon,
    ArrowUturnLeftIcon,
    ArrowUturnRightIcon,
} from '@heroicons/react/24/outline';
import SidebarMapping from '@/components/SidebarMapping';
import WidgetConfigurationPanel from '@/components/WidgetConfigurationPanel';
import { DashboardGrid } from './DashboardGrid';
import { DashboardProps, Widget, LayoutItem } from '../dashboard.types';
import PieMetric from '@/widgets/PieMetric';
import SimpleMetric from '@/widgets/SimpleMetric';
import SimpleMetricDate from '@/widgets/SimpleMetricDate';
import SingleLineChart from '@/widgets/SingleLineChart';
import TableMetric from '@/widgets/TableMetric';
import BarMetric from '@/widgets/BarMetric';
import StackedBarChart from '@/widgets/StackedBarChart';
import OrdersLineChart from '@/widgets/OrdersLineChart';
import AnnouncementWidget from '@/widgets/Announcement1';
import DualLineChart from '@/widgets/DualLineChart';
import PieChartWithTotal from '@/widgets/PieChartWithTotal';
import QuadrantMetrics from '@/widgets/QuadrantMetrics';
import LoansAppTray from '@/widgets/LoansAppTray';
import NewsFeed from '@/widgets/NewsFeed';
import PieChartComponent from '@/widgets/PieChart';
import StackedColumn from '@/widgets/ColumnChart';
import PredictionChart from '@/widgets/Prediction';
import RadarChartComponent from '@/widgets/RadarChart';
import MultiChart from '@/widgets/MultiChart';
import MultiChartBex from '@/widgets/MultiChartBex';
import FilterWidget from '@/widgets/FilterWidget';
import ListenerWidget from '@/widgets/ListenerWidget';
import GaugeChart from '@/widgets/GaugeChart';
import BlankWidget from '@/widgets/blank-widget/BlankWidget';
import { getDefaultWidgetProps, getDefaultWidgetSize } from '../config/widgetDefaultProps';
import { ChartWidgetConfig } from '@/widgets/chart/multi-chart/ChartConfig.types';
import { transformBexToChart } from '@/widgets/chart/multi-chart/transformBexToChart';
import MultiMetric from '@/widgets/chart/multi-metric/MultiMetric';
import KpiChart from '@/widgets/chart/kpi-chart/KpiChart';


// Widget mapping - maps widget names to their components
const widgetMapping: Record<string, React.ComponentType<any>> = {
    'two-metrics-piechart': PieMetric,
    'one-metric': SimpleMetric,
    'one-metric-date': SimpleMetricDate,
    'two-metrics-linechart': SingleLineChart,
    'one-metric-table': TableMetric,
    'bar-chart': BarMetric,
    'stacked-bar-chart': StackedBarChart,
    'orders-line-chart': OrdersLineChart,
    'dual-line-chart': DualLineChart,
    'pie-chart-total': PieChartWithTotal,
    'quadrant-metrics': QuadrantMetrics,
    'loans-app-tray': LoansAppTray,
    'news-feed': NewsFeed,
    announcement: AnnouncementWidget,
    'pie-chart': PieChartComponent,
    'column-chart': StackedColumn,
    'prediction-chart': PredictionChart,
    'radar-chart': RadarChartComponent,
    'multi-chart': MultiChart,
    'multi-chart-bex': MultiChartBex,
    'filter-widget': FilterWidget,
    'listener-widget': ListenerWidget,
    'gauge-chart': GaugeChart,
    'multi-metric': MultiMetric,
    'blank-widget': BlankWidget,
    'kpi-chart': KpiChart,
};

interface DashboardBuilderProps extends Omit<DashboardProps, 'isViewMode' | 'selectedWidget' | 'onWidgetClick' | 'onWidgetRemove'> {
    widgets: Widget[];
    layout: LayoutItem[];
    onWidgetsChange: (widgets: Widget[]) => void;
    onLayoutChange: (layout: LayoutItem[]) => void;
    renderWidget?: (widget: Widget) => React.ReactNode;
    emptyState?: React.ReactNode;
    showViewModeToggle?: boolean;
    onSave?: () => void;
    isSaving?: boolean;
    saveDisabled?: boolean;
    onWidgetRemove?: (widgetId: string) => void; // Optional custom remove handler
}

/**
 * DashboardBuilder - Edit wrapper for building and editing dashboards
 * This component includes the sidebar, configuration panel, and edit/view mode toggle
 */
export const DashboardBuilder: React.FC<DashboardBuilderProps> = ({
    widgets,
    layout,
    onWidgetsChange,
    onLayoutChange,
    sectionName = 'Dashboard',
    cols = 12,
    rowHeight = 80,
    renderWidget,
    emptyState,
    showViewModeToggle = true,
    onSave,
    isSaving = false,
    saveDisabled = false,
    onWidgetRemove,
}) => {
    const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
    const [isViewMode, setIsViewMode] = useState<boolean>(false);
    const [copiedWidget, setCopiedWidget] = useState<{
        widget: Widget;
        layoutItem: LayoutItem;
    } | null>(null);
    const [history, setHistory] = useState<
        { widgets: Widget[]; layout: LayoutItem[] }[]
    >([]);
    const [future, setFuture] = useState<
        { widgets: Widget[]; layout: LayoutItem[] }[]
    >([]);

    const pushToHistory = () => {
        setHistory((prev) => [...prev, { widgets, layout }]);
        setFuture([]);
    };

    const handleUndo = () => {
        setHistory((prevHistory) => {
            if (prevHistory.length === 0) return prevHistory;

            const previous = prevHistory[prevHistory.length - 1];
            const newHistory = prevHistory.slice(0, -1);

            setFuture((prevFuture) => [...prevFuture, { widgets, layout }]);
            onWidgetsChange(previous.widgets);
            onLayoutChange(previous.layout);

            return newHistory;
        });
    };

    const handleRedo = () => {
        setFuture((prevFuture) => {
            if (prevFuture.length === 0) return prevFuture;

            const next = prevFuture[prevFuture.length - 1];
            const newFuture = prevFuture.slice(0, -1);

            setHistory((prevHistory) => [...prevHistory, { widgets, layout }]);
            onWidgetsChange(next.widgets);
            onLayoutChange(next.layout);

            return newFuture;
        });
    };


    // Add widget to the grid
    const addWidget = (widgetName: string) => {
        // Get default props and size for the widget
        const defaultProps = getDefaultWidgetProps(widgetName);
        const { w, h } = getDefaultWidgetSize(widgetName);

        const newWidget: Widget = {
            id: `widget-${Date.now()}`,
            name: widgetName,
            props: defaultProps, // Initialize with default props
            isNew: true, // Mark as new widget
        };

        const newLayoutItem: LayoutItem = {
            i: newWidget.id,
            x: (layout.length * 2) % cols,
            y: Math.floor(layout.length / (cols / 3)) * 3,
            w,
            h,
            minW: 2,
            minH: 1,
        };

        pushToHistory();
        onWidgetsChange([...widgets, newWidget]);
        onLayoutChange([...layout, newLayoutItem]);
    };

    // Remove widget from the grid
    const removeWidget = (widgetId: string) => {
        // Use custom handler if provided, otherwise use default behavior
        if (onWidgetRemove) {
            onWidgetRemove(widgetId);
        } else {
            pushToHistory();
            onWidgetsChange(widgets.filter((w) => w.id !== widgetId));
            onLayoutChange(layout.filter((l) => l.i !== widgetId));
        }

        // Clear selection if deleted widget was selected
        if (selectedWidget === widgetId) {
            setSelectedWidget(null);
        }
    };

    // Handle widget click
    const handleWidgetClick = (widgetId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedWidget(widgetId === selectedWidget ? null : widgetId);
    };

    // Handle widget update from configuration panel
    const handleWidgetUpdate = (widgetId: string, props: Record<string, any>) => {
        pushToHistory();
        onWidgetsChange(
            widgets.map((w) => (w.id === widgetId ? { ...w, props } : w))
        );
    };

    // Copy currently selected widget
    const handleCopyWidget = () => {
        if (!selectedWidget) return;

        const widget = widgets.find((w) => w.id === selectedWidget);
        const layoutItem = layout.find((l) => l.i === selectedWidget);

        if (!widget || !layoutItem) return;

        setCopiedWidget({
            widget: { ...widget },
            layoutItem: { ...layoutItem },
        });
    };

    // Paste copied widget as a new widget on the grid
    const handlePasteWidget = () => {
        if (!copiedWidget) return;

        const baseWidget = copiedWidget.widget;
        const baseLayout = copiedWidget.layoutItem;

        const newId = `widget-${Date.now()}`;

        const newWidget: Widget = {
            ...baseWidget,
            id: newId,
            isNew: true,
        };

        const newLayoutItem: LayoutItem = {
            ...baseLayout,
            i: newId,
            x: Math.min(baseLayout.x + 1, Math.max(0, cols - baseLayout.w)),
            y: baseLayout.y,
        };

        pushToHistory();
        onWidgetsChange([...widgets, newWidget]);
        onLayoutChange([...layout, newLayoutItem]);
        setSelectedWidget(newId);
    };

    const handleLayoutChange = (newLayout: LayoutItem[]) => {
        pushToHistory();
        onLayoutChange(newLayout);
    };

    // Keyboard shortcuts: Cmd/Ctrl+C to copy, Cmd/Ctrl+V to paste
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only in edit mode
            if (isViewMode) return;

            // Ignore if user is typing in an input/textarea or editable content
            const target = event.target as HTMLElement | null;
            if (target) {
                const tagName = target.tagName.toLowerCase();
                const isEditable =
                    tagName === 'input' ||
                    tagName === 'textarea' ||
                    (target as HTMLElement).isContentEditable;
                if (isEditable) return;
            }

            const isCopyShortcut =
                (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c';
            const isPasteShortcut =
                (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'v';

            if (isCopyShortcut) {
                if (selectedWidget) {
                    event.preventDefault();
                    handleCopyWidget();
                }
                return;
            }

            if (isPasteShortcut) {
                if (copiedWidget) {
                    event.preventDefault();
                    handlePasteWidget();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isViewMode, selectedWidget, copiedWidget, handleCopyWidget, handlePasteWidget]);

    const defaultRenderWidget = (widget: Widget) => {
        if (renderWidget) {
            return renderWidget(widget);
        }

        // Get the widget component from the mapping
        const WidgetComponent = widgetMapping[widget.name];

        if (WidgetComponent) {
            // Render the actual widget component with its props
            // Wrap it to ensure it respects the overlay container styling
            return (
                <div className="h-full w-full">
                    <WidgetComponent {...(widget.props || {})} />
                </div>
            );
        }

        // Fallback - keep original placeholder style
        return (
            <div className="text-center">
                <div className="mb-2 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    {widget.name.replace(/-/g, ' ')}
                </div>
                <div className="text-sm">Widget content will be rendered here</div>
            </div>
        );
    };

    return (
        <div
            className="relative flex h-screen w-full overflow-hidden"
            style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
            } as React.CSSProperties}
        >


            {/* Sidebar - Only visible in edit mode */}
            {!isViewMode && (
                <div className="h-full flex-shrink-0 bg-white">
                    <SidebarMapping onItemClick={addWidget} />
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
                <div
                    className="flex items-center justify-between p-5 border-t bg-[#06103a]"
                    style={{ borderColor: 'var(--border)' }}
                >
                    {/* Left Side: View Mode + Theme */}
                    {showViewModeToggle && (
                        <div className="flex items-center gap-3">
                            <Button
                                className="p-button-rounded p-button-secondary shadow-lg flex items-center justify-center"
                                onClick={() => setIsViewMode((prev) => !prev)}
                                tooltip={isViewMode ? 'Exit View Mode' : 'View Mode'}
                                tooltipOptions={{ position: 'top' }}
                            >
                                {isViewMode ? (
                                    <PencilIcon className="h-5 w-5 text-white" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-white" />
                                )}
                            </Button>

                            <ThemeToggleButton className="shadow-lg" />
                        </div>
                    )}

                    {/* Right Side: Copy / Paste / Save */}
                    {!isViewMode && (
                        <div className="flex items-center gap-3">
                            <Button
                                className="p-button-rounded p-button-secondary shadow-lg flex items-center justify-center"
                                onClick={handleUndo}
                                disabled={history.length === 0}
                                tooltip={history.length ? 'Undo' : 'Nothing to undo'}
                                tooltipOptions={{ position: 'top' }}
                            >
                                <ArrowUturnLeftIcon className="h-5 w-5 text-white" />
                            </Button>
                            <Button
                                className="p-button-rounded p-button-secondary shadow-lg flex items-center justify-center"
                                onClick={handleRedo}
                                disabled={future.length === 0}
                                tooltip={future.length ? 'Redo' : 'Nothing to redo'}
                                tooltipOptions={{ position: 'top' }}
                            >
                                <ArrowUturnRightIcon className="h-5 w-5 text-white" />
                            </Button>
                            <Button
                                className="p-button-rounded p-button-secondary shadow-lg flex items-center justify-center"
                                onClick={handleCopyWidget}
                                disabled={!selectedWidget}
                                tooltip={selectedWidget ? 'Copy Selected Widget' : 'Select a widget to copy'}
                                tooltipOptions={{ position: 'top' }}
                            >
                                <DocumentDuplicateIcon className="h-5 w-5 text-white" />
                            </Button>
                            <Button
                                className="p-button-rounded p-button-secondary shadow-lg flex items-center justify-center"
                                onClick={handlePasteWidget}
                                disabled={!copiedWidget}
                                tooltip={copiedWidget ? 'Paste Copied Widget' : 'Copy a widget first'}
                                tooltipOptions={{ position: 'top' }}
                            >
                                <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                            </Button>

                            {onSave && (
                                <Button
                                    className="p-button-rounded p-button-success shadow-lg flex items-center justify-center"
                                    onClick={onSave}
                                    loading={isSaving}
                                    disabled={isSaving || saveDisabled}
                                    tooltip="Save"
                                    tooltipOptions={{ position: 'top' }}
                                >
                                    <ArrowDownOnSquareIcon className="h-5 w-5 text-white" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>


                <div className="flex-1 overflow-auto">
                    <DashboardGrid
                        widgets={widgets}
                        layout={layout}
                        onLayoutChange={handleLayoutChange}
                        isViewMode={isViewMode}
                        selectedWidget={selectedWidget}
                        onWidgetClick={handleWidgetClick}
                        onWidgetRemove={removeWidget}
                        sectionName={sectionName}
                        cols={cols}
                        rowHeight={rowHeight}
                        renderWidget={defaultRenderWidget}
                        emptyState={emptyState}
                    />
                </div>


            </div>

            {/* Configuration Panel - Only visible in edit mode */}
            {!isViewMode && (
                <div className="flex h-screen w-56 min-w-56 max-w-56 flex-shrink-0 flex-col overflow-auto bg-gradient-to-b from-[#00214E] to-[#0164B0] text-white md:w-64 md:min-w-64 md:max-w-64">
                    {selectedWidget ? (
                        <WidgetConfigurationPanel
                            selectedWidget={selectedWidget}
                            widgets={widgets}
                            onWidgetUpdate={handleWidgetUpdate}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-white/80">
                            No configuration available. Select a widget to configure its settings.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

