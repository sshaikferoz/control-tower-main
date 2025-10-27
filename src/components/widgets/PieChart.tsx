import React, { useEffect, useRef, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PieChartProps {
  data: {
    label: string;
    value: number;
    fill?: string;
  }[];
  title: string;
  color?: string;
  setChangeColor?: (color: string) => void;
}

const PieChartComponent = ({
  data = [],
  title = 'Chart',
  color,
  setChangeColor,
}: PieChartProps) => {
  const [userColor, setUserColor] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Same default colors as StackedBarChart
  const defaultBaseColor = '#00214E';
  const defaultLighterColor = '#0164B0';

  // Default pie colors matching the reference image
  const defaultPieColors = ['#FF6B00', '#FFD700', '#E91E63', '#424242', '#9E9E9E'];

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

  // Ensure each data item has a fill color
  const dataWithColors = safeData.map((item, index) => ({
    ...item,
    fill: item.fill || defaultPieColors[index % defaultPieColors.length],
  }));

  // Calculate total for percentage calculation
  const total = dataWithColors.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      return (
        <div
          style={{
            backgroundColor: '#1E3A71',
            border: '1px solid #00a3e0',
            borderRadius: '8px',
            padding: '8px',
            color: '#ffffff',
          }}
        >
          <p>{`${data.label}: ${data.value} (${percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full">
      <div
        className="h-full overflow-auto rounded-xl p-4 text-white"
        style={backgroundStyle}
        // onClick={handleDivClick}
      >
        {/* Title */}
        <div className="mb-4">
          <h3 className="[font-family:'Ghawar-Hefty',Helvetica] text-base font-bold text-white">
            {title}
          </h3>
        </div>

        {/* Chart and Legend Container */}
        <div className="flex flex-row flex-wrap items-center justify-between gap-1 md:flex-nowrap">
          {/* Pie Chart */}
          <div className="h-44 min-w-2/3 flex-1">
            {dataWithColors.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataWithColors}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    dataKey="value"
                    stroke="none"
                  >
                    {dataWithColors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-white opacity-70">No data available</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-5 flex min-w-1/3 flex-1 flex-col gap-3 overflow-auto md:mt-0">
            {dataWithColors.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-4 w-4 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: item.fill }}
                />
                <div className="[font-family:'Ghawar-Regular',Helvetica] text-sm font-normal break-words text-white">
                  {item.label}
                </div>
              </div>
            ))}
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

export default PieChartComponent;
