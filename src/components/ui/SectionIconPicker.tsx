'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { DASHBOARD_MENU_ICONS } from '@/widgets/dashboard-menu/DashboardMenuConfig.types';

interface SectionIconPickerProps {
  label: string;
  value: string;
  onChange: (iconId: string) => void;
  className?: string;
}

const ICON_OPTIONS = [
  { id: '', label: 'Default' },
  ...DASHBOARD_MENU_ICONS.map((icon) => ({
    id: icon.id,
    label: icon.label,
  })),
];

export const SectionIconPicker: React.FC<SectionIconPickerProps> = ({
  label,
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selected = ICON_OPTIONS.find((o) => o.id === value) || ICON_OPTIONS[0];
  const iconBaseUrl = `${process.env.NEXT_PUBLIC_BSP_NAME || ''}/icons`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label className="mb-2 block text-sm font-medium text-gray-300">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded border border-[#3a5a8b] bg-[#2a4a7b] px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-[#355a8b] focus:border-blue-500 focus:outline-none"
      >
        {selected.id ? (
          <img
            src={`${iconBaseUrl}/${selected.id}`}
            alt=""
            className="h-5 w-5 flex-shrink-0 object-contain"
            style={{ filter: 'invert(var(--icon-invert, 0))' }}
          />
        ) : (
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[10px] font-medium text-gray-500">
            —
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{selected.label}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 z-10 mt-1 max-h-56 overflow-auto rounded border border-[#3a5a8b] bg-[#1a3a6b] py-1 shadow-lg">
          {ICON_OPTIONS.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={opt.id || 'default'}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-[#2a4a7b] ${
                  isSelected ? 'bg-blue-600/30 text-blue-200' : ''
                }`}
              >
                {opt.id ? (
                  <img
                    src={`${iconBaseUrl}/${opt.id}`}
                    alt=""
                    className="h-5 w-5 flex-shrink-0 object-contain"
                    style={{ filter: 'invert(var(--icon-invert, 0))' }}
                  />
                ) : (
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[10px] font-medium text-gray-500">
                    —
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
