import React, { JSX, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as MUIIcons from '@mui/icons-material';
import { FormatConfig, applyValueFormat } from '@/helpers/formatConfig';

interface LoansAppTrayProps {
    title?: string;
    widget_name?: string;
    menuItems?: {
        id: number;
        iconName?: string;
        icon?: string;
        label: string;
        count: number;
        color?: string;
        formatConfig?: FormatConfig;
    }[];
    chartData?: {
        name: string;
        value: number;
        color: string;
        iconName?: string;
        fullName?: string;
    }[];
    menuItemConfigs?: {
        [key: number]: {
            reportName?: string;
            queryConfig?: any;
            formatConfig?: FormatConfig;
        };
    };
    chartDataConfig?: {
        reportName?: string;
        chartConfig?: any;
    };
}

// Helper function to get MUI icon component by name
const getMUIIcon = (iconName: string, size: number = 21.67) => {
    if (!iconName) return null;

    const IconComponent = (MUIIcons as any)[iconName];
    return IconComponent
        ? React.createElement(IconComponent, {
            style: { width: `${size}px`, height: `${size}px`, color: 'white' },
        })
        : null;
};

// Default colors for chart bars
const DEFAULT_COLORS = ['#449ca4', '#5899da', '#ffaa04', '#ff0000'];

// Helper function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number = 20): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

const LoansAppTray = ({
    title,
    widget_name,
    menuItems = [
        {
            id: 1,
            iconName: 'Assignment',
            icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/vector.svg`,
            label: 'Open PR',
            count: 13,
            color: '#449ca4',
        },
        {
            id: 2,
            iconName: 'Schedule',
            icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/group-1000003443.png`,
            label: 'Contract Expiring',
            count: 85,
            color: '#5899da',
        },
        {
            id: 3,
            iconName: 'Pending',
            icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/group-1000003444.png`,
            label: 'Pending SES',
            count: 32,
            color: '#ffaa04',
        },
        {
            id: 4,
            iconName: 'TrendingUp',
            icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/vector-1.svg`,
            label: 'Contract with 80% Consumed Values',
            count: 24,
            color: '#ff0000',
        },
    ],
    chartData,
    menuItemConfigs = {},
    chartDataConfig = {},
}: LoansAppTrayProps): JSX.Element => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Use chartData if provided, otherwise transform menuItems into chart data format
    const transformedChartData = chartData || menuItems.map((item, index) => ({
        name: truncateText(item.label.replace(/\n/g, ' '), 15),
        fullName: item.label.replace(/\n/g, ' '),
        value: item.count,
        color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        iconName: item.iconName,
        formatConfig: item.formatConfig || menuItemConfigs[item.id]?.formatConfig,
    }));

    // Calculate min and max values for scaling
    const minValue = 0; // Always start from 0
    const maxValue = Math.max(...transformedChartData.map((d) => d.value), 1);

    // Calculate a nice rounded max value with 20% padding
    const rawMax = maxValue * 1.2;
    let chartMaxValue;
    if (rawMax <= 0) {
        chartMaxValue = 10; // Default to 10 if no data
    } else {
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
        const normalized = rawMax / magnitude;
        let niceMax;
        if (normalized <= 1) niceMax = 1;
        else if (normalized <= 2) niceMax = 2;
        else if (normalized <= 5) niceMax = 5;
        else niceMax = 10;
        chartMaxValue = niceMax * magnitude;
    }

    // Format number for y-axis (non-currency formatting: K, M, B)
    const formatYAxisValue = (num: number): string => {
        if (num >= 1_000_000_000) return `${Math.ceil(num / 1_000_000_000)}B`;
        if (num >= 1_000_000) return `${Math.ceil(num / 1_000_000)}M`;
        if (num >= 1_000) return `${Math.ceil(num / 1_000)}K`;
        return Math.ceil(num).toString();
    };

    // Calculate 10 evenly spaced y-axis intervals
    const numIntervals = 10;
    const intervalValue = chartMaxValue / numIntervals;

    // Generate y-axis tick values (0 to chartMaxValue in 10 steps)
    // Round values to avoid floating point precision issues
    const yAxisTicks = Array.from({ length: numIntervals + 1 }, (_, i) => {
        const value = i * intervalValue;
        // Round to appropriate precision based on the magnitude
        if (chartMaxValue >= 1000) {
            return Math.round(value);
        } else if (chartMaxValue >= 1) {
            return Math.round(value * 10) / 10;
        } else {
            return Math.round(value * 100) / 100;
        }
    });

    // Format count value based on formatConfig; fallback to non-currency K/M/B like y-axis
    const formatCount = (count: number, itemId?: number): string => {
        const formatConfig = menuItems.find(item => item.id === itemId)?.formatConfig
            || menuItemConfigs[itemId || 0]?.formatConfig;
        if (formatConfig) {
            return applyValueFormat(count, formatConfig);
        }
        return formatYAxisValue(count);
    };

    // Use title or widget_name, with fallback to empty string
    const displayTitle = title || widget_name || '';

    return (
        <div className="h-full w-full">
            <div className="h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white flex flex-col">
                {/* Title Header */}
                {displayTitle && (
                    <div className="mb-3">
                        <h3 className="text-lg font-bold text-white">{displayTitle}</h3>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 flex">
                    {/* Left Panel - Alert Categories */}
                    <div className="flex flex-col gap-3 w-[45%] pr-4">
                        {menuItems.map((item) => {
                            const IconComponent = item.iconName ? getMUIIcon(item.iconName) : null;

                            return (
                                <div
                                    key={item.id}
                                    className="relative flex items-center gap-3"
                                >
                                    {IconComponent ? (
                                        <div
                                            className="relative flex h-[32px] w-[32px] items-center justify-center rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.color || DEFAULT_COLORS[item.id % DEFAULT_COLORS.length] }}
                                        >
                                            {IconComponent}
                                        </div>
                                    ) : (
                                        <div
                                            className="relative flex h-[32px] w-[32px] items-center justify-center rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.color || DEFAULT_COLORS[item.id % DEFAULT_COLORS.length] }}
                                        >
                                            <img
                                                className="relative h-[20px] w-[20px]"
                                                alt={`Icon for ${item.label}`}
                                                src={item.icon}
                                            />
                                        </div>
                                    )}

                                    <div className="relative flex flex-1 items-center">
                                        <div className="relative flex-1 overflow-hidden [font-family:'Ghawar-Hefty',Helvetica] text-sm leading-5 font-normal tracking-[0] text-white">
                                            {item.label.replace(/\n/g, ' ')}
                                        </div>
                                    </div>

                                    <div
                                        className="relative flex items-center justify-center rounded-full bg-[#1E3A71] flex-shrink-0"
                                        style={{
                                            minWidth: '28px',
                                            minHeight: '28px',
                                            padding: '4px 6px',
                                            width: 'auto',
                                            height: 'auto'
                                        }}
                                    >
                                        <span
                                            className="relative [font-family:'Roboto',Helvetica] text-xs leading-[14px] font-semibold tracking-[0] text-white text-center whitespace-nowrap"
                                            style={{
                                                padding: '0 2px'
                                            }}
                                            title={formatCount(item.count, item.id)}
                                        >
                                            {formatCount(item.count, item.id)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Panel - Thermometer-style Bars */}
                    <div className="flex-1 relative flex items-end justify-center gap-4" style={{ height: '100%', paddingBottom: '35px' }}>
                        {/* Y-Axis Labels */}
                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pr-2 z-10" style={{ width: '30px' }}>
                            {yAxisTicks.map((value, i) => {
                                const positionPercent = (value / chartMaxValue) * 100;
                                return (
                                    <React.Fragment key={value}>
                                        {/* Y-Axis Label */}
                                        <div
                                            className="absolute text-xs text-white"
                                            style={{
                                                bottom: `${positionPercent}%`,
                                                transform: 'translateY(50%)',
                                                right: '4px',
                                            }}
                                        >
                                            {formatYAxisValue(value)}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* Grid Lines - Spanning full chart area (starting after y-axis labels) */}
                        <div className="absolute top-0 bottom-0 right-0 pointer-events-none" style={{ left: '30px' }}>
                            {yAxisTicks.map((value, i) => {
                                const positionPercent = (value / chartMaxValue) * 100;
                                return (
                                    <div
                                        key={`grid-${i}`}
                                        className="absolute left-0 right-0 border-t border-white border-opacity-10 border-dotted"
                                        style={{
                                            bottom: `${positionPercent}%`,
                                            width: '100%',
                                        }}
                                    />
                                );
                            })}
                        </div>

                        {/* Bars Container */}
                        <div className="absolute left-0 right-0 top-0 bottom-0 flex items-end justify-center gap-4 pl-8 z-20" style={{ left: '30px' }}>
                            {transformedChartData.map((entry, index) => {
                                const barHeight = maxValue > 0 ? (entry.value / chartMaxValue) * 100 : 0;
                                // Find matching menu item to get the icon - prioritize by index, then by label match, then by value
                                const matchingMenuItem = menuItems[index] ||
                                    menuItems.find(item =>
                                        item.label === entry.fullName ||
                                        item.label === entry.name ||
                                        (chartData && item.count === entry.value)
                                    );
                                const iconName = matchingMenuItem?.iconName || entry.iconName;
                                const IconComponent = iconName ? getMUIIcon(iconName, 18) : null;
                                const isHovered = hoveredIndex === index;

                                return (
                                    <div
                                        key={`bar-${index}`}
                                        className="flex flex-col items-center relative cursor-pointer"
                                        style={{
                                            flex: '1',
                                            height: '100%',
                                            maxWidth: '80px'
                                        }}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {/* Thermometer Bar - Positioned from bottom at 0 */}
                                        <div
                                            className="absolute bottom-0 w-full rounded-t-lg transition-all duration-300"
                                            style={{
                                                height: `${barHeight}%`,
                                                backgroundColor: entry.color,
                                                minHeight: '4px',
                                                opacity: isHovered ? 0.9 : 1,
                                                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                                boxShadow: isHovered ? `0 4px 12px ${entry.color}80` : 'none',
                                            }}
                                        >
                                        </div>

                                        {/* Icon on top of the bar */}
                                        {IconComponent && (
                                            <div
                                                className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center rounded-full z-30"
                                                style={{
                                                    bottom: `${barHeight}%`,
                                                    width: '32px',
                                                    height: '32px',
                                                    backgroundColor: 'rgba(128, 128, 128, 0.9)',
                                                    padding: '6px',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                                                    marginBottom: '4px',
                                                }}
                                            >
                                                {IconComponent}
                                            </div>
                                        )}

                                        {/* Tooltip on hover - positioned at bottom of chart */}
                                        {isHovered && (
                                            <div
                                                className="absolute left-1/2 transform -translate-x-1/2 px-2 py-1 rounded bg-black bg-opacity-80 text-white text-xs whitespace-nowrap z-40"
                                                style={{
                                                    pointerEvents: 'none',
                                                    bottom: '4px'
                                                }}
                                            >
                                                {entry.fullName || entry.name}: {formatCount(entry.value, matchingMenuItem?.id)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoansAppTray;
