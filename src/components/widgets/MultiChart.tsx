import React, { useEffect, useRef, useState } from 'react';
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
}

interface MultiChartProps {
  data: {
    name: string;
    label?: string;
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
  valueFormat?: 'currency' | 'non-currency'; // NEW
  typography?: any;
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
  valueFormat = 'non-currency', // NEW - default to non-currency
  typography,
}) => {
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

  // Filter data by selected labels if applicable
  const filteredData =
    selectedLabels && selectedLabels.length > 0
      ? data.filter((item) => item.label && selectedLabels.includes(item.label as string))
      : data;

  // Group data by label if label field exists
  const hasLabels = data.some((item) => item.label !== undefined);
  const groupedData = hasLabels
    ? selectedLabels.reduce(
        (acc, label) => {
          const labelData = data.filter((item) => item.label === label);
          if (labelData.length > 0) {
            acc[label] = labelData;
          }
          return acc;
        },
        {} as Record<string, typeof data>
      )
    : null;

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

  const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

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
                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px' }}
              />
            )}
            {series.map((s, idx) => (
              <Line
                key={idx}
                type="monotone"
                dataKey={s.dataKey}
                stroke={s.color || defaultColors[idx % defaultColors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                name={s.name}
              />
            ))}
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
                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px' }}
              />
            )}
            {series.map((s, idx) => (
              <Bar
                key={idx}
                dataKey={s.dataKey}
                fill={s.color || defaultColors[idx % defaultColors.length]}
                radius={[4, 4, 0, 0]}
                name={s.name}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
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
                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px' }}
              />
            )}
            {series.map((s, idx) => (
              <Area
                key={idx}
                type="monotone"
                dataKey={s.dataKey}
                stroke={s.color || defaultColors[idx % defaultColors.length]}
                fill={s.color || defaultColors[idx % defaultColors.length]}
                fillOpacity={0.6}
                name={s.name}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
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
                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px' }}
              />
            )}
            {series.map((s, idx) => {
              const color = s.color || defaultColors[idx % defaultColors.length];
              const componentType = s.type || 'line';

              if (componentType === 'bar') {
                return (
                  <Bar
                    key={idx}
                    dataKey={s.dataKey}
                    fill={color}
                    radius={[4, 4, 0, 0]}
                    name={s.name}
                  />
                );
              } else if (componentType === 'area') {
                return (
                  <Area
                    key={idx}
                    type="monotone"
                    dataKey={s.dataKey}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.6}
                    name={s.name}
                  />
                );
              } else {
                return (
                  <Line
                    key={idx}
                    type="monotone"
                    dataKey={s.dataKey}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name={s.name}
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
                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px' }}
              />
            )}
            {series.map((s, idx) => (
              <Scatter
                key={idx}
                name={s.name}
                dataKey={s.dataKey}
                fill={s.color || defaultColors[idx % defaultColors.length]}
              />
            ))}
          </ScatterChart>
        );

      case 'pie':
        // For pie charts, use the first series
        const pieData = filteredData.map((item, idx) => ({
          name: item.name,
          value: Number(item[series[0]?.dataKey || 'value'] || 0),
          fill: series[idx]?.color || defaultColors[idx % defaultColors.length],
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
                wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: '4px' }}
              />
            )}
            {series.map((s, idx) => (
              <Radar
                key={idx}
                name={s.name}
                dataKey={s.dataKey}
                stroke={s.color || defaultColors[idx % defaultColors.length]}
                fill={s.color || defaultColors[idx % defaultColors.length]}
                fillOpacity={0.6}
              />
            ))}
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
            <h3 className="text-base font-normal text-white" style={getTitleStyle()}>
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
        {hasLabels && selectedLabels.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedLabels.map((label, idx) => (
              <span
                key={idx}
                className="bg-opacity-20 rounded-full bg-white px-3 py-1 text-xs text-white"
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
