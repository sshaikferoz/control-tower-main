import React, { useEffect, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StackedColumnProps {
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

const StackedColumn = ({
  data = [],
  title = 'Chart',
  totalValue = '',
  series = [],
  color,
  setChangeColor,
}: StackedColumnProps) => {
  const [userColor, setUserColor] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // ✅ Same default colors as in previous components
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

  const safeData = data || [];
  const safeSeries = series || [];

  // Sample data for demonstration
  const sampleData = [
    { name: 'Jan', sales: 400, marketing: 240, operations: 160 },
    { name: 'Feb', sales: 300, marketing: 139, operations: 180 },
    { name: 'Mar', sales: 200, marketing: 980, operations: 120 },
    { name: 'Apr', sales: 278, marketing: 390, operations: 200 },
    { name: 'May', sales: 189, marketing: 480, operations: 140 },
  ];

  const sampleSeries = [
    { name: 'Sales', dataKey: 'sales', color: '#8884d8' },
    { name: 'Marketing', dataKey: 'marketing', color: '#82ca9d' },
    { name: 'Operations', dataKey: 'operations', color: '#ffc658' },
  ];

  const displayData = safeData.length > 0 ? safeData : sampleData;
  const displaySeries = safeSeries.length > 0 ? safeSeries : sampleSeries;

  return (
    <div className="h-full w-full">
      <div className="h-full overflow-auto rounded-xl p-4 text-white" style={backgroundStyle}>
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
            <BarChart
              data={displayData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff30" />
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
                <Bar key={index} dataKey={item.dataKey} fill={item.color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
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

      {/* 🎨 Hidden color picker */}
      <input
        type="color"
        ref={colorInputRef}
        onChange={handleColorChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default StackedColumn;
