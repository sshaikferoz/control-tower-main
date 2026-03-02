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
    const defaultBaseColor = '#00214E';
    const defaultLighterColor = '#0164B0';
    const baseColor = backgroundColor || color || defaultBaseColor;
    const lighterColor = baseColor === defaultBaseColor ? defaultLighterColor : `${baseColor}80`;
    const accentColor = backgroundColor || color || '#00A3E0';

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

    return (
        <div
            className="blank-widget flex h-full w-full flex-col rounded-xl p-4"
            style={{
                backgroundImage: `linear-gradient(to bottom, ${baseColor}, ${lighterColor})`,
                color: '#ffffff',
            }}
        >
            <div className="mb-2 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full" style={{ background: accentColor }} />
                <h3 className="text-base font-bold text-white" style={getTitleStyle()}>{title}</h3>
            </div>

            <div className="flex-1 flex items-center justify-center" />
        </div>
    );
};

export default BlankWidget;
