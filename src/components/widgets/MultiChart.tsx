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
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface SeriesConfig {
    name: string;
    dataKey: string;
    color: string;
    type?: 'line' | 'bar' | 'area'; // For ComposedChart
    hide?: boolean; // For legend interactivity
}

interface MultiChartProps {
    data: {
        name: string;
        label?: string;
        groupKey?: string; // For grouping by Struct field
        [key: string]: string | number | undefined;
    }[];
    title: string;
    // totalValue?: string;
    series: SeriesConfig[];
    chartType: 'line' | 'bar' | 'area' | 'composed' | 'scatter' | 'pie' | 'donut' | 'radar' | 'horizontal-bar';
    color?: string;
    colorPalette?: string[];
    setChangeColor?: (color: string) => void;
    selectedLabels?: string[];
    showLegend?: boolean;
    stacked?: boolean;
    valueFormat?: 'currency' | 'non-currency';
    typography?: any;
    groupByField?: string; // Field name to group by (e.g., Struct field)
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
                    background: 'linear-gradient(135deg, #021c36 0%, #043960 100%)',
                    border: '1px solid rgba(0, 255, 255, 0.4)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 8px 32px rgba(0, 255, 255, 0.2), 0 0 20px rgba(0, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    pointerEvents: 'none',
                    animation: 'tooltipFadeIn 0.2s ease-out',
                    transformOrigin: 'bottom center',
                }}
            >
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '6px' }}>
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
                        <span style={{ color: '#ffffff', fontWeight: 500 }}>{entry.name}:</span>
                        <span style={{ color: '#00ffff', fontWeight: 'bold', marginLeft: 'auto' }}>
                            {formatter ? formatter(entry.value) : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        </>
    );
};


