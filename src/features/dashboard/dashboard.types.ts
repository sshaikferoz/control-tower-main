import type { LayoutItem as GridLayoutItem } from 'react-grid-layout/legacy';

export interface Widget {
    id: string;
    name: string;
    deleted?: boolean;
    [key: string]: any; // Allow additional widget properties
}

export interface LayoutItem extends GridLayoutItem {}

export interface DashboardProps {
    widgets: Widget[];
    layout: LayoutItem[];
    onLayoutChange?: (layout: LayoutItem[]) => void;
    isViewMode?: boolean;
    selectedWidget?: string | null;
    selectedWidgetIds?: string[];
    onWidgetClick?: (widgetId: string, event: React.MouseEvent) => void;
    onWidgetRemove?: (widgetId: string) => void;
    sectionName?: string;
    cols?: number;
    rowHeight?: number;
}

