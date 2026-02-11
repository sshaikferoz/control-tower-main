import React, { useEffect, useRef, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface ColumnChartProps {
    data: {
        name: string;
        [key: string]: string | number;
    }[];
    title: string;
    totalValue?: string;
    series: {
        name: string;
        dataKey: string;
        color: string;
    }[];
    color?: string;
    setChangeColor?: (color: string) => void;
}

const ColumnChart = ({
    data = [],
    title = 'Chart',
    totalValue = '',
    series = [],
    color,
    setChangeColor,
}: ColumnChartProps) => {
    const [userColor, setUserColor] = useState<string | null>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);

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

    const safeData = data || [];
    const safeSeries = series || [];

    const sampleData = [
        { name: 'Jan', sales: 1200000, marketing: 800000, operations: 650000 },
        { name: 'Feb', sales: 950000, marketing: 720000, operations: 500000 },
        { name: 'Mar', sales: 2100000, marketing: 1600000, operations: 900000 },
        { name: 'Apr', sales: 1780000, marketing: 1200000, operations: 870000 },
        { name: 'May', sales: 2500000, marketing: 1900000, operations: 1100000 },
    ];

    const sampleSeries = [
        { name: 'Sales', dataKey: 'sales', color: '#8884d8' },
        { name: 'Marketing', dataKey: 'marketing', color: '#82ca9d' },
        { name: 'Operations', dataKey: 'operations', color: '#ffc658' },
    ];

    const displayData = safeData.length > 0 ? safeData : sampleData;
    const displaySeries = safeSeries.length > 0 ? safeSeries : sampleSeries;

    const formatNumber = (num: number) => {
        if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
        if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
        return num.toString();
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
                        <h3 className="[font-family:'Ghawar-Hefty',Helvetica] text-base font-normal text-white">
                            {title}
                        </h3>
                    </div>
                    {totalValue && (
                        <div className="flex flex-col items-center">
                            <span className="[font-family:'Ghawar-SmeiBold',Helvetica] text-xl font-bold whitespace-nowrap text-white">
                                {totalValue}
                            </span>
                            <span className="[font-family:'Ghawar-Regular',Helvetica] text-sm font-normal text-white">
                                Total Value
                            </span>
                        </div>
                    )}
                </div>

                {/* ✅ Chart (legend included inside) */}
                <div className="relative min-h-[180px] flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={displayData}
                            margin={{ top: 10, right: 20, left: 50, bottom: 25 }} // bottom space for legend
                            barSize={40}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff30" />
                            <XAxis
                                dataKey="name"
                                axisLine={{ stroke: '#ffffff50' }}
                                tick={{ fill: '#ffffff', fontSize: 12 }}
                                tickLine={{ stroke: '#ffffff50' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#ffffff', fontSize: 12 }}
                                tickFormatter={(value) => formatNumber(Number(value))}
                                width={55}
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
                            {/* ✅ Built-in Legend (auto fits even in small widgets) */}
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                wrapperStyle={{
                                    color: '#ffffff',
                                    fontSize: 12,
                                    paddingTop: '4px',
                                }}
                            />
                            {displaySeries.map((item, index) => (
                                <Bar key={index} dataKey={item.dataKey} fill={item.color} radius={[4, 4, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
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

export default ColumnChart;
