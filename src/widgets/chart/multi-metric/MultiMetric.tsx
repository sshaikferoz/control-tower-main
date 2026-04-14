import React, { useMemo } from 'react';
import useBexJson from '@/hooks/useBexJson';
import { MultiMetricWidgetConfig, MultiMetricItem } from './MultiMetricConfig.types';
import { formatNumber } from '@/helpers/numberFormatting';
import { applyTypographyStyles } from '@/helpers/typographyHelper';
import { Skeleton } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { buildVariableParams } from '@/utils/buildVariableParams';

interface MultiMetricProps {
    multiMetricConfig?: MultiMetricWidgetConfig;
    backgroundColor?: string;
    typography?: any;
    title?: string; // Widget-level title (may come from query or manual widget title)
}

// Trend icon component
const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'equal' }> = ({ trend }) => {
    const iconColor = {
        up: '#4CAF50', // Green for increase
        down: '#F44336', // Red for decrease
        equal: '#FFC107', // Yellow for equal
    }[trend];

    if (trend === 'up') {
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4L12 8H9V12H7V8H4L8 4Z" fill={iconColor} />
            </svg>
        );
    } else if (trend === 'down') {
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12L4 8H7V4H9V8H12L8 12Z" fill={iconColor} />
            </svg>
        );
    } else {
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8H14" stroke={iconColor} strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }
};

