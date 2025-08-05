import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

interface SpendData {
  country: string;
  countryCode: string;
  value: number;
  category?: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface GeoSpendMapWidgetProps {
  title?: string;
  spendData?: SpendData[];
  selectedSpendType?: 'directSpend' | 'indirectSpend' | 'totalSpend' | 'sourcingGap' | 'investment';
  selectedArea?: 'global' | 'aoc' | 'asc';
  height?: number | string;
  onCountryClick?: (country: SpendData) => void;
  onSpendTypeChange?: (type: string) => void;
  onAreaChange?: (area: string) => void;
}

const defaultSpendData: SpendData[] = [
  {
    country: 'United States',
    countryCode: 'US',
    value: 2500000,
    category: 'chemicals',
    coordinates: [-95, 40],
  },
  {
    country: 'Germany',
    countryCode: 'DE',
    value: 1800000,
    category: 'electrical',
    coordinates: [10, 51],
  },
  {
    country: 'China',
    countryCode: 'CN',
    value: 3200000,
    category: 'drilling',
    coordinates: [104, 35],
  },
  {
    country: 'Brazil',
    countryCode: 'BR',
    value: 950000,
    category: 'static',
    coordinates: [-55, -10],
  },
  {
    country: 'Australia',
    countryCode: 'AU',
    value: 750000,
    category: 'offshore',
    coordinates: [133, -25],
  },
  {
    country: 'India',
    countryCode: 'IN',
    value: 1200000,
    category: 'fire',
    coordinates: [78, 20],
  },
  {
    country: 'Canada',
    countryCode: 'CA',
    value: 890000,
    category: 'chemicals',
    coordinates: [-106, 56],
  },
  {
    country: 'United Kingdom',
    countryCode: 'GB',
    value: 1100000,
    category: 'electrical',
    coordinates: [-3, 55],
  },
  {
    country: 'France',
    countryCode: 'FR',
    value: 980000,
    category: 'nonmetallic',
    coordinates: [2, 46],
  },
  {
    country: 'Japan',
    countryCode: 'JP',
    value: 1350000,
    category: 'drilling',
    coordinates: [138, 36],
  },
];

const spendTypeConfig = {
  directSpend: {
    title: 'Direct Materials Spend',
    color: '#2196F3',
    lightColor: '#E3F2FD',
  },
  indirectSpend: {
    title: 'Indirect Materials Spend',
    color: '#9C27B0',
    lightColor: '#F3E5F5',
  },
  totalSpend: {
    title: 'Total Material Spend',
    color: '#4CAF50',
    lightColor: '#E8F5E8',
  },
  sourcingGap: {
    title: 'Sourcing Coverage',
    color: '#F44336',
    lightColor: '#FFEBEE',
  },
  investment: {
    title: 'Investments',
    color: '#FF9800',
    lightColor: '#FFF3E0',
  },
};

// World map topology URL (TopoJSON format)
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const GeoSpendMapWidget: React.FC<GeoSpendMapWidgetProps> = ({
  title = 'Global Spend Map',
  spendData = defaultSpendData,
  selectedSpendType = 'directSpend',
  selectedArea = 'global',
  height = 280,
  onCountryClick,
  onSpendTypeChange,
  onAreaChange,
}) => {
  const [currentSpendType, setCurrentSpendType] = useState(selectedSpendType);
  const [currentArea, setCurrentArea] = useState(selectedArea);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mapForceRefresh, setMapForceRefresh] = useState(false);
  const [tooltipContent, setTooltipContent] = useState<{
    x: number;
    y: number;
    content: React.ReactNode;
  } | null>(null);

  const config = spendTypeConfig[currentSpendType];

  useEffect(() => {
    setMapForceRefresh(true);
    const timer = setTimeout(() => setMapForceRefresh(false), 200);
    return () => clearTimeout(timer);
  }, [currentArea, currentSpendType]);

  const formatValue = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const getTotalValue = (): string => {
    const total = spendData.reduce((sum, d) => sum + d.value, 0);
    return formatValue(total);
  };

