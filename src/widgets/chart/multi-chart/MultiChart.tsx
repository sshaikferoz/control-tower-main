import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
    LineChart,
    BarChart,
    AreaChart,
    ComposedChart,
    ScatterChart,
    PieChart,
    RadarChart,
    Line,
    Bar,
    Area,
    Scatter,
    Pie,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    DefaultLegendContent,
    ResponsiveContainer,
    Cell,
    LabelList,
} from 'recharts';
import useBexJson from '@/hooks/useBexJson';
import { transformBexToChart } from './transformBexToChart';
import { ChartWidgetConfig, LineType, GridLineStyle, PointerStyle } from './ChartConfig.types';
import { formatNumber as formatNumberUtil } from '@/helpers/numberFormatting';
import { WidgetSkeleton } from '@/components/ui/WidgetSkeleton';
import { useAppSelector } from '@/store/hooks';
import { buildVariableParams } from '@/utils/buildVariableParams';

interface SeriesConfig {
    name: string;
    dataKey: string;
    color: string;
    type?: 'line' | 'bar' | 'area'; // For ComposedChart
    lineType?: LineType; // Line style for line/area charts
    hide?: boolean; // For legend interactivity
    barOpacity?: number; // Opacity for bar charts (0-1)
    barEdgeColor?: string; // Color for the top edge of bars
    barEdgeWidth?: number; // Width of the top edge of bars (in pixels)
}

// Helper function to convert lineType to strokeDasharray
const getStrokeDasharray = (lineType?: LineType): string | undefined => {
    switch (lineType) {
        case 'solid':
            return undefined; // No dash array for solid lines
        case 'dashed':
            return '10 5';
        case 'dotted':
            return '2 2';
        case 'dashDot':
            return '10 5 2 5';
        default:
            return undefined;
    }
};

// Helper function to convert gridLineStyle to strokeDasharray
const getGridLineDasharray = (gridLineStyle?: GridLineStyle): string | undefined => {
    switch (gridLineStyle) {
        case 'solid':
            return undefined; // No dash array for solid lines
        case 'dashed-short':
            return '3 3';
        case 'dashed-medium':
            return '5 5';
        case 'dashed-long':
            return '10 5';
        case 'dotted':
            return '2 2';
        case 'dash-dot':
            return '5 5 1 5';
        default:
            return '3 3'; // Default to dashed-short
    }
};

// Helper function to build dot props based on pointerStyle configuration
const getDotProps = (pointerStyle: PointerStyle | undefined, defaultColor: string) => {
    if (pointerStyle?.showPointers === false) {
        return false; // Hide pointers
    }

    const pointerColor = pointerStyle?.pointerColor || defaultColor;
    const pointerSize = pointerStyle?.pointerSize ?? 4;
    const pointerStrokeColor = pointerStyle?.pointerStrokeColor;
    const pointerStrokeWidth = pointerStyle?.pointerStrokeWidth ?? 0;

    return {
        r: pointerSize,
        fill: pointerColor,
        strokeWidth: pointerStrokeWidth,
        stroke: pointerStrokeColor || undefined,
    };
};

// Helper function to build activeDot props based on pointerStyle configuration
const getActiveDotProps = (pointerStyle: PointerStyle | undefined, defaultColor: string) => {
    if (pointerStyle?.showPointers === false) {
        return false; // Hide active pointers
    }

    const pointerColor = pointerStyle?.pointerColor || defaultColor;
    const activePointerSize = pointerStyle?.activePointerSize ?? 8;
    const activePointerStrokeColor = pointerStyle?.activePointerStrokeColor || '#ffffff';
    const activePointerStrokeWidth = pointerStyle?.activePointerStrokeWidth ?? 2;
    const showGlow = pointerStyle?.showGlow !== false; // Default to true

    return {
        r: activePointerSize,
        fill: pointerColor,
        stroke: activePointerStrokeColor,
        strokeWidth: activePointerStrokeWidth,
        style: showGlow
            ? {
                filter: `drop-shadow(0 0 8px ${pointerColor}) drop-shadow(0 0 16px ${pointerColor}80)`,
                transition: 'all 0.2s ease',
            }
            : {
                transition: 'all 0.2s ease',
            },
    };
};

// Helper function to generate y-axis ticks based on domain and break
const generateYTicks = (domain: [number, number], breakValue: number): number[] => {
    const [min, max] = domain;
    const ticks: number[] = [];

    // Start from min and increment by breakValue until we reach or exceed max
    for (let value = min; value <= max; value += breakValue) {
        ticks.push(value);
    }

    // Ensure max is included if it's not already in the ticks
    if (ticks[ticks.length - 1] !== max) {
        ticks.push(max);
    }

    return ticks;
};

// Custom Bar Shape Component with opacity and top edge
const CustomBarShape = (props: any) => {
    const { fill, x, y, width, height, barOpacity, barEdgeColor, barEdgeWidth } = props;
    const opacity = barOpacity !== undefined ? barOpacity : 0.6; // Default opacity if not specified
    const edgeColor = barEdgeColor || fill; // Use provided edge color or default to fill color
    const edgeWidth = barEdgeWidth !== undefined ? barEdgeWidth : 2; // Default edge width is 2

    // For horizontal bars, adjust coordinates
    if (props.layout === 'vertical') {
        // Horizontal bar layout
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={fill}
                    fillOpacity={opacity}
                    rx={4}
                    ry={4}
                />
                {/* Left edge line (top edge in horizontal layout) */}
                <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={y + height}
                    stroke={edgeColor}
                    strokeWidth={edgeWidth}
                />
            </g>
        );
    } else {
        // Vertical bar layout (default)
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={fill}
                    fillOpacity={opacity}
                    rx={4}
                    ry={4}
                />
                {/* Top edge line */}
                <line
                    x1={x}
                    y1={y}
                    x2={x + width}
                    y2={y}
                    stroke={edgeColor}
                    strokeWidth={edgeWidth}
                />
            </g>
        );
    }
};

