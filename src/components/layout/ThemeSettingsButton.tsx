'use client';

import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { SunIcon as SunIconSolid, MoonIcon as MoonIconSolid } from '@heroicons/react/24/solid';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeSettingsButton() {
    const { theme, setTheme } = useTheme();

    return (
        <div
            className="flex shrink-0 rounded-full p-1 transition-colors"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            role="group"
            aria-label="Theme toggle"
        >
            <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    theme === 'light'
                        ? 'bg-white text-[var(--sidebar-bg)] shadow-sm'
                        : 'text-[var(--sidebar-text)] hover:text-white/90'
                }`}
                aria-pressed={theme === 'light'}
                aria-label="Light mode"
            >
                {theme === 'light' ? (
                    <SunIconSolid className="h-4 w-4" />
                ) : (
                    <SunIcon className="h-4 w-4" />
                )}
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    theme === 'dark'
                        ? 'bg-white text-[var(--sidebar-bg)] shadow-sm'
                        : 'text-[var(--sidebar-text)] hover:text-white/90'
                }`}
                aria-pressed={theme === 'dark'}
                aria-label="Dark mode"
            >
                {theme === 'dark' ? (
                    <MoonIconSolid className="h-4 w-4" />
                ) : (
                    <MoonIcon className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}
