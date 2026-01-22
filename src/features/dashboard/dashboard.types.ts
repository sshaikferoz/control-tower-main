import { Layout } from 'react-grid-layout';

export interface Widget {
    id: string;
    name: string;
    deleted?: boolean;
    [key: string]: any; // Allow additional widget properties
}

export interface LayoutItem extends Layout {
    i: string;
}

export interface DashboardProps {
    widgets: Widget[];
    layout: LayoutItem[];
    onLayoutChange?: (layout: LayoutItem[]) => void;
    isViewMode?: boolean;
    selectedWidget?: string | null;
    onWidgetClick?: (widgetId: string, event: React.MouseEvent) => void;
    onWidgetRemove?: (widgetId: string) => void;
    sectionName?: string;
    cols?: number;
    rowHeight?: number;
}