interface MultiChartProps {
    data?: {
        name: string;
        label?: string;
        groupKey?: string; // For grouping by Struct field
        [key: string]: string | number | undefined;
    }[];
    title?: string;
    // totalValue?: string;
    series?: SeriesConfig[];
    chartType?: 'line' | 'bar' | 'area' | 'composed' | 'scatter' | 'pie' | 'donut' | 'radar' | 'horizontal-bar' | 'table';
    color?: string;
    colorPalette?: string[];
    setChangeColor?: (color: string) => void;
    selectedLabels?: string[];
    showLegend?: boolean;
    stacked?: boolean;
    valueFormat?: 'currency' | 'non-currency';
    typography?: any;
    groupByField?: string; // Field name to group by (e.g., Struct field)
    // New props for BEX data fetching
    queryName?: string; // BEX query name to fetch data
    chartConfig?: ChartWidgetConfig; // Chart configuration for BEX data transformation
    listenToEvent?: string;
    // Y-axis domain and break for line chart type
    ySeriesDomain?: [number, number]; // Domain range [min, max] for y-axis
    ySeriesBreak?: number; // Scale factor/break interval for y-axis ticks
    /**
     * Optional formatting options for Y-series numeric values.
     * Currently supports decimal precision, similar to precision formatting
     * used in other widgets.
     */
    ySeriesFormatting?: {
        decimalPrecision?: number;
    };
}

const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8'];



