import React from 'react';
import { BlankWidgetConfig } from './BlankWidgetConfig.types';
interface BlankWidgetProps {
    title?: string;
    color?: string;
    backgroundColor?: string;
    typography?: any;
    setChangeColor?: (color: string) => void;
    blankWidgetConfig?: BlankWidgetConfig;
}

const BlankWidget: React.FC<BlankWidgetProps> = ({
    title,
    color,
    backgroundColor,
    typography,
    setChangeColor,
    blankWidgetConfig,
}) => {
    // Default colors
    const defaultBaseColor = '#00214E';
    const defaultLighterColor = '#0164B0';

    // Prefer explicit backgroundColor from widget config, then fallback to legacy color prop, then defaults
    const baseColor = backgroundColor || color || defaultBaseColor;
    const lighterColor = baseColor === defaultBaseColor ? defaultLighterColor : `${baseColor}80`;

    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${baseColor}, ${lighterColor})`,
        color: '#ffffff',
    };

    function getTitleStyle(): React.CSSProperties {
        return {
            fontFamily: typography?.title?.fontFamily,
            fontSize: typography?.title?.fontSize,
            fontWeight: typography?.title?.fontWeight,
            color: typography?.title?.color,
            textAlign: typography?.title?.textAlign,
            textTransform: typography?.title?.textTransform,
            letterSpacing: typography?.title?.letterSpacing,
            lineHeight: typography?.title?.lineHeight,
        };
    }

    const titleStyle = typography?.title?.textAlign;

    return (
        <div
            className="flex h-full w-full flex-col rounded-xl p-4"
            style={backgroundStyle}
        >
            <div className="mb-2">
                <h3 className="text-base font-bold text-white" style={getTitleStyle()}>{title}</h3>
            </div>

            <div className="flex-1 flex items-center justify-center" />
        </div>
    );
};

export default BlankWidget;
