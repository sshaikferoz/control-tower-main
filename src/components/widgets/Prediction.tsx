import React, { useEffect, useRef, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PredictionChartProps {
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

const PredictionChart = ({
  data = [],
  title = 'Prediction Chart',
  totalValue = '',
  series = [],
  color,
  setChangeColor,
}: PredictionChartProps) => {
  const [userColor, setUserColor] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const defaultBaseColor = '#00214E';
  const defaultLighterColor = '#0164B0';

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

  const safeData = data || [];
  const safeSeries = series || [];

  // Sample data for demonstration - showing actual vs predicted values
  const sampleData = [
    { name: 'Jan', actual: 4000, predicted: 3800 },
    { name: 'Feb', actual: 3000, predicted: 3200 },
    { name: 'Mar', actual: 2000, predicted: 2400 },
    { name: 'Apr', actual: 2780, predicted: 2600 },
    { name: 'May', actual: 1890, predicted: 2200 },
    { name: 'Jun', predicted: 2800 },
    { name: 'Jul', predicted: 3200 },
    { name: 'Aug', predicted: 3600 },
  ];

  const sampleSeries = [
    { name: 'Actual', dataKey: 'actual', color: '#8884d8' },
    { name: 'Predicted', dataKey: 'predicted', color: '#82ca9d' },
  ];

  const displayData = safeData.length > 0 ? safeData : sampleData;
  const displaySeries = safeSeries.length > 0 ? safeSeries : sampleSeries;

  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl p-4 text-white" style={backgroundStyle}>
        {/* Header */}
        <div className="flex justify-between">
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

        {/* Chart */}
        <div className="mt-4 h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: '#ffffff50' }}
                tick={{ fill: '#ffffff', fontSize: 12 }}
                tickLine={{ stroke: '#ffffff50' }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E3A71',
                  border: '1px solid #00a3e0',
                  borderRadius: '8px',
                  color: '#ffffff',
                }}
              />
              {displaySeries.map((item, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={item.dataKey}
                  stroke={item.color}
                  strokeWidth={2}
                  dot={{ fill: item.color, r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray={item.name.toLowerCase().includes('predict') ? '5 5' : '0'}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          {displaySeries.map((item, index) => (
            <div key={index} className="flex items-center gap-[5px]">
              <div
                className="h-[9px] w-[9px] rounded-full shadow-[0px_5px_12px_#9c88fb29]"
                style={{ backgroundColor: item.color }}
              />
              <div className="[font-family:'Ghawar-Regular',Helvetica] text-sm font-normal text-[#ffffff]">
                {item.name}
              </div>
            </div>
          ))}
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
