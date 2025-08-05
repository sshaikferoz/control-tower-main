'use client';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PSCLogo from '@/assets/PSCLogo';
import Image from 'next/image';

const menuItems = [
  { name: 'one-metric', imageURL: '' },
  { name: 'one-metric-date', imageURL: '' },
  { name: 'two-metrics-linechart', imageURL: '' },
  { name: 'two-metrics', imageURL: '' },
  { name: 'two-metrics-piechart', imageURL: '' },
  { name: 'one-metric-table', imageURL: '' },
  // New components
  { name: 'bar-chart', imageURL: '' },
  { name: 'stacked-bar-chart', imageURL: '' },
  { name: 'orders-line-chart', imageURL: '' },
  { name: 'dual-line-chart', imageURL: '' },
  { name: 'pie-chart-total', imageURL: '' },
  { name: 'quadrant-metrics', imageURL: '' },
  { name: 'loans-app-tray', imageURL: '' },
  { name: 'news-feed', imageURL: '' },
  { name: 'announcement', imageURL: '' },
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
    <div className="flex h-screen w-64 flex-col overflow-auto bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
      <div className="flex flex-row items-center space-x-2">
        <PSCLogo />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">P&SC</h1>
          <h1 className="text-lg font-semibold">Intelligence Centre</h1>
        </div>
      </div>
      <div className="relative mt-4">
        <MagnifyingGlassIcon className="absolute top-3 left-3 h-5 w-5 text-gray-300" />
        <input
          type="text"
          placeholder="Search Widget"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md bg-[#ffffff20] p-2 pl-10 text-white placeholder-gray-300 outline-none"
        />
      </div>
      <nav className="mt-6 flex-grow">
        <ul className="max-h-[calc(100vh-10rem)] space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item, index) => (
            <li
              key={index}
              className={`cursor-pointer rounded px-4 py-2 ${
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
                {/* Use default placeholder if image doesn't exist */}
                <img
                  src={`${process.env.NEXT_PUBLIC_BSP_NAME}/widget-preview/${item.name}.png`}
                  alt={item.name}
                  className="mb-2 h-16 w-full object-contain"
                />

                <div className="mt-1 text-center text-sm capitalize">
                  {item.name === 'pie-chart-total' ? 'Donut Chart' : item.name.replace(/-/g, ' ')}
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