// Premium Custom Tooltip Component
const PremiumTooltip = ({ active, payload, label, formatter }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <>
            <style>{`
                @keyframes tooltipFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
            <div
                className="premium-tooltip"
                style={{
                    background: 'var(--chart-tooltip-bg)',
                    border: '1px solid var(--chart-tooltip-border)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                    pointerEvents: 'none',
                    animation: 'tooltipFadeIn 0.2s ease-out',
                    transformOrigin: 'bottom center',
                }}
            >
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--chart-tooltip-text)', marginBottom: '8px', borderBottom: '1px solid var(--chart-legend-border)', paddingBottom: '6px' }}>
                    {label}
                </div>
                {payload.map((entry: any, index: number) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '6px',
                            fontSize: '13px',
                        }}
                    >
                        <div
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '2px',
                                backgroundColor: entry.color,
                                boxShadow: `0 0 8px ${entry.color}80`,
                            }}
                        />
                        <span style={{ color: 'var(--chart-tooltip-text)', fontWeight: 500 }}>{entry.name}:</span>
                        <span style={{ color: 'var(--primary2)', fontWeight: 'bold', marginLeft: 'auto' }}>
                            {formatter ? formatter(entry.value) : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        </>
    );
};


const MultiChart: React.FC<MultiChartProps> = ({
    data: providedData = [],
    title: providedTitle = 'Chart',
    // totalValue = '',
    series: providedSeries = [],
    chartType: providedChartType = 'line',
    color,
    colorPalette,
    setChangeColor,
    selectedLabels = [],
    showLegend: providedShowLegend = true,
    stacked: providedStacked = false,
    valueFormat: providedValueFormat = 'non-currency',
    typography,
    groupByField: providedGroupByField,
    queryName,
    chartConfig,
    ySeriesDomain,
    ySeriesBreak,
    listenToEvent,
    ySeriesFormatting: providedYSeriesFormatting,
}) => {
    const filterState = useAppSelector((state) => state.filters);
    const resolvedListenToEvent = listenToEvent || chartConfig?.listenToEvent;
    const [userColor, setUserColor] = useState<string | null>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
    const chartContainerRef = useRef<HTMLDivElement>(null);

    const filterVariables = useMemo(() => {
        if (!resolvedListenToEvent || filterState.eventName !== resolvedListenToEvent)
            return undefined;
        return buildVariableParams(filterState.variables);
    }, [filterState.eventName, filterState.variables, resolvedListenToEvent]);

    // Fetch BEX data if queryName is provided
    const { data: bexData, isLoading: bexLoading, error: bexError } = useBexJson(
        queryName || '',
        {
            parser: 'new',
            enabled: !!queryName && !!chartConfig,
            variables: filterVariables,
        }
    );

    // Transform BEX data if available
    const bexTransformedData = useMemo(() => {
        if (!queryName || !chartConfig || !bexData || bexLoading) {
            return null;
        }

        try {
            const flattenedConfig: ChartWidgetConfig = {
                ...chartConfig,
                measures: Array.isArray(chartConfig.measures)
                    ? chartConfig.measures.flat() as any
                    : chartConfig.measures,
            };
            return transformBexToChart(bexData, flattenedConfig);
        } catch (error) {
            return null;
        }
    }, [bexData, chartConfig, queryName, bexLoading]);

    // Determine which data/series/config to use
    const data = useMemo(() => {
        if (bexTransformedData) {
            return bexTransformedData.data;
        }
        return providedData;
    }, [bexTransformedData, providedData]);

    const series = useMemo(() => {
        if (bexTransformedData) {
            return bexTransformedData.series;
        }
        return providedSeries;
    }, [bexTransformedData, providedSeries]);

    const chartType = useMemo(() => {
        if (chartConfig?.chartType) {
            return chartConfig.chartType;
        }
        return providedChartType;
    }, [chartConfig?.chartType, providedChartType]);

    const showLegend = useMemo(() => {
        if (chartConfig?.showLegend !== undefined) {
            return chartConfig.showLegend;
        }
        return providedShowLegend;
    }, [chartConfig?.showLegend, providedShowLegend]);

    const showGridLines = useMemo(() => {
        if (chartConfig?.showGridLines !== undefined) {
            return chartConfig.showGridLines;
        }
        return true; // Default to showing grid lines
    }, [chartConfig?.showGridLines]);

    const gridLineStyle = useMemo(() => {
        return chartConfig?.gridLineStyle || 'dashed-short';
    }, [chartConfig?.gridLineStyle]);

    const pointerStyle = useMemo(() => {
        return chartConfig?.pointerStyle;
    }, [chartConfig?.pointerStyle]);

    const showDataLabels = useMemo(() => {
        return chartConfig?.showDataLabels === true; // default false
    }, [chartConfig?.showDataLabels]);

    const stacked = useMemo(() => {
        if (chartConfig?.stacked !== undefined) {
            return chartConfig.stacked;
        }
        return providedStacked;
    }, [chartConfig?.stacked, providedStacked]);

    const valueFormat = useMemo(() => {
        if (chartConfig?.valueFormat) {
            return chartConfig.valueFormat;
        }
        return providedValueFormat;
    }, [chartConfig?.valueFormat, providedValueFormat]);

    const ySeriesFormatting = useMemo(() => {
        if (chartConfig?.ySeriesFormatting) {
            return chartConfig.ySeriesFormatting;
        }
        return providedYSeriesFormatting;
    }, [chartConfig?.ySeriesFormatting, providedYSeriesFormatting]);

    const groupByField = useMemo(() => {
        if (bexTransformedData?.groupByField) {
            return bexTransformedData.groupByField;
        }
        return providedGroupByField;
    }, [bexTransformedData?.groupByField, providedGroupByField]);

    const xAxisLabel = useMemo(() => {
        if (bexTransformedData?.xAxisLabel) {
            return bexTransformedData.xAxisLabel;
        }
        return 'Name'; // Default fallback
    }, [bexTransformedData?.xAxisLabel]);

    const tableCharKeys = useMemo(() => {
        if (bexTransformedData?.charKeys && Array.isArray(bexTransformedData.charKeys)) {
            return bexTransformedData.charKeys as string[];
        }
        if (chartConfig?.charKeys && Array.isArray(chartConfig.charKeys)) {
            return chartConfig.charKeys as string[];
        }
        return [] as string[];
    }, [bexTransformedData?.charKeys, chartConfig?.charKeys]);

    const headerText = useMemo(() => {
        if (bexTransformedData?.headerText && typeof bexTransformedData.headerText === 'object') {
            return bexTransformedData.headerText as Record<string, string>;
        }
        return {} as Record<string, string>;
    }, [bexTransformedData?.headerText]);

    const title = useMemo(() => {
        // Use title from configuration if available, otherwise fallback to providedTitle
        return providedTitle;
    }, [chartConfig?.title, providedTitle]);

    const defaultBaseColor = '#00214E';
    const defaultLighterColor = '#0164B0';

    const paletteColors = useMemo(
        () => (colorPalette && colorPalette.length > 0 ? colorPalette : defaultColors),
        [colorPalette]
    );

    useEffect(() => {
        if (color && !userColor) setUserColor(color);
    }, [color]);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedColor = e.target.value;
        setUserColor(selectedColor);
        setChangeColor?.(selectedColor);
    };

    const baseColor = userColor || color || defaultBaseColor;
    const lighterColor = baseColor === defaultBaseColor ? defaultLighterColor : `${baseColor}80`;
    const isTransparent = chartConfig?.transparentBackground === true;
    const backgroundStyle = isTransparent
        ? {
            backgroundColor: 'transparent',
            color: '#ffffff',
        }
        : {
            backgroundImage: `linear-gradient(to bottom, ${baseColor}, ${lighterColor})`,
            color: '#ffffff',
        };

    const groupValues = useMemo((): string[] => {
        if (!groupByField) return [];

        // Get all unique group values from data
        const allGroupValues = Array.from(
            new Set(
                data
                    .map((item: any) => String(item[groupByField] || item.groupKey || ''))
                    .filter((value: string) => value)
            )
        ) as string[];

        // Filter by enabled groups from chartConfig if available
        if (chartConfig?.groupConfigs) {
            return allGroupValues.filter((groupValue) => {
                const groupConfig = chartConfig.groupConfigs![groupValue];
                // Default to enabled if not specified
                return groupConfig?.enabled !== false;
            });
        }

        // Fallback to selectedLabels if provided
        if (selectedLabels && selectedLabels.length > 0) {
            return selectedLabels;
        }

        return allGroupValues;
    }, [groupByField, selectedLabels, data, chartConfig]);

    // Get group-specific measure colors
    const groupMeasureColors = useMemo(() => {
        if (!groupByField || groupValues.length === 0) return new Map<string, Map<string, string>>();

        const measureColorMap = new Map<string, Map<string, string>>();
        groupValues.forEach((groupValue) => {
            const groupConfig = chartConfig?.groupConfigs?.[groupValue];
            const measureColors = new Map<string, string>();

            if (groupConfig?.measureColors) {
                // Use measure-specific colors from group config
                Object.entries(groupConfig.measureColors).forEach(([measureKey, color]) => {
                    measureColors.set(measureKey, color);
                });
            }

            measureColorMap.set(groupValue, measureColors);
        });
        return measureColorMap;
    }, [groupByField, groupValues, chartConfig]);

    const groupColorMap = useMemo(() => {
        if (!groupByField || groupValues.length === 0) return new Map<string, string>();

        return new Map(
            groupValues.map((groupValue) => {
                const measureColors = groupMeasureColors.get(groupValue);
                // Use first measure's color as the group color, or fallback to palette
                if (measureColors && measureColors.size > 0) {
                    const firstColor = Array.from(measureColors.values())[0];
                    return [groupValue, firstColor];
                }
                return [groupValue, paletteColors[0]];
            })
        );
    }, [groupByField, groupValues, groupMeasureColors, paletteColors]);

    // Transform data based on grouping field (Struct field)
    const transformedData = useMemo(() => {
        if (!groupByField || !data.length) {
            // No grouping - filter by selected labels if applicable
            return selectedLabels && selectedLabels.length > 0
                ? data.filter((item: any) => (item as any).label && selectedLabels.includes((item as any).label as string))
                : data;
        }

        // Group data by the groupByField (e.g., Struct field)
        const grouped = new Map<string, Map<string, any>>();

        data.forEach((item: any) => {
            const groupValue = String((item as any)[groupByField] || (item as any).groupKey || '');
            const xValue = String((item as any).name || '');

            if (!grouped.has(groupValue)) {
                grouped.set(groupValue, new Map());
            }

            const groupData = grouped.get(groupValue)!;
            if (!groupData.has(xValue)) {
                groupData.set(xValue, { name: xValue });
            }

            // Add all series values to the data point
            series.forEach((s) => {
                const value = item[s.dataKey];
                groupData.get(xValue)![s.dataKey] = value === '' || value === null || value === undefined
                    ? null
                    : Number(value) || 0;
            });
        });

        // Filter by enabled groups from chartConfig if available, otherwise use selectedLabels
        let filteredGroups = Array.from(grouped.entries());

        if (chartConfig?.groupConfigs) {
            filteredGroups = filteredGroups.filter(([groupValue]) => {
                const groupConfig = chartConfig.groupConfigs![groupValue];
                // Default to enabled if not specified
                return groupConfig?.enabled !== false;
            });
        } else if (selectedLabels && selectedLabels.length > 0) {
            filteredGroups = filteredGroups.filter(([groupValue]) =>
                selectedLabels.includes(groupValue)
            );
        }

        // Transform to array format for chart
        const allXValues = new Set<string>();
        filteredGroups.forEach(([, groupData]) => {
            groupData.forEach((_, xValue) => allXValues.add(xValue));
        });

        return Array.from(allXValues).map((xValue) => {
            const entry: any = { name: xValue };

            filteredGroups.forEach(([groupValue, groupData]) => {
                const dataPoint = groupData.get(xValue);
                if (dataPoint) {
                    series.forEach((s) => {
                        // Create unique key for each series per group
                        const seriesKey = `${groupValue}_${s.dataKey}`;
                        entry[seriesKey] = dataPoint[s.dataKey];
                    });
                }
            });

            return entry;
        });
    }, [data, groupByField, selectedLabels, series]);

    // Create dynamic series based on grouping
    const dynamicSeries = useMemo(() => {
        if (!groupByField || !data.length) {
            return series;
        }

        const newSeries: SeriesConfig[] = [];

        groupValues.forEach((groupValue) => {
            const measureColors = groupMeasureColors.get(groupValue);

            series.forEach((s, measureIndex) => {
                const seriesKey = `${groupValue}_${s.dataKey}`;
                // Get color from measure-specific config, or fallback to series color, or palette
                let seriesColor: string;
                if (measureColors && measureColors.has(s.dataKey)) {
                    seriesColor = measureColors.get(s.dataKey)!;
                } else if (s.color) {
                    seriesColor = s.color;
                } else {
                    seriesColor = paletteColors[measureIndex % paletteColors.length];
                }

                newSeries.push({
                    ...s,
                    name: `${s.name}`,
                    dataKey: seriesKey,
                    hide: hiddenSeries.has(seriesKey),
                    color: seriesColor,
                    lineType: s.lineType, // Preserve lineType when grouping
                    barOpacity: s.barOpacity, // Preserve barOpacity when grouping
                    barEdgeColor: s.barEdgeColor || seriesColor, // Use series color if barEdgeColor not set
                    barEdgeWidth: s.barEdgeWidth, // Preserve barEdgeWidth when grouping
                });
            });
        });

        return newSeries;
    }, [data, groupByField, series, selectedLabels, hiddenSeries, groupMeasureColors, paletteColors]);

    // Filter data by selected labels if no grouping
    const filteredData = useMemo(() => {
        if (groupByField) {
            return transformedData;
        }

        return selectedLabels && selectedLabels.length > 0
            ? data.filter((item: any) => (item as any).label && selectedLabels.includes((item as any).label as string))
            : data;
    }, [groupByField, transformedData, selectedLabels, data]);

    // Handle legend click to show/hide series
    const handleLegendClick = (e: any) => {
        // Recharts passes the entry directly, or it might be in e.payload or e.dataKey
        const entry = e.payload || e;
        const dataKey = entry.dataKey || e.dataKey;

        if (!dataKey) return;

        setHiddenSeries((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(dataKey)) {
                newSet.delete(dataKey);
            } else {
                newSet.add(dataKey);
            }
            return newSet;
        });
    };

    const formatNumber = (value: unknown): string => {
        // Recharts can pass numbers OR strings (including ""), depending on axis/tooltip internals.
        // Guard here so we only call the number formatter with a real finite number.
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
            // If it's a non-numeric string (or something unexpected), don't crash—just display it.
            return typeof value === 'string' ? value : String(value);
        }

        return formatNumberUtil(num, {
            format: valueFormat || 'non-currency',
            // Allow optional precision override for Y-series formatting
            decimalPrecision: ySeriesFormatting?.decimalPrecision,
            // Don't specify decimals to match original toString() behavior for currency
            // For non-currency, it will use default 2 decimals
        });
    };

    // Get series to render (filter out hidden ones)
    // For non-grouping case, filter out hidden series based on dataKey
    const seriesToRender = useMemo(() => {
        if (groupByField) {
            return dynamicSeries;
        }
        // For non-grouping, filter out hidden series
        return series.filter((s) => !hiddenSeries.has(s.dataKey));
    }, [groupByField, dynamicSeries, series, hiddenSeries]);

    const groupLegendPayload = useMemo(() => {
        if (!groupByField || groupValues.length === 0) return undefined;

        return groupValues.map((groupValue, idx) => {
            const valueStr = String(groupValue);
            return {
                id: valueStr,
                value: valueStr,
                color: groupColorMap.get(valueStr) || paletteColors[idx % paletteColors.length],
                type: 'square' as const,
            };
        });
    }, [groupByField, groupValues, groupColorMap, paletteColors]);

    // Get typography styles
    const getTitleStyle = () => {
        if (!typography?.title) return {};
        return {
            fontFamily: typography.title.fontFamily,
            fontSize: typography.title.fontSize,
            fontWeight: typography.title.fontWeight,
            color: typography.title.color || '#ffffff',
            textAlign: typography.title.textAlign,
            textTransform: typography.title.textTransform,
            letterSpacing: typography.title.letterSpacing,
            lineHeight: typography.title.lineHeight,
        };
    };

    const getValueStyle = () => {
        if (!typography?.value) return {};
        return {
            fontFamily: typography.value.fontFamily,
            fontSize: typography.value.fontSize,
            fontWeight: typography.value.fontWeight,
            color: typography.value.color || '#ffffff',
            textAlign: typography.value.textAlign,
            textTransform: typography.value.textTransform,
            letterSpacing: typography.value.letterSpacing,
            lineHeight: typography.value.lineHeight,
        };
    };

    // Render different chart types
    const renderChart = (): React.ReactElement => {
        const commonProps = {
            data: filteredData,
            // Extra top/right margin when data labels are shown so labels aren't cut off
            margin: {
                top: showDataLabels ? 30 : 10,
                right: showDataLabels ? 50 : 20,
                left: 50,
                bottom: showLegend ? 35 : 25,
            },
        };

        const commonAxisProps = {
            axisLine: { stroke: 'var(--chart-axis-line)' },
            tick: { fill: 'var(--chart-text)', fontSize: 12 },
            tickLine: { stroke: 'var(--chart-axis-line)' },
        };

        const premiumTooltipProps = {
            content: <PremiumTooltip formatter={formatNumber} />,
            shared: false, // Show only the hovered series, not all series at that point
            cursor: { stroke: 'var(--chart-cursor)', strokeWidth: 2, strokeDasharray: '0' },
            animationDuration: 200,
            contentStyle: {
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                padding: 0,
            },
            wrapperStyle: {
                outline: 'none',
            },
        };

        // Generate y-axis domain and ticks if ySeriesDomain and ySeriesBreak are provided
        // Apply to all chart types except table
        const yAxisDomain = ySeriesDomain ? ySeriesDomain : undefined;
        const yAxisTicks = ySeriesDomain && ySeriesBreak ? generateYTicks(ySeriesDomain, ySeriesBreak) : undefined;

        const renderPieVariant = (isDonut: boolean): React.ReactElement => {
            const pieSeriesKey = seriesToRender[0]?.dataKey || series[0]?.dataKey || 'value';
            const pieData = filteredData?.map((item: any, idx: number) => ({
                name: (item as any).name,
                value: Number((item as any)[pieSeriesKey] || 0),
                fill:
                    seriesToRender[idx]?.color ||
                    series[idx]?.color ||
                    paletteColors[idx % paletteColors.length],
            }));

            const outerRadius = '80%';
            const innerRadius: string | number = isDonut ? '55%' : 0;

            const legendPayload = pieData.map((entry: any, index: number) => ({
                value: entry.name,
                color: entry.fill,
                type: 'circle' as const,
                id: entry.name,
            }));

            return (
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        nameKey="name"
                        labelLine={false}
                        label={({ name, percent }: { name?: string; percent?: number }) =>
                            `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={outerRadius}
                        innerRadius={innerRadius}
                        dataKey="value"
                        paddingAngle={2}
                    >
                        {pieData.map((entry: any, index: number) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.fill}
                                style={{
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e: any) => {
                                    if (e?.target) {
                                        e.target.style.filter = `drop-shadow(0 0 12px ${entry.fill}) drop-shadow(0 0 24px ${entry.fill}80) brightness(1.2)`;
                                        e.target.style.transform = 'scale(1.05)';
                                        e.target.style.transformOrigin = 'center';
                                    }
                                }}
                                onMouseLeave={(e: any) => {
                                    if (e?.target) {
                                        e.target.style.filter = 'none';
                                        e.target.style.transform = 'scale(1)';
                                    }
                                }}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        content={<PremiumTooltip formatter={formatNumber} />}
                        contentStyle={{
                            background: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            padding: 0,
                        }}
                        wrapperStyle={{
                            outline: 'none',
                        }}
                    />
                    {showLegend && (
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            height={45}
                            wrapperStyle={{ color: 'var(--chart-text)', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                            content={(props) => <DefaultLegendContent {...props} payload={legendPayload} />}
                        />
                    )}
                </PieChart>
            );
        };

        switch (chartType) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        {showGridLines && <CartesianGrid strokeDasharray={getGridLineDasharray(gridLineStyle)} vertical={false} stroke="var(--chart-grid)" />}
                        <XAxis dataKey="name" {...commonAxisProps} />
                        <YAxis
                            {...commonAxisProps}
                            tickFormatter={formatNumber}
                            width={55}
                            domain={yAxisDomain}
                            ticks={yAxisTicks}
                        />
                        <Tooltip {...premiumTooltipProps} />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: 'var(--chart-text)', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                                content={(props) => <DefaultLegendContent {...props} payload={groupLegendPayload} />}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            const color = s.color || paletteColors[idx % paletteColors.length];
                            return (
                                <Line
                                    key={`${s.dataKey}-${idx}`}
                                    type="monotone"
                                    dataKey={s.dataKey}
                                    stroke={color}
                                    strokeWidth={2}
                                    strokeDasharray={getStrokeDasharray(s.lineType)}
                                    dot={getDotProps(pointerStyle, color)}
                                    activeDot={getActiveDotProps(pointerStyle, color)}
                                    name={s.name}
                                    hide={s.hide}
                                >
                                    {showDataLabels && (
                                        <LabelList
                                            dataKey={s.dataKey}
                                            position="top"
                                            formatter={(v: unknown) => formatNumber(v)}
                                            fill="var(--chart-text)"
                                            fontSize={12}
                                        />
                                    )}
                                </Line>
                            );
                        })}
                    </LineChart>
                );

            case 'bar':
            case 'horizontal-bar':
                const isHorizontal = chartType === 'horizontal-bar';

                return (
                    <BarChart {...commonProps} layout={isHorizontal ? 'vertical' : 'horizontal'} barSize={40}>
                        {showGridLines && <CartesianGrid strokeDasharray={getGridLineDasharray(gridLineStyle)} vertical={false} stroke="var(--chart-grid)" />}

                        {isHorizontal ? (
                            <XAxis
                                type="number"
                                {...commonAxisProps}
                                tickFormatter={formatNumber}
                                width={55}
                                domain={yAxisDomain}
                                ticks={yAxisTicks}
                            />
                        ) : (
                            <XAxis dataKey="name" {...commonAxisProps} />
                        )}
                        {isHorizontal ? (
                            <YAxis dataKey="name" type="category" {...commonAxisProps} width={100} />
                        ) : (
                            <YAxis
                                {...commonAxisProps}
                                tickFormatter={formatNumber}
                                width={55}
                                domain={yAxisDomain}
                                ticks={yAxisTicks}
                            />
                        )}
                        <Tooltip {...premiumTooltipProps} />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: 'var(--chart-text)', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                                content={(props) => <DefaultLegendContent {...props} payload={groupLegendPayload} />}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            const color = s.color || paletteColors[idx % paletteColors.length];
                            const barOpacity = s.barOpacity !== undefined ? s.barOpacity : 0.6;
                            const barEdgeColor = s.barEdgeColor || color;
                            const barEdgeWidth = s.barEdgeWidth !== undefined ? s.barEdgeWidth : 2;
                            return (
                                <Bar
                                    key={`${s.dataKey}-${idx}`}
                                    dataKey={s.dataKey}
                                    fill={color}
                                    radius={[4, 4, 0, 0]}
                                    name={s.name}
                                    stackId={stacked ? 'stack' : undefined}
                                    hide={s.hide}
                                    shape={(props: any) => (
                                        <CustomBarShape
                                            {...props}
                                            barOpacity={barOpacity}
                                            barEdgeColor={barEdgeColor}
                                            barEdgeWidth={barEdgeWidth}
                                            layout={isHorizontal ? 'vertical' : 'horizontal'}
                                        />
                                    )}
                                    style={{
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                    }}
                                    activeBar={{
                                        fill: color,
                                        stroke: '#ffffff',
                                        strokeWidth: 2,
                                        style: {
                                            filter: `brightness(1.3) drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color}80)`,
                                            transition: 'all 0.2s ease',
                                        },
                                    }}
                                >
                                    {showDataLabels && (
                                        <LabelList
                                            dataKey={s.dataKey}
                                            position={isHorizontal ? 'right' : 'top'}
                                            formatter={(v: unknown) => formatNumber(v)}
                                            fill="var(--chart-text)"
                                            fontSize={12}
                                        />
                                    )}
                                </Bar>
                            );
                        })}
                    </BarChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        {showGridLines && <CartesianGrid strokeDasharray={getGridLineDasharray(gridLineStyle)} vertical={false} stroke="var(--chart-grid)" />}
                        <XAxis dataKey="name" {...commonAxisProps} />
                        <YAxis {...commonAxisProps} tickFormatter={formatNumber} width={55} />
                        <Tooltip {...premiumTooltipProps} />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: 'var(--chart-text)', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                                content={(props) => <DefaultLegendContent {...props} payload={groupLegendPayload} />}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            const color = s.color || paletteColors[idx % paletteColors.length];
                            return (
                                <Area
                                    key={`${s.dataKey}-${idx}`}
                                    type="monotone"
                                    dataKey={s.dataKey}
                                    stroke={color}
                                    strokeDasharray={getStrokeDasharray(s.lineType)}
                                    fill={color}
                                    fillOpacity={0.6}
                                    name={s.name}
                                    stackId={stacked ? 'stack' : undefined}
                                    hide={s.hide}
                                    dot={getDotProps(pointerStyle, color)}
                                    activeDot={getActiveDotProps(pointerStyle, color)}
                                >
                                    {showDataLabels && (
                                        <LabelList
                                            dataKey={s.dataKey}
                                            position="top"
                                            formatter={(v: unknown) => formatNumber(v)}
                                            fill="var(--chart-text)"
                                            fontSize={12}
                                        />
                                    )}
                                </Area>
                            );
                        })}
                    </AreaChart>
                );

            case 'composed':
                return (
                    <ComposedChart {...commonProps}>
                        {showGridLines && <CartesianGrid strokeDasharray={getGridLineDasharray(gridLineStyle)} vertical={false} stroke="var(--chart-grid)" />}
                        <XAxis dataKey="name" {...commonAxisProps} />
                        <YAxis
                            {...commonAxisProps}
                            tickFormatter={formatNumber}
                            width={55}
                            domain={yAxisDomain}
                            ticks={yAxisTicks}
                        />
                        <Tooltip {...premiumTooltipProps} />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: 'var(--chart-text)', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                                content={(props) => <DefaultLegendContent {...props} payload={groupLegendPayload} />}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            const color = s.color || paletteColors[idx % paletteColors.length];
                            const componentType = s.type || 'line';

                            if (componentType === 'bar') {
                                const barOpacity = s.barOpacity !== undefined ? s.barOpacity : 0.6;
                                const barEdgeColor = s.barEdgeColor || color;
                                const barEdgeWidth = s.barEdgeWidth !== undefined ? s.barEdgeWidth : 2;
                                return (
                                    <Bar
                                        key={`${s.dataKey}-${idx}`}
                                        dataKey={s.dataKey}
                                        fill={color}
                                        radius={[4, 4, 0, 0]}
                                        name={s.name}
                                        hide={s.hide}
                                        shape={(props: any) => (
                                            <CustomBarShape
                                                {...props}
                                                barOpacity={barOpacity}
                                                barEdgeColor={barEdgeColor}
                                                barEdgeWidth={barEdgeWidth}
                                                layout="horizontal"
                                            />
                                        )}
                                        style={{
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer',
                                        }}
                                        activeBar={{
                                            fill: color,
                                            stroke: '#ffffff',
                                            strokeWidth: 2,
                                            style: {
                                                filter: `brightness(1.3) drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color}80)`,
                                                transition: 'all 0.2s ease',
                                            },
                                        }}
                                    >
                                        {showDataLabels && (
                                            <LabelList
                                                dataKey={s.dataKey}
                                                position="top"
                                                formatter={(v: unknown) => formatNumber(v)}
                                                fill="var(--chart-text)"
                                                fontSize={12}
                                            />
                                        )}
                                    </Bar>
                                );
                            } else if (componentType === 'area') {
                                return (
                                    <Area
                                        key={`${s.dataKey}-${idx}`}
                                        type="monotone"
                                        dataKey={s.dataKey}
                                        stroke={color}
                                        strokeDasharray={getStrokeDasharray(s.lineType)}
                                        fill={color}
                                        fillOpacity={0.6}
                                        name={s.name}
                                        hide={s.hide}
                                        dot={getDotProps(pointerStyle, color)}
                                        activeDot={getActiveDotProps(pointerStyle, color)}
                                    >
                                        {showDataLabels && (
                                            <LabelList
                                                dataKey={s.dataKey}
                                                position="top"
                                                formatter={(v: unknown) => formatNumber(v)}
                                                fill="var(--chart-text)"
                                                fontSize={12}
                                            />
                                        )}
                                    </Area>
                                );
                            } else {
                                return (
                                    <Line
                                        key={`${s.dataKey}-${idx}`}
                                        type="monotone"
                                        dataKey={s.dataKey}
                                        stroke={color}
                                        strokeWidth={2}
                                        strokeDasharray={getStrokeDasharray(s.lineType)}
                                        dot={getDotProps(pointerStyle, color)}
                                        activeDot={getActiveDotProps(pointerStyle, color)}
                                        name={s.name}
                                        hide={s.hide}
                                    >
                                        {showDataLabels && (
                                            <LabelList
                                                dataKey={s.dataKey}
                                                position="top"
                                                formatter={(v: unknown) => formatNumber(v)}
                                                fill="var(--chart-text)"
                                                fontSize={12}
                                            />
                                        )}
                                    </Line>
                                );
                            }
                        })}
                    </ComposedChart>
                );

            case 'scatter':
                return (
                    <ScatterChart {...commonProps}>
                        {showGridLines && <CartesianGrid strokeDasharray={getGridLineDasharray(gridLineStyle)} stroke="var(--chart-grid)" />}
                        <XAxis dataKey="name" {...commonAxisProps} />
                        <YAxis
                            {...commonAxisProps}
                            tickFormatter={formatNumber}
                            width={55}
                            domain={yAxisDomain}
                            ticks={yAxisTicks}
                        />
                        <Tooltip {...premiumTooltipProps} />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: 'var(--chart-text)', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                                content={(props) => <DefaultLegendContent {...props} payload={groupLegendPayload} />}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            const color = s.color || paletteColors[idx % paletteColors.length];
                            return (
                                <Scatter
                                    key={`${s.dataKey}-${idx}`}
                                    name={s.name}
                                    dataKey={s.dataKey}
                                    fill={color}
                                    hide={s.hide}
                                    shape={(props: any) => {
                                        const { cx, cy } = props;
                                        return (
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={6}
                                                fill={color}
                                                style={{
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={(e: any) => {
                                                    if (e?.target) {
                                                        e.target.setAttribute('r', '8');
                                                        e.target.setAttribute('stroke', '#ffffff');
                                                        e.target.setAttribute('stroke-width', '2');
                                                        e.target.style.filter = `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}80)`;
                                                    }
                                                }}
                                                onMouseLeave={(e: any) => {
                                                    if (e?.target) {
                                                        e.target.setAttribute('r', '6');
                                                        e.target.setAttribute('stroke', 'none');
                                                        e.target.setAttribute('stroke-width', '0');
                                                        e.target.style.filter = 'none';
                                                    }
                                                }}
                                            />
                                        );
                                    }}
                                >
                                    {showDataLabels && (
                                        <LabelList
                                            dataKey={s.dataKey}
                                            position="top"
                                            formatter={(v: unknown) => formatNumber(v)}
                                            fill="var(--chart-text)"
                                            fontSize={12}
                                        />
                                    )}
                                </Scatter>
                            );
                        })}
                    </ScatterChart>
                );

            case 'pie':
                return renderPieVariant(false);

            case 'donut':
                return renderPieVariant(true);

            case 'radar':
                return (
                    <RadarChart {...commonProps}>
                        {showGridLines && <PolarGrid stroke="var(--chart-axis-line)" strokeDasharray={getGridLineDasharray(gridLineStyle)} />}
                        <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--chart-text)', fontSize: 12 }} />
                        <PolarRadiusAxis
                            tick={{ fill: 'var(--chart-text)', fontSize: 12 }}
                            tickFormatter={formatNumber}
                            domain={yAxisDomain}
                        />
                        <Tooltip {...premiumTooltipProps} />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: 'var(--chart-text)', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                                content={(props) => <DefaultLegendContent {...props} payload={groupLegendPayload} />}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            const color = s.color || paletteColors[idx % paletteColors.length];
                            return (
                                <Radar
                                    key={`${s.dataKey}-${idx}`}
                                    name={s.name}
                                    dataKey={s.dataKey}
                                    stroke={color}
                                    fill={color}
                                    fillOpacity={0.6}
                                    hide={s.hide}
                                    dot={getDotProps(pointerStyle, color)}
                                    activeDot={getActiveDotProps(pointerStyle, color)}
                                />
                            );
                        })}
                    </RadarChart>
                );

            case 'table':
                return (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <style>{`
                            .multi-chart-table {
                                width: 100%;
                                border-collapse: collapse;
                                font-size: 13px;
                            }
                            .multi-chart-table thead {
                                position: sticky;
                                top: 0;
                                z-index: 10;
                            }
                            .multi-chart-table thead th {
                                background: rgba(0, 33, 78, 0.8);
                                color: #ffffff;
                                font-weight: 600;
                                padding: 12px 16px;
                                text-align: left;
                                border-bottom: 2px solid rgba(255, 255, 255, 0.3);
                                border-right: 1px solid rgba(255, 255, 255, 0.1);
                            }
                            .multi-chart-table thead th:first-child {
                                border-left: none;
                            }
                            .multi-chart-table thead th:last-child {
                                border-right: none;
                            }
                            .multi-chart-table tbody tr {
                                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                                transition: background-color 0.2s ease;
                            }
                            .multi-chart-table tbody tr:hover {
                                background-color: rgba(255, 255, 255, 0.05);
                            }
                            .multi-chart-table tbody td {
                                color: #ffffff;
                                padding: 10px 16px;
                                border-right: 1px solid rgba(255, 255, 255, 0.1);
                            }
                            .multi-chart-table tbody td.multi-chart-table-xcell {
                                font-weight: 500;
                                text-align: left;
                                border-right: 1px solid rgba(255, 255, 255, 0.2);
                            }
                            .multi-chart-table tbody td.multi-chart-table-measure {
                                text-align: right;
                                font-family: 'monospace', monospace;
                            }
                            .multi-chart-table tbody td:last-child {
                                border-right: none;
                            }
                            .multi-chart-table-wrapper {
                                overflow-y: auto;
                                overflow-x: auto;
                                flex: 1;
                                width: 100%;
                            }
                            .multi-chart-table-wrapper::-webkit-scrollbar {
                                width: 8px;
                                height: 8px;
                            }
                            .multi-chart-table-wrapper::-webkit-scrollbar-track {
                                background: rgba(255, 255, 255, 0.05);
                                border-radius: 4px;
                            }
                            .multi-chart-table-wrapper::-webkit-scrollbar-thumb {
                                background: rgba(255, 255, 255, 0.2);
                                border-radius: 4px;
                            }
                            .multi-chart-table-wrapper::-webkit-scrollbar-thumb:hover {
                                background: rgba(255, 255, 255, 0.3);
                            }
                        `}</style>
                        <div className="multi-chart-table-wrapper">
                            <table className="multi-chart-table">
                                <thead>
                                    <tr>
                                        {tableCharKeys && tableCharKeys.length > 0 &&
                                            tableCharKeys.map((key) => (
                                                <th key={key}>
                                                    {headerText[key] || key}
                                                </th>
                                            ))}
                                        {seriesToRender
                                            .filter((s) => !s.hide)
                                            .map((s) => (
                                                <th key={s.dataKey} style={{ color: s.color || '#ffffff' }}>
                                                    {s.name}
                                                </th>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData?.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={
                                                    seriesToRender.filter((s) => !s.hide).length +
                                                    (tableCharKeys && tableCharKeys.length > 0 ? tableCharKeys.length : 0)
                                                }
                                                style={{ textAlign: 'center', padding: '40px' }}
                                            >
                                                No data available
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData?.map((item: any, rowIdx: number) => (
                                            <tr key={`row-${rowIdx}`}>
                                                {tableCharKeys && tableCharKeys.length > 0 &&
                                                    tableCharKeys.map((key) => (
                                                        <td
                                                            key={key}
                                                            className="multi-chart-table-xcell"
                                                        >
                                                            {(item as any)[key] ?? '-'}
                                                        </td>
                                                    ))}
                                                {seriesToRender
                                                    .filter((s) => !s.hide)
                                                    .map((s) => {
                                                        const value = item[s.dataKey];
                                                        const numValue = value === null || value === undefined || value === '' ? null : Number(value);
                                                        return (
                                                            <td key={s.dataKey}>
                                                                {numValue !== null ? formatNumber(numValue) : '-'}
                                                            </td>
                                                        );
                                                    })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            default:
                return <></>;
        }
    };

    // Show loading state when fetching BEX data
    if (queryName && chartConfig && bexLoading) {
        return <WidgetSkeleton />;
    }

    // Show error state if BEX fetch failed
    if (queryName && chartConfig && bexError) {
        return (
            <div className="flex h-full w-full flex-col">
        <div
            className="multi-chart-widget flex flex-1 flex-col overflow-hidden rounded-xl p-4 text-white items-center justify-center"
            style={backgroundStyle}
        >
            <div className="text-center">
                <p className="text-sm text-red-300 mb-2">Error loading chart data</p>
                        <p className="text-xs text-white/60">{bexError.message || 'Unknown error'}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show message if queryName is provided but no chartConfig
    if (queryName && !chartConfig) {
        return (
            <div className="flex h-full w-full flex-col">
        <div
            className="multi-chart-widget flex flex-1 flex-col overflow-hidden rounded-xl p-4 text-white items-center justify-center"
            style={backgroundStyle}
        >
            <div className="text-center">
                <p className="text-sm text-white/80">Chart configuration is required</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col">
            <div
                className="multi-chart-widget flex flex-1 flex-col overflow-hidden rounded-xl p-4 text-white"
                style={backgroundStyle}
            >
                {/* Header */}

                <div className="mb-2 flex shrink-0 items-start justify-between">
                    <div className="flex flex-col items-start gap-[5px]">
                        <h3 className="text-base font-bold text-white" style={getTitleStyle()}>
                            {title}
                        </h3>
                    </div>
                    {/* {totalValue && (
                        <div className="flex flex-col items-center">
                            <span
                                className="text-xl font-bold whitespace-nowrap text-white"
                                style={getValueStyle()}
                            >
                                {totalValue}
                            </span>
                            <span className="text-sm font-normal text-white">Total Value</span>
                        </div>
                    )} */}
                </div>



                {/* Label filters (if applicable) */}


                {/* Chart */}
                <div className="relative min-h-[180px] flex-1 flex flex-col overflow-hidden" ref={chartContainerRef}>
                    <style>{`
                        .recharts-wrapper {
                            transition: all 0.2s ease;
                        }
                        .recharts-bar-rectangle:hover {
                            filter: brightness(1.2) !important;
                            transition: filter 0.2s ease;
                        }
                    `}</style>
                    {renderChart && (
                        chartType === 'table'
                            ? renderChart()
                            : (
                                <ResponsiveContainer width="100%" height="100%">
                                    {renderChart()}
                                </ResponsiveContainer>
                            )
                    )}

                </div>
            </div>

            {/* Hidden color picker */}
            < input
                type="color"
                ref={colorInputRef}
                onChange={handleColorChange}
                style={{ display: 'none' }}
            />
        </div >
    );
};

export default MultiChart;
