"use client";
import { ChartWidgetConfig } from "@/widgets/chart/multi-chart/ChartConfig.types";
import { transformBexToChart } from "@/widgets/chart/multi-chart/transformBexToChart";
import MultiChart from "@/widgets/chart/multi-chart/MultiChart";
import useBexJson from "@/hooks/useBexJson";
import mirageServer from "@/lib/mirage/mirageServer";
import { Loader } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import React from "react";
import { Button, Alert, Box, Typography, Card, CardContent, Skeleton } from "@mui/material";
import { WidgetSkeleton } from "@/components/ui/WidgetSkeleton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

if (process.env.NODE_ENV === 'development') {
    mirageServer();
}

const RenderSavedConfig = () => {
    const router = useRouter();
    const [savedConfig, setSavedConfig] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Load saved configuration from sessionStorage
    useEffect(() => {
        try {
            const lastSaved = sessionStorage.getItem('lastSavedChartConfig');
            if (lastSaved) {
                const config = JSON.parse(lastSaved);
                setSavedConfig(config);
            } else {
                // Try to get from saved configs array
                const savedConfigs = sessionStorage.getItem('savedChartConfigs');
                if (savedConfigs) {
                    const configs = JSON.parse(savedConfigs);
                    if (configs.length > 0) {
                        // Get the most recent one
                        const latest = configs[configs.length - 1];
                        setSavedConfig(latest);
                    } else {
                        setError('No saved configuration found. Please save a configuration first.');
                    }
                } else {
                    setError('No saved configuration found. Please save a configuration first.');
                }
            }
        } catch (e) {
            console.error('Error loading saved config:', e);
            setError('Failed to load saved configuration');
        }
    }, []);

    // Extract config from saved widget payload
    const chartConfig: ChartWidgetConfig | null = useMemo(() => {
        if (!savedConfig?.props) return null;

        return {
            chartType: savedConfig.props.chartType || 'line',
            xAxisKey: savedConfig.props.xAxisKey || '',
            groupByKey: savedConfig.props.groupByKey,
            measures: savedConfig.props.measures || [],
            stacked: savedConfig.props.stacked || false,
            valueFormat: savedConfig.props.valueFormat || 'non-currency',
            showLegend: savedConfig.props.showLegend !== false,
            colorPalette: savedConfig.props.colorPalette,
            colorVariantId: savedConfig.props.colorVariantId,
            seriesConfig: savedConfig.props.seriesConfig || {
                series: [],
            },
        };
    }, [savedConfig]);

    // Get query name from saved config
    const queryName = useMemo(() => {
        return savedConfig?.props?.queryName || 'YIMO_INV_TRND_DET_SLOW';
    }, [savedConfig]);

    // Fetch BEx data using the query name from config
    const { data: bexResponse, isLoading, error: bexError } = useBexJson(queryName, {
        parser: 'new',
        enabled: !!savedConfig && !!queryName && queryName !== '',
    });

    // Transform data using saved configuration
    const chartResult = useMemo(() => {
        if (!bexResponse || !chartConfig || isLoading) return null;

        try {
            const flattenedConfig: ChartWidgetConfig = {
                ...chartConfig,
                measures: Array.isArray(chartConfig.measures) ? chartConfig.measures.flat() as any : [],
            };
            return transformBexToChart(bexResponse, flattenedConfig);
        } catch (transformError) {
            console.error('Failed to transform BEx response for render preview:', transformError);
            return null;
        }
    }, [bexResponse, chartConfig, isLoading]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-8">
                <Alert severity="error" sx={{ mb: 2, maxWidth: 600 }}>
                    {error}
                </Alert>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/bex-test')}
                >
                    Go Back to Configuration
                </Button>
            </div>
        );
    }

    if (!savedConfig || !chartConfig) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="animate-spin" />
            </div>
        );
    }

    if (isLoading || !chartResult) {
        return (
            <div className="flex flex-col h-screen bg-gray-50">
                <div className="p-4 border-b bg-white shadow-sm">
                    <Skeleton
                        variant="text"
                        width="40%"
                        height={32}
                        sx={{ bgcolor: 'var(--skeleton-bg)' }}
                    />
                </div>
                <div className="flex-1 p-4">
                    <WidgetSkeleton height={600} />
                </div>
            </div>
        );
    }

    if (bexError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-8">
                <Alert severity="error" sx={{ mb: 2, maxWidth: 600 }}>
                    Failed to load BEx query data: {bexError.message}
                </Alert>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/bex-test')}
                >
                    Go Back to Configuration
                </Button>
            </div>
        );
    }

    const { data, series, groupByField } = chartResult;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="p-4 border-b bg-white shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <Typography variant="h5" component="h1" fontWeight="bold">
                            Saved Chart Configuration
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                            Widget: {savedConfig.name} | Query: {queryName}
                        </Typography>
                    </div>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.push('/bex-test')}
                        sx={{
                            borderColor: '#0164b0',
                            color: '#0164b0',
                            '&:hover': {
                                borderColor: '#00214e',
                                backgroundColor: 'rgba(1, 100, 176, 0.04)',
                            },
                        }}
                    >
                        Back to Configuration
                    </Button>
                </div>
            </div>

            {/* Configuration Info Card */}
            <div className="p-4">
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Configuration Details
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 1 }}>
                            <div>
                                <Typography variant="caption" color="text.secondary">
                                    Chart Type
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {chartConfig.chartType}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="caption" color="text.secondary">
                                    X-Axis
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {chartConfig.xAxisKey || 'Not set'}
                                </Typography>
                            </div>
                            {chartConfig.groupByKey && (
                                <div>
                                    <Typography variant="caption" color="text.secondary">
                                        Group By
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {chartConfig.groupByKey}
                                    </Typography>
                                </div>
                            )}
                            <div>
                                <Typography variant="caption" color="text.secondary">
                                    Measures
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {chartConfig.measures.length} selected
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="caption" color="text.secondary">
                                    Value Format
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {chartConfig.valueFormat}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="caption" color="text.secondary">
                                    Stacked
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {chartConfig.stacked ? 'Yes' : 'No'}
                                </Typography>
                            </div>
                        </Box>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <div className="flex-1 p-4 overflow-auto bg-white">
                <MultiChart
                    title={savedConfig.Description || ''}
                    data={data}
                    series={series}
                    chartType={chartConfig.chartType}
                    stacked={chartConfig.stacked}
                    groupByField={groupByField}
                    valueFormat={chartConfig.valueFormat}
                    showLegend={chartConfig.showLegend}
                    colorPalette={chartConfig.colorPalette}
                />
            </div>
        </div>
    );
};

export default RenderSavedConfig;
