'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { HexColorPicker } from 'react-colorful';
import { parseXMLToJson } from '@/lib/bexQueryXmlToJson';
import { eventBus } from '@/services/EventBus';

interface VariableMapping {
    varName: string;
    sourceField: string;
    operator?: string;
}

interface FilterWidgetProps {
    reportName?: string;
    eventName?: string;
    data?: any[];
    title?: string;
    color?: string;
    setChangeColor?: (color: string) => void;
    typography?: any;
    // Multiple SAP BW variable mappings: free-text variable name -> source column
    variableMappings?: VariableMapping[];
    // Optional mapping from technical column field -> user-friendly label
    columnLabels?: Record<string, string>;
}

const tableStyles = `
  .filter-widget-table .p-datatable-wrapper {
    border-radius: 0;
    border: 0.6px solid #d1d1d1;
    overflow: hidden;
  }

  .filter-widget-table .p-datatable-table {
    border-collapse: collapse;
    overflow: auto;
  }

  .filter-widget-table .p-datatable-thead > tr > th {
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

  .filter-widget-table .p-datatable-tbody > tr {
    background: transparent;
    height: 30px;
    border-bottom: 0.5px solid white;
    cursor: pointer;
  }

  .filter-widget-table .p-datatable-tbody > tr:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Selected row styling */
  .filter-widget-table .p-datatable-tbody > tr.p-highlight {
    background: rgba(255, 255, 255, 0.25);
  }

  .filter-widget-table .p-datatable-tbody > tr.p-highlight > td {
    font-weight: 600;
  }

  .filter-widget-table .p-datatable-tbody > tr:last-child {
    border-bottom: none;
  }

  .filter-widget-table .p-datatable-tbody > tr > td {
    border: none;
    padding: 5px 16px;
    color: white;
    font-size: 14px;
    line-height: 18px;
  }

  .filter-widget-table .p-datatable-tbody > tr > td:first-child {
    font-family: 'Ghawar-Regular', Helvetica, sans-serif;
  }

  .filter-widget-table .p-datatable-tbody > tr > td:not(:first-child) {
    font-family: 'Ghawar-Hefty', Helvetica, sans-serif;
    text-align: center;
  }
`;

