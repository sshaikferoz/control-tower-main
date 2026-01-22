'use client';

import React from 'react';
import { Widget } from '../types';

interface WidgetItemProps {
    widget: Widget;
    isSelected?: boolean;
    onClick: (widgetId: string) => void;
    theme?: 'light' | 'dark';
}

// Theme colors for widget items
const itemThemeColors = {
    light: {
        '--item-text': '#ffffff',
        '--item-hover-bg': 'rgba(255, 255, 255, 0.3)',
        '--item-selected-bg': '#ffffff',
        '--item-selected-text': '#000000',
    },
    dark: {
        '--item-text': '#ededed',
        '--item-hover-bg': 'rgba(255, 255, 255, 0.25)',
        '--item-selected-bg': '#ffffff',
        '--item-selected-text': '#000000',
    },
};

export const WidgetItem = React.memo<WidgetItemProps>(({ widget, isSelected = false, onClick, theme = 'light' }) => {

    const handleClick = () => {
        onClick(widget.name);
    };

    const colors = itemThemeColors[theme];

    return (
        <li
            className="flex-shrink-0 cursor-pointer rounded px-4 py-2 transition-colors duration-200"
            style={{
                ...colors,
                backgroundColor: isSelected ? 'var(--item-selected-bg)' : 'transparent',
                color: isSelected ? 'var(--item-selected-text)' : 'var(--item-text)',
            } as React.CSSProperties}
            onClick={handleClick}
            onMouseEnter={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--item-hover-bg)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        >
            <div className="flex flex-col items-center">
                {/* Fixed container for image to prevent layout shifts */}
                <div className="mb-2 flex h-16 w-full items-center justify-center overflow-hidden">
                    <img
                        src={`${process.env.NEXT_PUBLIC_BSP_NAME}/widget-preview/${widget.name}.png`}
                        alt={widget.displayName}
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
                        {widget.displayName}
                    </span>
                </div>
            </div>
        </li>
    );
});

WidgetItem.displayName = 'WidgetItem';

