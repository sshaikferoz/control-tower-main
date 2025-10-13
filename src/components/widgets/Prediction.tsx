import React, { useEffect, useRef, useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PredictionChartProps {
  data?: {
    name: string;
    actual?: number;
    predicted?: number;
    forecastUpper?: number;
    forecastLower?: number;
  }[];
  title?: string;
  totalValue?: string;
  color?: string;
  setChangeColor?: (color: string) => void;
}

const PredictionChart = ({
  data,
  title = 'Prediction Chart',
  totalValue = '',
  color,
  setChangeColor,
}: PredictionChartProps) => {
  const [userColor, setUserColor] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const defaultBaseColor = 'transparent';
  const defaultLighterColor = '#00214e';
  const actualLineColor = '#8884d8';
  const predictedLineColor = '#82ca9d';
  const forecastColor = '#FFA500';

  useEffect(() => {
    if (color && !userColor) {
      setUserColor(color);
    }
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

  // Default data if none provided
  const sourceData = data || [
    { name: 'Jan', actual: 4000, forecastUpper: null, forecastLower: null },
    { name: 'Feb', actual: 3000, forecastUpper: null, forecastLower: null },
    { name: 'Mar', actual: 2000, forecastUpper: null, forecastLower: null },
    { name: 'Apr', actual: 2780, forecastUpper: null, forecastLower: null },
    { name: 'May', actual: 1890, forecastUpper: 1890, forecastLower: 1890 },
    { name: 'Jun', predicted: 2800, forecastUpper: 3500, forecastLower: 2100 },
    { name: 'Jul', predicted: 3200, forecastUpper: 4000, forecastLower: 2400 },
    { name: 'Aug', predicted: 3600, forecastUpper: 4500, forecastLower: 2700 },
  ];

  // Find transition point (last actual data point)
  const lastActualIndex = sourceData.findIndex((item, index) => {
    const nextItem = sourceData[index + 1];
    return item.actual !== undefined && nextItem?.actual === undefined;
  });

  const hasTransition = lastActualIndex >= 0;

  // Calculate gradient percentage for transition
  const lastIntervalPercent = hasTransition ? (lastActualIndex * 100) / (sourceData.length - 1) : 0;

  // Combine actual and predicted into single dataKey
  const displayData = sourceData.map((item) => ({
    ...item,
    value: item.actual !== undefined ? item.actual : item.predicted,
  }));

  // Gradient definitions
  const gradientTwoColors = (id: string, col1: string, col2: string, percentChange: number) => (
    <linearGradient id={id} x1="0" y1="0" x2="100%" y2="0">
      <stop offset="0%" stopColor={col1} />
      <stop offset={`${percentChange}%`} stopColor={col1} />
      <stop offset={`${percentChange}%`} stopColor={col2} />
      <stop offset="100%" stopColor={col2} />
    </linearGradient>
  );

  const tooltipFormatter = (value: any, name: string) => {
    if (name.includes('_noTooltip')) {
      return [];
    }
    const formatValue = typeof value === 'number' ? value.toFixed(0) : value;
    return [formatValue, name];
  };

  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl p-4 text-white" style={backgroundStyle}>
        {/* Header */}
        <div className="flex justify-between">
          <div className="flex flex-col items-start gap-[5px]">
            <h3 className="text-base font-normal text-white">{title}</h3>
          </div>

          {totalValue && (
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold whitespace-nowrap text-white">{totalValue}</span>
              <span className="text-sm font-normal text-white">Total Value</span>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="mt-4 h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <defs>
                {/* Forecast band gradient */}
                <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={forecastColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={forecastColor} stopOpacity={0.05} />
                </linearGradient>

                {/* Gradient to hide everything except last segment (for dashed line) */}
                {gradientTwoColors(
                  'hideAllButLastInterval',
                  'rgba(0,0,0,0)',
                  predictedLineColor,
                  lastIntervalPercent
                )}

                {/* Gradient to hide just last segment (for solid line) */}
                {gradientTwoColors(
                  'hideJustLastInterval',
                  actualLineColor,
                  'rgba(0,0,0,0)',
                  lastIntervalPercent
                )}
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: '#ffffff50' }}
                tick={{ fill: '#ffffff', fontSize: 12 }}
                tickLine={{ stroke: '#ffffff50' }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff', fontSize: 12 }} />
              <Tooltip
                formatter={tooltipFormatter}
                contentStyle={{
                  backgroundColor: '#1E3A71',
                  border: '1px solid #00a3e0',
                  borderRadius: '8px',
                  color: '#ffffff',
                }}
              />

              {/* Forecast shaded band */}
              <Area
                type="monotone"
                dataKey="forecastUpper"
                stroke="none"
                fill="url(#forecastBand)"
                fillOpacity={1}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="forecastLower"
                stroke="none"
                fill={baseColor}
                fillOpacity={1}
                activeDot={false}
              />

              {/* Hidden base lines for tooltip */}
              <Line
                type="monotone"
                dataKey="actual"
                strokeDasharray="0 100"
                stroke="transparent"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                strokeDasharray="0 100"
                stroke="transparent"
                dot={false}
              />

              {/* Solid line for actual data (hidden after transition) */}
              <Line
                name="actual_noTooltip"
                type="monotone"
                dataKey="value"
                stroke="url(#hideJustLastInterval)"
                strokeWidth={2}
                dot={{ fill: actualLineColor, r: 4 }}
                activeDot={{ r: 6 }}
              />

              {/* Dashed line for predicted data (hidden before transition) */}
              <Line
                name="predicted_noTooltip"
                type="monotone"
                dataKey="value"
                stroke="url(#hideAllButLastInterval)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: predictedLineColor, r: 4 }}
                activeDot={{ r: 6 }}
              />

              {/* Forecast boundaries */}
              <Line
                type="monotone"
                dataKey="forecastUpper"
                stroke={forecastColor}
                strokeWidth={1}
                dot={false}
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="forecastLower"
                stroke={forecastColor}
                strokeWidth={1}
                dot={false}
                strokeDasharray="3 3"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-[5px]">
            <div
              className="h-[9px] w-[9px] rounded-full"
              style={{ backgroundColor: actualLineColor }}
            />
            <div className="text-sm font-normal text-[#ffffff]">Actual</div>
          </div>
          <div className="flex items-center gap-[5px]">
            <div
              className="h-[9px] w-[9px] rounded-full"
              style={{ backgroundColor: predictedLineColor }}
            />
            <div className="text-sm font-normal text-[#ffffff]">Predicted</div>
          </div>
          <div className="flex items-center gap-[5px]">
            <div
              className="h-[9px] w-[9px] rounded-full"
              style={{ backgroundColor: forecastColor }}
            />
            <div className="text-sm font-normal text-[#ffffff]">Forecast Range</div>
          </div>
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

export default PredictionChart;
