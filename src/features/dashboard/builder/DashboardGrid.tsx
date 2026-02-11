'use client';

import React, { useState } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Typography } from '@mui/material';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { DashboardProps, Widget, LayoutItem } from '../dashboard.types';
import RGL, { WidthProvider, type Layout } from 'react-grid-layout/legacy';
const GridLayout = WidthProvider(RGL);
interface DashboardGridProps extends DashboardProps {
    selectedWidgetIds?: string[];
    renderWidget: (widget: Widget) => React.ReactNode;
    emptyState?: React.ReactNode;
    onCopyWidget?: (widgetId: string) => void;
    onPasteWidget?: () => void;
    onBringToFront?: (widgetId: string) => void;
    onSendToBack?: (widgetId: string) => void;
    copiedWidget?: boolean;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
    widgets,
    layout,
    onLayoutChange,
    isViewMode = false,
    selectedWidget = null,
    selectedWidgetIds = [],
    onWidgetClick,
    onWidgetRemove,
    sectionName = 'Dashboard',
    cols = 15,
    rowHeight = 0,
    renderWidget,
    emptyState,
}) => {
    const handleLayoutChange = (newLayout: Layout) => {
        if (onLayoutChange) {
            onLayoutChange([...newLayout] as LayoutItem[]);
        }
    };

    const handleWidgetClick = (widgetId: string, event: React.MouseEvent) => {

        if (onWidgetClick) {
            onWidgetClick(widgetId, event);
        }
    };

    const handleWidgetRemove = (widgetId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (onWidgetRemove) {
            onWidgetRemove(widgetId);
        }
    };

    const visibleWidgets = widgets.filter((widget) => !widget.deleted);

    return (
        <Splitter
            className="h-screen w-full overflow-y-auto"
            style={{
                backgroundImage: `url('${process.env.NEXT_PUBLIC_BSP_NAME}/background/bg-low.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
            layout="vertical"
        >
            <SplitterPanel>
                <div
                    className="flex flex-1 flex-col p-4"
                    style={{
                        color: 'var(--foreground)',
                    }}
                >
                    <Typography
                        variant="h5"
                        component="h1"
                        gutterBottom
                        style={{
                            color: 'var(--foreground)',
                            fontWeight: 600,
                            marginBottom: '1rem',
                        }}
                    >
                        {sectionName}
                    </Typography>

                    {visibleWidgets.length === 0 ? (
                        emptyState || (
                            <div
                                className="flex h-full items-center justify-center"
                                style={{
                                    color: 'var(--foreground)'
                                }}
                            >
                                <div className="text-center">
                                    <div className="mb-4 text-4xl">📊</div>
                                    <div className="mb-2 text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                                        No widgets yet
                                    </div>
                                    <div className="text-sm">
                                        {isViewMode
                                            ? 'Switch to edit mode to add widgets'
                                            : 'Click on a widget from the sidebar to add it'}
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <GridLayout
                            className="layout h-full w-full"
                            layout={layout}
                            cols={cols}
                            rowHeight={rowHeight}
                            allowOverlap={true}
                            isResizable={!isViewMode}
                            resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
                            isDraggable={!isViewMode}
                            onLayoutChange={handleLayoutChange}
                        >
                            {visibleWidgets.map((widget) => (
                                <div
                                    key={widget.id}
                                    className="relative rounded-lg shadow-md transition-all"
                                    style={{
                                        // backgroundColor: 'var(--background)',
                                        border: `2px solid var(${selectedWidgetIds.includes(widget.id) || selectedWidget === widget.id ? '--primary1' : '--foreground'})`,
                                        cursor: isViewMode ? 'default' : 'pointer',
                                    }}

                                    onMouseDown={(event) => event.stopPropagation()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleWidgetClick(widget.id, e)
                                    }}
                                >
                                    {/* Delete Button - Only in edit mode */}
                                    {!isViewMode && onWidgetRemove && (
                                        <button
                                            className="absolute top-2 right-2 z-50 rounded px-2 py-1 text-xs text-white transition-colors hover:bg-red-600"
                                            style={{
                                                backgroundColor: '#ef4444',
                                                pointerEvents: 'auto',
                                            }}
                                            onMouseDown={(event) => event.stopPropagation()}
                                            onClick={(event) => { event.stopPropagation(); handleWidgetRemove(widget.id, event) }}
                                        >
                                            ✕
                                        </button>
                                    )}

                                    {/* Widget Content */}
                                    <div
                                        className="flex h-full w-full items-center justify-center"
                                        style={{
                                            color: 'var(--foreground)'
                                        }}
                                    >
                                        {renderWidget(widget)}
                                    </div>
                                </div>
                            ))}
                        </GridLayout>
                    )}
                </div>
            </SplitterPanel>
        </Splitter >
    );
};

