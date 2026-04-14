'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { HexColorPicker } from 'react-colorful';
import { parseXMLToJson } from '@/lib/bexQueryXmlToJson';
import { eventBus } from '@/services/EventBus';

interface ListenerWidgetProps {
    reportName?: string;
    listenToEvent?: string;
    data?: any[];
    title?: string;
    color?: string;
    setChangeColor?: (color: string) => void;
    typography?: any;
    // Optional mapping from technical column field -> user-friendly label
    columnLabels?: Record<string, string>;
}

const tableStyles = `
  .listener-widget-table .p-datatable-wrapper {
    border-radius: 0;
    border: 0.6px solid #d1d1d1;
    overflow: hidden;
  }

  .listener-widget-table .p-datatable-table {
    border-collapse: collapse;
    overflow: auto;
  }

  .listener-widget-table .p-datatable-thead > tr > th {
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

  .listener-widget-table .p-datatable-tbody > tr {
    background: transparent;
    height: 30px;
    border-bottom: 0.5px solid white;
  }

  .listener-widget-table .p-datatable-tbody > tr:last-child {
    border-bottom: none;
  }

  .listener-widget-table .p-datatable-tbody > tr > td {
    border: none;
    padding: 5px 16px;
    color: white;
    font-size: 14px;
    line-height: 18px;
  }

  .listener-widget-table .p-datatable-tbody > tr > td:first-child {
    font-family: 'Ghawar-Regular', Helvetica, sans-serif;
  }

  .listener-widget-table .p-datatable-tbody > tr > td:not(:first-child) {
    font-family: 'Ghawar-Hefty', Helvetica, sans-serif;
    text-align: center;
  }
`;

const ListenerWidget: React.FC<ListenerWidgetProps> = ({
    reportName,
    listenToEvent,
    data: propData,
    title = 'Listener Widget',
    color,
    setChangeColor,
    typography,
    columnLabels,
}) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
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

    const fetchData = useCallback(
        async (filterData: any = null) => {
            if (propData) {
                // If propData is provided, use it directly
                setData(Array.isArray(propData) ? propData : []);
                return;
            }

            if (!reportName) {
                setData([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                let url = '';

                // Determine which query to call (testing condition for YPDO_SCCT_MFR_PROFIL_SPEND_MAP)
                let effectiveQuery = reportName;
                if (reportName === 'YPDO_SCCT_MFR_PROFIL_SPEND_MAP') {
                    if (filterData && (filterData.variables || filterData.column || filterData.value)) {
                        // If at least one variable/filter is present, use the "_WITH_VAR" version
                        effectiveQuery = 'YPDO_SCCT_MFR_PROFIL_SPEND_MAP_WITH_VAR';
                    } else {
                        // Otherwise use the "_WITHOUT_VAR" version
                        effectiveQuery = 'YPDO_SCCT_MFR_PROFIL_SPEND_MAP_WITHOUT_VAR';
                    }
                }

                // Prefer full variables string emitted by the filter widget (supports multiple variables)
                if (filterData && filterData.variables) {
                    url =
                        process.env.NODE_ENV === 'development' && process.env.USE_SAP_DB !== 'true'
                            ? `/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${effectiveQuery}`
                            : `${process.env.PROXY_BASE_URL_SAP_DB || ''}/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${effectiveQuery}&variables=${encodeURIComponent(
                                filterData.variables
                            )}`;

                    setAppliedFilters(filterData);
                    console.log('ListenerWidget fetching with emitted variables:', url);
                } else if (filterData && filterData.column && filterData.value) {
                    // Legacy single-variable support: build variables string from column/value pair
                    const variables = `VAR_NAME_1=${encodeURIComponent(
                        filterData.column
                    )}&VAR_OPERATOR_1=EQ&VAR_VALUE_EXT_1=${encodeURIComponent(filterData.value)}`;

                    url =
                        process.env.NODE_ENV === 'development' && process.env.USE_SAP_DB !== 'true'
                            ? `/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${effectiveQuery}&variables=${encodeURIComponent(
                                variables
                            )}`
                            : `${process.env.PROXY_BASE_URL_SAP_DB || ''}/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${effectiveQuery}&variables=${encodeURIComponent(
                                variables
                            )}`;

                    setAppliedFilters(filterData);
                    console.log('ListenerWidget fetching with legacy variables:', url);
                } else {
                    // No filter variables – fetch base report
                    url =
                        process.env.NODE_ENV === 'development' && process.env.USE_SAP_DB !== 'true'
                            ? `/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${effectiveQuery}`
                            : `${process.env.PROXY_BASE_URL_SAP_DB || ''}/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${effectiveQuery}`;

                    setAppliedFilters(null);
                }

                const res = await fetch(url);
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

                setData(items);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
                setData([]);
            } finally {
                setLoading(false);
            }
        },
        [reportName, propData]
    );

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [reportName, propData]);

    // Subscribe to emitter events
    useEffect(() => {
        if (listenToEvent) {
            const unsubscribe = eventBus.subscribe(listenToEvent, (eventData) => {
                console.log('ListenerWidget received event:', eventData);
                fetchData(eventData);
            });

            return () => {
                unsubscribe();
            };
        }
    }, [listenToEvent, fetchData]);

    const baseColor = userColor || defaultBaseColor;
    const lighterColor = baseColor === defaultBaseColor ? defaultLighterColor : `${baseColor}80`;

    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${baseColor}, ${lighterColor})`,
        color: '#ffffff',
        cursor: 'pointer',
    };
    const tableColumns =
        data.length > 0
            ? Object.keys(data[0]).map((key) => ({
                field: key,
                header: columnLabels?.[key] || key.toUpperCase().replace(/_/g, ' '),
            }))
            : [];

    if (loading && !data.length) {
        return (
            <div className="relative h-full w-full">
                <div
                    className="h-full rounded-xl p-4"
                    style={backgroundStyle}
                    onClick={() => setShowPicker(false)}
                >
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center text-white">
                            <div className="mb-2">Loading data...</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative h-full w-full">
                <div
                    className="h-full rounded-xl p-4"
                    style={backgroundStyle}
                    onClick={() => setShowPicker(false)}
                >
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center text-red-300">{error}</div>
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



                        {/* Table */}
                        <div className="h-[calc(100%-120px)] overflow-hidden px-7 pb-4">
                            {data.length === 0 ? (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center text-white opacity-70">
                                        {loading ? 'Loading...' : 'No data available'}
                                    </div>
                                </div>
                            ) : (
                                <div className="listener-widget-table flex h-full flex-col">

                                    <div className="flex-grow overflow-x-hidden overflow-y-auto rounded-md border border-[#d1d1d1]">
                                        <DataTable
                                            value={data}
                                            className="h-full w-full"
                                            showGridlines={false}
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
                            )}
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

export default ListenerWidget;

