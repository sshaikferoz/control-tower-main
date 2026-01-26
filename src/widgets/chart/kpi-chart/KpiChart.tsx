import React, { useEffect, useMemo, useState } from 'react';
import { Tooltip } from '@mui/material';
import useBexJson from '@/hooks/useBexJson';
import { KpiWidgetConfig, KpiType } from './KpiConfig.types';
import { formatNumber as formatNumberUtil } from '@/helpers/numberFormatting';
import { WidgetSkeleton } from '@/components/ui/WidgetSkeleton';

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
}) => {
    const [currentValue, setCurrentValue] = useState<number | null>(null);

    const effectiveQueryName = queryName || kpiConfig?.queryName || '';
    const { data: bexData, isLoading, error } = useBexJson(effectiveQueryName, {
        parser: 'new',
        enabled: !!effectiveQueryName,
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
            decimals: 2,
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
    const color = getColorForValue(currentValue);

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

    /* ---------------------------------- */
    /* KPI RENDERERS */
    /* ---------------------------------- */

    const renderNumber = () => (
        <div className="flex flex-col items-center justify-center flex-1">
            <span className="text-4xl font-bold">{currentValue !== null ? formatNumber(currentValue) : '—'}</span>
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
                <span className="text-4xl font-bold">{currentValue !== null ? formatNumber(currentValue) : '—'}</span>
                <span className={`text-sm font-semibold ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(deltaPct).toFixed(1)}%
                </span>
            </div>
        );
    };

    const renderLinear = () => (
        <div className="w-full">
            <div className="h-8 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full transition-all"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );

    const renderProgress = () => (
        <div className="w-full flex flex-col gap-2">
            <span className="text-sm font-semibold">{Math.round(percentage)}%</span>
            {renderLinear()}
        </div>
    );

    const renderDonut = () => {
        const r = 42;
        const c = 2 * Math.PI * r;
        return (
            <svg width="120" height="120">
                <circle cx="60" cy="60" r={r} stroke="#ffffff30" strokeWidth="10" fill="none" />
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
                    textAnchor="middle"
                    fontSize="22"
                    fontWeight="bold"
                    fill={color}
                >
                    {Math.round(percentage)}%
                </text>
            </svg>
        );
    };

    const renderRadialBar = () => renderDonut();

    const renderStatus = () => (
        <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-lg font-semibold">{formatNumber(currentValue ?? 0)}</span>
        </div>
    );

    const renderBullet = () => {
        const isNegative = currentValue !== null && currentValue < 0;

        return (
            <div className="w-full flex flex-col gap-2">
                {/* Value + Indicator */}
                <div className="flex items-center justify-end gap-2">
                    <span
                        className="text-sm"
                        style={{
                            color: color,
                            transform: isNegative ? 'rotate(180deg)' : undefined,
                        }}
                    >
                        ▼
                    </span>
                    <span className="text-sm font-semibold" style={{ color }}>
                        {currentValue !== null ? formatNumber(currentValue) : '—'}
                    </span>
                </div>

                {/* Bullet Bar */}
                <div className="relative h-2 w-full rounded overflow-hidden bg-white/20">
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
            </div>
        );
    };


    const renderIconKpi = () => (
        <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <span className="text-xl font-bold">{formatNumber(currentValue ?? 0)}</span>
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
        bullet: renderBullet
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
            <div className="h-full w-full rounded-xl p-4 flex flex-col" style={backgroundStyle}>

                <h3 className="mb-4 font-bold">{title}</h3>

                <div className="flex-1 flex items-center justify-center">
                    {renderers[kpiConfig.kpiType || 'number']()}
                </div>
                {/* Legend for color ranges when showLabels is enabled */}
                {showLabels && kpiConfig.colorRanges && kpiConfig.colorRanges.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="flex flex-wrap gap-2 justify-center items-center">
                            {kpiConfig.colorRanges.map((range, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-1.5"
                                >
                                    <div
                                        className="w-3 h-3 rounded border border-white/30 flex-shrink-0"
                                        style={{ backgroundColor: range.color }}
                                    />
                                    <span className="text-xs text-white/90 font-medium">
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
