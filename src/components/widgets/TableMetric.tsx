import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import React, { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { WidgetTypographyConfig } from '@/helpers/types';
import { getCleanTypographyStyles } from '@/helpers/typographyHelper';

type DataItem = {
    [key: string]: string | number;
};

type TableMetricProps = {
    data: DataItem[];
    columns?: Array<{ field: string; header: string }>;
    title?: string;
    color?: string;
    setChangeColor?: (color: string) => void;
    typography?: WidgetTypographyConfig;
};

const tableStyles = `
  .metric-table .p-datatable-wrapper {
    border-radius: 0;
    border: 0.6px solid #d1d1d1;
    overflow: hidden;
  }

  .metric-table .p-datatable-table {
    border-collapse: collapse;
    overflow: auto;
  }

  .metric-table .p-datatable-thead > tr > th {
    background: transparent;
    color: #83bd01;
    font-family: 'Ghawar-Bold', Helvetica, sans-serif;
    font-size: 13px;
    font-weight: bold;
    padding: 5px 16px;
    height: 30px;
    border: none;
    text-align: left;
  }

  .metric-table .p-datatable-thead > tr > th:nth-child(2),
  .metric-table .p-datatable-thead > tr > th:nth-child(3) {
    text-align: center;
  }

  .metric-table .p-datatable-tbody > tr {
    background: transparent;
    height: 30px;
    border-bottom: 0.5px solid white;
  }

  .metric-table .p-datatable-tbody > tr:last-child {
    border-bottom: none;
  }

  .metric-table .p-datatable-tbody > tr > td {
    border: none;
    padding: 5px 16px;
    color: white;
    font-size: 14px;
    line-height: 18px;
  }

  .metric-table .p-datatable-tbody > tr > td:first-child {
    font-family: 'Ghawar-Regular', Helvetica, sans-serif;
  }

  .metric-table .p-datatable-tbody > tr > td:not(:first-child) {
    font-family: 'Ghawar-Hefty', Helvetica, sans-serif;
    text-align: center;
  }
`;

const TableMetric = ({
    data,
    columns,
    title = 'My Top Items',
    color,
    setChangeColor,
    typography,
}: TableMetricProps) => {
    const [userColor, setUserColor] = useState<string>(color || '#00214E');
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const defaultBaseColor = '#00214E';
    const defaultLighterColor = '#0164B0';

    useEffect(() => {
        if (color && !userColor) {
            setUserColor(color);
        }
    }, [color]);

    const handleColorChange = (selectedColor: string) => {
        setUserColor(selectedColor);
        setChangeColor?.(selectedColor);
    };

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowPicker(false);
            }
        };
        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    const baseColor = userColor || defaultBaseColor;
    const lighterColor = baseColor === defaultBaseColor ? defaultLighterColor : `${baseColor}80`;

    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${baseColor}, ${lighterColor})`,
        color: '#ffffff',
        cursor: 'pointer',
    };

    const tableColumns =
        columns ||
        (data?.length > 0
            ? Object.keys(data[0]).map((key) => ({
                field: key,
                header: key.toUpperCase().replace(/_/g, ' '),
            }))
            : []);

    const getColumnWidth = (index: number, total: number) => {
        if (total === 3) {
            if (index === 0) return '160px';
            if (index === 1) return '90px';
            if (index === 2) return '95px';
        }
        return 'auto';
    };

    // Get typography styles
    const titleStyles = getCleanTypographyStyles('title', typography);
    const headerStyles = getCleanTypographyStyles('header', typography);
    const cellStyles = getCleanTypographyStyles('cell', typography);

    // Generate dynamic CSS for typography
    const generateTypographyCSS = (styles: React.CSSProperties, selector: string): string => {
        const rules: string[] = [];
        if (styles.fontFamily) rules.push(`font-family: ${styles.fontFamily} !important`);
        if (styles.fontSize) rules.push(`font-size: ${styles.fontSize} !important`);
        if (styles.fontWeight) rules.push(`font-weight: ${styles.fontWeight} !important`);
        if (styles.color) rules.push(`color: ${styles.color} !important`);
        if (styles.textAlign) rules.push(`text-align: ${styles.textAlign} !important`);
        if (styles.textTransform) rules.push(`text-transform: ${styles.textTransform} !important`);
        if (styles.letterSpacing) rules.push(`letter-spacing: ${styles.letterSpacing} !important`);
        if (styles.lineHeight) rules.push(`line-height: ${styles.lineHeight} !important`);

        if (rules.length > 0) {
            return `.metric-table ${selector} { ${rules.join('; ')} }`;
        }
        return '';
    };

    const headerCSS = generateTypographyCSS(headerStyles, '.p-datatable-thead > tr > th');
    const cellCSS = generateTypographyCSS(cellStyles, '.p-datatable-tbody > tr > td');

    const dynamicTableStyles = `
        ${tableStyles}
        ${headerCSS}
        ${cellCSS}
    `;

    return (
        <div className="relative h-full w-full">
            <style>{dynamicTableStyles}</style>

            <div
                className="h-full w-full overflow-hidden rounded-xl border border-solid border-[#00214E]"
                onClick={() => setShowPicker(false)}
            >
                <div className="h-full p-0">
                    {/* ✅ Apply gradient only here */}
                    <div className="relative h-full rounded-xl" style={backgroundStyle}>
                        {/* Card Header */}
                        <div className="flex items-center justify-between px-7 pt-1.5 pb-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className="text-base leading-4 font-bold tracking-[-0.16px] text-white"
                                    style={{
                                        fontFamily: 'Ghawar-Hefty, Helvetica',
                                        ...titleStyles
                                    }}
                                >
                                    {title}
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="h-[90%] overflow-hidden px-7 pb-4">
                            <div className="metric-table flex h-full flex-col">
                                <div className="flex-grow overflow-x-hidden overflow-y-auto rounded-md border border-[#d1d1d1]">
                                    <DataTable value={data} className="h-full w-full" showGridlines={false}>
                                        {tableColumns.map((col, index) => (
                                            <Column
                                                key={col.field}
                                                field={col.field}
                                                header={col.header}
                                                style={{
                                                    width: getColumnWidth(index, tableColumns.length),
                                                }}
                                            />
                                        ))}
                                    </DataTable>
                                </div>

                                {/* 👇 Small bottom spacing */}
                                <div className="h-3" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Color Picker */}
            {showPicker && (
                <div
                    ref={pickerRef}
                    className="absolute top-full left-[50%] z-50 mt-2 rounded bg-white p-2 shadow-lg"
                >
                    <HexColorPicker color={userColor} onChange={handleColorChange} />
                    <div className="mt-2 text-center text-sm text-black">{userColor}</div>
                </div>
            )}
        </div>
    );
};

export default TableMetric;