  const getMaxValue = (): number => {
    return Math.max(...spendData.map((d) => d.value));
  };

  const getMinValue = (): number => {
    return Math.min(...spendData.map((d) => d.value));
  };

  const getMarkerSize = (value: number): number => {
    const maxValue = getMaxValue();
    const ratio = value / maxValue;
    return Math.max(4, ratio * 12);
  };

  const getCountryFillColor = (geo: any): string => {
    const countryCode = geo.properties.ISO_A2;
    const countryData = spendData.find((d) => d.countryCode === countryCode);

    if (!countryData) {
      return '#e8eaf6'; // Light blue-gray for countries without data
    }

    const maxValue = getMaxValue();
    const minValue = getMinValue();
    const normalizedValue = (countryData.value - minValue) / (maxValue - minValue);

    // Create gradient effect based on spend value
    const opacity = 0.4 + normalizedValue * 0.6; // 0.4 to 1.0 opacity
    return `${config.color}${Math.round(opacity * 255)
      .toString(16)
      .padStart(2, '0')}`;
  };

  const handleSpendTypeChange = (type: keyof typeof spendTypeConfig) => {
    setCurrentSpendType(type);
    onSpendTypeChange?.(type);
  };

  const handleAreaChange = (area: any) => {
    setCurrentArea(area);
    onAreaChange?.(area);
  };

  const handleCountryClick = (country: SpendData) => {
    onCountryClick?.(country);
  };

  const handleMarkerClick = (data: SpendData) => {
    handleCountryClick(data);
  };

  const handleGeographyClick = (geo: any) => {
    const countryCode = geo.properties.ISO_A2;
    const countryData = spendData.find((d) => d.countryCode === countryCode);
    if (countryData) {
      handleCountryClick(countryData);
    }
  };

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const countryCode = geo.properties.ISO_A2;
    const countryData = spendData.find((d) => d.countryCode === countryCode);

