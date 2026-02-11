import React, { useState, useEffect, useRef } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { HexColorPicker } from 'react-colorful';

interface OrdersLineChartProps {
    data: {
        name: string;
        value: number;
    }[];
    title: string;
    color?: string;
    setChangeColor?: (color: string) => void;
}

const OrdersLineChart = ({ data, title }: OrdersLineChartProps) => {
    const [bgColor, setBgColor] = useState('#00214E'); // background color
    const [lineColor, setLineColor] = useState('#0164B0'); // line color
    const [showBgPicker, setShowBgPicker] = useState(false);
    const [showLinePicker, setShowLinePicker] = useState(false);
    const bgPickerRef = useRef<HTMLDivElement>(null);
    const linePickerRef = useRef<HTMLDivElement>(null);

    const lighterBgColor = `${bgColor}80`;

    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${bgColor}, ${lighterBgColor})`,
        color: '#ffffff',
        cursor: 'pointer',
    };

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (bgPickerRef.current && !bgPickerRef.current.contains(e.target as Node)) {
                setShowBgPicker(false);
            }
            if (linePickerRef.current && !linePickerRef.current.contains(e.target as Node)) {
                setShowLinePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative h-full w-full">
            <div className="h-full rounded-xl p-4" style={backgroundStyle}>
                <div className="flex w-full items-start justify-between">
                    <h3 className="text-base font-bold text-white">{title}</h3>

                    {/* Buttons to open color pickers */}
                    {/* <div className="flex gap-2">
            <button
              className="text-sm px-2 py-1 bg-white text-black rounded"
              onClick={() => setShowBgPicker(true)}
            >
              Background
            </button>
            <button
              className="text-sm px-2 py-1 bg-white text-black rounded"
              onClick={() => setShowLinePicker(true)}
            >
              Line
            </button>
          </div> */}
                </div>

                <div className="mt-4 h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
                            <XAxis dataKey="name" tick={{ fill: '#ffffff' }} axisLine={{ stroke: '#ffffff50' }} />
                            <YAxis tick={{ fill: '#ffffff' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1E3A71',
                                    border: '1px solid #00a3e0',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={lineColor} // dynamic line color
                                strokeWidth={2}
                                dot={{
                                    r: 4,
                                    fill: lineColor,
                                    stroke: '#ffffff',
                                    strokeWidth: 2,
                                }}
                                activeDot={{
                                    r: 6,
                                    fill: lineColor,
                                    stroke: '#ffffff',
                                    strokeWidth: 2,
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Background Color Picker */}
            {showBgPicker && (
                <div
                    ref={bgPickerRef}
                    className="absolute top-full left-[10%] z-50 mt-2 rounded bg-white p-2 shadow-lg"
                >
                    <HexColorPicker color={bgColor} onChange={setBgColor} />
                    <div className="mt-2 text-center text-sm text-black">{bgColor}</div>
                </div>
            )}

            {/* Line Color Picker */}
            {showLinePicker && (
                <div
                    ref={linePickerRef}
                    className="absolute top-full left-[70%] z-50 mt-2 rounded bg-white p-2 shadow-lg"
                >
                    <HexColorPicker color={lineColor} onChange={setLineColor} />
                    <div className="mt-2 text-center text-sm text-black">{lineColor}</div>
                </div>
            )}
        </div>
    );
};

export default OrdersLineChart;
