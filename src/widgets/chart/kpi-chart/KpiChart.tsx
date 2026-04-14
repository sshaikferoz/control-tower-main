import React, { useEffect, useMemo, useState } from 'react';
import { Tooltip } from '@mui/material';
import useBexJson from '@/hooks/useBexJson';
import { KpiWidgetConfig, KpiType } from './KpiConfig.types';
import { formatNumber as formatNumberUtil } from '@/helpers/numberFormatting';
import { getCleanTypographyStyles } from '@/helpers/typographyHelper';
import { WidgetSkeleton } from '@/components/ui/WidgetSkeleton';
import { buildVariableParams } from '@/utils/buildVariableParams';
import { useAppSelector } from '@/store/hooks';
/* ---------------------------------- */
/* Types */
/* ---------------------------------- */

interface KpiChartProps {
    title?: string;
    data?: {
        [key: string]: string | number | undefined;
    }[];
    kpiConfig?: KpiWidgetConfig;
    queryName?: string;
    backgroundColor?: string;
    typography?: any;
    listenToEvent?: string;
}

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

const KpiChart: React.FC<KpiChartProps> = ({
    title,
    data: providedData = [],
    kpiConfig,
    queryName,
    backgroundColor,
    typography,
}) => {
    const [currentValue, setCurrentValue] = useState<number | null>(null);

    const effectiveQueryName = queryName || kpiConfig?.queryName || '';

    const filterState = useAppSelector((state) => state.filters);
    const filterVariables = useMemo(() => {
        if (!kpiConfig?.listenToEvent || filterState.eventName !== kpiConfig?.listenToEvent)
            return undefined;
        return buildVariableParams(filterState.variables);
    }, [filterState.eventName, filterState.variables, kpiConfig?.listenToEvent]);

    const { data: bexData, isLoading, error } = useBexJson(effectiveQueryName, {
        parser: 'new',
        enabled: !!effectiveQueryName,
        variables: filterVariables,
    });

    /* ---------------------------------- */
    /* Data extraction */
    /* ---------------------------------- */

    const extractedValue = useMemo(() => {
        if (!kpiConfig?.valueKey) return null;
        const source = (bexData as any)?.chartData || providedData;
        if (!source?.length) return null;
        const value = source[0][kpiConfig.valueKey];
        if (value === '' || value === null || value === undefined) return null;
        const parsed = typeof value === 'string' ? Number(value.trim()) : Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }, [bexData, providedData, kpiConfig]);

    const targetValue = useMemo(() => {
        if (!kpiConfig) return null;

        if ((kpiConfig.targetSource || 'manual') === 'query') {
            if (!kpiConfig.targetValueKey) return null;
            const source = (bexData as any)?.chartData || providedData;
            if (!source?.length) return null;
            const value = source[0][kpiConfig.targetValueKey];
            if (value === '' || value === null || value === undefined) return null;
            const parsed = typeof value === 'string' ? Number(value.trim()) : Number(value);
            return Number.isFinite(parsed) ? parsed : null;
        }

        const manual = kpiConfig.targetManualValue;
        if (manual === null || manual === undefined) return null;
        const parsed = Number(manual);
        return Number.isFinite(parsed) ? parsed : null;
    }, [bexData, providedData, kpiConfig]);

    useEffect(() => {
        setCurrentValue(extractedValue);
    }, [extractedValue]);

    /* ---------------------------------- */
    /* Helpers */
    /* ---------------------------------- */

    const formatNumber = (value: unknown): string => {
        // Defensive: some sources can provide "" or non-numeric strings.
        if (value === '' || value === null || value === undefined) return '';

        let num: number | null = null;
        if (typeof value === 'number') {
            num = value;
        } else if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '') return '';
            const parsed = Number(trimmed);
            num = Number.isFinite(parsed) ? parsed : null;
        }

        if (num === null || !Number.isFinite(num)) {
            return typeof value === 'string' ? value : String(value);
        }

        return formatNumberUtil(num, {
            format: kpiConfig?.valueFormat || 'non-currency',
            decimalPrecision: kpiConfig?.decimalPrecision,
            decimals: kpiConfig?.decimalPrecision ?? 2,
        });
    };

    const getColorForValue = (value: number | null) => {
        if (value === null || !kpiConfig?.colorRanges) return '#9CA3AF';
        return (
            kpiConfig.colorRanges.find(r => value >= r.min && value <= r.max)?.color ||
            '#9CA3AF'
        );
    };

    const getPercentage = (value: number | null) => {
        if (value === null || !kpiConfig) return 0;
        const range = kpiConfig.maxValue - kpiConfig.minValue;
        return range === 0
            ? 0
            : Math.min(100, Math.max(0, ((value - kpiConfig.minValue) / range) * 100));
    };

    const percentage = getPercentage(currentValue);
    const targetPercentage = getPercentage(targetValue);
    const color = getColorForValue(currentValue);
    const targetIndicatorColor = 'var(--chart-text)';
    const showTargetTop = kpiConfig?.showTargetValueTop === true && targetValue !== null;

    /* ---------------------------------- */
    /* Theme */
    /* ---------------------------------- */

    const base = backgroundColor || '#00214E';
    const light = backgroundColor ? `${backgroundColor}80` : '#0164B0';

    const backgroundStyle = kpiConfig?.transparentBackground
        ? { backgroundColor: 'transparent', color: '#fff' }
        : {
            backgroundImage: `linear-gradient(to bottom, ${base}, ${light})`,
            color: '#fff',
        };

    const titleStyles = getCleanTypographyStyles('title', typography);
    const valueStyles = getCleanTypographyStyles('value', typography);
    const labelStyles = getCleanTypographyStyles('label', typography);

    /* ---------------------------------- */
    /* KPI RENDERERS */
    /* ---------------------------------- */

    const renderNumber = () => (
        <div className="flex flex-col items-center justify-center flex-1">
            <span className="kpi-value text-4xl font-bold" style={valueStyles}>{currentValue !== null ? formatNumber(currentValue) : '—'}</span>
        </div>
    );

    const renderNumberWithDelta = () => {
        const deltaRaw = providedData?.[1]?.[kpiConfig?.valueKey || ''];
        const delta =
            deltaRaw === '' || deltaRaw === null || deltaRaw === undefined
                ? null
                : Number.isFinite(Number(deltaRaw))
                    ? Number(deltaRaw)
                    : null;
        const deltaPct =
            delta === null || currentValue === null || delta === 0
                ? 0
                : ((currentValue - delta) / delta) * 100;
        const isPositive = deltaPct >= 0;

        return (
            <div className="flex flex-col items-center">
                <span className="kpi-value text-4xl font-bold" style={valueStyles}>{currentValue !== null ? formatNumber(currentValue) : '—'}</span>
                <span className={`text-sm font-semibold ${isPositive ? 'text-green-300' : 'text-red-300'}`} style={labelStyles}>
                    {isPositive ? '▲' : '▼'} {Math.abs(deltaPct).toFixed(1)}%
                </span>
            </div>
        );
    };

    const renderLinear = () => (
        <div className="w-full relative">
            <div className="h-8 rounded-full overflow-hidden relative" style={{ background: 'var(--chart-progress-bg)' }}>
                <div
                    className="h-full transition-all"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
                {targetValue !== null && (
                    <div
                        className="absolute top-0 h-full w-[2px]"
                        style={{
                            left: `${targetPercentage}%`,
                            transform: 'translateX(-50%)',
                            backgroundColor: targetIndicatorColor,
                            boxShadow: '0 0 4px color-mix(in srgb, var(--chart-text) 55%, transparent)',
                        }}
                        aria-label={`Target ${formatNumber(targetValue)}`}
                    />
                )}
            </div>
            {targetValue !== null && showTargetTop && (
                <span
                    className="absolute -top-5 text-[10px] font-semibold whitespace-nowrap"
                    style={{
                        left: `${targetPercentage}%`,
                        transform: 'translateX(-50%)',
                        color: targetIndicatorColor,
                    }}
                >
                    {formatNumber(targetValue)}
                </span>
            )}
        </div>
    );

    const renderProgress = () => (
        <div className="w-full flex flex-col gap-2">
            <span className="kpi-value text-sm font-semibold" style={valueStyles}>{Math.round(percentage)}%</span>
            {renderLinear()}
        </div>
    );

    const renderDonut = () => {
        const r = 42;
        const c = 2 * Math.PI * r;
        const textStyle = {
            fontSize: valueStyles.fontSize || '22px',
            fontWeight: valueStyles.fontWeight || 'bold',
            fill: valueStyles.color || color,
            fontFamily: valueStyles.fontFamily,
            textAnchor: 'middle' as const,
        };
        return (
            <svg width="120" height="120">
                <circle cx="60" cy="60" r={r} stroke="var(--chart-donut-stroke)" strokeWidth="10" fill="none" />
                <circle
                    cx="60"
                    cy="60"
                    r={r}
                    stroke={color}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - percentage / 100)}
                    transform="rotate(-90 60 60)"
                />
                <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    {...textStyle}
                >
                    {Math.round(percentage)}%
                </text>
            </svg>
        );
    };

    const renderRadialBar = () => renderDonut();

    const renderGauge = () => {
        const centerX = 100;
        const centerY = 100;
        const radius = 70;
        const startX = centerX - radius;
        const endX = centerX + radius;
        const arcPath = `M ${startX} ${centerY} A ${radius} ${radius} 0 0 1 ${endX} ${centerY}`;
        const gaugeValue = Math.round(percentage);
        const hasTarget = targetValue !== null;
        const targetAngle = Math.PI * (1 - targetPercentage / 100);
        const targetX = centerX + radius * Math.cos(targetAngle);
        const targetY = centerY - radius * Math.sin(targetAngle);
        const targetInnerX = centerX + (radius - 10) * Math.cos(targetAngle);
        const targetInnerY = centerY - (radius - 10) * Math.sin(targetAngle);
        const targetOuterX = centerX + (radius + 10) * Math.cos(targetAngle);
        const targetOuterY = centerY - (radius + 10) * Math.sin(targetAngle);

        const valueTextStyle = {
            fontSize: valueStyles.fontSize || '20px',
            fontWeight: valueStyles.fontWeight || 600,
            fill: valueStyles.color || 'var(--chart-text)',
            fontFamily: valueStyles.fontFamily,
        };

        return (
            <div className="w-full flex justify-center">
                <svg width="220" height="140" viewBox="0 0 200 130" role="img" aria-label={`Gauge value ${gaugeValue}%`}>
                    <path
                        d={arcPath}
                        stroke="#D1D5DB"
                        strokeWidth="22"
                        fill="none"
                        strokeLinecap="butt"
                    />
                    <path
                        d={arcPath}
                        stroke={color}
                        strokeWidth="22"
                        fill="none"
                        strokeLinecap="butt"
                        pathLength={100}
                        strokeDasharray={`${gaugeValue} 100`}
                    />
                    {hasTarget && (
                        <>
                            <line
                                x1={targetInnerX}
                                y1={targetInnerY}
                                x2={targetOuterX}
                                y2={targetOuterY}
                                stroke={targetIndicatorColor}
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            {showTargetTop && (
                                <text
                                    x={targetX}
                                    y={targetY - 12}
                                    textAnchor="middle"
                                    style={{
                                        fill: targetIndicatorColor,
                                        fontSize: '10px',
                                        fontWeight: 600,
                                    }}
                                >
                                    {formatNumber(targetValue)}
                                </text>
                            )}
                        </>
                    )}
                    <text
                        x="100"
                        y="103"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        style={valueTextStyle}
                    >
                        {gaugeValue}%
                    </text>
                </svg>
            </div>
        );
    };

    const renderStatus = () => (
        <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="kpi-value text-lg font-semibold" style={valueStyles}>{formatNumber(currentValue ?? 0)}</span>
        </div>
    );

    const renderBullet = () => {
        const isNegative = currentValue !== null && currentValue < 0;
        const markerPosition = getPercentage(currentValue);

        return (
            <div className="w-full flex flex-col gap-2">
                {/* Bullet Bar + Pointer + Value (all aligned at markerPosition) */}
                <div className="relative h-6 w-full flex items-end">
                    {/* Background bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 rounded overflow-hidden" style={{ background: 'var(--chart-progress-bg)' }}>
                        {/* Color ranges */}
                        {kpiConfig?.colorRanges?.map((range, index) => {
                            const left = getPercentage(range.min);
                            const width = getPercentage(range.max) - left;

                            return (
                                <div
                                    key={index}
                                    className="absolute top-0 h-full"
                                    style={{
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        backgroundColor: range.color,
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Pointer cap exactly at current value */}
                    {currentValue !== null && (
                        <div
                            className="absolute"
                            style={{
                                left: `${markerPosition}%`,
                                transform: 'translateX(-50%)',
                                // Bring the cap closer to the bar (above for positive, below for negative)
                                top: isNegative ? undefined : 1,
                                bottom: isNegative ? 1 : undefined,
                                width: 0,
                                height: 0,
                                borderLeft: '5px solid transparent',
                                borderRight: '5px solid transparent',
                                // Flip orientation: for positive values point UP, for negative point DOWN
                                borderTop: !isNegative ? `6px solid ${color}` : 'none',
                                borderBottom: isNegative ? `6px solid ${color}` : 'none',
                            }}
                        />
                    )}

                    {targetValue !== null && (
                        <div
                            className="absolute bottom-0 h-3.5 w-[2px]"
                            style={{
                                left: `${targetPercentage}%`,
                                transform: 'translateX(-50%)',
                                backgroundColor: targetIndicatorColor,
                            }}
                            aria-label={`Target ${formatNumber(targetValue)}`}
                        />
                    )}

                    {/* Numeric value aligned to markerPosition */}
                    {currentValue !== null && (
                        <div
                            className="absolute -top-4 text-xs font-semibold whitespace-nowrap"
                            style={{
                                left: `${markerPosition}%`,
                                transform: 'translateX(-50%)',
                                color,
                                ...valueStyles,
                            }}
                        >
                            {formatNumber(currentValue)}
                        </div>
                    )}
                    {targetValue !== null && showTargetTop && (
                        <div
                            className="absolute -top-4 text-[10px] font-semibold whitespace-nowrap"
                            style={{
                                left: `${targetPercentage}%`,
                                transform: 'translateX(-50%)',
                                color: targetIndicatorColor,
                            }}
                        >
                            {formatNumber(targetValue)}
                        </div>
                    )}
                </div>
            </div>
        );
    };


    const renderIconKpi = () => (
        <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <span className="kpi-value text-xl font-bold" style={valueStyles}>{formatNumber(currentValue ?? 0)}</span>
        </div>
    );

    /* ---------------------------------- */
    /* Renderer Map */
    /* ---------------------------------- */

    const renderers: Record<KpiType, () => React.ReactElement> = {
        number: renderNumber,
        numberWithDelta: renderNumberWithDelta,
        progress: renderProgress,
        donut: renderDonut,
        radialBar: renderRadialBar,
        status: renderStatus,
        bullet: renderBullet,
        gauge: renderGauge,
    };

    /* ---------------------------------- */
    /* Loading / Error */
    /* ---------------------------------- */

    if (isLoading)
        return <WidgetSkeleton />;
    if (error)
        return <div className="flex items-center justify-center h-full text-red-300">Error</div>;
    if (!kpiConfig)
        return <div className="flex items-center justify-center h-full text-white">Missing KPI config</div>;

    /* ---------------------------------- */
    /* Render */
    /* ---------------------------------- */

    const showLabels = kpiConfig.showLabels !== false;
    const hasDescription = !!title;

    return (
        <Tooltip
            title={hasDescription ? title : ''}
            placement="top"
            arrow
            disableHoverListener={!hasDescription}
        >
            <div className="kpi-chart-widget h-full w-full rounded-xl p-4 flex flex-col" style={backgroundStyle}>

                <h3 className="mb-4 font-bold" style={titleStyles}>{title}</h3>
                {!showTargetTop && (
                    <div className="mb-2 flex justify-center">
                        <span className="text-xs font-semibold" style={{ ...labelStyles, color: 'var(--chart-text)' }}>
                            {formatNumber(targetValue)}
                        </span>
                    </div>
                )}

                <div className="flex-1 flex items-center justify-center">
                    {renderers[kpiConfig.kpiType || 'number']()}
                </div>
                {/* Legend for color ranges when showLabels is enabled */}
                {showLabels && kpiConfig.colorRanges && kpiConfig.colorRanges.length > 0 && (
                    <div className="mt-4 pt-3 border-t kpi-legend" style={{ borderColor: 'var(--chart-legend-border)' }}>
                        <div className="flex flex-wrap gap-2 justify-center items-center">
                            {kpiConfig.colorRanges.map((range, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-1.5"
                                >
                                    <div
                                        className="w-3 h-3 rounded flex-shrink-0"
                                        style={{ backgroundColor: range.color, border: '1px solid var(--chart-legend-border)' }}
                                    />
                                    <span className="text-xs font-medium kpi-legend-label" style={labelStyles}>
                                        {range.label || `${formatNumber(range.min)} - ${formatNumber(range.max)}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Tooltip>
    );
};

export default KpiChart;
