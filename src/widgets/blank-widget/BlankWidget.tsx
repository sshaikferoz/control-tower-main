import React, { useEffect, useState } from 'react';
import { BlankWidgetConfig } from './BlankWidgetConfig.types';

interface BlankWidgetProps {
    title?: string;
    color?: string;
    setChangeColor?: (color: string) => void;
    showTitle?: boolean;
    blankWidgetConfig?: BlankWidgetConfig;
}

const BlankWidget: React.FC<BlankWidgetProps> = ({
    title,
    color,
    setChangeColor,
    showTitle,
    blankWidgetConfig,
}) => {
    const [userColor, setUserColor] = useState<string>(color || '#00214E');

    // Default colors
    const defaultBaseColor = '#00214E';
    const defaultLighterColor = '#0164B0';

    useEffect(() => {
        if (color && !userColor) {
            setUserColor(color);
        }
    }, [color, userColor]);

    const baseColor = userColor || defaultBaseColor;
    const lighterColor = baseColor === defaultBaseColor ? defaultLighterColor : `${baseColor}80`;

    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${baseColor}, ${lighterColor})`,
        color: '#ffffff',
    };

    // Determine widget-level title to display
    const widgetTitle = blankWidgetConfig?.title ?? title;

    const shouldShowTitle =
        (blankWidgetConfig?.showTitle ??
            (typeof showTitle === 'boolean' ? showTitle : true)) && !!widgetTitle;

    return (
        <div
            className="flex h-full w-full flex-col rounded-xl p-4"
            style={backgroundStyle}
        >
            {shouldShowTitle && (
                <div className="mb-2">
                    <h3 className="text-base font-bold text-white">{widgetTitle}</h3>
                </div>
            )}

            <div className="flex-1 flex items-center justify-center" />
        </div>
    );
};

export default BlankWidget;