    if (countryData) {
      setHoveredCountry(countryCode);
      setTooltipContent({
        x: event.clientX,
        y: event.clientY,
        content: (
          <div className="bg-opacity-95 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-xs text-white shadow-xl">
            <div className="font-semibold text-yellow-300">{countryData.country}</div>
            <div className="text-green-300">{formatValue(countryData.value)}</div>
            <div className="text-xs text-gray-300">{countryData.category}</div>
          </div>
        ),
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCountry(null);
    setTooltipContent(null);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltipContent) {
      setTooltipContent((prev) =>
        prev
          ? {
              ...prev,
              x: event.clientX,
              y: event.clientY,
            }
          : null
      );
    }
  };

  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
        {/* Header - matching SimpleMetric style */}
        <div className="mb-3">
          <h2 className="text-4xl font-bold">{getTotalValue()}</h2>
          <p className="text-base opacity-90">{title}</p>
        </div>

        {/* Area Navigation */}
        <div className="mb-3 flex gap-1">
          {(['global', 'aoc', 'asc'] as const).map((area) => (
            <button
              key={area}
              onClick={() => handleAreaChange(area)}
              className={`rounded px-2 py-1 text-xs transition-all ${
                currentArea === area
                  ? 'bg-opacity-25 bg-white font-semibold'
                  : 'bg-opacity-10 hover:bg-opacity-15 bg-white'
              }`}
              disabled={currentSpendType !== 'directSpend' && area !== 'global'}
            >
              {area.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Interactive Map Container */}
        <div
          className="bg-opacity-95 relative mb-3 overflow-hidden rounded-lg border bg-white"
          style={{ height: height }}
          onMouseMove={handleMouseMove}
        >
          {!mapForceRefresh ? (
            <div className="h-full w-full bg-white">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 100,
                  center: [0, 20],
                }}
                width={800}
                height={400}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                }}
              >
                <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => handleGeographyClick(geo)}
                          onMouseEnter={(event) => handleMouseEnter(geo, event)}
                          onMouseLeave={handleMouseLeave}
                          style={{
                            default: {
                              fill: getCountryFillColor(geo),
                              stroke: '#607d8b',
                              strokeWidth: 0.5,
                              outline: 'none',
                              cursor: spendData.find((d) => d.countryCode === geo.properties.ISO_A2)
                                ? 'pointer'
                                : 'default',
                            },
                            hover: {
                              fill: spendData.find((d) => d.countryCode === geo.properties.ISO_A2)
                                ? config.color
                                : getCountryFillColor(geo),
                              stroke: '#37474f',
                              strokeWidth: 1,
                              outline: 'none',
                            },
                            pressed: {
                              fill: config.color,
                              stroke: '#37474f',
                              strokeWidth: 1,
                              outline: 'none',
                            },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  {/* Data Point Markers */}
                  {spendData.map((data) => (
                    <Marker
                      key={data.countryCode}
                      coordinates={data.coordinates}
                      onClick={() => handleMarkerClick(data)}
                    >
                      <circle
                        r={getMarkerSize(data.value)}
                        fill={config.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                        style={{
                          cursor: 'pointer',
                          filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
                        }}
                        className="transition-all duration-200 hover:scale-125"
                      />
                      <circle
                        r={getMarkerSize(data.value) + 2}
                        fill="none"
                        stroke={config.color}
                        strokeWidth={1}
                        opacity={0.3}
                        style={{ pointerEvents: 'none' }}
                      />
                    </Marker>
                  ))}
                </ZoomableGroup>
              </ComposableMap>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="flex items-center gap-2 text-gray-800">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Loading map...</span>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-opacity-95 absolute right-2 bottom-2 rounded border bg-white px-2 py-1 text-xs text-gray-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div
                  className="h-3 w-3 rounded-full border border-gray-400"
                  style={{ backgroundColor: config.color, opacity: 0.4 }}
                ></div>
                <span className="text-gray-700">Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="h-3 w-3 rounded-full border border-gray-400"
                  style={{ backgroundColor: config.color }}
                ></div>
                <span className="text-gray-700">High</span>
              </div>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <div className="bg-opacity-95 rounded border bg-white px-2 py-1 text-xs text-gray-700 shadow-sm">
              Zoom: Mouse wheel | Pan: Drag
            </div>
          </div>
        </div>

        {/* Spend Type Navigation */}
        <div className="mb-2 flex gap-1 overflow-x-auto">
          {(Object.keys(spendTypeConfig) as Array<keyof typeof spendTypeConfig>).map((type) => (
            <button
              key={type}
              onClick={() => handleSpendTypeChange(type)}
              disabled={currentArea !== 'global' && type !== 'directSpend'}
              className={`rounded px-2 py-1 text-xs whitespace-nowrap transition-all ${
                currentSpendType === type
                  ? 'bg-opacity-25 bg-white font-semibold'
                  : 'bg-opacity-10 hover:bg-opacity-15 bg-white'
              } ${
                currentArea !== 'global' && type !== 'directSpend'
                  ? 'cursor-not-allowed opacity-50'
                  : ''
              }`}
            >
              {spendTypeConfig[type].title}
            </button>
          ))}
        </div>

        {/* Simple status indicator */}
        <div className="flex items-center justify-between text-xs opacity-70">
          <span>{spendData.length} countries</span>
          <div className="flex items-center gap-1">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                mapForceRefresh ? 'animate-pulse bg-yellow-400' : 'bg-green-400'
              }`}
            ></div>
            <span>{mapForceRefresh ? 'Loading' : 'Interactive'}</span>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {tooltipContent && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: tooltipContent.x + 10,
            top: tooltipContent.y - 10,
          }}
        >
          {tooltipContent.content}
        </div>
      )}
    </div>
  );
};

// // Default props
// GeoSpendMapWidget.defaultProps = {
//   title: "Global Spend Map",
//   spendData: defaultSpendData,
//   selectedSpendType: "directSpend",
//   selectedArea: "global",
//   height: 280,
// };

export default GeoSpendMapWidget;
