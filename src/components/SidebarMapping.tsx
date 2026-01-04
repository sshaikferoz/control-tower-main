'use client';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PSCLogo from '@/assets/PSCLogo';
import Image from 'next/image';

const menuItems = [
  { name: 'multi-metric', imageURL: '' },
  { name: 'one-metric', imageURL: '' },
  { name: 'one-metric-date', imageURL: '' },
  { name: 'two-metrics-linechart', imageURL: '' },
  { name: 'two-metrics', imageURL: '' },
  { name: 'two-metrics-piechart', imageURL: '' },
  { name: 'one-metric-table', imageURL: '' },
  // New components
  { name: 'bar-chart', imageURL: '' },
  { name: 'stacked-bar-chart', imageURL: '' },
  //   { name: 'orders-line-chart', imageURL: '' },
  //   { name: 'dual-line-chart', imageURL: '' },
  //   { name: 'pie-chart-total', imageURL: '' },
  { name: 'quadrant-metrics', imageURL: '' },
  { name: 'loans-app-tray', imageURL: '' },
  { name: 'news-feed', imageURL: '' },
  { name: 'pie-chart', imageURL: '' },
  { name: 'column-chart', imageURL: '' },
  //   { name: 'prediction-chart', imageURL: '' },
  //   { name: 'radar-chart', imageURL: '' },
  { name: 'multi-chart', imageURL: '' },
  { name: 'filter-widget', imageURL: '' },
  { name: 'listener-widget', imageURL: '' },
  //   { name: 'announcement', imageURL: '' },
];

interface SidebarMappingProps {
  onItemClick: (name: string) => void;
}

const SidebarMapping: React.FC<SidebarMappingProps> = ({ onItemClick }) => {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState('mySCAI');

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen w-64 max-w-64 min-w-64 flex-shrink-0 flex-col bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
      {/* Header - Fixed height to prevent shifts */}
      <div className="flex h-16 flex-shrink-0 flex-row items-center space-x-2">
        <PSCLogo className="h-[31px] w-[29px] shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="text-lg leading-tight font-semibold">P&SC</h1>
          <h1 className="text-lg leading-tight font-semibold">Intelligence Centre</h1>
        </div>
      </div>

      {/* Search - Fixed height */}
      <div className="relative mt-4 flex-shrink-0">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-3 left-3 h-5 w-5 text-gray-300" />
        <input
          type="text"
          placeholder="Search Widget"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md bg-[#ffffff20] p-2 pl-10 text-white placeholder-gray-300 outline-none"
        />
      </div>

      {/* Navigation - Scrollable content */}
      <nav className="mt-6 min-h-0 flex-1">
        <ul className="h-full space-y-2 overflow-x-hidden overflow-y-auto">
          {filteredMenuItems.map((item, index) => (
            <li
              key={index}
              className={`flex-shrink-0 cursor-pointer rounded px-4 py-2 transition-colors duration-200 ${
                selectedItem === item.name
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-[#ffffff30]'
              }`}
              onClick={() => {
                setSelectedItem(item.name);
                onItemClick(item.name);
              }}
            >
              <div className="flex flex-col items-center">
                {/* Fixed container for image to prevent layout shifts */}
                <div className="mb-2 flex h-16 w-full items-center justify-center overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_BSP_NAME}/widget-preview/${item.name}.png`}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      // Fallback for broken images
                      e.currentTarget.style.display = 'none';
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Fixed height for text to prevent layout shifts */}
                <div className="mt-1 flex min-h-[2.5rem] items-center justify-center px-1 text-center text-sm capitalize">
                  <span className="break-words hyphens-auto">
                    {item.name === 'pie-chart-total'
                      ? 'Donut Chart'
                      : item.name === 'loans-app-tray'
                        ? 'Alert Widget'
                        : item.name.replace(/-/g, ' ')}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SidebarMapping;
