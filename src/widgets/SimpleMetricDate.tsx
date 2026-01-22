import { WidgetTypographyConfig } from '@/helpers/types';
import { getCleanTypographyStyles } from '@/helpers/typographyHelper';
import React, { useEffect, useRef, useState } from 'react';

interface SimpleMetricDateProps {
  name: string;
  value: number;
  date: string;
  color?: string; // Optional external color
  typography?: WidgetTypographyConfig;
  setChangeColor?: (color: string) => void;
}

const SimpleMetricDate = ({
  name,
  value,
  date,
  color,
  setChangeColor,
  typography,
}: SimpleMetricDateProps) => {
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

  return (
    <div className="h-full w-full">
      <div
        className="h-full rounded-xl p-4"
        style={backgroundStyle}
        // onClick={handleDivClick}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-4xl font-bold"
            style={{ ...getCleanTypographyStyles('value', typography) }}
          >
            {value}
          </h2>
          <span className="text-[13px]" style={{ ...getCleanTypographyStyles('date', typography) }}>
            {date}
          </span>
        </div>
        <p style={{ ...getCleanTypographyStyles('name', typography) }}>{name}</p>
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

export default SimpleMetricDate;
