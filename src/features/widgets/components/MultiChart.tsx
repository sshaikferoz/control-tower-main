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
    totalValue?: string;
    series: SeriesConfig[];
    chartType: 'line' | 'bar' | 'area' | 'composed' | 'scatter' | 'pie' | 'radar' | 'horizontal-bar';
    color?: string;
    setChangeColor?: (color: string) => void;
    selectedLabels?: string[];
    showLegend?: boolean;
    stacked?: boolean;
    valueFormat?: 'currency' | 'non-currency';
    typography?: any;
    groupByField?: string; // Field name to group by (e.g., Struct field)
}

const MultiChart: React.FC<MultiChartProps> = ({
    data = [],
    title = 'Chart',
    totalValue = '',
    series = [],
    chartType = 'line',
    color,
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

    const defaultBaseColor = '#00214E';
    const defaultLighterColor = '#0164B0';

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

        // Get unique group values
        const groupValues = selectedLabels && selectedLabels.length > 0
            ? selectedLabels
            : Array.from(new Set(data.map((item) => String(item[groupByField] || item.groupKey || '')).filter(Boolean)));

        const newSeries: SeriesConfig[] = [];

        groupValues.forEach((groupValue) => {
            series.forEach((s) => {
                const seriesKey = `${groupValue}_${s.dataKey}`;
                newSeries.push({
                    ...s,
                    name: `${groupValue} - ${s.name}`,
                    dataKey: seriesKey,
                    hide: hiddenSeries.has(seriesKey),
                });
            });
        });

        return newSeries;
    }, [data, groupByField, series, selectedLabels, hiddenSeries]);

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

    const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8'];

    // Get series to render (filter out hidden ones)
    // For non-grouping case, filter out hidden series based on dataKey
    const seriesToRender = useMemo(() => {
        if (groupByField) {
            return dynamicSeries;
        }
        // For non-grouping, filter out hidden series
        return series.filter((s) => !hiddenSeries.has(s.dataKey));
    }, [groupByField, dynamicSeries, series, hiddenSeries]);

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
    const renderChart = () => {
        const commonProps = {
            data: filteredData,
            margin: { top: 10, right: 20, left: 50, bottom: showLegend ? 35 : 25 },
        };

        const commonAxisProps = {
            axisLine: { stroke: '#ffffff50' },
            tick: { fill: '#ffffff', fontSize: 12 },
            tickLine: { stroke: '#ffffff50' },
        };

        switch (chartType) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff30" />
                        <XAxis dataKey="name" {...commonAxisProps} />
                        <YAxis {...commonAxisProps} tickFormatter={formatNumber} width={55} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1E3A71',
                                border: '1px solid #00a3e0',
                                borderRadius: '8px',
                                color: '#ffffff',
                            }}
                            formatter={(value: any) => formatNumber(Number(value))}
                        />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            return (
                                <Line
                                    key={`${s.dataKey}-${idx}`}
                                    type="monotone"
                                    dataKey={s.dataKey}
                                    stroke={s.color || defaultColors[idx % defaultColors.length]}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
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
                            <>
                                <XAxis type="number" {...commonAxisProps} tickFormatter={formatNumber} width={55} />
                                <YAxis dataKey="name" type="category" {...commonAxisProps} width={100} />
                            </>
                        ) : (
                            <>
                                <XAxis dataKey="name" {...commonAxisProps} />
                                <YAxis {...commonAxisProps} tickFormatter={formatNumber} width={55} />
                            </>
                        )}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1E3A71',
                                border: '1px solid #00a3e0',
                                borderRadius: '8px',
                                color: '#ffffff',
                            }}
                            formatter={(value: any) => formatNumber(Number(value))}
                        />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            return (
                                <Bar
                                    key={`${s.dataKey}-${idx}`}
                                    dataKey={s.dataKey}
                                    fill={s.color || defaultColors[idx % defaultColors.length]}
                                    radius={[4, 4, 0, 0]}
                                    name={s.name}
                                    stackId={stacked ? 'stack' : undefined}
                                    hide={s.hide}
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
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1E3A71',
                                border: '1px solid #00a3e0',
                                borderRadius: '8px',
                                color: '#ffffff',
                            }}
                            formatter={(value: any) => formatNumber(Number(value))}
                        />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            return (
                                <Area
                                    key={`${s.dataKey}-${idx}`}
                                    type="monotone"
                                    dataKey={s.dataKey}
                                    stroke={s.color || defaultColors[idx % defaultColors.length]}
                                    fill={s.color || defaultColors[idx % defaultColors.length]}
                                    fillOpacity={0.6}
                                    name={s.name}
                                    stackId={stacked ? 'stack' : undefined}
                                    hide={s.hide}
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
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1E3A71',
                                border: '1px solid #00a3e0',
                                borderRadius: '8px',
                                color: '#ffffff',
                            }}
                            formatter={(value: any) => formatNumber(Number(value))}
                        />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            const color = s.color || defaultColors[idx % defaultColors.length];
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
                                        dot={{ r: 4 }}
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
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1E3A71',
                                border: '1px solid #00a3e0',
                                borderRadius: '8px',
                                color: '#ffffff',
                            }}
                            formatter={(value: any) => formatNumber(Number(value))}
                        />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            return (
                                <Scatter
                                    key={`${s.dataKey}-${idx}`}
                                    name={s.name}
                                    dataKey={s.dataKey}
                                    fill={s.color || defaultColors[idx % defaultColors.length]}
                                    hide={s.hide}
                                />
                            );
                        })}
                    </ScatterChart>
                );

            case 'pie':
                // For pie charts, use the first series
                const pieData = filteredData.map((item, idx) => ({
                    name: item.name,
                    value: Number(item[seriesToRender[0]?.dataKey || series[0]?.dataKey || 'value'] || 0),
                    fill: seriesToRender[idx]?.color || series[idx]?.color || defaultColors[idx % defaultColors.length],
                }));

                return (
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1E3A71',
                                border: '1px solid #00a3e0',
                                borderRadius: '8px',
                                color: '#ffffff',
                            }}
                            formatter={(value: any) => formatNumber(Number(value))}
                        />
                    </PieChart>
                );

            case 'radar':
                return (
                    <RadarChart {...commonProps}>
                        <PolarGrid stroke="#ffffff50" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#ffffff', fontSize: 12 }} />
                        <PolarRadiusAxis
                            tick={{ fill: '#ffffff', fontSize: 12 }}
                            tickFormatter={formatNumber}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1E3A71',
                                border: '1px solid #00a3e0',
                                borderRadius: '8px',
                                color: '#ffffff',
                            }}
                            formatter={(value: any) => formatNumber(Number(value))}
                        />
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px', cursor: 'default' }}
                            />
                        )}
                        {seriesToRender.map((s, idx) => {
                            if (s.hide) return null;
                            return (
                                <Radar
                                    key={`${s.dataKey}-${idx}`}
                                    name={s.name}
                                    dataKey={s.dataKey}
                                    stroke={s.color || defaultColors[idx % defaultColors.length]}
                                    fill={s.color || defaultColors[idx % defaultColors.length]}
                                    fillOpacity={0.6}
                                    hide={s.hide}
                                />
                            );
                        })}
                    </RadarChart>
                );

            default:
                return null;
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
                    {totalValue && (
                        <div className="flex flex-col items-center">
                            <span
                                className="text-xl font-bold whitespace-nowrap text-white"
                                style={getValueStyle()}
                            >
                                {totalValue}
                            </span>
                            <span className="text-sm font-normal text-white">Total Value</span>
                        </div>
                    )}
                </div>

                {/* Label filters (if applicable) */}
                {(groupByField || (data.some((item) => item.label !== undefined) && selectedLabels.length > 0)) && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {selectedLabels.map((label, idx) => (
                            <span
                                key={idx}
                                className="rounded-full bg-black/40 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white shadow-md border border-white/30"
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                    backdropFilter: 'blur(4px)'
                                }}
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                )}

                {/* Chart */}
                <div className="relative min-h-[180px] flex-1">
                    {renderChart && (
                        <ResponsiveContainer width="100%" height="100%">
                            {renderChart() || <></>}
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
