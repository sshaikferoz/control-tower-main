import React, { useEffect, useRef, useState } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataItem {
  date: string;
  Actual: number;
  unit: string;
}

interface ChartProps {
  data: {
    chart_data: ChartDataItem[];
    chart_yaxis: string;
  };
  widget_name: string;
  color?: string;
  setChangeColor?: (color: string) => void;
}

const SingleLineChart = ({ widget_name, data, color, setChangeColor }: ChartProps) => {
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
    cursor: 'pointer',
  };

  const highlightIndex = data?.chart_data?.length - 2;
  const highlightData = data?.chart_data?.[highlightIndex];

  // ✅ Aramco number formatter
  const formatAramcoValue = (num: number) => {
    if (num === null || num === undefined || isNaN(num)) return '-';
    const abs = Math.abs(num);
    const round = (val: number, decimals = 1) =>
      Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);

    if (abs >= 1_000_000_000) {
      return `${round(num / 1_000_000_000, 2)}B`;
    } else if (abs >= 1_000_000) {
      return `${round(num / 1_000_000, 1)}MM`;
    } else if (abs >= 1_000) {
      return `${round(num / 1_000, 1)}M`;
    }
    return `${round(num, 2)}`;
  };

  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl p-4 text-white" style={backgroundStyle}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold">{widget_name}</h3>
        </div>

        {/* ✅ Chart fills available height */}
        <div className="flex h-[calc(100%-2rem)] items-center justify-center rounded pt-4">
          <ChartContainer
            config={{
              [data?.chart_yaxis]: {
                label: data?.chart_yaxis,
                color: 'var(--primary1)',
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                accessibilityLayer
                data={data?.chart_data}
                margin={{ top: 20, right: 20, left: 40, bottom: 20 }}
              >
                <YAxis
                  orientation="right"
                  tick={{ fill: 'white', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatAramcoValue(Number(value))}
                  width={60}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'white', fontSize: 12 }}
                  tickLine={false}
                  axisLine={true}
                  tickMargin={8}
                />

                {highlightData && (
                  <>
                    <ReferenceArea
                      x1={highlightData?.date}
                      x2={highlightData?.date}
                      strokeOpacity={0.1}
                      fill={baseColor}
                      fillOpacity={0.2}
                    />
                    <ReferenceLine
                      x={highlightData?.date}
                      stroke={baseColor}
                      strokeDasharray="10 10"
                    />
                  </>
                )}

                <Line
                  dataKey={data?.chart_yaxis}
                  type="linear"
                  fill={baseColor}
                  stroke={baseColor}
                  strokeWidth={2}
                  dot={{
                    r: 6,
                    fill: '#ffffff',
                    stroke: baseColor,
                    strokeWidth: 4,
                  }}
                  activeDot={{
                    fill: baseColor,
                    stroke: '#ffffff',
                    strokeWidth: 4,
                    r: 6,
                  }}
                />

                {/* ✅ Tooltip formatted with Aramco logic */}
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value: any) => formatAramcoValue(Number(value))}
                    />
                  }
                  cursor={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
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

export default SingleLineChart;
