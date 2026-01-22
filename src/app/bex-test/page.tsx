"use client";
import { ChartWidgetConfig } from "@/widgets/chart/multi-chart/ChartConfig.types";
import { transformBexToChart } from "@/widgets/chart/multi-chart/transformBexToChart";
import MultiChart from "@/widgets/chart/multi-chart/MultiChart"
import useBexJson from "@/hooks/useBexJson";
import mirageServer from "@/lib/mirage/mirageServer";
import { Loader } from "lucide-react";
import { useState, useMemo } from "react";
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ChartConfigPanel } from "@/widgets/chart/multi-chart/ChartConfigPanel";
import { Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";



const DashboardWidget = () => {
    mirageServer();
    const router = useRouter();
    const { data: bexResponse, isLoading, error } = useBexJson("YIMO_INV_TRND_DET_SLOW", { parser: 'new' });
    const [config, setConfig] = useState<ChartWidgetConfig>({
        chartType: "line",
        xAxisKey: "Month",
        measures: ['TotalValue'],
        stacked: true,
        valueFormat: "non-currency",
        showLegend: true,
        groupByKey: '',
        seriesConfig: {
            series: [],
        },
    });
    const [saveMessage, setSaveMessage] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const chartResult = useMemo(() => {
        if (!bexResponse || isLoading) return null;

        // Flatten measures array for transformBexToChart (it expects Array<string>)
        // Note: transformBexToChart currently expects Array<string> but type says Array<Array<string>>
        const flattenedConfig: ChartWidgetConfig = {
            ...config,
            measures: config.measures.flat() as any, // Type workaround until transformBexToChart is updated
        };
        return transformBexToChart(bexResponse, flattenedConfig);
    }, [bexResponse, config, isLoading]);

    const saveConfiguration = () => {
        setIsSaving(true);
        try {
            // Construct payload similar to mapping page format
            // Include all props even without data so it can be loaded back correctly
            const widgetId = `multi-chart-${Date.now()}`;
            
            const widgetPayload = {
                id: widgetId,
                name: 'multi-chart',
                widgetType: 'multi-chart',
                props: {
                    // Include all ChartWidgetConfig properties
                    chartType: config.chartType || 'line',
                    xAxisKey: config.xAxisKey || '',
                    groupByKey: config.groupByKey || undefined,
                    measures: config.measures || [],
                    stacked: config.stacked || false,
                    valueFormat: config.valueFormat || 'non-currency',
                    showLegend: config.showLegend !== false,
                    colorPalette: config.colorPalette || undefined,
                    colorVariantId: config.colorVariantId || undefined,
                    seriesConfig: config.seriesConfig || {
                        series: [],
                    },
                    // Store query name for loading data later
                    queryName: 'YIMO_INV_TRND_DET_SLOW',
                },
                roles: [],
                Description: 'Multi Chart Widget Configuration',
                deleted: false,
                active: true,
            };

            // Save to sessionStorage similar to mapping page
            let savedConfigs = [];
            try {
                const stored = sessionStorage.getItem('savedChartConfigs');
                if (stored) {
                    savedConfigs = JSON.parse(stored);
                }
            } catch (e) {
                console.error('Error reading saved configs:', e);
            }

            savedConfigs.push({
                ...widgetPayload,
                savedAt: new Date().toISOString(),
            });

            sessionStorage.setItem('savedChartConfigs', JSON.stringify(savedConfigs));
            sessionStorage.setItem('lastSavedChartConfig', JSON.stringify(widgetPayload));

            setSaveMessage('Configuration saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error('Error saving configuration:', error);
            setSaveMessage('Failed to save configuration');
            setTimeout(() => setSaveMessage(''), 3000);
        } finally {
            setIsSaving(false);
        }
    };


    if (isLoading || !chartResult) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader />
            </div>
        );
    }
    else {
        const { data, series, groupByField } = chartResult;
        return (
            <div className="flex flex-col h-full bg-white">
                {/* Save Button */}
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Chart Configuration</h2>
                    <div className="flex items-center gap-3">
                        {saveMessage && (
                            <span className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                {saveMessage}
                            </span>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={saveConfiguration}
                            disabled={isSaving}
                            sx={{
                                backgroundColor: '#0164b0',
                                '&:hover': {
                                    backgroundColor: '#00214e',
                                },
                            }}
                        >
                            {isSaving ? 'Saving...' : 'Save Configuration'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => router.push('/bex-test/render')}
                            sx={{
                                borderColor: '#0164b0',
                                color: '#0164b0',
                                '&:hover': {
                                    borderColor: '#00214e',
                                    backgroundColor: 'rgba(1, 100, 176, 0.04)',
                                },
                            }}
                        >
                            View Saved Config
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-[280px_1fr] gap-3 flex-1 overflow-hidden">
                    <div className="p-4 overflow-y-auto bg-gradient-to-b from-[#00214e] to-[#0164b0]">
                        <ChartConfigPanel
                            response={bexResponse}
                            value={config}
                            onChange={setConfig}
                        />
                    </div>

                    <div className="p-4 overflow-auto">
                        <MultiChart
                            title={''}
                            data={data}
                            series={series}
                            chartType={config.chartType}
                            stacked={config.stacked}
                            groupByField={groupByField}
                            valueFormat={config.valueFormat}
                            showLegend={config.showLegend}
                            colorPalette={config.colorPalette}
                        />
                    </div>
                </div>
            </div>
        );
    }
};

export default DashboardWidget;