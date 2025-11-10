import React, { JSX } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as MUIIcons from '@mui/icons-material';

interface LoansAppTrayProps {
    menuItems?: {
        id: number;
        iconName?: string;
        icon?: string;
        label: string;
        count: number;
        color?: string;
    }[];
    chartData?: {
        name: string;
        value: number;
        color: string;
        iconName?: string;
    }[];
    menuItemConfigs?: {
        [key: number]: {
            reportName?: string;
            queryConfig?: any;
        };
    };
    chartDataConfig?: {
        reportName?: string;
        chartConfig?: any;
    };
}

// Helper function to get MUI icon component by name
const getMUIIcon = (iconName: string) => {
    if (!iconName) return null;

    const IconComponent = (MUIIcons as any)[iconName];
    return IconComponent
        ? React.createElement(IconComponent, {
            style: { width: '21.67px', height: '21.67px', color: 'white' },
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
    // Use chartData if provided, otherwise transform menuItems into chart data format
    const transformedChartData = chartData || menuItems.map((item, index) => ({
        name: truncateText(item.label.replace(/\n/g, ' '), 15),
        fullName: item.label.replace(/\n/g, ' '),
        value: item.count,
        color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        iconName: item.iconName,
    }));

    // Calculate max value for scaling
    const maxValue = Math.max(...transformedChartData.map((d) => d.value), 1);
    const chartMaxValue = Math.ceil(maxValue * 1.2 / 20) * 20; // Round up to nearest 20

    return (
        <div className="h-full w-full">
            <div className="h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white flex">
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

                                <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#1E3A71] flex-shrink-0">
                                    <span className="relative w-fit [font-family:'Roboto',Helvetica] text-sm leading-[18px] font-semibold tracking-[0] whitespace-nowrap text-white">
                                        {item.count}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Panel - Thermometer-style Bars */}
                <div className="flex-1 relative flex items-end justify-center gap-4" style={{ height: '100%' }}>
                    {/* Y-Axis Labels */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pr-2" style={{ width: '30px' }}>
                        {Array.from({ length: Math.floor(chartMaxValue / 20) + 1 }, (_, i) => {
                            const value = chartMaxValue - (i * 20);
                            return (
                                <div 
                                    key={value}
                                    className="text-xs text-white"
                                    style={{ 
                                        position: 'absolute',
                                        bottom: `${(i * 20 / chartMaxValue) * 100}%`,
                                        transform: 'translateY(50%)'
                                    }}
                                >
                                    {value}
                                </div>
                            );
                        })}
                    </div>

                    {/* Bars Container */}
                    <div className="flex-1 flex items-end justify-center gap-4 h-full pl-8">
                        {transformedChartData.map((entry, index) => {
                            const barHeight = maxValue > 0 ? (entry.value / chartMaxValue) * 100 : 0;
                            const IconComponent = entry.iconName ? getMUIIcon(entry.iconName) : null;
                            
                            return (
                                <div
                                    key={`bar-${index}`}
                                    className="flex flex-col items-center relative"
                                    style={{ 
                                        flex: '1',
                                        height: '100%',
                                        maxWidth: '80px'
                                    }}
                                >
                                    {/* Thermometer Bar */}
                                    <div 
                                        className="relative w-full rounded-t-lg flex-shrink-0"
                                        style={{
                                            height: `${barHeight}%`,
                                            backgroundColor: entry.color,
                                            minHeight: '4px',
                                            transition: 'height 0.3s ease',
                                        }}
                                    />
                                    
                                    {/* Icon at Base */}
                                    <div 
                                        className="absolute bottom-0 flex items-center justify-center"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                        }}
                                    >
                                        {IconComponent ? (
                                            <div
                                                className="flex items-center justify-center rounded-full"
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    backgroundColor: 'rgba(128, 128, 128, 0.8)',
                                                    padding: '6px',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                                }}
                                            >
                                                {IconComponent}
                                            </div>
                                        ) : (
                                            <div
                                                className="flex items-center justify-center rounded-full"
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    backgroundColor: 'rgba(128, 128, 128, 0.8)',
                                                    padding: '6px',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                                }}
                                            >
                                                <span style={{ color: 'white', fontSize: '16px' }}>●</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoansAppTray;
