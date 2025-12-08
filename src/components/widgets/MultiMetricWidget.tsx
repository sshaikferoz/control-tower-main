import React, { useMemo } from 'react';
import { WidgetTypographyConfig } from '@/helpers/types';
import { getCleanTypographyStyles } from '@/helpers/typographyHelper';

interface MultiMetricItem {
    id?: string;
    title: string;
    value: string | number;
}

interface MultiMetricWidgetProps {
    items?: MultiMetricItem[];
    color?: string;
    typography?: WidgetTypographyConfig;
    setChangeColor?: (color: string) => void;
}

const defaultItems: MultiMetricItem[] = [
    { id: 'metric-1', title: 'Metric One', value: '120' },
    { id: 'metric-2', title: 'Metric Two', value: '87' },
    { id: 'metric-3', title: 'Metric Three', value: '42' },
];

const MultiMetricWidget: React.FC<MultiMetricWidgetProps> = ({ items = defaultItems, color, typography }) => {
    const backgroundStyle = useMemo(() => {
        const baseColor = color || '#00214E';
        const lighterColor =
            baseColor.toLowerCase() === '#00214e' ? '#0164B0' : `${baseColor}b3`;

        return {
            backgroundImage: `linear-gradient(to bottom, ${baseColor}, ${lighterColor})`,
            color: '#ffffff',
        };
    }, [color]);

    return (
        <div className="relative h-full w-full">
            <div className="h-full rounded-2xl p-4" style={backgroundStyle}>
                <div className="flex h-full flex-col gap-4">
                    {(items.length ? items : defaultItems).map((item, index) => (
                        <div key={item.id || index} className="flex flex-col gap-1">
                            <span
                                className="text-3xl font-bold leading-tight sm:text-4xl"
                                style={getCleanTypographyStyles('value', typography)}
                            >
                                {item.value ?? '--'}
                            </span>
                            <span
                                className="text-sm tracking-wide text-white/70 sm:text-base"
                                style={getCleanTypographyStyles('name', typography)}
                            >
                                {item.title ?? ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MultiMetricWidget;

