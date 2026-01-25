'use client';

import React, { useState, useEffect } from 'react';
import { DashboardBuilder } from '@/features/dashboard/builder/DashboardBuilder';
import type { Widget, LayoutItem } from '@/features/dashboard/dashboard.types';

const DashboardPage: React.FC = () => {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [layout, setLayout] = useState<LayoutItem[]>([]);

    // Use useState to avoid hydration mismatch - sectionName is set on client side only
    const [sectionName, setSectionName] = useState<string>('Dashboard');

    // Set section name from URL params on client side only to avoid hydration mismatch
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            setSectionName(searchParams.get('sectionName') || 'Dashboard');
        }
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