const FilterWidget: React.FC<FilterWidgetProps> = ({
    reportName,
    eventName = 'filter-changed',
    data: propData,
    title = 'Filter Widget',
    color,
    setChangeColor,
    typography,
    variableMappings,
    columnLabels,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterData, setFilterData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
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

    useEffect(() => {
        const fetchFilterData = async () => {
            if (propData) {
                // If propData is provided, use it directly
                setFilterData(Array.isArray(propData) ? propData : []);
                setLoading(false);
                return;
            }

            if (!reportName) {
                setFilterData([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(
                    process.env.NODE_ENV === 'development'
                        ? `/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${reportName}`
                        : `/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${reportName}`
                );
                const xmlData = await res.text();
                const parsedJSON = parseXMLToJson(xmlData);

                // Extract data from parsed JSON - handle both output array and transformed structure
                let items: any[] = [];

                if (parsedJSON?.output && Array.isArray(parsedJSON.output)) {
                    // Direct output array
                    items = parsedJSON.output;
                } else if (parsedJSON?.data && Array.isArray(parsedJSON.data)) {
                    // Data array from processWidgetMappings
                    items = parsedJSON.data;
                } else if (parsedJSON?.chartData && Array.isArray(parsedJSON.chartData)) {
                    // Chart data format
                    items = parsedJSON.chartData;
                } else {
                    // Try to extract from FormStructure if available
                    if (parsedJSON?.FormStructure) {
                        const formStructure = parsedJSON.FormStructure;
                        Object.keys(formStructure).forEach((chaField) => {
                            Object.keys(formStructure[chaField] || {}).forEach((chaValue) => {
                                const row: any = { [chaField]: chaValue };
                                const kfValues = formStructure[chaField][chaValue];
                                Object.keys(kfValues || {}).forEach((kfField) => {
                                    row[kfField] = kfValues[kfField];
                                });
                                items.push(row);
                            });
                        });
                    }
                }

                setFilterData(items);
            } catch (error) {
                console.error('Error fetching filter data:', error);
                setFilterData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFilterData();
    }, [reportName, propData]);

    const emitSelection = (items: any[]) => {
        if (!items || items.length === 0) {
            // Emit a clear event with no variables so listener can reload base query
            const clearEvent: Record<string, any> = {
                column: null,
                value: null,
                fullItem: null,
                reportName,
                variables: '',
            };
            console.log('FilterWidget emitting clear event:', eventName, clearEvent);
            eventBus.publish(eventName, clearEvent);
            return;
        }

        // Fallback single column/value based on the first selected row
        const firstItem = items[0];
        const fallbackColumnKey = Object.keys(firstItem)[0];
        const fallbackValue = Object.values(firstItem)[0];

        const eventData: Record<string, any> = {
            column: fallbackColumnKey,
            value: fallbackValue,
            fullItem: firstItem,
            reportName: reportName,
        };

        // If variable mappings are provided, build SAP BW variables string
        if (variableMappings && variableMappings.length > 0) {
            const variableParams: string[] = [];
            let varNum = 1;

            // For multiple select: for each selected row, for each mapping,
            // append another VAR_NAME_n / VAR_OPERATOR_n / VAR_VALUE_EXT_n triplet.
            items.forEach((item) => {
                variableMappings.forEach((mapping) => {
                    const fieldValue = item[mapping.sourceField];
                    const operator = mapping.operator || 'EQ';

                    if (fieldValue !== undefined && fieldValue !== null) {
                        variableParams.push(`VAR_NAME_${varNum}=${mapping.varName}`);
                        variableParams.push(`VAR_OPERATOR_${varNum}=${operator}`);
                        variableParams.push(`VAR_VALUE_EXT_${varNum}=${String(fieldValue)}`);

                        // Also expose varName -> value on the event payload (last one wins per varName)
                        eventData[mapping.varName] = fieldValue;
                        varNum += 1;
                    }
                });

            });

            if (variableParams.length > 0) {
                eventData.variables = variableParams.join('&');
            }
        }

        console.log('FilterWidget emitting event:', eventName, eventData);
        eventBus.publish(eventName, eventData);
    };

    const filteredData = filterData.filter((item) => {
        if (!searchTerm) return true;
        return Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const baseColor = userColor || defaultBaseColor;
    const lighterColor = baseColor === defaultBaseColor ? defaultLighterColor : `${baseColor}80`;

    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${baseColor}, ${lighterColor})`,
        color: '#ffffff',
        cursor: 'pointer',
    };

    const tableColumns =
        filterData.length > 0
            ? Object.keys(filterData[0]).map((key) => ({
                field: key,
                header: columnLabels?.[key] || key.toUpperCase().replace(/_/g, ' '),
            }))
            : [];

    if (loading) {
        return (
            <div className="relative h-full w-full">
                <div
                    className="h-full rounded-xl p-4"
                    style={backgroundStyle}
                    onClick={() => setShowPicker(false)}
                >
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center text-white">
                            <div className="mb-2">Loading filters...</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!filterData.length) {
        return (
            <div className="relative h-full w-full">
                <div
                    className="h-full rounded-xl p-4"
                    style={backgroundStyle}
                    onClick={() => setShowPicker(false)}
                >
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center text-white">
                            No data available. Please configure the data source.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <style>{tableStyles}</style>

            <div
                className="h-full w-full overflow-hidden rounded-xl border border-solid border-[#00214E]"
                onClick={() => setShowPicker(false)}
            >
                <div className="h-full p-0">
                    <div className="relative h-full rounded-xl" style={backgroundStyle}>
                        {/* Card Header */}
                        <div className="flex items-center justify-between px-7 pt-1.5 pb-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className="text-base leading-4 font-bold tracking-[-0.16px] text-white"
                                    style={{ fontFamily: 'Ghawar-Hefty, Helvetica' }}
                                >
                                    {title}
                                </div>
                            </div>
                        </div>

                        {/* Selected Items Display */}
                        {selectedItems.length > 0 && (
                            <div className="px-7 pb-2">
                                <div className="text-xs text-white opacity-80 mb-1">Selected:</div>
                                <div className="flex flex-wrap gap-1">
                                    {selectedItems.map((item, idx) => (
                                        <span
                                            key={idx}
                                            className="rounded bg-white bg-opacity-20 px-2 py-0.5 text-xs text-black"
                                        >
                                            {Object.values(item)[0] as string}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search Input */}
                        <div className="px-7 pb-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full rounded border border-white border-opacity-30 bg-white bg-opacity-90 px-3 py-2 text-sm text-[#00214E] placeholder:text-[#4B5563] focus:border-opacity-70 focus:outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] opacity-70">
                                    🔍
                                </span>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="h-[calc(100%-120px)] overflow-hidden px-7 pb-4">
                            <div className="filter-widget-table flex h-full flex-col">
                                <div className="flex-grow overflow-x-hidden overflow-y-auto rounded-md border border-[#d1d1d1]">
                                    <DataTable
                                        value={filteredData}
                                        className="h-full w-full"
                                        showGridlines={false}
                                        dataKey={tableColumns[0]?.field}
                                        selection={selectedItems}
                                        metaKeySelection={false}
                                        onSelectionChange={(e) => {
                                            const value = e.value;
                                            const items = Array.isArray(value) ? value : value ? [value] : [];
                                            setSelectedItems(items);
                                            emitSelection(items);
                                        }}
                                        selectionMode="multiple"
                                    >
                                        {tableColumns.map((col, index) => (
                                            <Column
                                                key={col.field}
                                                field={col.field}
                                                header={col.header}
                                                style={{
                                                    width: index === 0 ? '160px' : 'auto',
                                                }}
                                            />
                                        ))}
                                    </DataTable>
                                </div>
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

export default FilterWidget;

