import React, { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface MultiMetricProps {
  metric1: string;
  value1: string;
  metric2: string;
  value2: string;
  color?: string; // Optional prop to set initial color
  setChangeColor?: (color: string) => void; // Callback to notify the parent about the color change
}

const MultiMetrics = ({
  metric1,
  value1,
  metric2,
  value2,
  color,
  setChangeColor,
}: MultiMetricProps) => {
  const [userColor, setUserColor] = useState<string>(color || '#00214E');
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Default colors
  const defaultBaseColor = '#00214E';
  const defaultLighterColor = '#0164B0';

  // Sync color prop with state
  useEffect(() => {
    if (color && !userColor) {
      setUserColor(color);
    }
  }, [color]);

  // Handle color change from the picker
  const handleColorChange = (selectedColor: string) => {
    setUserColor(selectedColor);
    setChangeColor?.(selectedColor); // Notify parent about color change
  };

  // Define background gradient styles based on user-selected color
  const baseColor = userColor || defaultBaseColor;
  const lighterColor = baseColor === defaultBaseColor ? defaultLighterColor : `${baseColor}80`;

  const backgroundStyle = {
    backgroundImage: `linear-gradient(to bottom, ${baseColor}, ${lighterColor})`,
    color: '#ffffff',
    cursor: 'pointer',
  };

  // Close the picker when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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
        onClick={() => setShowPicker(false)} // Toggle color picker on card click
      >
        <div className="flex flex-row gap-3">
          {/* First Metric */}
          <div className="flex flex-col">
            <p className="text-bold text-center text-4xl">{value1}</p>
            <p>{metric1}</p>
          </div>

          {/* Divider between metrics */}
          <div className="w-0.3 h-[4rem] border-l-2 border-dashed border-white"></div>

          {/* Second Metric */}
          <div className="flex flex-col">
            <p className="text-bold text-center text-4xl">{value2}</p>
            <p>{metric2}</p>
          </div>
        </div>
      </div>

      {/* Color Picker */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute top-full left-[50%] z-50 mt-2 rounded bg-white p-2 shadow-lg"
        >
          <HexColorPicker color={userColor} onChange={handleColorChange} />
          <div className="mt-2 text-center text-sm text-black">{userColor}</div>
        </div>
      )}
    </div>
  );
};

export default MultiMetrics;