// Single metric item - rendered inside the shared card
const MetricItem: React.FC<{
    metric: MultiMetricItem;
    value: number | null;
    isLoading: boolean;
    error: Error | null;
    typography?: any;
    layout?: 'horizontal' | 'vertical';
}> = ({ metric, value, isLoading, error, typography, layout = 'horizontal' }) => {
    // Get metric's own layout (how title and value are arranged within the metric)
    const metricLayout = metric.metricLayout || 'vertical';

    // Calculate trend
    const trend = useMemo(() => {
        if (!metric.enableTrend || value === null || metric.trendValue === undefined) {
            return null;
        }

        const comparison = metric.invertTrend
            ? value < metric.trendValue
            : value > metric.trendValue;

        if (comparison) {
            return 'up';
        } else if (value === metric.trendValue) {
            return 'equal';
        } else {
            return 'down';
        }
    }, [metric, value]);

    // Format value
    const formattedValue = useMemo(() => {
        if (value === null) return 'N/A';
        return formatNumber(value, {
            format: metric.valueFormat || 'non-currency',
            decimalPrecision: metric.decimalPrecision,
        });
    }, [value, metric.valueFormat, metric.decimalPrecision]);

    // Get alignment classes
    const titleAlignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }[metric.titleAlignment || 'center'];

    const valueAlignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }[metric.valueAlignment || 'center'];

    // Apply typography styles
    // Use "name" for per-metric labels, so widget header ("title")
    // typography does not affect every metric item.
    const titleStyles = applyTypographyStyles('label', typography);
    const valueStyles = applyTypographyStyles('value', typography);

    if (isLoading) {
        // Responsive padding based on widget layout
        const paddingClasses = layout === 'vertical'
            ? 'px-2 sm:px-4'
            : 'px-2 sm:px-4 lg:px-6';

        return (
            <div className={`flex flex-col items-center justify-center ${paddingClasses} flex-1 min-w-0`}>
                <Skeleton
                    variant="text"
                    width="60%"
                    height={20}
                    sx={{
                        bgcolor: 'var(--skeleton-bg)',
                        mb: 1,
                    }}
                />
                <Skeleton
                    variant="text"
                    width="80%"
                    height={40}
                    sx={{
                        bgcolor: 'var(--skeleton-bg)',
                    }}
                />
            </div>
        );
    }

    if (error) {
        return null;
    }

    // Responsive padding and sizing based on widget layout (not metric layout)
    const paddingClasses = layout === 'vertical'
        ? 'px-2 sm:px-4'
        : 'px-2 sm:px-4 lg:px-6';

    const valueSizeClasses = layout === 'vertical'
        ? 'text-xl sm:text-2xl lg:text-3xl'
        : 'text-lg sm:text-xl md:text-2xl lg:text-3xl';

    return (
        <div className={`flex ${metricLayout === 'horizontal' ? 'flex-row items-center' : 'flex-col items-center'} justify-center ${paddingClasses} flex-1 min-w-0`}>
            {metricLayout === 'vertical' ? (
                // Vertical layout: title on top, value below
                <>
                    <div className={`mb-1 ${titleAlignClass} w-full`}>
                        <p className="text-xs sm:text-sm font-medium text-white/90" style={titleStyles}>
                            {metric.title}
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 w-full ${valueAlignClass === 'text-center'
                        ? 'justify-center'
                        : valueAlignClass === 'text-right'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}>
                        <span className={`${valueSizeClasses} font-bold text-white`} style={valueStyles}>
                            {formattedValue}
                            {metric.unit ? <span className="text-[0.7em] font-normal opacity-90"> {metric.unit}</span> : ''}
                        </span>
                        {metric.enableTrend && trend !== null && <TrendIcon trend={trend} />}
                    </div>
                </>
            ) : metricLayout === 'verticalTitleBelow' ? (
                // Vertical layout: value on top, title below
                <>
                    <div className={`flex items-center gap-2 w-full mb-1 ${valueAlignClass === 'text-center'
                        ? 'justify-center'
                        : valueAlignClass === 'text-right'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}>
                        <span className={`${valueSizeClasses} font-bold text-white`} style={valueStyles}>
                            {formattedValue}
                            {metric.unit ? <span className="text-[0.7em] font-normal opacity-90"> {metric.unit}</span> : ''}
                        </span>
                        {metric.enableTrend && trend !== null && <TrendIcon trend={trend} />}
                    </div>
                    <div className={`${titleAlignClass} w-full`}>
                        <p className="text-xs sm:text-sm font-medium text-white/90" style={titleStyles}>
                            {metric.title}
                        </p>
                    </div>
                </>
            ) : (
                // Horizontal layout: title and value side by side
                <>
                    <div className={`${titleAlignClass} mr-2`}>
                        <p className="text-xs sm:text-sm font-medium text-white/90 whitespace-nowrap" style={titleStyles}>
                            {metric.title}
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 ${valueAlignClass === 'text-center'
                        ? 'justify-center'
                        : valueAlignClass === 'text-right'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}>
                        <span className={`${valueSizeClasses} font-bold text-white`} style={valueStyles}>
                            {formattedValue}
                            {metric.unit ? <span className="text-[0.7em] font-normal opacity-90"> {metric.unit}</span> : ''}
                        </span>
                        {metric.enableTrend && trend !== null && <TrendIcon trend={trend} />}
                    </div>
                </>
            )}
        </div>
    );
};

const MultiMetric: React.FC<MultiMetricProps> = ({
    multiMetricConfig,
    backgroundColor,
    typography,
    title,
}) => {
    const filterState = useAppSelector((state) => state.filters);
    const defaultBaseColor = backgroundColor || '#00214E';
    const defaultLighterColor = backgroundColor ? `${backgroundColor}80` : '#0164B0';
    const isTransparent = multiMetricConfig?.transparentBackground === true;
    const backgroundStyle = isTransparent
        ? {
            backgroundColor: 'transparent',
            color: '#ffffff',
            cursor: 'pointer',
        }
        : {
            backgroundImage: `linear-gradient(to bottom, ${defaultBaseColor}, ${defaultLighterColor})`,
            color: '#ffffff',
            cursor: 'pointer',
        };

    // Get layout from config, default to 'horizontal'
    const layout = multiMetricConfig?.layout || 'horizontal';
    const showDividers = multiMetricConfig?.showDividers ?? true;
    const resolvedListenToEvent = multiMetricConfig?.listenToEvent;
    const filterVariables = useMemo(() => {
        if (!resolvedListenToEvent || filterState.eventName !== resolvedListenToEvent) {
            return undefined;
        }
        return buildVariableParams(filterState.variables);
    }, [filterState.eventName, filterState.variables, resolvedListenToEvent]);

    // Typography for widget-level title (driven by "title" element config)
    const widgetTitleStyles = applyTypographyStyles('title', typography);
    const titleStyle = typography?.title?.textAlign;
    if (!multiMetricConfig || !multiMetricConfig.metrics || multiMetricConfig.metrics.length === 0) {
        return (
            <div className="relative h-full w-full">
                <div
                    className="multi-metric-widget h-full rounded-xl p-4 flex items-center justify-center"
                    style={backgroundStyle}
                >
                    <p className="text-sm text-white/80">No metrics configured</p>
                </div>
            </div>
        );
    }

    // Responsive layout classes
    // Horizontal: flex-row on all screens, but wrap on small screens
    // Vertical: flex-col on all screens
    const containerClasses = layout === 'vertical'
        ? 'flex flex-col h-full w-full items-center justify-center gap-4 md:gap-6'
        : 'flex flex-col sm:flex-row h-full w-full items-center justify-center gap-4 sm:gap-6';

    return (
        <div className="relative h-full w-full">
            <div className="multi-metric-widget h-full rounded-xl p-4 text-white" style={backgroundStyle}>
                {/* Widget-level header title */}

                <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-base font-bold text-white w-full" style={widgetTitleStyles} >
                        {title}
                    </h3>
                </div>


                <div className={containerClasses}>
                    {multiMetricConfig.metrics.map((metric, index) => (
                        <React.Fragment key={metric.id}>
                            <MetricCardWrapper
                                metric={metric}
                                typography={typography}
                                layout={layout}
                                filterVariables={filterVariables}
                            />
                            {/* Add divider between metrics in horizontal layout (except last) */}
                            {showDividers && layout === 'horizontal' && index < multiMetricConfig.metrics.length - 1 && (
                                <div className="metric-divider hidden sm:block h-16 w-px border-l-2 border-dashed border-white/50" />
                            )}
                            {/* Add divider between metrics in vertical layout (except last) */}
                            {showDividers && layout === 'vertical' && index < multiMetricConfig.metrics.length - 1 && (
                                <div className="metric-divider w-full h-px border-t-2 border-dashed border-white/50" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Wrapper component to handle data fetching for each metric
const MetricCardWrapper: React.FC<{
    metric: MultiMetricItem;
    typography?: any;
    layout?: 'horizontal' | 'vertical';
    filterVariables?: string;
}> = ({ metric, typography, layout = 'horizontal', filterVariables }) => {
    const { data: bexData, isLoading, error } = useBexJson(metric.queryName || '', {
        parser: 'new',
        enabled: !!metric.queryName,
        variables: filterVariables,
    });

    const resolvedTitle = useMemo(() => {
        if ((metric.titleSource || 'manual') === 'query') {
            if (!metric.titleFieldKey) {
                return metric.title;
            }

            const source = (bexData as any)?.chartData || [];
            if (!source?.length) {
                return metric.title;
            }

            const rawTitleValue = source[0]?.[metric.titleFieldKey];
            if (rawTitleValue === null || rawTitleValue === undefined || rawTitleValue === '') {
                return metric.title || metric.titleFieldKey;
            }

            return String(rawTitleValue);
        }

        return metric.title;
    }, [bexData, metric.title, metric.titleFieldKey, metric.titleSource]);

    const safeParseNumber = (value: unknown): number | null => {
        if (value === '' || value === null || value === undefined) return null;
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '') return null;
            const parsed = Number(trimmed);
            return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
    };

    // Extract value from data
    const extractedValue = useMemo(() => {
        if (!metric.valueKey || !bexData) return null;

        // Check if bexData has chartData property (for enhanced parser result)
        const bexChartData = (bexData as any)?.chartData;
        if (!bexChartData || bexChartData.length === 0) return null;

        // Extract the single value using valueKey from the first row
        const firstRow = bexChartData[0];
        const value = firstRow[metric.valueKey];
        return safeParseNumber(value);
    }, [bexData, metric.valueKey]);

    return (
        <MetricItem
            metric={{ ...metric, title: resolvedTitle }}
            value={extractedValue}
            isLoading={isLoading}
            error={error as Error | null}
            typography={typography}
            layout={layout}
        />
    );
};

export default MultiMetric;