const MultiChart: React.FC<MultiChartProps> = ({
    data = [],
    title = 'Chart',
    // totalValue = '',
    series = [],
    chartType = 'line',
    color,
    colorPalette,
    setChangeColor,
    selectedLabels = [],
    showLegend = true,
    stacked = false,
    valueFormat = 'non-currency',
    typography,
    groupByField,
}) => {
    const [userColor, setUserColor] = useState<string | null>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
    const chartContainerRef = useRef<HTMLDivElement>(null);

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

    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${baseColor}, ${lighterColor})`,
        color: '#ffffff',
    };

    const groupValues = useMemo(() => {
        if (!groupByField) return [];
        if (selectedLabels && selectedLabels.length > 0) {
            return selectedLabels;
        }

        return Array.from(
            new Set(
                data
                    .map((item) => String(item[groupByField] || item.groupKey || ''))
                    .filter((value) => value)
            )
        );
    }, [groupByField, selectedLabels, data]);

    const groupColorMap = useMemo(() => {
        if (!groupByField || groupValues.length === 0) return new Map<string, string>();

        return new Map(
            groupValues.map((groupValue, idx) => [
                groupValue,
                paletteColors[idx % paletteColors.length],
            ])
        );
    }, [groupByField, groupValues, paletteColors]);

    // Transform data based on grouping field (Struct field)
    const transformedData = useMemo(() => {
        if (!groupByField || !data.length) {
            // No grouping - filter by selected labels if applicable
            return selectedLabels && selectedLabels.length > 0
                ? data.filter((item) => item.label && selectedLabels.includes(item.label as string))
                : data;
        }

        // Group data by the groupByField (e.g., Struct field)
        const grouped = new Map<string, Map<string, any>>();

        data.forEach((item) => {
            const groupValue = String(item[groupByField] || item.groupKey || '');
            const xValue = String(item.name || '');

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

        // If selectedLabels is provided, filter by those labels
        const filteredGroups = selectedLabels && selectedLabels.length > 0
            ? Array.from(grouped.entries()).filter(([groupValue]) =>
                selectedLabels.includes(groupValue)
            )
            : Array.from(grouped.entries());

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
            series.forEach((s) => {
                const seriesKey = `${groupValue}_${s.dataKey}`;
                newSeries.push({
                    ...s,
                    name: `${groupValue} - ${s.name}`,
                    dataKey: seriesKey,
                    hide: hiddenSeries.has(seriesKey),
                    color: groupColorMap.get(groupValue) || s.color || paletteColors[0],
                });
            });
        });

        return newSeries;
    }, [data, groupByField, series, selectedLabels, hiddenSeries, groupColorMap]);

    // Filter data by selected labels if no grouping
    const filteredData = useMemo(() => {
        if (groupByField) {
            return transformedData;
        }

        return selectedLabels && selectedLabels.length > 0
            ? data.filter((item) => item.label && selectedLabels.includes(item.label as string))
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

    const formatNumber = (num: number) => {
        if (valueFormat === 'currency') {
            // Currency format: Thousand → M, Million → MM, Billion → B
            if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
            if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}MM`;
            if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}M`;
            return num.toString();
        } else {
            // Non-currency format: Thousand → K, Million → M, Billion → B
            if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
            if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
            if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
            return num.toString();
        }
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
            return {
                id: groupValue,
                value: groupValue,
                color: groupColorMap.get(groupValue) || paletteColors[idx % paletteColors.length],
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
            margin: { top: 10, right: 20, left: 50, bottom: showLegend ? 35 : 25 },
        };

        const commonAxisProps = {
            axisLine: { stroke: '#ffffff50' },
            tick: { fill: '#ffffff', fontSize: 12 },
            tickLine: { stroke: '#ffffff50' },
        };

        const premiumTooltipProps = {
            content: <PremiumTooltip formatter={formatNumber} />,
            cursor: { stroke: 'rgba(0, 255, 255, 0.5)', strokeWidth: 2, strokeDasharray: '0' },
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

        const renderPieVariant = (isDonut: boolean): React.ReactElement => {
            const pieSeriesKey = seriesToRender[0]?.dataKey || series[0]?.dataKey || 'value';
            const pieData = filteredData.map((item, idx) => ({
                name: item.name,
                value: Number(item[pieSeriesKey] || 0),
                fill:
                    seriesToRender[idx]?.color ||
                    series[idx]?.color ||
                    paletteColors[idx % paletteColors.length],
            }));

            const outerRadius = '80%';
            const innerRadius: string | number = isDonut ? '55%' : 0;

            const legendPayload = pieData.map((entry) => ({
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
                        label={({ name, percent }: { name: string; percent: number }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={outerRadius}
                        innerRadius={innerRadius}
                        dataKey="value"
                        paddingAngle={2}
                    >
                        {pieData.map((entry, index) => (
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
                            wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                            payload={legendPayload}
                        />
                    )}
                </PieChart>
            );
        };

        switch (chartType) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff30" />
                        <XAxis dataKey="name" {...commonAxisProps} />
                        <YAxis {...commonAxisProps} tickFormatter={formatNumber} width={55} />
                        <Tooltip {...premiumTooltipProps} />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                                payload={groupLegendPayload}
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
                                    dot={{
                                        r: 4,
                                        fill: color,
                                        strokeWidth: 0,
                                    }}
                                    activeDot={{
                                        r: 8,
                                        fill: color,
                                        stroke: '#ffffff',
                                        strokeWidth: 2,
                                        style: {
                                            filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}80)`,
                                            transition: 'all 0.2s ease',
                                        },
                                    }}
                                    name={s.name}
                                    hide={s.hide}
                                />
                            );
                        })}
                    </LineChart>
                );

            case 'bar':
            case 'horizontal-bar':
                const isHorizontal = chartType === 'horizontal-bar';

                return (
                    <BarChart {...commonProps} layout={isHorizontal ? 'vertical' : 'horizontal'} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff30" />

                        {isHorizontal ? (
                            <XAxis type="number" {...commonAxisProps} tickFormatter={formatNumber} width={55} />
                        ) : (
                            <XAxis dataKey="name" {...commonAxisProps} />
                        )}
                        {isHorizontal ? (
                            <YAxis dataKey="name" type="category" {...commonAxisProps} width={100} />
                        ) : (
                            <YAxis {...commonAxisProps} tickFormatter={formatNumber} width={55} />
                        )}
                        <Tooltip {...premiumTooltipProps} />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                                payload={groupLegendPayload}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            const color = s.color || paletteColors[idx % paletteColors.length];
                            return (
                                <Bar
                                    key={`${s.dataKey}-${idx}`}
                                    dataKey={s.dataKey}
                                    fill={color}
                                    radius={[4, 4, 0, 0]}
                                    name={s.name}
                                    stackId={stacked ? 'stack' : undefined}
                                    hide={s.hide}
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
                                />
                            );
                        })}
                    </BarChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff30" />
                        <XAxis dataKey="name" {...commonAxisProps} />
                        <YAxis {...commonAxisProps} tickFormatter={formatNumber} width={55} />
                        <Tooltip {...premiumTooltipProps} />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                                payload={groupLegendPayload}
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
                                    fill={color}
                                    fillOpacity={0.6}
                                    name={s.name}
                                    stackId={stacked ? 'stack' : undefined}
                                    hide={s.hide}
                                    dot={{
                                        r: 4,
                                        fill: color,
                                        strokeWidth: 0,
                                    }}
                                    activeDot={{
                                        r: 8,
                                        fill: color,
                                        stroke: '#ffffff',
                                        strokeWidth: 2,
                                        style: {
                                            filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}80)`,
                                            transition: 'all 0.2s ease',
                                        },
                                    }}
                                />
                            );
                        })}
                    </AreaChart>
                );

            case 'composed':
                return (
                    <ComposedChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff30" />
                        <XAxis dataKey="name" {...commonAxisProps} />
                        <YAxis {...commonAxisProps} tickFormatter={formatNumber} width={55} />
                        <Tooltip {...premiumTooltipProps} />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                                payload={groupLegendPayload}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            const color = s.color || paletteColors[idx % paletteColors.length];
                            const componentType = s.type || 'line';

                            if (componentType === 'bar') {
                                return (
                                    <Bar
                                        key={`${s.dataKey}-${idx}`}
                                        dataKey={s.dataKey}
                                        fill={color}
                                        radius={[4, 4, 0, 0]}
                                        name={s.name}
                                        hide={s.hide}
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
                                    />
                                );
                            } else if (componentType === 'area') {
                                return (
                                    <Area
                                        key={`${s.dataKey}-${idx}`}
                                        type="monotone"
                                        dataKey={s.dataKey}
                                        stroke={color}
                                        fill={color}
                                        fillOpacity={0.6}
                                        name={s.name}
                                        hide={s.hide}
                                        dot={{
                                            r: 4,
                                            fill: color,
                                            strokeWidth: 0,
                                        }}
                                        activeDot={{
                                            r: 8,
                                            fill: color,
                                            stroke: '#ffffff',
                                            strokeWidth: 2,
                                            style: {
                                                filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}80)`,
                                                transition: 'all 0.2s ease',
                                            },
                                        }}
                                    />
                                );
                            } else {
                                return (
                                    <Line
                                        key={`${s.dataKey}-${idx}`}
                                        type="monotone"
                                        dataKey={s.dataKey}
                                        stroke={color}
                                        strokeWidth={2}
                                        dot={{
                                            r: 4,
                                            fill: color,
                                            strokeWidth: 0,
                                        }}
                                        activeDot={{
                                            r: 8,
                                            fill: color,
                                            stroke: '#ffffff',
                                            strokeWidth: 2,
                                            style: {
                                                filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}80)`,
                                                transition: 'all 0.2s ease',
                                            },
                                        }}
                                        name={s.name}
                                        hide={s.hide}
                                    />
                                );
                            }
                        })}
                    </ComposedChart>
                );

            case 'scatter':
                return (
                    <ScatterChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
                        <XAxis dataKey="name" {...commonAxisProps} />
                        <YAxis {...commonAxisProps} tickFormatter={formatNumber} width={55} />
                        <Tooltip {...premiumTooltipProps} />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                                payload={groupLegendPayload}
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
                                />
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
                        <PolarGrid stroke="#ffffff50" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#ffffff', fontSize: 12 }} />
                        <PolarRadiusAxis
                            tick={{ fill: '#ffffff', fontSize: 12 }}
                            tickFormatter={formatNumber}
                        />
                        <Tooltip {...premiumTooltipProps} />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                                payload={groupLegendPayload}
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
                                    dot={{
                                        r: 4,
                                        fill: color,
                                        strokeWidth: 0,
                                    }}
                                    activeDot={{
                                        r: 8,
                                        fill: color,
                                        stroke: '#ffffff',
                                        strokeWidth: 2,
                                        style: {
                                            filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}80)`,
                                            transition: 'all 0.2s ease',
                                        },
                                    }}
                                />
                            );
                        })}
                    </RadarChart>
                );

            default:
                return <></>;
        }
    };

    return (
        <div className="flex h-full w-full flex-col">
            <div
                className="flex flex-1 flex-col overflow-hidden rounded-xl p-4 text-white"
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
                <div className="relative min-h-[180px] flex-1" ref={chartContainerRef}>
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
                        <ResponsiveContainer width="100%" height="100%">
                            {renderChart()}
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Hidden color picker */}
            <input
                type="color"
                ref={colorInputRef}
                onChange={handleColorChange}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default MultiChart;
