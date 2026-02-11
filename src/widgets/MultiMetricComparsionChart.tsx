'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface DataSeries {
    name: string;
    value: string | number;
    color: string;
}

interface ChartDataPoint {
    period: string;
    [key: string]: string | number; // For dynamic data series
}

interface MultiMetricComparsionChartProps {
    className?: string;
    title?: string;
    subtitle?: string;
    series: DataSeries[];
    data: ChartDataPoint[];
    iconSrc?: string;
    maxValue?: number;
}

const MultiMetricComparsionChart: React.FC<MultiMetricComparsionChartProps> = ({
    className = '',
    title,
    subtitle,
    series,
    data,
    iconSrc,
    maxValue,
}) => {
    // Generate colors map from data series
    const colorsMap = series.reduce(
        (acc, item) => {
            // Extract the color value from the Tailwind class
            let color = item.color;
            if (color.startsWith('bg-[')) {
                color = color.replace('bg-[', '').replace(']', '');
            } else if (color.includes('-')) {
                // This is a fallback for standard Tailwind color classes
                color = '#8979ff'; // Default color if we can't parse
            }
            acc[item.name] = color;
            return acc;
        },
        {} as Record<string, string>
    );

    // Custom tooltip that matches design
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded bg-white p-2 text-xs shadow">
                    <p className="font-bold">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={`tooltip-${index}`} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Custom value label for bars
    const renderCustomizedLabel = (props: any) => {
        const { x, y, width, value } = props;
        return (
            <text
                x={x + width / 2}
                y={y - 5}
                fill="#FFFFFF"
                textAnchor="middle"
                fontSize={10}
                fontFamily="Inter"
            >
                {value}
            </text>
        );
    };

    return (
        <Card
            className={`flex h-[254px] w-full flex-col items-start rounded-xl border border-solid border-[#00a3e0] shadow-[3px_8px_30px_1px_#a8afb84c] md:w-[711px] ${className}`}
            style={{
                background:
                    'linear-gradient(180deg, rgba(30,58,113,1) 25%, rgba(0,128,189,1) 100%), linear-gradient(0deg, rgba(13,54,111,1) 0%, rgba(13,54,111,1) 100%)',
            }}
        >
            <CardContent className="flex h-full w-full flex-col p-3.5">
                {/* Chart Header */}
                <div className="flex w-full justify-between">
                    <div className="flex items-start gap-[17px]">
                        {iconSrc && <img className="h-[18.67px] w-[21px]" alt="Chart Icon" src={iconSrc} />}
                        <div className="flex flex-col gap-[5px]">
                            <div className="text-base font-bold text-[#ffffff]">{title}</div>
                            <div className="text-[11px] font-normal whitespace-nowrap text-[#ffffff]">
                                {subtitle}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-[19px]">
                        {series.map((item, index) => (
                            <div key={index} className="flex flex-col items-center gap-[5px]">
                                <div className="text-xl font-bold whitespace-nowrap text-[#ffffff]">
                                    {item.value}
                                </div>
                                <div className="flex items-center gap-[5px]">
                                    <div
                                        className={`h-[9px] w-[9px] ${item.color} rounded-[4.5px] shadow-[0px_5px_12px_#9c88fb29]`}
                                    />
                                    <div className="text-sm font-normal text-[#ffffff]">{item.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chart Content */}
                <div className="mt-4 h-[179px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 10,
                                left: 0,
                                bottom: 5,
                            }}
                            barGap={2}
                            barCategoryGap={40}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.2)"
                                horizontal={true}
                                vertical={true}
                            />
                            <XAxis
                                dataKey="period"
                                tick={{ fill: '#FFFFFF', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                            />
                            <YAxis
                                tick={{ fill: '#FFFFFF', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                                tickCount={5}
                                domain={[0, maxValue || 'auto']}
                            />
                            <Tooltip content={<CustomTooltip />} />

                            {series.map((item, index) => {
                                // Extract color from the tailwind class or use a default
                                const fillColor = colorsMap[item.name] || '#8979ff';

                                return (
                                    <Bar
                                        key={`bar-${index}`}
                                        dataKey={item.name}
                                        fill={fillColor}
                                        opacity={0.8}
                                        radius={[0, 0, 0, 0]}
                                        barSize={17}
                                    >
                                        <LabelList dataKey={item.name} position="top" content={renderCustomizedLabel} />
                                    </Bar>
                                );
                            })}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default MultiMetricComparsionChart;
