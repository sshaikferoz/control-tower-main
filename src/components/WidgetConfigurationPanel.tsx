'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Typography,
    Box,
    TextField,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Chip,
    Divider,
    InputAdornment,
    Tooltip,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Button,
} from '@mui/material';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import PaletteIcon from '@mui/icons-material/Palette';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Alert from '@mui/material/Alert';
import { TypographyConfigUI } from './TypographyConfigUI';
import { ChartConfigPanel } from '@/widgets/chart/multi-chart/ChartConfigPanel';
import { ChartWidgetConfig } from '@/widgets/chart/multi-chart/ChartConfig.types';
import { MultiMetricConfigPanel } from '@/widgets/chart/multi-metric/MultiMetricConfigPanel';
import { MultiMetricWidgetConfig } from '@/widgets/chart/multi-metric/MultiMetricConfig.types';
import { MultiMetricComparisonConfigPanel } from '@/widgets/chart/multi-metric-comparison/MultiMetricComparisonConfigPanel';
import { MultiMetricComparisonConfig } from '@/widgets/chart/multi-metric-comparison/MultiMetricComparisonConfig.types';
import { DashboardMenuConfigPanel } from '@/widgets/dashboard-menu/DashboardMenuConfigPanel';
import { DashboardMenuWidgetConfig } from '@/widgets/dashboard-menu/DashboardMenuConfig.types';
import { KpiConfigPanel } from '@/widgets/chart/kpi-chart/KpiConfigPanel';
import { KpiWidgetConfig } from '@/widgets/chart/kpi-chart/KpiConfig.types';
import { BlankWidgetConfig } from '@/widgets/blank-widget/BlankWidgetConfig.types';
import { FilterPanelConfigPanel } from '@/widgets/filter-panel/FilterPanelConfigPanel';
import { FilterPanelWidgetConfig } from '@/widgets/filter-panel/FilterPanelConfig.types';
import { AlertNotificationsConfigPanel } from '@/widgets/alert-notifications/AlertNotificationsConfigPanel';
import { AlertNotificationsWidgetConfig } from '@/widgets/alert-notifications/AlertNotificationsConfig.types';
import useBexJson from '@/hooks/useBexJson';
import { TargetReportConfig } from '@/helpers/types';
import { getTypographyElementsForWidget } from '@/helpers/typographyHelper';

interface Widget {
    id: string;
    name: string;
    deleted?: boolean;
    props?: Record<string, any>;
}

interface Role {
    Name: string;
    RoleId?: string;
    Description?: string;
    Type?: string;
    DelFlag?: string;
}

