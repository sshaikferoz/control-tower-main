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

interface HeaderField {
  type: string;
  fieldName: string;
  label?: string;
  axisType?: string;
}

interface SeriesConfig { 
  name: string;
  dataKey: string;
  color: string;
  type?: 'line' | 'bar' | 'area';
}

interface MultiChartProps {
  data: any[];
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
  header?: HeaderField[];
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
  header = [],
}) => {
  const [userColor, setUserColor] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // --- 🎯 Auto detect x-axis key dynamically
  const xKey = useMemo(() => {
    if (!data || data.length === 0) return 'x';

    // Prefer CHA type fields from header (non-KF)
    const charField =
      header.find((h) => h.type === 'CHA' && h.fieldName && h.axisType === 'ROW')?.fieldName ??
      Object.keys(data[0]).find(
        (key) =>
          key.toLowerCase().includes('month') ||
          key.toLowerCase().includes('date') ||
          key.toLowerCase().includes('struct')
      ) ??
      Object.keys(data[0])[0];

    return charField;
  }, [data, header]);

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

  const filteredData =
    selectedLabels && selectedLabels.length > 0
      ? data.filter((item) => item.label && selectedLabels.includes(item.label as string))
      : data;

  const formatNumber = (num: number) => {
    if (isNaN(num)) return '-';
    if (valueFormat === 'currency') {
      if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
      if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}MM`;
      if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}M`;
      return `$${num}`;
    } else {
      if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
      if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
      if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
      return num.toString();
    }
  };

  const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  const getTitleStyle = () =>
    typography?.title
      ? {
          fontFamily: typography.title.fontFamily,
          fontSize: typography.title.fontSize,
          fontWeight: typography.title.fontWeight,
          color: typography.title.color || '#ffffff',
          textAlign: typography.title.textAlign,
          textTransform: typography.title.textTransform,
        }
      : {};

  const getValueStyle = () =>
    typography?.value
      ? {
          fontFamily: typography.value.fontFamily,
          fontSize: typography.value.fontSize,
          fontWeight: typography.value.fontWeight,
          color: typography.value.color || '#ffffff',
          textAlign: typography.value.textAlign,
        }
      : {};

  const commonProps = {
    data: filteredData,
    margin: { top: 10, right: 20, left: 50, bottom: showLegend ? 35 : 25 },
  };

  const commonAxisProps = {
    axisLine: { stroke: '#ffffff50' },
    tick: { fill: '#ffffff', fontSize: 12 },
    tickLine: { stroke: '#ffffff50' },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff30" />
            <XAxis dataKey={xKey} {...commonAxisProps} />
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
                wrapperStyle={{ color: '#ffffff', fontSize: 12 }}
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
      case 'horizontal-bar': {
        const isHorizontal = chartType === 'horizontal-bar';
        return (
          <BarChart {...commonProps} layout={isHorizontal ? 'vertical' : 'horizontal'} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff30" />
            {isHorizontal ? (
              <>
                <XAxis type="number" {...commonAxisProps} tickFormatter={formatNumber} />
                <YAxis dataKey={xKey} type="category" {...commonAxisProps} width={100} />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} {...commonAxisProps} />
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
                wrapperStyle={{ color: '#ffffff', fontSize: 12 }}
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
      }

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff30" />
            <XAxis dataKey={xKey} {...commonAxisProps} />
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
                wrapperStyle={{ color: '#ffffff', fontSize: 12 }}
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
            <XAxis dataKey={xKey} {...commonAxisProps} />
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
                wrapperStyle={{ color: '#ffffff', fontSize: 12 }}
              />
            )}
            {series.map((s, idx) => {
              const color = s.color || defaultColors[idx % defaultColors.length];
              if (s.type === 'bar')
                return (
                  <Bar
                    key={idx}
                    dataKey={s.dataKey}
                    fill={color}
                    radius={[4, 4, 0, 0]}
                    name={s.name}
                  />
                );
              if (s.type === 'area')
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
            })}
          </ComposedChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
            <XAxis dataKey={xKey} {...commonAxisProps} />
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
                wrapperStyle={{ color: '#ffffff', fontSize: 12 }}
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

      case 'pie': {
        const pieData = filteredData.map((item, idx) => ({
          name: item[xKey],
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
      }

      case 'radar':
        return (
          <RadarChart {...commonProps}>
            <PolarGrid stroke="#ffffff50" />
            <PolarAngleAxis dataKey={xKey} tick={{ fill: '#ffffff', fontSize: 12 }} />
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
                wrapperStyle={{ color: '#ffffff', fontSize: 12 }}
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
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-base font-normal text-white" style={getTitleStyle()}>
            {title}
          </h3>
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

        {/* Chart */}
        <div className="relative min-h-[180px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart() || <></>}
          </ResponsiveContainer>
        </div>
      </div>

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
