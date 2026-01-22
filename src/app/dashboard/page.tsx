'use client';

import React, { useState, useMemo } from 'react';
import { DashboardBuilder } from '@/features/dashboard/builder/DashboardBuilder';
import type { Widget, LayoutItem } from '@/features/dashboard/dashboard.types';

const DashboardPage: React.FC = () => {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [layout, setLayout] = useState<LayoutItem[]>([]);

    // Get section name from URL params
    const sectionName = useMemo(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            return searchParams.get('sectionName') || 'Dashboard';
        }
        return 'Dashboard';
    }, []);

    return (
        <DashboardBuilder
            widgets={widgets}
            layout={layout}
            onWidgetsChange={setWidgets}
            onLayoutChange={setLayout}
            sectionName={sectionName}
            cols={12}
            rowHeight={80}
        />
    );
};

export default DashboardPage;

