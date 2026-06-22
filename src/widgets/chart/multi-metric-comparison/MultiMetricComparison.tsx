'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LabelList,
} from 'recharts';
import { Skeleton } from '@mui/material';
import useBexJson from '@/hooks/useBexJson';
import { formatNumber } from '@/helpers/numberFormatting';
import { applyTypographyStyles } from '@/helpers/typographyHelper';
import { useAppSelector } from '@/store/hooks';
import { buildVariableParams } from '@/utils/buildVariableParams';
import { getWidgetConfigBgStyle } from '@/widgets/widgetBackground';
import {
    ComparisonAggregation,
    ComparisonSeries,
    MultiMetricComparisonConfig,
} from './MultiMetricComparisonConfig.types';

interface MultiMetricComparisonProps {
    comparisonConfig?: MultiMetricComparisonConfig;
    backgroundColor?: string;
    typography?: any;
    title?: string;
    showQueryDebugErrors?: boolean;
    debugWidgetName?: string;
}

interface SeriesResult {
    rows: Record<string, unknown>[];
    isLoading: boolean;
    error: string | null;
    headerText: Record<string, string>;
}

const EMPTY_RESULT: SeriesResult = {
    rows: [],
    isLoading: false,
    error: null,
    headerText: {},
};

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

const aggregate = (values: number[], mode: ComparisonAggregation): number | null => {
    if (values.length === 0) return null;
    switch (mode) {
        case 'last':
            return values[values.length - 1];
        case 'first':
            return values[0];
        case 'max':
            return Math.max(...values);
        case 'min':
            return Math.min(...values);
        case 'average':
            return values.reduce((acc, v) => acc + v, 0) / values.length;
        case 'sum':
        default:
            return values.reduce((acc, v) => acc + v, 0);
    }
};

/**
 * Headless component: fetches a single series' query and reports the result up.
 * One is rendered per configured series so the hook count stays stable for a
 * given series list while still supporting an arbitrary number of queries.
 */
const SeriesLoader: React.FC<{
    series: ComparisonSeries;
    filterVariables?: string;
    onResult: (id: string, result: SeriesResult) => void;
}> = ({ series, filterVariables, onResult }) => {
    const { data, isLoading, error } = useBexJson(series.queryName || '', {
        parser: 'new',
        enabled: !!series.queryName,
        variables: filterVariables,
    });

    const parserError =
        typeof (data as { error?: unknown } | undefined)?.error === 'string'
            ? (data as { error?: string }).error || null
            : null;
    const resolvedError = parserError || error?.message || null;

    useEffect(() => {
        const rows = ((data as any)?.chartData as Record<string, unknown>[]) || [];
        const headerText = ((data as any)?.headerText as Record<string, string>) || {};
        onResult(series.id, { rows, isLoading, error: resolvedError, headerText });
        // `data` identity changes only when the parsed payload changes.
    }, [data, isLoading, resolvedError, series.id, onResult]);

    return null;
};

