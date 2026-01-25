import React, { useState, useEffect, Suspense } from 'react';
import { Tooltip } from '@mui/material';
import { useIntersectionObserver } from '../hooks/ui/useIntersectionObserver';
import { WidgetSkeleton } from '../components/ui/WidgetSkeleton';

interface LazyWidgetContentProps {
    widget: any;
    Component: React.ComponentType<any>;
    props: any;
    onVisible: () => void;
    isLoading: boolean;
}

export const LazyWidgetContent: React.FC<LazyWidgetContentProps> = ({
    widget,
    Component,
    props,
    onVisible,
    isLoading,
}) => {
    const { setRef, isVisible, hasBeenVisible } = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '50px',
    });

    const [hasTriggeredLoad, setHasTriggeredLoad] = useState(false);

    useEffect(() => {
        if ((isVisible || hasBeenVisible) && !hasTriggeredLoad) {
            onVisible();
            setHasTriggeredLoad(true);
        }
    }, [isVisible, hasBeenVisible, hasTriggeredLoad, onVisible, widget.id]);

    const isKpiChart = widget.name === 'kpi-chart';
    const hoverClasses = isKpiChart
        ? 'transition-transform duration-300 ease-in-out hover:scale-105 origin-center'
        : '';


    const description = widget.description || '';

    const content = (
        <div ref={setRef} className={`h-full w-full ${hoverClasses}`}>
            {isVisible || hasBeenVisible ? (
                <Suspense fallback={<WidgetSkeleton />}>
                    {isLoading ? <WidgetSkeleton /> : <Component {...props} />}
                </Suspense>
            ) : (
                <WidgetSkeleton />
            )}
        </div>
    );

    // Wrap with tooltip only for KpiChart widgets with description
    if (isKpiChart && description) {
        return (
            <Tooltip
                title={description}
                placement="top"
                arrow
                enterDelay={300}
                leaveDelay={0}
            >
                {content}
            </Tooltip>
        );
    }

    return content;
};
