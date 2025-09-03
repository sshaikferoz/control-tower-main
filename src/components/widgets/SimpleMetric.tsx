import React, { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface SimpleMetricProps {
  name: string;
  value: number;
  color?: string;
  setChangeColor?: (color: string) => void;
}

const SimpleMetric = ({ name, value, color, setChangeColor }: SimpleMetricProps) => {
  const [userColor, setUserColor] = useState<string>(color || '#00214E');
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Default colors
  const defaultBaseColor = '#00214E';
  const defaultLighterColor = '#0164B0';

  useEffect(() => {
    if (color && !userColor) {
      setUserColor(color);
    }
  }, [color]);

  const handleColorChange = (selectedColor: string) => {
    setUserColor(selectedColor);
    setChangeColor?.(selectedColor);
  };

  const baseColor = userColor || defaultBaseColor;
  const lighterColor =
    baseColor === defaultBaseColor ? defaultLighterColor : `${baseColor}80`;

  const backgroundStyle = {
    backgroundImage: `linear-gradient(to bottom, ${baseColor}, ${lighterColor})`,
    color: '#ffffff',
    cursor: 'pointer',
  };

  // Close the picker when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div className="relative h-full w-full">
      {/* Card with background */}
      <div
        className="h-full rounded-xl p-4"
        style={backgroundStyle}
        onClick={() => setShowPicker(true)}
      >
        <h2 className="text-4xl font-bold">{value}</h2>
        <p>{name}</p>
      </div>

      {/* Color Picker */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute left-[50%] top-full mt-2 z-50 bg-white p-2 rounded shadow-lg"
        >
          <HexColorPicker color={userColor} onChange={handleColorChange} />
          <div className="text-sm text-black mt-2  text-center">{userColor}</div>
        </div>
      )}
    </div>
  );
};

export default SimpleMetric;