const MultiMetricComparison: React.FC<MultiMetricComparisonProps> = ({
    comparisonConfig,
    backgroundColor,
    typography,
    title,
    showQueryDebugErrors = false,
    debugWidgetName,
}) => {
    const filterState = useAppSelector((state) => state.filters);
    const [results, setResults] = useState<Record<string, SeriesResult>>({});

    const handleResult = useCallback((id: string, result: SeriesResult) => {
        setResults((prev) => {
            const existing = prev[id];
            if (
                existing &&
                existing.isLoading === result.isLoading &&
                existing.error === result.error &&
                existing.rows === result.rows
            ) {
                return prev;
            }
            return { ...prev, [id]: result };
        });
    }, []);

    const series = useMemo(() => comparisonConfig?.series || [], [comparisonConfig]);
    const chartType = comparisonConfig?.chartType || 'bar';
    const showHeadlineMetrics = comparisonConfig?.showHeadlineMetrics ?? true;
    const showLegend = comparisonConfig?.showLegend ?? true;
    const showGridLines = comparisonConfig?.showGridLines ?? true;
    const showDataLabels = comparisonConfig?.showDataLabels ?? false;

    const isTransparent = comparisonConfig?.transparentBackground === true;
    const defaultBaseColor = backgroundColor || '#00214E';
    const defaultLighterColor = backgroundColor ? `${backgroundColor}80` : '#0164B0';
    const backgroundStyle: React.CSSProperties = isTransparent
        ? {
            backgroundColor: 'transparent',
            color: '#ffffff',
            cursor: 'pointer',
            ...getWidgetConfigBgStyle(undefined, true),
        }
        : {
            backgroundImage: `linear-gradient(to bottom, ${defaultBaseColor}, ${defaultLighterColor})`,
            color: '#ffffff',
            cursor: 'pointer',
            ...getWidgetConfigBgStyle(backgroundColor),
        };

    // Filter wiring shared by every series query.
    const resolvedListenToEvent = comparisonConfig?.listenToEvent;
    const filterVariables = useMemo(() => {
        if (!resolvedListenToEvent || filterState.eventName !== resolvedListenToEvent) {
            return undefined;
        }
        return buildVariableParams(filterState.variables);
    }, [filterState.eventName, filterState.variables, resolvedListenToEvent]);

    // Resolve each series' label, headline value and per-category lookup.
    const resolvedSeries = useMemo(() => {
        return series.map((s) => {
            const result = results[s.id] || EMPTY_RESULT;
            const rows = result.rows;

            let label = s.label;
            if (s.labelSource === 'query' && s.labelFieldKey && rows.length > 0) {
                const raw = rows[0]?.[s.labelFieldKey];
                if (raw !== null && raw !== undefined && raw !== '') {
                    label = String(raw);
                }
            }

            const numericValues: number[] = [];
            const byCategory = new Map<string, number>();
            if (s.valueKey) {
                rows.forEach((row) => {
                    const parsed = safeParseNumber(row[s.valueKey as string]);
                    if (parsed === null) return;
                    numericValues.push(parsed);
                    if (s.categoryKey) {
                        const rawCat = row[s.categoryKey];
                        const cat =
                            rawCat === null || rawCat === undefined ? '' : String(rawCat);
                        byCategory.set(cat, parsed);
                    }
                });
            }

            const headlineValue = aggregate(
                numericValues,
                s.headlineAggregation || 'sum'
            );

            return {
                config: s,
                label,
                headlineValue,
                byCategory,
                isLoading: result.isLoading,
                error: result.error,
            };
        });
    }, [series, results]);

    // Build the shared category axis (first-seen order across all series).
    const chartData = useMemo(() => {
        const categories: string[] = [];
        const seen = new Set<string>();
        resolvedSeries.forEach((rs) => {
            rs.byCategory.forEach((_, cat) => {
                if (!seen.has(cat)) {
                    seen.add(cat);
                    categories.push(cat);
                }
            });
        });

        return categories.map((cat) => {
            const entry: Record<string, string | number> = { category: cat };
            resolvedSeries.forEach((rs) => {
                const v = rs.byCategory.get(cat);
                if (v !== undefined) entry[rs.config.id] = v;
            });
            return entry;
        });
    }, [resolvedSeries]);

    const anyLoading = resolvedSeries.some((rs) => rs.isLoading);
    const hasConfiguredSeries = series.some((s) => s.queryName && s.valueKey);

    const widgetTitleStyles = applyTypographyStyles('title', typography);

    // ---- Empty / loading states -------------------------------------------
    if (series.length === 0 || !hasConfiguredSeries) {
        return (
            <div className="relative h-full w-full">
                <div
                    className="multi-metric-comparison-widget flex h-full items-center justify-center rounded-xl p-4"
                    style={backgroundStyle}
                >
                    <p className="text-sm text-white/80">No queries configured</p>
                </div>
            </div>
        );
    }

    if (anyLoading && chartData.length === 0) {
        return (
            <div className="relative h-full w-full">
                {series.map((s) => (
                    <SeriesLoader
                        key={s.id}
                        series={s}
                        filterVariables={filterVariables}
                        onResult={handleResult}
                    />
                ))}
                <div
                    className="multi-metric-comparison-widget h-full rounded-xl p-4"
                    style={backgroundStyle}
                >
                    <Skeleton variant="text" width="40%" height={24} sx={{ bgcolor: 'var(--skeleton-bg)', mb: 2 }} />
                    <Skeleton variant="rectangular" width="100%" height="70%" sx={{ bgcolor: 'var(--skeleton-bg)', borderRadius: 2 }} />
                </div>
            </div>
        );
    }

    const formatValue = (value: number | null, s: ComparisonSeries) => {
        if (value === null) return 'N/A';
        return formatNumber(value, {
            format: s.valueFormat || 'non-currency',
            decimalPrecision: s.decimalPrecision,
        });
    };

    const renderChart = () => {
        const axisTick = { fill: 'rgba(255,255,255,0.75)', fontSize: 11 };
        const grid = showGridLines ? (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" vertical={false} />
        ) : null;
        const tooltipEl = (
            <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.06)' }}
                contentStyle={{
                    background: '#0b2a52',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 12,
                }}
                formatter={(value: any, _name: any, item: any) => {
                    const s = series.find((x) => x.id === item?.dataKey);
                    const label = resolvedSeries.find((rs) => rs.config.id === item?.dataKey)?.label;
                    return [formatValue(safeParseNumber(value), s || ({} as ComparisonSeries)), label];
                }}
            />
        );

        const legendEl = showLegend ? (
            <Legend
                formatter={(value: string) =>
                    resolvedSeries.find((rs) => rs.config.id === value)?.label || value
                }
                wrapperStyle={{ fontSize: 12, color: '#fff' }}
            />
        ) : null;

        // Axes for the vertical orientation (categories along the X axis).
        const commonAxes = (
            <>
                {grid}
                <XAxis dataKey="category" tick={axisTick} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.25)' }} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} />
                {tooltipEl}
                {legendEl}
            </>
        );

        if (chartType === 'horizontal-bar') {
            return (
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 12, right: 16, left: 8, bottom: 0 }}
                    barGap={2}
                    barCategoryGap="20%"
                >
                    {grid}
                    <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} />
                    <YAxis
                        type="category"
                        dataKey="category"
                        tick={axisTick}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.25)' }}
                        width={90}
                    />
                    {tooltipEl}
                    {legendEl}
                    {resolvedSeries.map((rs) => (
                        <Bar key={rs.config.id} dataKey={rs.config.id} name={rs.config.id} fill={rs.config.color} radius={[0, 3, 3, 0]} maxBarSize={36}>
                            {showDataLabels && <LabelList dataKey={rs.config.id} position="right" fill="#fff" fontSize={10} />}
                        </Bar>
                    ))}
                </BarChart>
            );
        }

        if (chartType === 'line') {
            return (
                <LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                    {commonAxes}
                    {resolvedSeries.map((rs) => (
                        <Line
                            key={rs.config.id}
                            type="monotone"
                            dataKey={rs.config.id}
                            name={rs.config.id}
                            stroke={rs.config.color}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                            connectNulls
                        >
                            {showDataLabels && <LabelList dataKey={rs.config.id} position="top" fill="#fff" fontSize={10} />}
                        </Line>
                    ))}
                </LineChart>
            );
        }

        if (chartType === 'area') {
            return (
                <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                        {resolvedSeries.map((rs) => (
                            <linearGradient key={rs.config.id} id={`mmc-grad-${rs.config.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={rs.config.color} stopOpacity={0.5} />
                                <stop offset="95%" stopColor={rs.config.color} stopOpacity={0.05} />
                            </linearGradient>
                        ))}
                    </defs>
                    {commonAxes}
                    {resolvedSeries.map((rs) => (
                        <Area
                            key={rs.config.id}
                            type="monotone"
                            dataKey={rs.config.id}
                            name={rs.config.id}
                            stroke={rs.config.color}
                            strokeWidth={2}
                            fill={`url(#mmc-grad-${rs.config.id})`}
                            connectNulls
                        >
                            {showDataLabels && <LabelList dataKey={rs.config.id} position="top" fill="#fff" fontSize={10} />}
                        </Area>
                    ))}
                </AreaChart>
            );
        }

        return (
            <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }} barGap={2} barCategoryGap="20%">
                {commonAxes}
                {resolvedSeries.map((rs) => (
                    <Bar key={rs.config.id} dataKey={rs.config.id} name={rs.config.id} fill={rs.config.color} radius={[3, 3, 0, 0]} maxBarSize={36}>
                        {showDataLabels && <LabelList dataKey={rs.config.id} position="top" fill="#fff" fontSize={10} />}
                    </Bar>
                ))}
            </BarChart>
        );
    };

    return (
        <div className="relative h-full w-full">
            {series.map((s) => (
                <SeriesLoader
                    key={s.id}
                    series={s}
                    filterVariables={filterVariables}
                    onResult={handleResult}
                />
            ))}

            <div className="multi-metric-comparison-widget flex h-full flex-col rounded-xl p-4 text-white" style={backgroundStyle}>
                {/* Header: title + subtitle on the left, headline metrics on the right */}
                <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        {title && (
                            <h3 className="text-base font-bold text-white" style={widgetTitleStyles}>
                                {title}
                            </h3>
                        )}
                        {comparisonConfig?.subtitle && (
                            <p className="text-xs text-white/60">{comparisonConfig.subtitle}</p>
                        )}
                    </div>

                    {/* Header aggregation labels temporarily disabled.
                    {showHeadlineMetrics && (
                        <div className="flex flex-wrap items-start gap-4">
                            {resolvedSeries.map((rs) => (
                                <div key={rs.config.id} className="flex flex-col items-start">
                                    <span className="text-lg font-bold leading-tight text-white sm:text-xl lg:text-2xl">
                                        {formatValue(rs.headlineValue, rs.config)}
                                        {rs.config.unit ? (
                                            <span className="text-[0.6em] font-normal opacity-90"> {rs.config.unit}</span>
                                        ) : null}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-white/80">
                                        <span
                                            className="inline-block h-2.5 w-2.5 rounded-full"
                                            style={{ backgroundColor: rs.config.color }}
                                        />
                                        {rs.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    */}
                </div>

                {/* Per-query debug errors (admin / edit mode only) */}
                {showQueryDebugErrors &&
                    resolvedSeries
                        .filter((rs) => rs.error)
                        .map((rs) => (
                            <div key={`err-${rs.config.id}`} className="query-debug-error mb-1 rounded px-2 py-1 text-[11px]">
                                <strong>{debugWidgetName || 'multi-metric-comparison'}</strong> · {rs.label} ·{' '}
                                {rs.config.queryName || 'N/A'}: {rs.error}
                            </div>
                        ))}

                {/* Comparison chart */}
                <div className="min-h-0 flex-1">
                    {chartData.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-sm text-white/70">No data to compare</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            {renderChart()}
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MultiMetricComparison;
