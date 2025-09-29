import React, { useEffect, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface BarMetricProps {
  data: {
    name: string;
    value: number;
    fill?: string;
    background?: string;
    opacity?: number;
  }[];
  title: string;
  variance?: string;
  color?: string;
  setChangeColor?: (color: string) => void;
}

const BarMetric = ({ data, title, variance = '+0.00%', color, setChangeColor }: BarMetricProps) => {
  const [userColor, setUserColor] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

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

  // Dynamically calculate max Y axis value
  const maxValue = Math.max(...data.map((item) => item.value)) * 1.2;

  return (
    <div className="h-full w-full">
      <div
        className="h-full rounded-xl p-4 text-white"
        style={backgroundStyle}
        // onClick={handleDivClick}
      >
        <div className="p-3">
          <div className="flex h-full w-full flex-col items-center gap-2.5">
            {/* Header */}
            <div className="flex h-8 w-full items-center justify-between px-2">
              <h3 className="font-sans text-base font-normal text-white">{title}</h3>
              <div className="flex items-center gap-2"></div>
            </div>

            {/* Chart */}
            <div className="flex h-48 w-full flex-col items-start">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'white', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                  />
                  <YAxis
                    tick={{ fill: 'white', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                    domain={[0, maxValue]}
                  />
                  <Bar
                    dataKey="value"
                    fill="#83bd01cc"
                    radius={[0, 0, 0, 0]}
                    label={{
                      position: 'top',
                      fill: 'white',
                      formatter: (value: any) => `${value}`,
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}
                    isAnimationActive={true}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
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

export default BarMetric;