interface WidgetConfigurationPanelProps {
    selectedWidget: string | null;
    widgets: Widget[];
    onWidgetUpdate?: (widgetId: string, props: Record<string, any>) => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`widget-config-tabpanel-${index}`}
            aria-labelledby={`widget-config-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
        </div>
    );
}

const WidgetConfigurationPanel: React.FC<WidgetConfigurationPanelProps> = ({
    selectedWidget,
    widgets,
    onWidgetUpdate,
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [newRoleName, setNewRoleName] = useState('');
    const bexResponseStoredRef = useRef(false);

    if (!selectedWidget) {
        return null;
    }

    const selectedWidgetData = widgets.find((w) => w.id === selectedWidget);
    if (!selectedWidgetData) {
        return null;
    }

    const widgetProps = selectedWidgetData.props || {};
    const widgetName = selectedWidgetData.name;
    const typography = widgetProps.typography || {};
    const backgroundColor = widgetProps.backgroundColor || '#00214E';
    const roles: Role[] = widgetProps.roles || [];
    const description: string = widgetProps.description || '';
    const title: string = widgetProps.title || '';
    // IsActive: 'X' = widget visible when dashboard is rendered, '' = hidden (mapping screen always shows all)
    const isActive = (widgetProps.IsActive ?? 'X') === 'X';
    const targetReportEnabled = widgetProps.targetReportEnabled !== undefined ? widgetProps.targetReportEnabled : true;
    const targetReport: TargetReportConfig = widgetProps.targetReport || {
        type: 'Bex Query',
        technicalId: '',
        name: '',
        description: '',
    };

    // Check if this is a multi-chart widget
    const isMultiChart = widgetName === 'multi-chart' || widgetName === 'multi-chart-bex';
    const isBexChart = widgetName === 'multi-chart-bex';
    const isKpiChart = widgetName === 'kpi-chart';
    const isMultiMetric = widgetName === 'multi-metric';
    const isMultiMetricComparison = widgetName === 'multi-metric-comparison-chart';
    const isBlankWidget = widgetName === 'blank-widget';
    const isFilterPanel = widgetName === 'filter-panel';
    const isDashboardMenu = widgetName === 'dashboard-menu';
    const isAlertNotifications = widgetName === 'alert-notifications';

    // Get queryName for BEX chart widgets
    const queryName =
        widgetProps.queryName ||
        (isMultiMetric ? widgetProps.multiMetricConfig?.queryName : '') ||
        '';

    // Load BEX data if this is a BEX chart widget, gauge chart, or multi-metric widget and we have a queryName
    // This is only for configuration preview - the component will fetch its own data when rendering
    const { data: bexData, isLoading: bexLoading, error: bexError } = useBexJson(
        queryName,
        {
            parser: 'new',
            enabled: (isBexChart || isKpiChart || isMultiMetric) && !!queryName,
        }
    );

    // Get chart config for multi-chart widgets
    const chartConfig: ChartWidgetConfig = widgetProps.chartConfig || {
        chartType: 'line',
        xAxisKey: '',
        measures: [],
        stacked: false,
        valueFormat: 'non-currency',
        showLegend: true,
        groupByKey: '',
        seriesConfig: {
            series: [],
        },
    };

    // Get y-series domain and break for line charts
    const ySeriesDomain: [number, number] | undefined = widgetProps.ySeriesDomain;
    const ySeriesBreak: number | undefined = widgetProps.ySeriesBreak;

    // Get KPI config for KPI chart widgets
    const kpiConfig: KpiWidgetConfig = widgetProps.kpiConfig || {
        minValue: 0,
        maxValue: 100,
        colorRanges: [
            { min: 0, max: 25, color: '#4CAF50', label: 'Low' },
            { min: 25, max: 75, color: '#FFC107', label: 'Moderate' },
            { min: 75, max: 100, color: '#F44336', label: 'High' },
        ],
        showLabels: true,
        showTitle: true,
        valueFormat: 'non-currency',
        kpiType: 'number',
    };

    // Get multi-metric config for multi-metric widgets
    const multiMetricConfig: MultiMetricWidgetConfig = widgetProps.multiMetricConfig || {
        metrics: [],
    };

    // Get comparison config for multi-metric-comparison-chart widgets
    const comparisonConfig: MultiMetricComparisonConfig = widgetProps.comparisonConfig || {
        series: [],
        chartType: 'bar',
    };

    // Get blank widget config for blank widgets
    const blankWidgetConfig: BlankWidgetConfig = widgetProps.blankWidgetConfig || {
        showTitle: false,
        title: '',
    };

    // Get dashboard menu config for dashboard-menu widgets
    const dashboardMenuConfig: DashboardMenuWidgetConfig = widgetProps.dashboardMenuConfig || {
        items: [],
        displayMode: 'multiple',
        layout: 'list',
    };

    // Get filter panel config for filter panel widgets
    const filterPanelConfig: FilterPanelWidgetConfig = widgetProps.filterPanelConfig || {
        eventName: '',
        components: [],
    };

    // Get alert notifications config for alert-notifications widgets
    const alertConfig: AlertNotificationsWidgetConfig = widgetProps.alertConfig || {
        categories: [],
    };

    // Use loaded BEX data for configuration panel preview only
    const bexResponse = bexData || null;

    const updateWidgetProp = (key: string, value: any) => {
        if (onWidgetUpdate) {
            onWidgetUpdate(selectedWidget, {
                ...widgetProps,
                [key]: value,
            });
        }
    };

    // Initialize chartConfig if it doesn't exist for multi-chart widgets
    useEffect(() => {
        if (isMultiChart && !widgetProps.chartConfig) {
            const defaultConfig: ChartWidgetConfig = {
                chartType: 'line',
                xAxisKey: '',
                measures: [],
                stacked: false,
                valueFormat: 'non-currency',
                showLegend: true,
                groupByKey: '',
                seriesConfig: {
                    series: [],
                },
            };
            updateWidgetProp('chartConfig', defaultConfig);
        }
    }, [isMultiChart]);


    // Initialize kpiConfig if it doesn't exist for kpi-chart widgets
    useEffect(() => {
        if (isKpiChart && !widgetProps.kpiConfig) {
            const defaultKpiConfig: KpiWidgetConfig = {
                minValue: 0,
                maxValue: 100,
                colorRanges: [
                    { min: 0, max: 25, color: '#4CAF50', label: 'Low' },
                    { min: 25, max: 75, color: '#FFC107', label: 'Moderate' },
                    { min: 75, max: 100, color: '#F44336', label: 'High' },
                ],
                showLabels: true,
                valueFormat: 'non-currency',
                kpiType: 'donut',
                listenToEvent: '',
            };
            updateWidgetProp('kpiConfig', defaultKpiConfig);
        }
    }, [isKpiChart, widgetProps.kpiConfig]);

    // Initialize multiMetricConfig if it doesn't exist for multi-metric widgets
    useEffect(() => {
        if (isMultiMetric && !widgetProps.multiMetricConfig) {
            const defaultConfig: MultiMetricWidgetConfig = {
                metrics: [],
            };
            updateWidgetProp('multiMetricConfig', defaultConfig);
        }
    }, [isMultiMetric, widgetProps.multiMetricConfig]);

    // Initialize comparisonConfig if it doesn't exist for comparison-chart widgets
    useEffect(() => {
        if (isMultiMetricComparison && !widgetProps.comparisonConfig) {
            const defaultComparisonConfig: MultiMetricComparisonConfig = {
                series: [],
                chartType: 'bar',
                showHeadlineMetrics: true,
                showLegend: true,
                showGridLines: true,
            };
            updateWidgetProp('comparisonConfig', defaultComparisonConfig);
        }
    }, [isMultiMetricComparison, widgetProps.comparisonConfig]);

    // Initialize blankWidgetConfig if it doesn't exist for blank widgets
    useEffect(() => {
        if (isBlankWidget && !widgetProps.blankWidgetConfig) {
            const defaultBlankConfig: BlankWidgetConfig = {
                title: '',
            };
            updateWidgetProp('blankWidgetConfig', defaultBlankConfig);
        }
    }, [isBlankWidget, widgetProps.blankWidgetConfig]);

    // Initialize filterPanelConfig if it doesn't exist for filter panel widgets
    useEffect(() => {
        if (isFilterPanel && !widgetProps.filterPanelConfig) {
            const defaultFilterPanelConfig: FilterPanelWidgetConfig = {
                eventName: '',
                components: [],
            };
            updateWidgetProp('filterPanelConfig', defaultFilterPanelConfig);
        }
    }, [isFilterPanel, widgetProps.filterPanelConfig]);

    // Initialize alertConfig if it doesn't exist for alert-notifications widgets
    useEffect(() => {
        if (isAlertNotifications && !widgetProps.alertConfig) {
            const defaultAlertConfig: AlertNotificationsWidgetConfig = {
                categories: [],
            };
            updateWidgetProp('alertConfig', defaultAlertConfig);
        }
    }, [isAlertNotifications, widgetProps.alertConfig]);

    const handleTypographyChange = (config: any) => {
        updateWidgetProp('typography', config);
    };

    const handleBackgroundColorChange = (color: string) => {
        updateWidgetProp('backgroundColor', color);
    };

    // Reset background to the widget's default (removes the configured color)
    const handleResetBackgroundColor = () => {
        if (onWidgetUpdate) {
            const { backgroundColor: _removed, ...rest } = widgetProps;
            onWidgetUpdate(selectedWidget, rest);
        }
    };

    const hasCustomBackgroundColor = Boolean(widgetProps.backgroundColor);

    const handleAddRole = () => {
        if (newRoleName.trim()) {
            const newRole: Role = {
                Name: newRoleName.trim(),
                RoleId: '',
                Description: '',
                Type: 'Custom',
                DelFlag: '',
            };
            const updatedRoles = [...roles, newRole];
            updateWidgetProp('roles', updatedRoles);
            setNewRoleName('');
        }
    };

    const handleDeleteRole = (index: number) => {
        const roleToDelete = roles[index];
        if (roleToDelete && roleToDelete.RoleId) {
            // Mark existing role as deleted
            const updatedRoles = roles.map((role, i) =>
                i === index ? { ...role, DelFlag: 'X' } : role
            );
            updateWidgetProp('roles', updatedRoles);
        } else {
            // Remove new role completely
            const updatedRoles = roles.filter((_, i) => i !== index);
            updateWidgetProp('roles', updatedRoles);
        }
    };

    const handleChartConfigChange = (config: ChartWidgetConfig) => {
        updateWidgetProp('chartConfig', config);
    };

    const handleMultiMetricConfigChange = (config: MultiMetricWidgetConfig) => {
        updateWidgetProp('multiMetricConfig', config);
    };

    const handleComparisonConfigChange = (config: MultiMetricComparisonConfig) => {
        updateWidgetProp('comparisonConfig', config);
    };

    const handleBlankWidgetConfigChange = (config: BlankWidgetConfig) => {
        updateWidgetProp('blankWidgetConfig', config);
    };

    const handleDashboardMenuConfigChange = (config: DashboardMenuWidgetConfig) => {
        updateWidgetProp('dashboardMenuConfig', config);
    };

    const handleFilterPanelConfigChange = (config: FilterPanelWidgetConfig) => {
        updateWidgetProp('filterPanelConfig', config);
    };

    const handleAlertNotificationsConfigChange = (config: AlertNotificationsWidgetConfig) => {
        updateWidgetProp('alertConfig', config);
    };

    const handleTargetReportChange = (field: keyof TargetReportConfig, value: string | boolean) => {
        updateWidgetProp('targetReport', {
            ...targetReport,
            [field]: value,
        });
    };

    const handleTargetReportEnabledChange = (enabled: boolean) => {
        updateWidgetProp('targetReportEnabled', enabled);
    };

    const activeRoles = roles.filter((role) => role.DelFlag !== 'X');

    const REPORT_TYPE_OPTIONS = [
        { value: 'Bex Query', label: 'Bex Query' },
        { value: 'Lumira', label: 'Lumira' },
        { value: 'WAD Template', label: 'WAD Template' },
        { value: 'Web Link', label: 'Web Link' },
    ];

    const hasConfigTab =
        isMultiChart || isKpiChart || isMultiMetric || isMultiMetricComparison || isBlankWidget || isFilterPanel || isDashboardMenu || isAlertNotifications;

    return (
        <div className="flex h-screen w-56 min-w-56 max-w-56 flex-shrink-0 flex-col overflow-auto bg-gradient-to-b from-[#00214E] to-[#0164B0] text-white md:w-64 md:min-w-64 md:max-w-64">
            <div className="sticky top-0 z-10 bg-gradient-to-b from-[#00214E] to-[#0164B0] p-3 pb-2">
                <Typography variant="subtitle2" component="h2" gutterBottom className="text-white font-semibold" sx={{ fontSize: '0.75rem' }}>
                    Widget Configuration
                </Typography>
                <div>
                    <Typography variant="body2" className="text-white capitalize" sx={{ fontSize: '0.7rem' }}>
                        {widgetName.replace(/-/g, ' ')}
                    </Typography>
                </div>

                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        '& .MuiTabs-indicator': { backgroundColor: '#84BD00' },
                        '& .MuiTab-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            textTransform: 'none',
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            minHeight: '40px',
                            padding: '6px 12px',
                            minWidth: 'auto',
                            '&.Mui-selected': { color: '#84BD00' },
                        },
                    }}
                >
                    <Tooltip title="Description" placement="top" arrow>
                        <Tab
                            icon={<InfoIcon sx={{ fontSize: '1.1rem' }} />}
                            aria-label="Description"
                        />
                    </Tooltip>

                    {hasConfigTab && (
                        <Tooltip title="Config" placement="top" arrow>
                            <Tab
                                icon={<SettingsIcon sx={{ fontSize: '1.1rem' }} />}
                                aria-label="Config"
                            />
                        </Tooltip>
                    )}

                    <Tooltip title="Report Config" placement="top" arrow>
                        <Tab
                            icon={<AssignmentIcon sx={{ fontSize: '1.1rem' }} />}
                            aria-label="Report Config"
                        />
                    </Tooltip>

                    <Tooltip title="Typography" placement="top" arrow>
                        <Tab
                            icon={<FormatPaintIcon sx={{ fontSize: '1.1rem' }} />}
                            aria-label="Typography"
                        />
                    </Tooltip>

                    <Tooltip title="Background" placement="top" arrow>
                        <Tab
                            icon={<PaletteIcon sx={{ fontSize: '1.1rem' }} />}
                            aria-label="Background"
                        />
                    </Tooltip>

                    <Tooltip title="Role" placement="top" arrow>
                        <Tab
                            icon={<PersonIcon sx={{ fontSize: '1.1rem' }} />}
                            aria-label="Role"
                        />
                    </Tooltip>
                </Tabs>

            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3">
                {/* Description Tab */}
                <TabPanel value={activeTab} index={0}>
                    <Box sx={{ color: 'white' }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                            Widget Description
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                mb: 2,
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.65rem',
                                display: 'block',
                            }}
                        >
                            Provide a short description for this widget. This can be used in details dialogs or help tooltips.
                        </Typography>

                        <Box
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                            }}
                        >
                            <Typography variant="caption" sx={{ mb: 1, color: 'white', fontWeight: 500, fontSize: '0.7rem', display: 'block' }}>
                                Visibility when dashboard is viewed
                            </Typography>
                            <Typography variant="caption" sx={{ mb: 1.5, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block' }}>
                                Disabled widgets stay on the mapping screen but are hidden when the dashboard is rendered.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant={isActive ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => updateWidgetProp('IsActive', 'X')}
                                    sx={{
                                        flex: 1,
                                        fontSize: '0.7rem',
                                        textTransform: 'none',
                                        bgcolor: isActive ? '#84BD00' : 'transparent',
                                        color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)',
                                        borderColor: 'rgba(255, 255, 255, 0.4)',
                                        '&:hover': {
                                            bgcolor: isActive ? '#6fa000' : 'rgba(255, 255, 255, 0.08)',
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                        },
                                    }}
                                >
                                    Enable
                                </Button>
                                <Button
                                    variant={!isActive ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => updateWidgetProp('IsActive', '')}
                                    sx={{
                                        flex: 1,
                                        fontSize: '0.7rem',
                                        textTransform: 'none',
                                        bgcolor: !isActive ? 'rgba(225, 85, 63, 0.9)' : 'transparent',
                                        color: !isActive ? 'white' : 'rgba(255, 255, 255, 0.8)',
                                        borderColor: 'rgba(255, 255, 255, 0.4)',
                                        '&:hover': {
                                            bgcolor: !isActive ? 'rgba(225, 85, 63, 1)' : 'rgba(255, 255, 255, 0.08)',
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                        },
                                    }}
                                >
                                    Disable
                                </Button>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                p: 2,
                            }}
                        >


                            <TextField
                                label="Title"
                                fullWidth
                                size="small"
                                variant="outlined"
                                value={title}
                                onChange={(e) => updateWidgetProp('title', e.target.value)}
                                placeholder="Enter widget title"
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '0.7rem',
                                        color: 'white',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#84BD00',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '0.7rem',
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#84BD00',
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                        fontSize: '0.7rem',
                                    },
                                }}
                            />

                            <TextField
                                label="Description"
                                fullWidth
                                size="small"
                                multiline
                                minRows={3}
                                maxRows={6}
                                variant="outlined"
                                value={description}
                                onChange={(e) => updateWidgetProp('description', e.target.value)}
                                placeholder="Enter a description that explains what this widget shows or how to use it."
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '0.7rem',
                                        color: 'white',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#84BD00',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '0.7rem',
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#84BD00',
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                        fontSize: '0.7rem',
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                </TabPanel>

                {/* Typography Tab */}
                <TabPanel value={activeTab} index={hasConfigTab ? 3 : 2}>
                    <TypographyConfigUI
                        value={typography}
                        onChange={handleTypographyChange}
                        elementTypes={getTypographyElementsForWidget(widgetName)}
                        elementLabels={
                            isDashboardMenu
                                ? { title: 'Widget title', menuTitle: 'Menu title', menuDesc: 'Menu desc' }
                                : isAlertNotifications
                                  ? {
                                        title: 'Widget title',
                                        categoryTitle: 'Category title',
                                        value: 'Value',
                                        suffix: 'Suffix',
                                    }
                                  : undefined
                        }
                    />
                </TabPanel>

                {/* Background Color Tab */}
                <TabPanel value={activeTab} index={hasConfigTab ? 4 : 3}>
                    <Box sx={{ color: 'white' }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                            Background Color
                        </Typography>
                        <Typography variant="caption" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block' }}>
                            Choose a background color for this widget. The color will be applied to the widget container.
                        </Typography>

                        <Box
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                            }}
                        >
                            <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-12">
                                    <TextField
                                        fullWidth
                                        label="Background Color"
                                        type="color"
                                        size="small"
                                        value={backgroundColor}
                                        onChange={(e) => handleBackgroundColorChange(e.target.value)}
                                        sx={{
                                            '& input': {
                                                width: '100px',
                                                height: '40px',
                                                cursor: 'pointer',
                                                borderRadius: 1,
                                            },
                                            '& label': {
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: '0.7rem',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '0.7rem',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#84BD00',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<RestartAltIcon sx={{ fontSize: '1rem' }} />}
                                    onClick={handleResetBackgroundColor}
                                    disabled={!hasCustomBackgroundColor}
                                    sx={{
                                        fontSize: '0.7rem',
                                        textTransform: 'none',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        borderColor: 'rgba(255, 255, 255, 0.4)',
                                        '&:hover': {
                                            borderColor: 'rgba(255, 255, 255, 0.6)',
                                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                                        },
                                        '&.Mui-disabled': {
                                            color: 'rgba(255, 255, 255, 0.3)',
                                            borderColor: 'rgba(255, 255, 255, 0.15)',
                                        },
                                    }}
                                >
                                    Reset to default
                                </Button>
                            </Box>
                        </Box>

                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.6rem', display: 'block' }}>
                            Reset clears the configured color so the widget uses its default background.
                        </Typography>
                    </Box>
                </TabPanel>

                {/* Role Tab */}
                <TabPanel value={activeTab} index={hasConfigTab ? 5 : 4}>
                    <Box sx={{ color: 'white' }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                            Role Configuration
                        </Typography>
                        <Typography variant="caption" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block' }}>
                            Manage roles that have access to this widget. Add or remove roles as needed.
                        </Typography>

                        <Box
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                p: 2,
                            }}
                        >
                            {/* Add Role Section */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" sx={{ mb: 1, color: 'white', fontWeight: 500, fontSize: '0.7rem', display: 'block' }}>
                                    Add New Role
                                </Typography>
                                <Box display="flex" gap={1}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Enter role name"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddRole();
                                            }
                                        }}
                                        sx={{
                                            input: { color: 'white', fontSize: '0.7rem' },
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '0.7rem',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#84BD00',
                                                },
                                            },
                                        }}
                                    />
                                    <IconButton
                                        onClick={handleAddRole}
                                        disabled={!newRoleName.trim()}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#84BD00',
                                            color: 'white',
                                            padding: '6px',
                                            '&:hover': {
                                                backgroundColor: '#6fa000',
                                            },
                                            '&.Mui-disabled': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                color: 'rgba(255, 255, 255, 0.3)',
                                            },
                                        }}
                                    >
                                        <AddIcon sx={{ fontSize: '1rem' }} />
                                    </IconButton>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                            {/* Roles List */}
                            <Box>
                                <Typography variant="caption" sx={{ mb: 1, color: 'white', fontWeight: 500, fontSize: '0.7rem', display: 'block' }}>
                                    Assigned Roles ({activeRoles.length})
                                </Typography>
                                {activeRoles.length === 0 ? (
                                    <Box
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem' }}>
                                            No roles assigned. Add a role to get started.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {activeRoles.map((role, displayIndex) => {
                                            // Find the original index in the roles array
                                            let originalIndex = -1;
                                            let activeCount = 0;
                                            for (let i = 0; i < roles.length; i++) {
                                                if (roles[i].DelFlag !== 'X') {
                                                    if (activeCount === displayIndex) {
                                                        originalIndex = i;
                                                        break;
                                                    }
                                                    activeCount++;
                                                }
                                            }

                                            return (
                                                <Box
                                                    key={`${role.Name}-${displayIndex}`}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        p: 1.5,
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        borderRadius: 1,
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                        },
                                                    }}
                                                >
                                                    <Chip
                                                        label={role.Name}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: 'rgba(132, 189, 0, 0.2)',
                                                            color: '#84BD00',
                                                            fontWeight: 500,
                                                            fontSize: '0.65rem',
                                                            height: '24px',
                                                            '& .MuiChip-label': {
                                                                padding: '0 8px',
                                                            },
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteRole(originalIndex)}
                                                        sx={{
                                                            color: '#E1553F',
                                                            padding: '4px',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(225, 85, 63, 0.2)',
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                                                    </IconButton>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </TabPanel>


                {/* Config Tab - Only for multi-chart widgets */}
                {isMultiChart && (
                    <TabPanel value={activeTab} index={1}>
                        <Box sx={{ color: 'white' }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                                Chart Configuration
                            </Typography>
                            <Typography variant="caption" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block' }}>
                                Configure chart type, axes, measures, and other chart settings.
                            </Typography>

                            {/* Query Name Input - Only for BEX charts */}
                            {isBexChart && (
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Query Name"
                                        value={queryName}
                                        onChange={(e) => updateWidgetProp('queryName', e.target.value)}
                                        placeholder="Enter BEX query name"
                                        sx={{
                                            input: { color: 'white', fontSize: '0.7rem' },
                                            label: { color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.7rem' },
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '0.7rem',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#84BD00',
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            )}

                            {isBexChart && !queryName ? (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 2,
                                        p: 2,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem' }}>
                                        Please set a query name in the widget props to load BEx data.
                                    </Typography>
                                </Box>
                            ) : isBexChart && bexLoading ? (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 2,
                                        p: 2,
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <CircularProgress size={24} sx={{ color: '#84BD00' }} />
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem' }}>
                                        Loading BEx data...
                                    </Typography>
                                </Box>
                            ) : isBexChart && bexError ? (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 2,
                                        p: 2,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: '#E1553F', fontSize: '0.65rem' }}>
                                        Error loading BEx data: {bexError.message || 'Unknown error'}
                                    </Typography>
                                </Box>
                            ) : bexResponse ? (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 2,
                                        p: 2,
                                    }}
                                >
                                    <ChartConfigPanel
                                        response={bexResponse}
                                        value={chartConfig}
                                        onChange={handleChartConfigChange}
                                    />
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 2,
                                        p: 2,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem' }}>
                                        BEx response data is required to configure the chart. Please map the widget to a data source first.
                                    </Typography>
                                </Box>
                            )}

                            {/* Y-Axis Domain and Break Configuration - For all chart types except table */}
                            {chartConfig.chartType !== 'table' && (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 2,
                                        p: 2,
                                        mt: 2,
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.75rem' }}>
                                        Y-Axis Configuration
                                    </Typography>
                                    <Typography variant="caption" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block' }}>
                                        Configure the Y-axis domain range and tick interval for charts. For horizontal bar charts, this applies to the X-axis.
                                    </Typography>

                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-6">
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Y-Axis Min"
                                                type="number"
                                                value={ySeriesDomain ? ySeriesDomain[0] : ''}
                                                onChange={(e) => {
                                                    const minValue = e.target.value === '' ? undefined : Number(e.target.value);
                                                    const currentMax = ySeriesDomain ? ySeriesDomain[1] : undefined;

                                                    if (minValue !== undefined && currentMax !== undefined) {
                                                        // Both values exist, update domain
                                                        updateWidgetProp('ySeriesDomain', [minValue, currentMax]);
                                                    } else if (minValue !== undefined) {
                                                        // Only min provided, set a default max
                                                        updateWidgetProp('ySeriesDomain', [minValue, minValue + 100]);
                                                    } else if (currentMax !== undefined) {
                                                        // Min cleared but max exists, keep max with default min
                                                        updateWidgetProp('ySeriesDomain', [0, currentMax]);
                                                    } else {
                                                        // Both cleared
                                                        updateWidgetProp('ySeriesDomain', undefined);
                                                    }
                                                }}
                                                placeholder="Min"
                                                sx={{
                                                    input: { color: 'white', fontSize: '0.7rem' },
                                                    label: { color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.7rem' },
                                                    '& .MuiOutlinedInput-root': {
                                                        fontSize: '0.7rem',
                                                        '& fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#84BD00',
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: '#84BD00',
                                                    },
                                                }}
                                            />
                                        </div>
                                        <div className="col-span-6">
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Y-Axis Max"
                                                type="number"
                                                value={ySeriesDomain ? ySeriesDomain[1] : ''}
                                                onChange={(e) => {
                                                    const maxValue = e.target.value === '' ? undefined : Number(e.target.value);
                                                    const currentMin = ySeriesDomain ? ySeriesDomain[0] : undefined;

                                                    if (currentMin !== undefined && maxValue !== undefined) {
                                                        // Both values exist, update domain
                                                        updateWidgetProp('ySeriesDomain', [currentMin, maxValue]);
                                                    } else if (maxValue !== undefined) {
                                                        // Only max provided, set default min
                                                        updateWidgetProp('ySeriesDomain', [0, maxValue]);
                                                    } else if (currentMin !== undefined) {
                                                        // Max cleared but min exists, keep min with default max
                                                        updateWidgetProp('ySeriesDomain', [currentMin, currentMin + 100]);
                                                    } else {
                                                        // Both cleared
                                                        updateWidgetProp('ySeriesDomain', undefined);
                                                    }
                                                }}
                                                placeholder="Max"
                                                sx={{
                                                    input: { color: 'white', fontSize: '0.7rem' },
                                                    label: { color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.7rem' },
                                                    '& .MuiOutlinedInput-root': {
                                                        fontSize: '0.7rem',
                                                        '& fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#84BD00',
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: '#84BD00',
                                                    },
                                                }}
                                            />
                                        </div>
                                        <div className="col-span-12">
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Y-Axis Break (Scale Factor)"
                                                type="number"
                                                value={ySeriesBreak || ''}
                                                onChange={(e) => {
                                                    const breakValue = e.target.value === '' ? undefined : Number(e.target.value);
                                                    updateWidgetProp('ySeriesBreak', breakValue);
                                                }}
                                                placeholder="e.g., 5 for intervals of 5"
                                                helperText="Interval between Y-axis ticks (e.g., 5 means ticks at 0, 5, 10, 15...)"
                                                sx={{
                                                    input: { color: 'white', fontSize: '0.7rem' },
                                                    label: { color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.7rem' },
                                                    '& .MuiOutlinedInput-root': {
                                                        fontSize: '0.7rem',
                                                        '& fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#84BD00',
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: '#84BD00',
                                                    },
                                                    '& .MuiFormHelperText-root': {
                                                        color: 'rgba(255, 255, 255, 0.5)',
                                                        fontSize: '0.65rem',
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                </Box>
                            )}
                        </Box>
                    </TabPanel>
                )}


                {/* Config Tab - Only for kpi-chart widgets */}
                {isKpiChart && (
                    <TabPanel value={activeTab} index={1}>
                        <Box sx={{ color: 'white' }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                                KPI Configuration
                            </Typography>
                            <Typography variant="caption" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block' }}>
                                Configure KPI scale, color ranges, and data selection for the KPI gauge.
                            </Typography>

                            {/* Query Name Input - Only for BEX KPI charts */}
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Query Name (BEX)"
                                    value={queryName}
                                    onChange={(e) => updateWidgetProp('queryName', e.target.value)}
                                    placeholder="Enter BEX query name"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            fontSize: '0.7rem',
                                            '& fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#84BD00',
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '0.7rem',
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#84BD00',
                                        },
                                    }}
                                />
                            </Box>

                            {!queryName ? (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 2,
                                        p: 2,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem' }}>
                                        Please set a query name in the widget props to load BEx data.
                                    </Typography>
                                </Box>
                            ) : bexLoading ? (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 2,
                                        p: 2,
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <CircularProgress size={24} sx={{ color: '#84BD00' }} />
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem' }}>
                                        Loading BEx data...
                                    </Typography>
                                </Box>
                            ) : bexError ? (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 2,
                                        p: 2,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: '#E1553F', fontSize: '0.65rem' }}>
                                        Error loading BEx data: {bexError.message || 'Unknown error'}
                                    </Typography>
                                </Box>
                            ) : bexResponse ? (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 2,
                                        p: 2,
                                    }}
                                >
                                    <KpiConfigPanel
                                        response={bexResponse}
                                        value={kpiConfig}
                                        onChange={(newConfig) => updateWidgetProp('kpiConfig', newConfig)}
                                    />
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 2,
                                        p: 2,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem' }}>
                                        BEx response data is required to configure the KPI. Please map the widget to a data source first.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </TabPanel>
                )}

                {/* Config Tab - Only for multi-metric widgets */}
                {isMultiMetric && (
                    <TabPanel value={activeTab} index={1}>
                        <Box sx={{ color: 'white' }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                                Multi Metric Configuration
                            </Typography>
                            <Typography variant="caption" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block' }}>
                                Configure multiple metrics. Each metric can have its own query and field mapping.
                            </Typography>

                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 2,
                                    p: 2,
                                }}
                            >
                                <MultiMetricConfigPanel
                                    value={multiMetricConfig}
                                    onChange={handleMultiMetricConfigChange}
                                />
                            </Box>
                        </Box>
                    </TabPanel>
                )}

                {/* Config Tab - Only for multi-metric comparison chart widgets */}
                {isMultiMetricComparison && (
                    <TabPanel value={activeTab} index={1}>
                        <Box sx={{ color: 'white' }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                                Comparison Chart Configuration
                            </Typography>
                            <Typography variant="caption" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block' }}>
                                Add multiple queries — one per series — then pick the category and value fields to compare.
                            </Typography>

                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 2,
                                    p: 2,
                                }}
                            >
                                <MultiMetricComparisonConfigPanel
                                    value={comparisonConfig}
                                    onChange={handleComparisonConfigChange}
                                />
                            </Box>
                        </Box>
                    </TabPanel>
                )}

                {/* Config Tab - Only for dashboard-menu widgets */}
                {isDashboardMenu && (
                    <TabPanel value={activeTab} index={1}>
                        <Box sx={{ color: 'white' }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                                Dashboard Menu Configuration
                            </Typography>
                            <Typography variant="caption" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block' }}>
                                Configure the list of menu items. Each item can open a different detailed report.
                            </Typography>

                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 2,
                                    p: 2,
                                }}
                            >
                                <DashboardMenuConfigPanel
                                    value={dashboardMenuConfig}
                                    onChange={handleDashboardMenuConfigChange}
                                />
                            </Box>
                        </Box>
                    </TabPanel>
                )}

                {/* Config Tab - Only for filter-panel widgets */}
                {isFilterPanel && (
                    <TabPanel value={activeTab} index={1}>
                        <Box sx={{ color: 'white' }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                                Filter Panel Configuration
                            </Typography>
                            <Typography variant="caption" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block' }}>
                                Configure filter components. Each component can be an input, date picker, or list from BEX query.
                            </Typography>

                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 2,
                                    p: 2,
                                }}
                            >
                                <FilterPanelConfigPanel
                                    value={filterPanelConfig}
                                    onChange={handleFilterPanelConfigChange}
                                />
                            </Box>
                        </Box>
                    </TabPanel>
                )}

                {/* Config Tab - Only for alert-notifications widgets */}
                {isAlertNotifications && (
                    <TabPanel value={activeTab} index={1}>
                        <Box sx={{ color: 'white' }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                                Alert Notifications Configuration
                            </Typography>
                            <Typography variant="caption" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block' }}>
                                Add categories and alerts. Each alert uses a BEX query; criticality (Warning/Normal/Critical) is derived from thresholds.
                            </Typography>

                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 2,
                                    p: 2,
                                }}
                            >
                                <AlertNotificationsConfigPanel
                                    value={alertConfig}
                                    onChange={handleAlertNotificationsConfigChange}
                                />
                            </Box>
                        </Box>
                    </TabPanel>
                )}

                {/* Report Config Tab - Available for all widgets */}
                <TabPanel value={activeTab} index={hasConfigTab ? 2 : 1}>
                    <Box sx={{ color: 'white' }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                mb: 1,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <AssignmentIcon sx={{ fontSize: '1rem' }} />
                            Detailed Report Configuration
                        </Typography>
                        <Alert
                            severity="info"
                            sx={{
                                mb: 2,
                                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                '& .MuiAlert-icon': {
                                    color: 'rgba(255, 255, 255, 0.9)',
                                },
                                '& .MuiAlert-message': {
                                    color: 'rgba(255, 255, 255, 0.9)',
                                },
                            }}
                        >
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.65rem' }}>
                                Configure the Detailed Report that this widget will open when accessed.
                            </Typography>
                        </Alert>

                        <Box
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={targetReportEnabled}
                                        onChange={(e) => handleTargetReportEnabledChange(e.target.checked)}
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            '&.Mui-checked': {
                                                color: '#84BD00',
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 500 }}>
                                        Enable Report Configuration
                                    </Typography>
                                }
                            />
                        </Box>

                        <Box
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                p: 2,
                                opacity: targetReportEnabled ? 1 : 0.5,
                                pointerEvents: targetReportEnabled ? 'auto' : 'none',
                            }}
                        >
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12">
                                    <FormControl fullWidth>
                                        <InputLabel
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: '0.7rem',
                                                '&.Mui-focused': {
                                                    color: '#84BD00',
                                                },
                                            }}
                                        >
                                            Report Type
                                        </InputLabel>
                                        <Select
                                            value={targetReport.type || 'Bex Query'}
                                            onChange={(e) => handleTargetReportChange('type', e.target.value as string)}
                                            label="Report Type"
                                            disabled={!targetReportEnabled}
                                            sx={{
                                                color: 'white',
                                                fontSize: '0.7rem',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#84BD00',
                                                },
                                                '& .MuiSvgIcon-root': {
                                                    color: 'white',
                                                },
                                            }}
                                        >
                                            {REPORT_TYPE_OPTIONS.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>

                                <div className="col-span-12">
                                    <TextField
                                        label="Technical ID"
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                        value={targetReport.technicalId || ''}
                                        onChange={(e) => handleTargetReportChange('technicalId', e.target.value)}
                                        placeholder="Enter technical report ID (e.g., YSCM_CT_PROC_OSS)"
                                        disabled={!targetReportEnabled}
                                        sx={{
                                            input: { color: 'white', fontSize: '0.7rem' },
                                            label: { color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.7rem' },
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '0.7rem',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#84BD00',
                                                },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#84BD00',
                                            },
                                        }}
                                    />
                                </div>

                                <div className="col-span-12">
                                    <TextField
                                        label="Report Name"
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                        value={targetReport.name || ''}
                                        onChange={(e) => handleTargetReportChange('name', e.target.value)}
                                        placeholder="Enter the display name of the report"
                                        disabled={!targetReportEnabled}
                                        sx={{
                                            input: { color: 'white', fontSize: '0.7rem' },
                                            label: { color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.7rem' },
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '0.7rem',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#84BD00',
                                                },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#84BD00',
                                            },
                                        }}
                                    />
                                </div>

                                <div className="col-span-12">
                                    <TextField
                                        label="Report Description"
                                        fullWidth
                                        size="small"
                                        multiline
                                        rows={3}
                                        variant="outlined"
                                        value={targetReport.description || ''}
                                        onChange={(e) => handleTargetReportChange('description', e.target.value)}
                                        placeholder="Enter a description of what this report does"
                                        disabled={!targetReportEnabled}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '0.7rem',
                                                color: 'white',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#84BD00',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: '0.7rem',
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#84BD00',
                                            },
                                            '& .MuiInputBase-input': {
                                                color: 'white',
                                                fontSize: '0.7rem',
                                            },
                                        }}
                                    />
                                </div>

                                <div className="col-span-12">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={targetReport.showInfo !== undefined ? targetReport.showInfo : false}
                                                onChange={(e) => handleTargetReportChange('showInfo', e.target.checked)}
                                                disabled={!targetReportEnabled}
                                                sx={{
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    '&.Mui-checked': {
                                                        color: '#84BD00',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 500 }}>
                                                Show Info Icon
                                            </Typography>
                                        }
                                    />
                                </div>
                            </div>
                        </Box>
                    </Box>
                </TabPanel>

            </div>
        </div>
    );
};

export default WidgetConfigurationPanel;

