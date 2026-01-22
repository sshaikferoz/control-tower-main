'use client';

import React from 'react';
import { DashboardGrid } from './builder/DashboardGrid';
import { DashboardProps, Widget } from './dashboard.types';

interface DashboardRendererProps extends Omit<DashboardProps, 'isViewMode' | 'onWidgetClick' | 'onWidgetRemove'> {
    renderWidget?: (widget: Widget) => React.ReactNode;
    emptyState?: React.ReactNode;
}

/**
 * DashboardRenderer - View-only wrapper for displaying dashboards
 * This component renders the dashboard in read-only mode without editing capabilities
 */
export const DashboardRenderer: React.FC<DashboardRendererProps> = ({
    widgets,
    layout,
    sectionName = 'Dashboard',
    cols = 12,
    rowHeight = 80,
    renderWidget,
    emptyState,
}) => {
    const defaultRenderWidget = (widget: Widget) => {
        if (renderWidget) {
            return renderWidget(widget);
        }

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
        <DashboardGrid
            widgets={widgets}
            layout={layout}
            isViewMode={true}
            sectionName={sectionName}
            cols={cols}
            rowHeight={rowHeight}
            renderWidget={defaultRenderWidget}
            emptyState={emptyState}
        />
    );
};

