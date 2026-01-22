import React, { useEffect, useRef, useState, useMemo } from 'react';
import useBexJson from '@/hooks/useBexJson';
import { GaugeWidgetConfig, ColorRange } from './GaugeConfig.types';
import { formatNumber as formatNumberUtil } from '@/helpers/numberFormatting';

interface GaugeChartProps {
    data?: {
        [key: string]: string | number | undefined;
    }[];
    gaugeConfig?: GaugeWidgetConfig;
    queryName?: string;
    backgroundColor?: string;
    typography?: any;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
    data: providedData = [],
    gaugeConfig,
    queryName,
    backgroundColor,
    typography,
}) => {
    const gaugeContainerRef = useRef<HTMLDivElement>(null);
    const [currentValue, setCurrentValue] = useState<number | null>(null);

    // Fetch BEX data if queryName is provided
    const effectiveQueryName = queryName || gaugeConfig?.queryName || '';
    const { data: bexData, isLoading: bexLoading, error: bexError } = useBexJson(
        effectiveQueryName,
        {
            parser: 'new',
            enabled: !!effectiveQueryName,
        }
    );

    // Extract value from data
    const extractedValue = useMemo(() => {
        if (!gaugeConfig || !gaugeConfig.valueKey) return null;

        // Use BEX data if available, otherwise use provided data
        // Check if bexData has chartData property (for enhanced parser result)
        const bexChartData = (bexData as any)?.chartData;
        const dataSource = bexChartData || providedData;
        if (!dataSource || dataSource.length === 0) return null;

        // Extract the single value using valueKey from the first row
        const firstRow = dataSource[0];
        const value = firstRow[gaugeConfig.valueKey];
        return value !== null && value !== undefined ? Number(value) : null;
    }, [bexData, providedData, gaugeConfig]);

    useEffect(() => {
        setCurrentValue(extractedValue);
    }, [extractedValue]);

    const title = useMemo(() => {
        // Check if bexData has metadata (for enhanced parser result)
        if (bexData && typeof bexData === 'object' && 'metadata' in bexData) {
            const metadata = (bexData as any).metadata;
            if (metadata?.description) {
                return metadata.description;
            }
        }

    }, [bexData]);


    // Get color for current value
    const getColorForValue = (value: number | null): string => {
        if (value === null || !gaugeConfig?.colorRanges) return '#888888';

        for (const range of gaugeConfig.colorRanges) {
            if (value >= range.min && value <= range.max) {
                return range.color;
            }
        }

        return '#888888';
    };

    // Get percentage for value
    const getPercentage = (value: number | null): number => {
        if (value === null || !gaugeConfig) return 0;
        const { minValue, maxValue } = gaugeConfig;
        const range = maxValue - minValue;
        if (range === 0) return 0;
        const percentage = ((value - minValue) / range) * 100;
        return Math.max(0, Math.min(100, percentage));
    };

    const formatNumber = (num: number) => {
        const format = gaugeConfig?.valueFormat || 'non-currency';
        return formatNumberUtil(num, {
            format,
            decimals: 2, // GaugeChart uses 2 decimals for small numbers
        });
    };

    const defaultBaseColor = backgroundColor || '#00214E';
    const defaultLighterColor = backgroundColor ? `${backgroundColor}80` : '#0164B0';
    const isTransparent = gaugeConfig?.transparentBackground === true;
    const backgroundStyle = isTransparent
        ? {
              backgroundColor: 'transparent',
              color: '#ffffff',
          }
        : {
              backgroundImage: backgroundColor
                  ? `linear-gradient(to bottom, ${defaultBaseColor}, ${defaultLighterColor})`
                  : `linear-gradient(to bottom, #00214E, #0164B0)`,
              color: '#ffffff',
          };

    // Show loading state
    if (queryName || gaugeConfig?.queryName) {
        if (bexLoading) {
            return (
                <div className="flex h-full w-full flex-col">
                    <div
                        className="flex flex-1 flex-col overflow-hidden rounded-xl p-4 text-white items-center justify-center"
                        style={backgroundStyle}
                    >
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                            <p className="text-sm text-white/80">Loading gauge data...</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (bexError) {
            return (
                <div className="flex h-full w-full flex-col">
                    <div
                        className="flex flex-1 flex-col overflow-hidden rounded-xl p-4 text-white items-center justify-center"
                        style={backgroundStyle}
                    >
                        <div className="text-center">
                            <p className="text-sm text-red-300 mb-2">Error loading gauge data</p>
                            <p className="text-xs text-white/60">{bexError.message || 'Unknown error'}</p>
                        </div>
                    </div>
                </div>
            );
        }
    }

    if (!gaugeConfig) {
        return (
            <div className="flex h-full w-full flex-col">
                <div
                    className="flex flex-1 flex-col overflow-hidden rounded-xl p-4 text-white items-center justify-center"
                    style={backgroundStyle}
                >
                    <div className="text-center">
                        <p className="text-sm text-white/80">Gauge configuration is required</p>
                    </div>
                </div>
            </div>
        );
    }

    const { minValue, maxValue, colorRanges, showLabels = true, showTitle = true } = gaugeConfig;

    const percentage = getPercentage(currentValue);
    const currentColor = getColorForValue(currentValue);

    // Calculate positions for color ranges
    const rangeWidth = 100 / colorRanges.length;

    return (
        <div className="flex h-full w-full flex-col">
            <div
                className="flex flex-1 flex-col overflow-hidden rounded-xl p-4 text-white"
                style={backgroundStyle}
            >
                {/* Header */}
                {showTitle && (
                    <div className="mb-4 flex shrink-0 items-start justify-between">
                        <div className="flex flex-col items-start gap-1">
                            <h3 className="text-base font-bold text-white">{title}</h3>
                        </div>
                    </div>
                )}

                {/* Gauge */}
                <div className="relative flex-1 flex flex-col items-center justify-center" ref={gaugeContainerRef}>
                    <div className="w-full max-w-[600px] p-5">
                        {/* Scale with color ranges */}
                        <div className="relative w-full h-[50px] rounded-lg overflow-visible flex">
                            {colorRanges.map((range, index) => {
                                const rangePercentage = ((range.max - range.min) / (maxValue - minValue)) * 100;

                                return (
                                    <div
                                        key={index}
                                        className="h-full transition-all duration-300 relative"
                                        style={{
                                            width: `${rangePercentage}%`,
                                            backgroundColor: range.color,
                                        }}
                                    />
                                );
                            })}

                            {/* Indicator */}
                            {currentValue !== null && (
                                <div
                                    className="absolute -top-5 -translate-x-1/2 transition-all duration-300 z-20 flex flex-row items-center gap-2"
                                    style={{
                                        left: `${percentage}%`,
                                    }}
                                >
                                    <div
                                        className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] flex-shrink-0"
                                        style={{
                                            borderTopColor: currentColor,
                                        }}
                                    />
                                    <div
                                        className="text-xs font-bold whitespace-nowrap text-shadow-[0_1px_2px_rgba(0,0,0,0.5)] px-1.5 py-0.5 rounded border-none"
                                        style={{ color: currentColor }}
                                    >
                                        {formatNumber(currentValue)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Scale labels */}
                        {showLabels && (
                            <>
                                <div className="flex justify-between w-full mt-4 text-xs text-white/90 font-medium">
                                    <span>{formatNumber(minValue)}</span>
                                    {colorRanges.map((range, index) => {
                                        if (index < colorRanges.length - 1) {
                                            return (
                                                <span key={index} className="font-semibold" style={{ color: range.color }}>
                                                    {formatNumber(range.max)}
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                    <span>{formatNumber(maxValue)}</span>
                                </div>
                                {colorRanges.length > 0 && (
                                    <div className="flex justify-between w-full mt-2 text-[11px] text-white/70">
                                        {colorRanges.map((range, index) => (
                                            <span key={index} className="font-medium" style={{ color: range.color }}>
                                                {range.label || `${formatNumber(range.min)} - ${formatNumber(range.max)}`}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default GaugeChart;
