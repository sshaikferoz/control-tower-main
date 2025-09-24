import React, { useEffect, useRef, useState } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

import { LineChart, Line, XAxis, YAxis, ReferenceArea, ReferenceLine } from 'recharts';

interface ChartDataItem {
  date: string;
  Actual: number;
  unit: string;
}

interface ChartProps {
  data: {
    chart_data: ChartDataItem[];
    chart_yaxis: string;
    widget_name: string;
  };
  color?: string;
  setChangeColor?: (color: string) => void;
}

const SingleLineChart = ({ data, color, setChangeColor }: ChartProps) => {
  const [userColor, setUserColor] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // ✅ Use same default colors as in SimpleMetricDate
  const defaultBaseColor = '#00214E';
  const defaultLighterColor = '#0164B0';

  useEffect(() => {
    if (color && !userColor) {
      setUserColor(color);
    }
  }, [color]);

  const handleDivClick = () => {
    colorInputRef.current?.click();
  };

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

  return (
    <div className="h-full w-full">
      <div
        className="h-full rounded-xl p-4 text-white"
        style={backgroundStyle}
        // onClick={handleDivClick}
      >
        <div className="flex justify-between">
          <h3 className="flex items-center text-lg font-semibold">{data?.widget_name}</h3>
        </div>

        <div className="flex items-center justify-center rounded pt-8">
          <ChartContainer
            config={{
              [data?.chart_yaxis]: {
                label: data?.chart_yaxis,
                color: 'var(--primary1)',
              },
            }}
            className="h-[140px] w-full"
          >
            <LineChart
              accessibilityLayer
              margin={{ left: 10, right: 0, top: 10 }}
              data={data?.chart_data}
            >
              <YAxis
                orientation="right"
                tick={{ fill: 'white' }}
                tickLine={false}
                axisLine={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: 'white' }}
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

              <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} />
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      {/* 🎨 Hidden Color Picker */}
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
