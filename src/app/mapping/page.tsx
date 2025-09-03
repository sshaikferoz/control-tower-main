'use client';

import SidebarMapping from '@/components/SidebarMapping';
import React, { useEffect, useState } from 'react';
import RGL, { WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import MultiMetrics from '@/components/widgets/MultiMetrics';
import PieMetric from '@/components/widgets/PieMetric';
import SimpleMetric from '@/components/widgets/SimpleMetric';
import SimpleMetricDate from '@/components/widgets/SimpleMetricDate';
import SingleLineChart from '@/components/widgets/SingleLineChart';
import TableMetric from '@/components/widgets/TableMetric';
// Import new components

import BarMetric from '@/components/widgets/BarMetric';
import StackedBarChart from '@/components/widgets/StackedBarChart';
import OrdersLineChart from '@/components/widgets/OrdersLineChart';
import AnnouncementWidget from '@/components/widgets/Announcement';
import DualLineChart from '@/components/widgets/DualLineChart';
import PieChartWithTotal from '@/components/widgets/PieChartWithTotal';
import QuadrantMetrics from '@/components/widgets/QuadrantMetrics';
import { Button } from 'primereact/button';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { parseXMLToJson } from '@/lib/bexQueryXmlToJson';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Chip,
  Grid,
  Paper,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  Divider,
  Alert,
  Snackbar,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DataIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import PreviewIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { transformFormMetadata, getValueByPath, formatValue } from '@/helpers/transformHelpers';
import {
  TransformedData,
  widgetConfigFields,
  WidgetFieldMapping,
  WidgetMappingConfig,
} from '@/helpers/types';
import LoansAppTray from '@/components/widgets/LoansAppTray';
import mirageServer from '@/lib/mirage/mirageServer';
// Import the SAP OData service
import { sapODataService, LayoutData } from '@/services/sapODataService';
import GeoSpendMapWidget from '@/components/widgets/GeoSpendMapWidget';
import NewsFeed from '@/components/widgets/NewsFeed';
import { get } from 'http';
import { title } from 'process';

// Setup GridLayout with width provider
const GridLayout = WidthProvider(RGL);

interface Widget {
  id: string;
  name: string;
  props: Record<string, any>;
}

interface FieldMappings {
  [key: string]: WidgetMappingConfig;
}

interface LayoutItem extends Layout {
  static: boolean;
  sectionName?: string;
}

interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
}

// Detailed Report Configuration Interface
interface TargetReportConfig {
  type: 'Bex Query' | 'Lumira' | 'WAD Template' | 'Web Link';
  technicalId: string;
  name: string;
  description: string;
}

// Mock data for API endpoints and entities

// MirageJS mock API server setup
if (process.env.NODE_ENV === 'development') mirageServer();
// Component mapping
const widgetMapping: Record<string, React.ComponentType<any>> = {
  'two-metrics': MultiMetrics,
  'two-metrics-piechart': PieMetric,
  'one-metric': SimpleMetric,
  'one-metric-date': SimpleMetricDate,
  'two-metrics-linechart': SingleLineChart,
  'one-metric-table': TableMetric,
  // New components
  'bar-chart': BarMetric,
  'stacked-bar-chart': StackedBarChart,
  'orders-line-chart': OrdersLineChart,
  'dual-line-chart': DualLineChart,
  'pie-chart-total': PieChartWithTotal,
  'quadrant-metrics': QuadrantMetrics,
  'loans-app-tray': LoansAppTray,
  'news-feed': NewsFeed, // Placeholder for news feed
  announcement: AnnouncementWidget, // Placeholder for map component
};

// Widget size configurations
const widgetSizes: Record<string, { w: number; h: number }> = {
  'one-metric': { w: 2, h: 1.5 },
  'one-metric-date': { w: 2, h: 1.5 },
  'two-metrics-linechart': { w: 4, h: 3 },
  'two-metrics': { w: 2.5, h: 1.5 },
  'two-metrics-piechart': { w: 2.5, h: 1.5 },
  'one-metric-table': { w: 3, h: 3 },
  // New components
  'bar-chart': { w: 2.5, h: 3 },
  'stacked-bar-chart': { w: 6, h: 3 },
  'orders-line-chart': { w: 4, h: 3 },
  'dual-line-chart': { w: 4, h: 3 },
  'pie-chart-total': { w: 2.5, h: 3 },
  'quadrant-metrics': { w: 4, h: 3 },
  'loans-app-tray': { w: 6, h: 3 }, // Wide component to fit menu + chart
  'news-feed': { w: 12, h: 3 }, // Placeholder for news feed: { w: 12, h: 12 }, // Map component
  announcement: { w: 12, h: 3 }, // Placeholder for announcement widget
};

// Report type options
const REPORT_TYPE_OPTIONS = [
  { value: 'Bex Query', label: 'Bex Query' },
  { value: 'Lumira', label: 'Lumira' },
  { value: 'WAD Template', label: 'WAD Template' },
  { value: 'Web Link', label: 'Web Link' },
];

// Determine the widget mapping type based on widget name
const getWidgetMappingType = (widgetName: string): 'simple' | 'chart' | 'table' | 'quadrant' => {
  if (widgetName.includes('table')) {
    return 'table';
  } else if (widgetName === 'quadrant-metrics') {
    return 'quadrant';
  } else if (
    widgetName.includes('linechart') ||
    widgetName.includes('piechart') ||
    widgetName.includes('bar-chart') ||
    widgetName.includes('stacked-bar') ||
    widgetName.includes('line-chart') ||
    widgetName.includes('pie-chart')
  ) {
    return 'chart';
  } else {
    return 'simple';
  }
};

// Categorize widgets to determine configuration needs
const getWidgetCategory = (widgetName: string): string => {
  if (widgetName === 'bar-chart') {
    return 'bar';
  } else if (widgetName === 'stacked-bar-chart') {
    return 'stacked-bar';
  } else if (widgetName === 'orders-line-chart') {
    return 'single-line';
  } else if (widgetName === 'dual-line-chart') {
    return 'dual-line';
  } else if (widgetName === 'pie-chart-total') {
    return 'pie-total';
  } else if (widgetName === 'quadrant-metrics') {
    return 'quadrant';
  } else if (widgetName.includes('piechart')) {
    return 'pie';
  } else if (widgetName.includes('linechart')) {
    return 'line';
  } else if (widgetName.includes('table')) {
    return 'table';
  } else {
    return 'simple';
  }
};

// Default widget props for preview
const defaultPropsMapping: Record<string, any> = {
  'one-metric': { name: 'Active Contracts', value: 45 },
  'one-metric-date': {
    name: 'Open PO Orders',
    value: 18,
    date: '13-Aug-2024',
  },
  'two-metrics': {
    metric1: 'Long Form',
    value1: '12.3',
    metric2: 'Short & Mid-Form',
    value2: '135',
  },
  'two-metrics-linechart': {
    data: {
      chart_data: [
        { date: '01-01-2024', Actual: 50, unit: '%' },
        { date: '01-02-2024', Actual: 100, unit: '%' },
        { date: '01-03-2024', Actual: 90, unit: '%' },
        { date: '01-04-2024', Actual: 150, unit: '%' },
        { date: '01-05-2024', Actual: 120, unit: '%' },
        { date: '01-06-2024', Actual: 195, unit: '%' },
      ],
      chart_yaxis: 'Actual',
      //   metric_data: {
      //     metric_value: '$142',
      //     metric_variance: '+5.40%',
      //     metric_label: 'Received Payments',
      //   },
      widget_name: 'Successful Payments',
    },
  },
  'two-metrics-piechart': {
    data: [
      { label: 'Flaring Intensity', value: 30, fill: '#84BD00' },
      { label: 'SO2 Emissions', value: 70, fill: '#E1553F' },
    ],
    metrics: {
      amount: '$234K',
      percentage: '0.31%',
      label: 'Contracts Under Development',
    },
  },
  'one-metric-table': {
    // totalAmount: '$15,223',
    title: 'Top Suppliers',
    data: [
      { supplier_name: 'Reliable Suppliers', contracts: 7, value: '52,345' },
      { supplier_name: 'Supply Solutions', contracts: 5, value: '42,345' },
    ],
  },
  // New components default props
  'bar-chart': {
    data: [
      { name: '2024', value: 163000, fill: '#83bd01' },
      { name: '2025', value: 118000, fill: '#FFC846' },
    ],
    title: 'Spend Comparison',
    variance: '+5.40%',
  },
  'stacked-bar-chart': {
    data: [
      { name: 'Jan', Supplier1: 400, Supplier2: 240, Supplier3: 100 },
      { name: 'Feb', Supplier1: 300, Supplier2: 200, Supplier3: 150 },
      { name: 'Mar', Supplier1: 450, Supplier2: 220, Supplier3: 180 },
      { name: 'Apr', Supplier1: 470, Supplier2: 260, Supplier3: 120 },
      { name: 'May', Supplier1: 390, Supplier2: 210, Supplier3: 160 },
      { name: 'Jun', Supplier1: 520, Supplier2: 280, Supplier3: 220 },
    ],
    title: 'Top Spend Supplier',
    series: [
      { name: 'Supplier A', dataKey: 'Supplier1', color: '#84BD00' },
      { name: 'Supplier B', dataKey: 'Supplier2', color: '#FFC846' },
      { name: 'Supplier C', dataKey: 'Supplier3', color: '#8979FF' },
    ],
  },
  'orders-line-chart': {
    data: [
      { name: 'Jan', value: 120000 },
      { name: 'Feb', value: 150000 },
      { name: 'Mar', value: 180000 },
      { name: 'Apr', value: 140000 },
      { name: 'May', value: 160000 },
      { name: 'Jun', value: 190000 },
      { name: 'Jul', value: 175000 },
      { name: 'Aug', value: 195000 },
      { name: 'Sep', value: 165000 },
      { name: 'Oct', value: 185000 },
      { name: 'Nov', value: 205000 },
      { name: 'Dec', value: 220000 },
    ],
    title: 'Last 12 Months Orders',
    totalValue: '$235MM',
  },
  'dual-line-chart': {
    data: [
      { name: 'Jan', line1: 10000, line2: 15000 },
      { name: 'Feb', line1: 12000, line2: 18000 },
      { name: 'Mar', line1: 15000, line2: 14000 },
      { name: 'Apr', line1: 13000, line2: 19000 },
      { name: 'May', line1: 17000, line2: 16000 },
      { name: 'Jun', line1: 20000, line2: 21000 },
    ],
    title: 'Spend Trends',
    series: [
      { name: 'Contract Spend', dataKey: 'line1', color: '#5899DA' },
      { name: 'Material Spend', dataKey: 'line2', color: '#FFC846' },
    ],
  },
  'pie-chart-total': {
    data: [
      { name: 'Segment 1', value: 2000, fill: '#84BD00' },
      { name: 'Segment 2', value: 1128, fill: '#E1553F' },
    ],
    title: 'With P&SCM Buyers',
    totalValue: '$3,128B',
    // subValue: '$339.1B',
    // variance: '+23.98%',
  },
  'quadrant-metrics': {
    metrics: [
      { title: 'In Process', value: '53', position: 'top-left' },
      { title: 'With Supplier', value: '18', position: 'top-right' },
      { title: 'B2B Order', value: '1,335', position: 'bottom-left' },
      { title: 'Completed Order', value: '1,247', position: 'bottom-right' },
    ],
  },
  // Add this to the defaultPropsMapping object
  'loans-app-tray': {
    menuItems: [
      {
        id: 1,
        icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/vector.svg`,
        label: 'Open PR',
        count: 13,
      },
      {
        id: 2,
        icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/group-1000003443.png`,
        label: 'Contract Expiring',
        count: 85,
      },
      {
        id: 3,
        icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/group-1000003444.png`,
        label: 'Pending SES',
        count: 32,
      },
      {
        id: 4,
        icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/vector-1.svg`,
        label: 'Contract with 80%\nConsumed Values',
        count: 24,
      },
    ],
    chartData: [
      { name: 'PR', value: 86, color: '#449ca4' },
      { name: 'CE', value: 156, color: '#5899da' },
      { name: 'SES', value: 114, color: '#ffaa04' },
      { name: 'CV', value: 126, color: '#ff0000' },
    ],
  },
  announcement: {
    title: 'Welcome to Our Platform! 🎉',
    announcement: [
      '🚧 Important Update! System maintenance scheduled for 2 AM.',
      '⚠️ New Feature! We’ve just released a new dashboard.',
      '🔒 Security Alert! Please update your password for better security.',
    ]
  },
};

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
      id={`mapping-tabpanel-${index}`}
      aria-labelledby={`mapping-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const MappingScreen: React.FC = () => {
  let sectionName = '';
  let sectionId = '';
  let isExpanded = '';
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    sectionName = searchParams.get('sectionName') || '';
    sectionId = searchParams.get('sectionId') || '';
    isExpanded = searchParams.get('expanded') || '';
  }

  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [selectedWidgetName, setSelectedWidgetName] = useState<string | null>(null);

  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMappings>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [reportName, setReportName] = useState<string>('YSCM_CT_PROC_OSS');
  const [parsedResponse, setParsedResponse] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<TransformedData | null>(null);
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState<boolean>(false);
  const [currentMappingField, setCurrentMappingField] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [previewData, setPreviewData] = useState<any>(null);

  // New state for roles
  const [newRole, setNewRole] = useState<string>('');

  // State for widget configurations including roles and description
  const [widgetConfigurations, setWidgetConfigurations] = useState<Record<string, any>>({});

  // For chart configuration
  const [chartXAxis, setChartXAxis] = useState<string>('');
  const [chartYAxis, setChartYAxis] = useState<string>('');
  const [chartYAxis2, setChartYAxis2] = useState<string>(''); // For dual-line charts
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]); // For quadrant metrics

  // For table configuration
  const [tableColumns, setTableColumns] = useState<Array<{ field: string; header: string }>>([]);

  // For stacked bar chart series
  const [stackedSeries, setStackedSeries] = useState<
    Array<{ name: string; dataKey: string; color: string }>
  >([]);

  // New state for save operation
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [showSaveAlert, setShowSaveAlert] = useState<boolean>(false);
  const [saveAlertSeverity, setSaveAlertSeverity] = useState<'success' | 'error'>('success');

  const [announcementCount, setAnnouncementCount] = useState(0);
  const [announcementValues, setAnnouncementValues] = useState<string[]>([])
   const [changeColor,setChangeColorOneMetric] = useState<string>('')

  useEffect(() => {
    fetch('/api/endpoints')
      .then((res) => res.json())
      .then((data) => setApiEndpoints(data.endpoints))
      .catch((err) => console.error('Failed to fetch endpoints:', err));

    // For test data, automatically fetch on load
    fetchReportData();
  }, []);

  useEffect(() => {
    setFieldsForAnnouncement()
  }, announcementValues)
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };


  const initializeWidgetMappingConfig = (widgetId: string, widgetName: string) => {

    // Determine mapping type based on widget type
    const mappingType = getWidgetMappingType(widgetName);
    const widgetCategory = getWidgetCategory(widgetName);

    // Create empty field mappings based on widget config fields
    const fields: Record<string, WidgetFieldMapping> = {};

    // Get the fields from widget config
    const configFields = widgetConfigFields[widgetName as keyof typeof widgetConfigFields] || [];

    // Initialize each field with default mapping
    configFields.forEach(({ field, path }) => {
      fields[field] = {
        fieldPath: path,
        inputType: 'manual', // Default to manual
        manualValue: getValueByPath(defaultPropsMapping[widgetName], path), // Get default value from default props
      };
    });

    // Initialize Detailed Report configuration
    const targetReportConfig: TargetReportConfig = {
      type: 'Bex Query',
      technicalId: '',
      name: '',
      description: '',
    };

    // Create the widget mapping config with appropriate type-specific settings
    const baseConfig = {
      reportName: reportName,
      mappingType: mappingType,
      fields: fields,
      targetReport: targetReportConfig, // Add Detailed Report configuration
    };

    // Add chart-specific configuration
    let configToSave;

    if (mappingType === 'chart') {
      if (widgetCategory === 'dual-line') {
        configToSave = {
          ...baseConfig,
          chartConfig: {
            xAxis: { field: '', type: 'CHA' },
            yAxis: [
              { field: '', type: 'KF' },
              { field: '', type: 'KF' },
            ],
          },
        };
      } else if (widgetCategory === 'stacked-bar') {
        // For stacked bar charts, initialize with empty fields array and series config
        const defaultSeries = defaultPropsMapping[widgetName]?.series || [];
        configToSave = {
          ...baseConfig,
          chartConfig: {
            xAxis: { field: '', type: 'CHA' },
            yAxis: { fields: [], type: 'KF' }, // Empty fields array
          },
          seriesConfig: {
            series: [...defaultSeries], // Initialize with default series from props (use spread to create a copy)
          },
        };
      } else {
        configToSave = {
          ...baseConfig,
          chartConfig: {
            xAxis: { field: '', type: 'CHA' },
            yAxis: { field: '', type: 'KF' },
          },
        };
      }
    }
    // Add table-specific configuration
    else if (mappingType === 'table') {
      configToSave = {
        ...baseConfig,
        tableConfig: {
          columns: [],
        },
      };
    }
    // Add quadrant-specific configuration
    else if (mappingType === 'quadrant') {
      configToSave = {
        ...baseConfig,
        quadrantConfig: {
          chaField: '',
          metrics: [],
        },
      };
    }
    // Simple metrics
    else {
      configToSave = baseConfig;
    }

    // Update fieldMappings state
    setFieldMappings((prev: any) => ({
      ...prev,
      [widgetId]: configToSave,
    }));

    // Store the default widget props in widgetConfigurations with roles and description
    setWidgetConfigurations((prev) => ({
      ...prev,
      [widgetId]: {
        ...defaultPropsMapping[widgetName],
        widgetType: widgetName,
        configType: mappingType,
        widgetCategory: widgetCategory,
        roles: [], // Initialize with empty roles array
        description: '', // Initialize with empty description
      },
    }));
  };

  const addWidget = (name: string) => {
    if (!widgetMapping[name]) return;
    const widgetId = `widget-${Date.now()}`;
    const { w, h } = widgetSizes[name] || { w: 2, h: 2 };

    // Add widget to widgets array
    setWidgets((prev) => [...prev, { id: widgetId, name, props: {} }]);

    // Add to layout
    setLayout((prev: any) => [
      ...prev,
      { i: widgetId, x: 0, y: Infinity, w, h, static: false, sectionName },
    ]);

    // Initialize widget mapping config
    initializeWidgetMappingConfig(widgetId, name);
  };

  const removeWidget = (id: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== id));
    setLayout((prev) => prev.filter((item) => item.i !== id));

    // Remove from field mappings
    setFieldMappings((prev) => {
      const newMappings = { ...prev };
      delete newMappings[id];
      return newMappings;
    });

    // Remove from widgetConfigurations
    setWidgetConfigurations((prev) => {
      const newConfigs = { ...prev };
      delete newConfigs[id];
      return newConfigs;
    });

    if (selectedWidget === id) {
      setSelectedWidget(null);
      setPreviewData(null);
    }
  };

  const saveLayout = async () => {
    if (!sectionId) {
      setSaveMessage('Section ID is required to save the layout.');
      setSaveAlertSeverity('error');
      setShowSaveAlert(true);
      return;
    }

    if (widgets.length === 0) {
      setSaveMessage('No widgets to save.');
      setSaveAlertSeverity('error');
      setShowSaveAlert(true);
      return;
    }

    setIsSaving(true);

    try {
      // Add sectionName to the layout
      const updatedLayout = layout.map((item) => ({
        ...item,
      }));

      // Create a clean version of fieldMappings for saving
      const cleanedFieldMappings = Object.entries(fieldMappings).reduce(
        (acc, [widgetId, config]) => {
          // Deep copy to avoid reference issues
          acc[widgetId] = JSON.parse(JSON.stringify(config));
          return acc;
        },
        {} as FieldMappings
      );

      // Include roles, description, and other configurations in the widgets data
      const widgetsWithCompleteData = widgets.map((widget) => {
        const widgetConfig = widgetConfigurations[widget.id] || {};
        const { widgetType, roles, description, ...cleanProps } = widgetConfig;

        return {
          id: widget.id,
          name: widget.name,
          props: cleanProps,
          roles: roles || [], // Include roles
          Description: description || '', // Save description as "Description"
          widgetType: widgetType || widget.name,
        };
      });

      // Prepare layout data for the service
      const layoutData: LayoutData = {
        sectionName: sectionName,
        layout: updatedLayout,
        fieldMappings: cleanedFieldMappings,
        widgets: widgetsWithCompleteData,
        expanded: isExpanded,
      };

      console.log('Saving layout data:', layoutData);

      // Save using the SAP OData service
      const result = await sapODataService.saveWidgetLayout(layoutData, sectionId);

      console.log('Save successful:', result);

      // Also save to sessionStorage for backward compatibility
      let payload = JSON.parse(sessionStorage.getItem('payload') || '[]');
      if (typeof payload === 'string') {
        payload = JSON.parse(payload);
      }

      const newEntry = {
        sectionName: sectionName,
        layout: updatedLayout,
        fieldMappings: cleanedFieldMappings,
        widgets: widgetsWithCompleteData,
        expanded: isExpanded,
      };

      payload.push(newEntry);
      sessionStorage.setItem('payload', JSON.stringify(payload));

      setSaveMessage(`Layout saved successfully! Saved ${widgets.length} widgets.`);
      setSaveAlertSeverity('success');
      setShowSaveAlert(true);

      // Navigate to the dashboard page after a short delay
      setTimeout(() => {
        window.location.href =
          process.env.NODE_ENV === 'development'
            ? '/'
            : `${process.env.NEXT_PUBLIC_BSP_NAME}/index.html`;
      }, 2000);
    } catch (error) {
      console.error('Error saving layout:', error);
      setSaveMessage(
        `Failed to save layout: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setSaveAlertSeverity('error');
      setShowSaveAlert(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWidgetClick = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (selectedWidget === id) return;
    console.log(selectedWidget, 'ppppppppp', 'widgetclicked')
    const widgetInfo = getWidgetName(id);
    if (widgetInfo && widgetInfo.name) {
      setSelectedWidgetName(widgetInfo.name);
    }


    // Save preview data to widget configurations if it exists
    if (selectedWidget && previewData) {
      setWidgetConfigurations((prev) => ({
        ...prev,
        [selectedWidget]: {
          ...prev[selectedWidget],
          ...previewData,
        },
      }));
    }

    // Now select the new widget
    setSelectedWidget(id);

    // Reset preview data
    setPreviewData(null);

    // Reset tab to first tab (Data Mapping)
    setTabValue(0);

    // Load existing configuration for this widget
    const widget = widgets.find((w) => w.id === id);
    if (!widget) return;

    // Initialize mapping config if not exists
    if (!fieldMappings[id]) {
      initializeWidgetMappingConfig(id, widget.name);
    }

    // Load chart/table specific configurations
    const config = fieldMappings[id];
    const widgetCategory = getWidgetCategory(widget.name);

    if (config?.mappingType === 'chart' && config.chartConfig) {
      setChartXAxis(config.chartConfig.xAxis.field);

      // Handle different chart types
      if (widgetCategory === 'dual-line' && Array.isArray(config.chartConfig.yAxis)) {
        setChartYAxis(config.chartConfig.yAxis[0]?.field || '');
        setChartYAxis2(config.chartConfig.yAxis[1]?.field || '');
      } else if (widgetCategory === 'stacked-bar' && config.chartConfig.yAxis.fields) {
        // For stacked bar charts, load the series config
        setChartYAxis(''); // Reset single Y-axis

        // Load the stacked series if available
        if (config.seriesConfig && config.seriesConfig.series) {
          setStackedSeries([...config.seriesConfig.series]); // Create a copy
        } else {
          // Initialize with empty array if there's no series configuration
          setStackedSeries([]);
        }
      } else {
        // Regular charts with single Y-axis
        setChartYAxis(config.chartConfig.yAxis?.field || '');
        setChartYAxis2(''); // Reset second Y-axis
      }
    } else if (config?.mappingType === 'table' && config.tableConfig) {
      setTableColumns(config.tableConfig.columns || []);
    } else if (config?.mappingType === 'quadrant' && config?.quadrantConfig) {
      // For quadrant metrics, load selected metrics
      setSelectedMetrics(config.quadrantConfig.metrics || []);
    }
  };


 const setChangeColor = (color: string) => {
  if(!selectedWidget) return
  console.log('setChangeColor was called with:', color);
  const field = 'color'
 console.log(selectedWidget)
    setFieldMappings((prev) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        fields: {
          ...prev[selectedWidget].fields,
          [field]: {
            ...prev[selectedWidget].fields[field],
            color: color,
          },
        },
      },
    }));

    // Live update the widget configuration
    handleLiveValueUpdate(field, color);
  // Optionally update state or perform other actions here
}

  // Handle roles change
  const handleRolesChange = (roles: string[]) => {
    if (!selectedWidget) return;

    setWidgetConfigurations((prev) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        roles: roles,
      },
    }));
  };

  // Handle description change
  const handleDescriptionChange = (description: string) => {
    if (!selectedWidget) return;

    setWidgetConfigurations((prev) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        description: description,
      },
    }));
  };

  // Handle Detailed Report configuration changes
  const handleTargetReportChange = (field: keyof TargetReportConfig, value: string) => {
    if (!selectedWidget) return;

    setFieldMappings((prev: any) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        targetReport: {
          ...prev[selectedWidget].targetReport,
          [field]: value,
        },
      },
    }));
  };

  // Live value update function
  const handleLiveValueUpdate = (field: string, value: any) => {
    if (!selectedWidget) return;

    setWidgetConfigurations((prev) => {
      const updated = { ...prev };
      if (updated[selectedWidget]) {
        updated[selectedWidget] = {
          ...updated[selectedWidget],
          [field]: value,
        };
      }
      return updated;
    });

    // Also update preview data if it exists
    if (previewData) {
      console.log(previewData, 'previewwwwww')
      setPreviewData((prev: any) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleChartAxisChange = (
    axisType: 'xAxis' | 'yAxis' | 'yAxis2',
    field: string,
    fieldType: 'CHA' | 'KF'
  ) => {
    if (!selectedWidget) return;

    const widgetType = getSelectedWidgetType();
    if (!widgetType) return;

    const widgetCategory = getWidgetCategory(widgetType);

    // Update appropriate state
    if (axisType === 'xAxis') {
      setChartXAxis(field);
    } else if (axisType === 'yAxis') {
      setChartYAxis(field);
    } else if (axisType === 'yAxis2') {
      setChartYAxis2(field);
    }

    if (widgetCategory === 'stacked-bar') {
      // For stacked-bar, we add to the Y axes array
      if (axisType === 'xAxis') {
        setFieldMappings((prev: any) => ({
          ...prev,
          [selectedWidget]: {
            ...prev[selectedWidget],
            chartConfig: {
              ...prev[selectedWidget].chartConfig,
              xAxis: { field, type: fieldType },
            },
          },
        }));
      } else if (axisType === 'yAxis') {
        // For stacked bar, when adding a Y axis, we add it to the fields array
        // and also update the series config
        setFieldMappings((prev) => {
          const config = JSON.parse(JSON.stringify(prev[selectedWidget])); // Deep copy to avoid issues
          const currentFields = config.chartConfig?.yAxis?.fields || [];

          if (!currentFields.includes(field)) {
            // Generate a color for the new series
            const colors = ['#84BD00', '#FFC846', '#8979FF', '#E1553F', '#5899DA'];
            const newSeriesIndex = stackedSeries.length;
            const seriesName =
              parsedResponse?.header.find((h: any) => h.fieldName === field)?.label || field;

            // Add to fields array
            config.chartConfig = {
              ...config.chartConfig,
              yAxis: {
                ...config.chartConfig?.yAxis,
                fields: [...currentFields, field],
                type: fieldType,
              },
            };

            // Add to series config
            const newSeries = {
              name: seriesName,
              dataKey: field,
              color: colors[newSeriesIndex % colors.length],
            };

            // Update local state
            const updatedSeries = [...stackedSeries, newSeries];
            setStackedSeries(updatedSeries);

            // Update config
            if (!config.seriesConfig) {
              config.seriesConfig = { series: [] };
            }

            config.seriesConfig.series = updatedSeries;
          }

          return { ...prev, [selectedWidget]: config };
        });
      }
    } else if (widgetCategory === 'dual-line') {
      // For dual-line charts, handle yAxis as an array with two elements
      setFieldMappings((prev: any) => {
        const config = { ...prev[selectedWidget] };

        if (!config.chartConfig) {
          config.chartConfig = {};
        }

        if (axisType === 'xAxis') {
          config.chartConfig.xAxis = { field, type: fieldType };
        } else if (axisType === 'yAxis') {
          // Initialize yAxis array if it doesn't exist
          if (!Array.isArray(config.chartConfig.yAxis)) {
            config.chartConfig.yAxis = [null, null];
          }
          config.chartConfig.yAxis[0] = { field, type: fieldType };
        } else if (axisType === 'yAxis2') {
          // Initialize yAxis array if it doesn't exist
          if (!Array.isArray(config.chartConfig.yAxis)) {
            config.chartConfig.yAxis = [null, null];
          }
          config.chartConfig.yAxis[1] = { field, type: fieldType };
        }

        return { ...prev, [selectedWidget]: config };
      });
    } else {
      // For regular charts with single x/y axis
      setFieldMappings((prev: any) => ({
        ...prev,
        [selectedWidget]: {
          ...prev[selectedWidget],
          chartConfig: {
            ...prev[selectedWidget].chartConfig,
            [axisType]: {
              field,
              type: fieldType,
            },
          },
        },
      }));
    }
  }; // Remove a Y-axis from stacked bar chart
  const handleRemoveStackedSeries = (index: number) => {
    if (!selectedWidget) return;

    // Update stackedSeries state
    setStackedSeries((prev) => {
      const newSeries = [...prev];
      const removed = newSeries.splice(index, 1)[0];

      // Also update fieldMappings
      setFieldMappings((prevMappings) => {
        // Deep copy to avoid reference issues
        const config = JSON.parse(JSON.stringify(prevMappings[selectedWidget]));

        // Remove from fields array
        if (config.chartConfig?.yAxis?.fields) {
          const fields = config.chartConfig.yAxis.fields.filter((f: any) => f !== removed.dataKey);
          config.chartConfig.yAxis.fields = fields;
        }

        // Remove from series config
        if (config.seriesConfig?.series) {
          config.seriesConfig.series = config.seriesConfig.series.filter(
            (_: any, i: any) => i !== index
          );
        }

        return { ...prevMappings, [selectedWidget]: config };
      });

      return newSeries;
    });
  };

  // Handle selection of metrics for quadrant chart
  const handleQuadrantMetricSelection = (metricField: string, index: number) => {
    if (!selectedWidget) return;

    setSelectedMetrics((prev) => {
      const newMetrics = [...prev];
      newMetrics[index] = metricField;
      return newMetrics;
    });

    setFieldMappings((prev: any) => {
      const config = { ...prev[selectedWidget] };

      if (!config.quadrantConfig) {
        config.quadrantConfig = {
          chaField: chartXAxis, // Using the current CHA field
          metrics: [],
        };
      }

      const newMetrics = [...(config.quadrantConfig.metrics || [])];
      newMetrics[index] = metricField;

      config.quadrantConfig.metrics = newMetrics;
      config.quadrantConfig.chaField = chartXAxis;

      return { ...prev, [selectedWidget]: config };
    });
  };

  const handleFieldMappingTypeChange = (field: string, inputType: 'manual' | 'mapped') => {
    if (!selectedWidget) return;

    setFieldMappings((prev) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        fields: {
          ...prev[selectedWidget].fields,
          [field]: {
            ...prev[selectedWidget].fields[field],
            inputType,
          },
        },
      },
    }));
  };

  const handleManualValueChange = (field: string, value: any) => {
    if (!selectedWidget) return;

    console.log(value, field, '---', '----------')

    setFieldMappings((prev) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        fields: {
          ...prev[selectedWidget].fields,
          [field]: {
            ...prev[selectedWidget].fields[field],
            inputType: 'manual',
            manualValue: value,
          },
        },
      },
    }));

    // Live update the widget configuration
    handleLiveValueUpdate(field, value);
  };

  const handleAnnouncementValueChange = (field: string, value: any) => {
    if (!selectedWidget) return;
    console.log(field, value, fieldMappings, '----------ooooooo')

    setFieldMappings((prev) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        fields: {
          ...prev[selectedWidget].fields,
          [field]: {
            ...prev[selectedWidget].fields[field],
            inputType: 'manual',
            manualValue: value,
          },
        },
      },
    }));

    console.log(fieldMappings, 'fielddddmapppingss')

    // Live update the widget configuration
    handleLiveValueUpdate(field, value);
  };


  const handleCountChange = (e: any) => {
    const count = parseInt(e.target.value);
    setAnnouncementCount(count);
    setAnnouncementValues(Array(count).fill(''))

  }


  const handleAnnouncementValueChanges = (index: any, value: any) => {
    console.log("valueee", value)
    if (!selectedWidget) return;
    const updatedValues = [...announcementValues];
    updatedValues[index] = value
    setAnnouncementValues(updatedValues)
    console.log(announcementValues, 'annnnnnounccccccccc')

    setFieldsForAnnouncement()



  }

  const setFieldsForAnnouncement = () => {
    const field = 'announcement'

    if (!selectedWidget) return;

    setFieldMappings((prev) => ({

      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        fields: {
          ...prev[selectedWidget].fields,
          [field]: {
            ...prev[selectedWidget].fields[field],
            inputType: 'manual',
            manualValue: announcementValues,
          },
        },
      },
    }));


    // Live update the widget configuration
    console.log(announcementValues, 'finalll values')
    handleLiveValueUpdate(field, announcementValues);

  }

  const handleDescriptionToggle = (value:boolean) =>{
    console.log(value,'valueeee')
   if (!selectedWidget) return;
    const field = 'showdescription'


    // console.log(fieldMappings,'--------------------------')
    //  setPreviewData((prev: any) => ({
    //     ...prev,
    //     showdescription: value,
    //   }));

     setFieldMappings((prev) => ({

      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        fields: {
          ...prev[selectedWidget].fields,
          [field]: {
            ...prev[selectedWidget].fields[field],
            inputType: 'manual',
            manualValue: value,
          },
        },
      },
    }));


    // Live update the widget configuration
    console.log(value, 'finalll values')
    handleLiveValueUpdate(field, value);




      
  }



  const handleMappedFieldSelection = (
    field: string,
    chaField: string,
    chaValue: string,
    kfField: string
  ) => {
    if (!selectedWidget) return;

    setFieldMappings((prev) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        fields: {
          ...prev[selectedWidget].fields,
          [field]: {
            ...prev[selectedWidget].fields[field],
            inputType: 'mapped',
            mappedConfig: {
              chaField,
              chaValue,
              kfField,
            },
          },
        },
      },
    }));
  };

  const handleTableColumnAdd = (field: any) => {
    if (!selectedWidget) return;

    // Get the label from the parsed response instead of using the field name
    const headerLabel =
      parsedResponse.header.find((h: any) => h.fieldName === field)?.label || field;

    const newColumn = { field, header: headerLabel };

    // Add to local state
    setTableColumns((prev) => [...prev, newColumn]);

    // Add to field mappings
    setFieldMappings((prev: any) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        tableConfig: {
          ...prev[selectedWidget].tableConfig,
          columns: [...(prev[selectedWidget].tableConfig?.columns || []), newColumn],
        },
      },
    }));
  };

  const handleTableColumnRemove = (index: number) => {
    if (!selectedWidget) return;

    // Update local state
    const newColumns = [...tableColumns];
    newColumns.splice(index, 1);
    setTableColumns(newColumns);

    // Update field mappings
    setFieldMappings((prev: any) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        tableConfig: {
          ...prev[selectedWidget].tableConfig,
          columns: newColumns,
        },
      },
    }));
  };

  const getSelectedWidgetType = () => {
    if (!selectedWidget) return null;
    const widget = widgets.find((w) => w.id === selectedWidget);
    return widget ? widget.name : null;
  };


  const getWidgetName = (id: any) => {
    const widget = widgets.find((w) => w.id == id)
    return widget
  }

  const getWidgetConfigFields = () => {
    const widgetType = getSelectedWidgetType();
    console.log(widgetType, 'typeeee')
    return widgetType
      ? widgetConfigFields[widgetType as keyof typeof widgetConfigFields] || []
      : [];
  };

  const handleReportNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newReportName = event.target.value;
    setReportName(newReportName);

    if (selectedWidget) {
      setFieldMappings((prev) => ({
        ...prev,
        [selectedWidget]: {
          ...prev[selectedWidget],
          reportName: newReportName,
        },
      }));
    }
  };

  const fetchReportData = async () => {
    if (!reportName) return;

    setLoading(true);
    try {
      const res = await fetch(
        process.env.NODE_ENV === 'development'
          ? `/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${reportName}`
          : `/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${reportName}`
        //
      );
      const data = await res.text();
      const parsedJSON = parseXMLToJson(data);
      setParsedResponse(parsedJSON);

      // Transform the data for easier access
      const transformed = transformFormMetadata(parsedJSON);
      setTransformedData(transformed);

      console.log('Transformed data:', transformed);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCHAFields = () => {
    if (!parsedResponse || !parsedResponse.header) return [];
    return parsedResponse.header.filter((field: any) => field.type === 'CHA');
  };

  const getKFFields = () => {
    if (!parsedResponse || !parsedResponse.header) return [];
    return parsedResponse.header.filter((field: any) => field.type === 'KF');
  };

  const getCHAValues = (selectedCHA: string) => {
    if (!transformedData || !selectedCHA) return [];

    // Get all CHA values from the transformed data
    if (transformedData.FormStructure[selectedCHA]) {
      return Object.keys(transformedData.FormStructure[selectedCHA]);
    }
    return [];
  };

  const getKFValue = (chaField: string, chaValue: string, kfField: string) => {
    if (!transformedData || !chaField || !chaValue || !kfField) return null;

    try {
      return transformedData.FormStructure[chaField][chaValue][kfField];
    } catch (error) {
      return null;
    }
  };

  const updateWidgetConfiguration = (widgetId: string, previewProps: any) => {
    setWidgetConfigurations((prev) => ({
      ...prev,
      [widgetId]: {
        ...prev[widgetId],
        ...previewProps,
      },
    }));

    // Also update previewData for the current selected widget
    if (selectedWidget === widgetId) {
      setPreviewData(previewProps);
    }
  };

  const closeMappingDialog = () => {
    setIsMappingDialogOpen(false);
    setCurrentMappingField('');
  };

  const handleMappingSelection = (field: string) => {
    if (!selectedWidget) return;

    const widgetConfig = fieldMappings[selectedWidget];
    const chaField = widgetConfig?.chaField || '';
    const chaValue = widgetConfig?.chaValue || '';
    const kfField = widgetConfig?.kfField || '';

    if (chaField && chaValue && kfField) {
      handleMappedFieldSelection(field, chaField, chaValue, kfField);
    }

    closeMappingDialog();
  };

  // Check if any fields have mapped input type to show query configuration
  const hasAnyMappedFields = () => {
    if (!selectedWidget || !fieldMappings[selectedWidget]) return false;

    const fields = fieldMappings[selectedWidget].fields || {};
    return Object.values(fields).some((field: any) => field.inputType === 'mapped');
  };

  // Calculate tab indices based on widget type
  const getTabIndices = () => {
    if (!selectedWidget || !fieldMappings[selectedWidget]) return {};
    const mappingType: any = fieldMappings[selectedWidget]?.mappingType;
    let currentIndex = 0;

    const indices: any = {
      dataMapping: currentIndex++,
      authorization: currentIndex++,
      info: currentIndex++,
    };

    // Add conditional tabs
    if (mappingType === 'chart') {
      indices.chartConfig = currentIndex++;
    } else if (mappingType === 'table') {
      indices.tableConfig = currentIndex++;
    } else if (mappingType === 'quadrant') {
      indices.quadrantConfig = currentIndex++;
    }

    indices.dataPreview = currentIndex++;
    indices.widgetPreview = currentIndex++;

    return indices;
  };

  // Generate preview data based on widget type and mappings
  const generatePreview = () => {
    if (!selectedWidget || !transformedData) return;

    const widgetType = getSelectedWidgetType();
    if (!widgetType) return;

    const config = fieldMappings[selectedWidget];
    const widgetCategory = getWidgetCategory(widgetType);

    // Generate preview based on widget type and mapping configuration
    let previewProps: any = {};

    // Handle simple metrics
    if (config.mappingType === 'simple') {
      // For simple metrics, process each field
      Object.entries(config.fields).forEach(([field, fieldMapping]) => {
        if (fieldMapping.inputType === 'manual') {
          // Use manual value directly
          previewProps[field] = fieldMapping.manualValue;
        } else if (fieldMapping.inputType === 'mapped' && fieldMapping.mappedConfig) {
          // Get value from the data
          const { chaField, chaValue, kfField } = fieldMapping.mappedConfig;
          const value = getKFValue(chaField, chaValue, kfField);
          if (value !== null) {
            previewProps[field] = value;
          }
        }
      });
      updateWidgetConfiguration(selectedWidget, previewProps);
    }
    // Handle chart-type widgets
    else if (config.mappingType === 'chart' && config.chartConfig) {
      try {
        // For different chart types
        if (widgetCategory === 'bar') {
          const { xAxis, yAxis } = config.chartConfig;
          if (xAxis?.field && yAxis?.field) {
            // Build bar chart data from transformed data
            const chartData = Object.entries(transformedData.FormStructure[xAxis.field] || {})
              .filter(([chaValue]) => chaValue !== 'Overall Result')
              .map(([chaValue, values]: [string, any], index) => {
                const value = values[yAxis.field] ? Number(values[yAxis.field]) : 0;
                const colors = ['#83bd01', '#FFC846', '#E1553F', '#5899DA', '#8979FF'];

                return {
                  name: chaValue,
                  value: value,
                  fill: colors[index % colors.length],
                };
              });

            // Get title & ensure it has a default
            const title = transformedData.FormMetadata[yAxis.field]?.label || 'Chart';

            previewProps = {
              data: chartData || [],
              title: title,
              variance: '+0.00%',
            };
          }
          updateWidgetConfiguration(selectedWidget, previewProps);
        } else if (widgetCategory === 'stacked-bar') {
          const { xAxis, yAxis } = config.chartConfig;
          // Make sure to initialize with default empty arrays to prevent undefined errors
          previewProps = {
            data: [],
            series: [],
            title: 'Stacked Chart',
          };

          if (xAxis?.field && yAxis?.fields?.length > 0) {
            // Get X-axis values (excluding "Overall Result")
            const xValues = Object.keys(transformedData.FormStructure[xAxis.field] || {}).filter(
              (key) => key !== 'Overall Result'
            );

            // Create data array with each X value and corresponding Y values
            const data = xValues.map((xValue) => {
              const entry: Record<string, any> = { name: xValue };

              // Add values for each Y series
              yAxis.fields.forEach((kfField: any) => {
                entry[kfField] = Number(
                  transformedData.FormStructure[xAxis.field][xValue][kfField] || 0
                );
              });

              return entry;
            });

            // Get title & ensure it has a default
            const title = transformedData.FormMetadata[xAxis.field]?.label || 'Stacked Chart';

            // Always use the series from the config to ensure dataKey matches what's in the data
            const series = config.seriesConfig?.series || [];

            previewProps = {
              data: data,
              series: series,
              title: title,
            };
          }
          updateWidgetConfiguration(selectedWidget, previewProps);
        } else if (widgetCategory === 'single-line' || widgetCategory === 'orders-line-chart') {
          const { xAxis, yAxis } = config.chartConfig;
          if (xAxis?.field && yAxis?.field) {
            // Generate line data
            const data = Object.entries(transformedData.FormStructure[xAxis.field] || {})
              .filter(([chaValue]) => chaValue !== 'Overall Result')
              .map(([chaValue, values]: [string, any]) => {
                return {
                  name: chaValue,
                  value: Number(values[yAxis.field] || 0),
                };
              });

            // Calculate total value from "Overall Result"
            let totalValue = '0';
            if (transformedData.FormStructure[xAxis.field]['Overall Result']) {
              const total = Number(
                transformedData.FormStructure[xAxis.field]['Overall Result'][yAxis.field] || 0
              );
              totalValue = `${total.toLocaleString()}`;
            }

            // Get title from metadata
            const title = transformedData.FormMetadata[yAxis.field]?.label || 'Line Chart';

            previewProps = {
              data: data || [],
              title: title,
              totalValue: totalValue,
            };
          }
          updateWidgetConfiguration(selectedWidget, previewProps);
        } else if (widgetCategory === 'dual-line') {
          const { xAxis, yAxis } = config.chartConfig;
          // Initialize with defaults
          previewProps = {
            data: [],
            series: [],
            title: 'Dual Line Chart',
          };

          if (
            xAxis?.field &&
            Array.isArray(yAxis) &&
            yAxis.length >= 2 &&
            yAxis[0]?.field &&
            yAxis[1]?.field
          ) {
            // Generate line data
            const data = Object.entries(transformedData.FormStructure[xAxis.field] || {})
              .filter(([chaValue]) => chaValue !== 'Overall Result')
              .map(([chaValue, values]: [string, any]) => {
                return {
                  name: chaValue,
                  line1: Number(values[yAxis[0].field] || 0),
                  line2: Number(values[yAxis[1].field] || 0),
                };
              });

            // Create series configuration
            const series = [
              {
                name: transformedData.FormMetadata[yAxis[0].field]?.label || yAxis[0].field,
                dataKey: 'line1',
                color: '#5899DA',
              },
              {
                name: transformedData.FormMetadata[yAxis[1].field]?.label || yAxis[1].field,
                dataKey: 'line2',
                color: '#FFC846',
              },
            ];

            // Get title from metadata
            const title = `${transformedData.FormMetadata[yAxis[0].field]?.label || yAxis[0].field
              } vs ${transformedData.FormMetadata[yAxis[1].field]?.label || yAxis[1].field}`;

            previewProps = {
              data: data,
              series: series,
              title: title,
            };
          }
          updateWidgetConfiguration(selectedWidget, previewProps);
        } else if (widgetCategory === 'pie-total') {
          const { xAxis, yAxis } = config.chartConfig;
          // Initialize with defaults
          previewProps = {
            data: [],
            title: 'Pie Chart',
            totalValue: '$0',
            subValue: '$0',
            variance: '0%',
          };

          if (xAxis?.field && yAxis?.field) {
            // Generate pie data (exclude "Overall Result")
            const data = Object.entries(transformedData.FormStructure[xAxis.field] || {})
              .filter(([chaValue]) => chaValue !== 'Overall Result')
              .map(([chaValue, values]: [string, any], index) => {
                const value = Number(values[yAxis.field] || 0);
                const colors = ['#84BD00', '#E1553F', '#5899DA', '#FFC846', '#8979FF'];

                return {
                  name: chaValue,
                  value: value,
                  fill: colors[index % colors.length],
                };
              });

            // Get total value (sum of all segments)
            const totalSum = data.reduce((sum, item) => sum + item.value, 0);
            const totalValue = `${totalSum.toLocaleString()}`;

            // Get "Overall Result" value if available
            let overallValue = 0;
            if (transformedData.FormStructure[xAxis.field]['Overall Result']) {
              overallValue = Number(
                transformedData.FormStructure[xAxis.field]['Overall Result'][yAxis.field] || 0
              );
            }
            const subValue = `${overallValue.toLocaleString()}`;

            // Calculate variance
            let variance = '+0.00%';
            if (data.length > 0 && totalSum > 0) {
              const diff = ((overallValue - totalSum) / totalSum) * 100;
              variance = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%`;
            }

            // Get title from metadata
            const title = transformedData.FormMetadata[yAxis.field]?.label || 'Pie Chart';

            previewProps = {
              data: data,
              title: title,
              totalValue: totalValue,
              subValue: subValue,
              variance: variance,
            };
          }
          updateWidgetConfiguration(selectedWidget, previewProps);
        } else if (widgetCategory === 'pie') {
          // For standard pie charts
          const { xAxis, yAxis } = config.chartConfig;
          if (xAxis?.field && yAxis?.field) {
            // Generate pie data
            const chartData = Object.entries(transformedData.FormStructure[xAxis.field] || {})
              .filter(([chaValue]) => chaValue !== 'Overall Result')
              .map(([chaValue, values]: [string, any], index) => {
                const value = Number(values[yAxis.field] || 0);
                const colors = ['#84BD00', '#E1553F', '#2D7FF9', '#FFA500'];

                return {
                  label: chaValue,
                  value: value,
                  fill: colors[index % colors.length],
                };
              });

            // Get total value from "Overall Result"
            let totalValue = 0;
            if (transformedData.FormStructure[xAxis.field]['Overall Result']) {
              totalValue = Number(
                transformedData.FormStructure[xAxis.field]['Overall Result'][yAxis.field] || 0
              );
            }

            previewProps = {
              data: chartData,
              metrics: {
                amount: formatValue(totalValue, 'currency'),
                percentage: '100%',
                label: transformedData.FormMetadata[yAxis.field]?.label || yAxis.field,
              },
            };
          }
          updateWidgetConfiguration(selectedWidget, previewProps);
        } else if (widgetCategory === 'line') {
          // For standard line charts
          const { xAxis, yAxis } = config.chartConfig;
          if (xAxis?.field && yAxis?.field) {
            // Generate chart data from form data
            const chartData = Object.entries(transformedData.FormStructure[xAxis.field] || {})
              .filter(([chaValue]) => chaValue !== 'Overall Result')
              .map(([chaValue, values]: [string, any]) => {
                return {
                  date: chaValue,
                  [yAxis.field]: Number(values[yAxis.field] || 0),
                  unit: transformedData.FormMetadata[yAxis.field]?.type || '%',
                };
              });

            // Get "Overall Result" value
            let overallValue = 0;
            if (transformedData.FormStructure[xAxis.field]['Overall Result']) {
              overallValue = Number(
                transformedData.FormStructure[xAxis.field]['Overall Result'][yAxis.field] || 0
              );
            }

            previewProps = {
              data: {
                chart_data: chartData || [],
                chart_yaxis: yAxis.field,
                // metric_data: {
                //   metric_value: formatValue(overallValue, 'currency'),
                //   metric_variance: '+0.00%', // Placeholder variance
                //   metric_label: transformedData.FormMetadata[yAxis.field]?.label || yAxis.field,
                // },
                widget_name: transformedData.FormMetadata[yAxis.field]?.label || 'Chart',
              },
            };
          }
          updateWidgetConfiguration(selectedWidget, previewProps);
        }
      } catch (err) {
        console.error('Error generating chart preview:', err);
        // Provide default props to avoid errors when displaying
        if (widgetCategory === 'stacked-bar') {
          previewProps = { data: [], series: [], title: 'Chart Preview Error' };
        } else if (widgetCategory === 'dual-line') {
          previewProps = { data: [], series: [], title: 'Chart Preview Error' };
        } else if (widgetCategory === 'pie-total') {
          previewProps = {
            data: [],
            title: 'Chart Preview Error',
            totalValue: '$0',
            subValue: '$0',
            variance: '0%',
          };
        } else if (widgetCategory === 'pie') {
          previewProps = {
            data: [],
            metrics: { amount: '$0', percentage: '0%', label: 'Preview Error' },
          };
        } else if (widgetCategory === 'line') {
          previewProps = {
            data: {
              chart_data: [],
              chart_yaxis: '',
              //   metric_data: {
              //     metric_value: '$0',
              //     metric_variance: '0%',
              //     metric_label: 'Error',
              //   },
              widget_name: 'Chart Preview Error',
            },
          };
        } else {
          previewProps = { data: [], title: 'Chart Preview Error' };
        }
      }
    }
    // Handle quadrant metrics
    else if (config.mappingType === 'quadrant' && config.quadrantConfig) {
      try {
        const { chaField, metrics } = config.quadrantConfig;
        // Initialize with empty metrics
        previewProps = { metrics: [] };

        if (chaField && metrics && metrics.length > 0) {
          // Define positions
          const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

          // Create metrics array with configured values
          const quadrantMetrics = metrics.map((metricName: any, index: number) => {
            // Find the value for this metric
            let value = '0';

            if (metricName) {
              // For simplicity, just grab the first KF field's value for the given metric CHA value
              const kfFields = Object.keys(
                transformedData.FormStructure[chaField][metrics[0] || ''] || {}
              );
              if (kfFields.length > 0) {
                const kfField = kfFields[0];
                const metricValue = transformedData.FormStructure[chaField][metricName]?.[kfField];
                if (metricValue !== undefined) {
                  value = String(metricValue);
                }
              }
            }

            return {
              title: metricName || 'No Data',
              value: value,
              position: positions[index] as
                | 'top-left'
                | 'top-right'
                | 'bottom-left'
                | 'bottom-right',
            };
          });

          // Fill in any missing metrics to ensure we have 4
          while (quadrantMetrics.length < 4) {
            quadrantMetrics.push({
              title: 'No Data',
              value: '0',
              position: positions[quadrantMetrics.length] as
                | 'top-left'
                | 'top-right'
                | 'bottom-left'
                | 'bottom-right',
            });
          }

          previewProps = { metrics: quadrantMetrics };
          updateWidgetConfiguration(selectedWidget, previewProps);
        }
      } catch (err) {
        console.error('Error generating quadrant preview:', err);
        // Provide default metrics
        previewProps = {
          metrics: [
            { title: 'Error', value: '0', position: 'top-left' },
            { title: 'Error', value: '0', position: 'top-right' },
            { title: 'Error', value: '0', position: 'bottom-left' },
            { title: 'Error', value: '0', position: 'bottom-right' },
          ],
        };
      }
    }
    // Handle table widgets
    else if (config.mappingType === 'table' && config.tableConfig) {
      // For tables, generate table data
      const { columns } = config.tableConfig;

      if (columns && columns.length > 0) {
        // Get the CHA field (assuming first field is CHA)
        const chaField = columns[0].field;

        // Get all CHA values except "Overall Result"
        const chaValues = getCHAValues(chaField).filter((val) => val !== 'Overall Result');

        // Generate table rows
        const tableData =
          chaValues.length > 0
            ? chaValues.map((chaValue) => {
              const row: any = {};

              // Process each column
              columns.forEach((column: any) => {
                // For the first column (CHA field), use the CHA value as the cell value
                if (column.field === chaField) {
                  row[column.field] = chaValue;
                } else {
                  // For KF fields, get the value from the data
                  const value = getKFValue(chaField, chaValue, column.field);
                  // Store the value with the column's field as key
                  //   row[column.field] = column.field.toLowerCase().includes('value')
                  //     ? formatValue(value, 'currency')
                  //     : Number(value || 0);
                  row[column.field] =
                    column.field.toLowerCase().includes('value') && Number(value || 0);
                  //     ? formatValue(value, 'currency')
                  //     : Number(value || 0);
                }
              });

              return row;
            })
            : [];

        // Get total from "Overall Result" (using the second column if available, or the first non-CHA column)
        let totalColumn = columns.length > 1 ? columns[1].field : null;
        if (!totalColumn) {
          // Find the first KF column if the second column isn't available
          for (let i = 0; i < columns.length; i++) {
            if (columns[i].field !== chaField) {
              totalColumn = columns[i].field;
              break;
            }
          }
        }

        const total = totalColumn ? getKFValue(chaField, 'Overall Result', totalColumn) : 0;
        console.log('Total value for table:', total);
        // Get the title from the metadata if available
        const tableTitle = transformedData.FormMetadata[chaField]?.label || 'Top Items';

        previewProps = {
          //   totalAmount: formatValue(total, 'currency'),
          title: tableTitle,
          data: tableData,
          columns: columns.map((col) => {
            // Use the label from the original metadata for the header
            const headerLabel =
              parsedResponse.header.find((h: any) => h.fieldName === col.field)?.label ||
              col.header ||
              col.field;
            return {
              field: col.field,
              header: headerLabel,
            };
          }),
        };
      }
      updateWidgetConfiguration(selectedWidget, previewProps);
    }

    setPreviewData(previewProps);
  };

  const handleCloseAlert = () => {
    setShowSaveAlert(false);
  };

  console.log(selectedWidgetName, "selectedwidget------->>")


  return (
    <div className="relative flex h-screen w-full">
      {/* Sidebar with widget options */}
      <div className="h-full bg-white">
        <SidebarMapping onItemClick={addWidget} />
      </div>

      {/* Main content area with splitter */}
      <Splitter
        className="h-100vh w-full overflow-y-auto"
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_BSP_NAME}/background/bg.png')`,
        }}
        layout="vertical"
      >
        {/* Top panel: Grid layout preview */}
        <SplitterPanel>
          <div className="max-xl flex flex-1 flex-col p-4 text-white">
            <Typography variant="h5" component="h1" gutterBottom>
              {sectionName}
            </Typography>

            {/* Grid layout for widgets */}
            <GridLayout
              className="layout h-52 w-full"
              layout={layout}
              cols={12}
              rowHeight={80}
              width={80}
              isResizable={false}
              isDraggable={true}
              onLayoutChange={(newLayout) => setLayout(newLayout as LayoutItem[])}
            >
              {widgets.map(({ id, name }) => {
                const Component = widgetMapping[name];
                // Use widgetConfigurations if available, otherwise use default props
                const widgetProps =
                  previewData && selectedWidget === id
                    ? previewData
                    : widgetConfigurations[id] || defaultPropsMapping[name];

                const hasRoles = widgetConfigurations[id]?.roles?.length > 0;
                const hasDescription = widgetConfigurations[id]?.description?.trim();

                return (

                  <div
                    key={id}
                    className={`relative z-100 rounded-lg shadow-md ${selectedWidget === id ? 'border-2 border-blue-500' : ''
                      } ${hasRoles ? 'border border-green-500' : ''}`}
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWidgetClick(id, e);
                    }}
                  >
                    <button
                      className="absolute top-2 right-2 z-50 rounded bg-red-500 px-2 py-1 text-xs text-white"
                      style={{ pointerEvents: 'auto' }}
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        removeWidget(id);
                      }}
                    >
                      ✕
                    </button>
                    {/* {hasRoles && (
                        <div className="absolute top-2 left-2 z-50 rounded-full bg-green-500 px-2 py-1 text-xs text-white">
                            <SecurityIcon style={{ fontSize: 14 }} />
                        </div>
                        )}
                        {hasDescription && (
                        <div className="absolute top-2 left-8 z-50 rounded-full bg-blue-500 px-2 py-1 text-xs text-white">
                            <InfoIcon style={{ fontSize: 14 }} />
                        </div>
                        )} */}
                    <Component {...widgetProps} setChangeColor={setChangeColor} />
                  </div>
                );
              })}
            </GridLayout>
          </div>
        </SplitterPanel>
      </Splitter>

      {/* Bottom panel: Configuration panel */}
      <div className="flex h-screen w-1/3 flex-col overflow-auto bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
        <div className="h-full overflow-y-auto">
          <Typography variant="h6" component="h2" gutterBottom>
            Widget Configuration
          </Typography>

          {selectedWidget ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Configure {getSelectedWidgetType()} Widget
              </Typography>

              {/* Configuration tabs - reordered */}
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="mapping tabs"
                className="!bg-[#ffffff20]"
                variant="scrollable"
                scrollButtons={false}
              >

                {selectedWidgetName === 'announcement'
                  ? [
                    <Tab
                      key="announcement"
                      icon={<SettingsIcon />}
                      label="Announcement Mapping"
                      className="!text-white"
                    />,
                  ]
                  : [
                    <Tab
                      key="data-mapping"
                      icon={<SettingsIcon />}
                      label="Data Mapping"
                      className="!text-white"
                    />,
                    <Tab
                      key="auth"
                      icon={<SecurityIcon />}
                      label="Authorization"
                      className="!text-white"
                    />,
                    <Tab
                      key="info"
                      icon={<InfoIcon />}
                      label="Info"
                      className="!text-white"
                    />,
                    fieldMappings[selectedWidget]?.mappingType === 'chart' && (
                      <Tab
                        key="chart"
                        icon={<DataIcon />}
                        label="Chart Config"
                        className="!text-white"
                      />
                    ),
                    fieldMappings[selectedWidget]?.mappingType === 'table' && (
                      <Tab
                        key="table"
                        icon={<DataIcon />}
                        label="Table Config"
                        className="!text-white"
                      />
                    ),
                    fieldMappings[selectedWidget]?.mappingType === 'quadrant' && (
                      <Tab
                        key="quadrant"
                        icon={<DataIcon />}
                        label="Quadrant Config"
                        className="!text-white"
                      />
                    ),
                    <Tab
                      key="data-preview"
                      icon={<PreviewIcon />}
                      label="Data Preview"
                      className="!text-white"
                    />,
                    <Tab
                      key="widget-preview"
                      icon={<VisibilityIcon />}
                      label="Widget Preview"
                      className="!text-white"
                    />,
                  ].filter(Boolean)}
              </Tabs>


              {(() => {
                const tabIndices = getTabIndices();
                return (
                  <>
                    {/* Data Mapping Tab - First tab */}
                    {console.log(getWidgetConfigFields())}

                    <TabPanel value={tabValue} index={tabIndices.dataMapping}>
                      {/* Show query configuration if any fields are mapped */}
                      {hasAnyMappedFields() && (
                        <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: '#ffffff20' }}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                            Query Configuration
                          </Typography>
                          <Alert severity="info" sx={{ mb: 2, backgroundColor: '#2196f320' }}>
                            <Typography sx={{ color: 'white' }}>
                              Configure the SAP BW report to fetch data from when using mapped
                              fields.
                            </Typography>
                          </Alert>

                          <FormControl fullWidth variant="outlined" margin="normal">
                            <TextField
                              label="Report Technical Name"
                              value={reportName}
                              onChange={handleReportNameChange}
                              helperText="Enter the technical name of the SAP BW report"
                              sx={{
                                input: { color: 'white' },
                                label: { color: 'white' },
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': { borderColor: 'white' },
                                  '&:hover fieldset': { borderColor: 'white' },
                                  '&.Mui-focused fieldset': { borderColor: 'white' },
                                },
                                '& .MuiFormHelperText-root': { color: 'white' },
                              }}
                            />
                            <Box mt={2} display="flex" alignItems="center" gap={2}>
                              <Button
                                label="Fetch Report Data"
                                onClick={fetchReportData}
                                disabled={loading}
                              />
                              {loading && <CircularProgress size={20} />}
                            </Box>
                          </FormControl>
                        </Paper>
                      )}

                      {/* Field mapping configuration */}
                      {getWidgetConfigFields().map(({ field }) => {
                        console.log(field, 'fielddd')
                        const fieldMapping = fieldMappings[selectedWidget]?.fields[field];
                        const isManualInput = fieldMapping?.inputType === 'manual';
                        const mappedConfig = fieldMapping?.mappedConfig;

                        return field !== 'data' &&
                          field !== 'chart_data' &&
                          field !== 'chart_yaxis' &&
                          field !== 'series' &&
                          field !== 'metrics' &&
                          field !== 'menuItems' &&
                          field !== 'chartData' &&
                          selectedWidgetName !== 'announcement' ?
                          (
                            <FormControl fullWidth variant="outlined" margin="normal" key={field}>
                              <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                                {/* {field} */}
                                {field === 'name' || field === 'widget_name'
                                  ? 'TITLE'
                                  : field?.toUpperCase()}
                              </Typography>

                              {/* Input Type Selection */}
                              <FormControl fullWidth variant="outlined" margin="normal" size="small">
                                <InputLabel sx={{ color: 'white' }}>Input Type</InputLabel>
                                <Select
                                  value={isManualInput ? 'manual' : 'mapped'}
                                  onChange={(e) =>
                                    handleFieldMappingTypeChange(
                                      field,
                                      e.target.value as 'manual' | 'mapped'
                                    )
                                  }
                                  label="Input Type"
                                  sx={{
                                    color: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '& .MuiSvgIcon-root': { color: 'white' },
                                  }}
                                >
                                  <MenuItem value="manual">Manual Input</MenuItem>
                                  <MenuItem value="mapped">Query Mapping</MenuItem>
                                </Select>
                              </FormControl>

                              {/* Manual Input Field */}
                              {isManualInput ? (
                                <TextField
                                  label={`Value for ${field}`}
                                  value={fieldMapping?.manualValue || ''}
                                  onChange={(e) => handleManualValueChange(field, e.target.value)}
                                  fullWidth
                                  margin="normal"
                                  size="small"
                                  sx={{
                                    input: { color: 'white' },
                                    label: { color: 'white' },
                                    '& .MuiOutlinedInput-root': {
                                      '& fieldset': { borderColor: 'white' },
                                      '&:hover fieldset': { borderColor: 'white' },
                                      '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                      },
                                    },
                                  }}
                                />
                              ) : (
                                /* Mapped Input Field Configuration */
                                <Box
                                  mt={2}
                                  p={2}
                                  border={1}
                                  borderColor="rgba(255,255,255,0.3)"
                                  borderRadius={1}
                                  sx={{ backgroundColor: '#ffffff10' }}
                                >
                                  <Typography variant="subtitle2" sx={{ color: 'white', mb: 2 }}>
                                    Data Mapping Configuration
                                  </Typography>
                                  {!parsedResponse && (
                                    <Alert
                                      severity="warning"
                                      sx={{ mb: 2, backgroundColor: '#ff980020' }}
                                    >
                                      <Typography sx={{ color: 'white' }}>
                                        Please configure and fetch report data first to enable field
                                        mapping.
                                      </Typography>
                                    </Alert>
                                  )}

                                  {parsedResponse && (
                                    <Grid container spacing={2}>
                                      <Grid item xs={12}>
                                        <FormControl fullWidth size="small">
                                          <InputLabel sx={{ color: 'white' }}>CHA Field</InputLabel>
                                          <Select
                                            value={mappedConfig?.chaField || ''}
                                            onChange={(e) => {
                                              const chaField = e.target.value as string;
                                              handleMappedFieldSelection(
                                                field,
                                                chaField,
                                                mappedConfig?.chaValue || '',
                                                mappedConfig?.kfField || ''
                                              );
                                            }}
                                            label="CHA Field"
                                            sx={{
                                              color: 'white',
                                              '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'white',
                                              },
                                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'white',
                                              },
                                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'white',
                                              },
                                              '& .MuiSvgIcon-root': {
                                                color: 'white',
                                              },
                                            }}
                                          >
                                            {getCHAFields().map((chaField: any) => (
                                              <MenuItem
                                                key={chaField.fieldName}
                                                value={chaField.fieldName}
                                              >
                                                {chaField.label} ({chaField.fieldName})
                                              </MenuItem>
                                            ))}
                                          </Select>
                                        </FormControl>
                                      </Grid>

                                      {mappedConfig?.chaField && (
                                        <Grid item xs={12}>
                                          <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: 'white' }}>CHA Value</InputLabel>
                                            <Select
                                              value={mappedConfig?.chaValue || ''}
                                              onChange={(e) => {
                                                const chaValue = e.target.value as string;
                                                handleMappedFieldSelection(
                                                  field,
                                                  mappedConfig?.chaField || '',
                                                  chaValue,
                                                  mappedConfig?.kfField || ''
                                                );
                                              }}
                                              label="CHA Value"
                                              sx={{
                                                color: 'white',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                  borderColor: 'white',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                  borderColor: 'white',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                  borderColor: 'white',
                                                },
                                                '& .MuiSvgIcon-root': {
                                                  color: 'white',
                                                },
                                              }}
                                            >
                                              {getCHAValues(mappedConfig?.chaField).map((value) => (
                                                <MenuItem key={value} value={value}>
                                                  {value}
                                                </MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>
                                        </Grid>
                                      )}

                                      {mappedConfig?.chaField && mappedConfig?.chaValue && (
                                        <Grid item xs={12}>
                                          <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: 'white' }}>KF Field</InputLabel>
                                            <Select
                                              value={mappedConfig?.kfField || ''}
                                              onChange={(e) => {
                                                const kfField = e.target.value as string;
                                                handleMappedFieldSelection(
                                                  field,
                                                  mappedConfig?.chaField || '',
                                                  mappedConfig?.chaValue || '',
                                                  kfField
                                                );
                                              }}
                                              label="KF Field"
                                              sx={{
                                                color: 'white',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                  borderColor: 'white',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                  borderColor: 'white',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                  borderColor: 'white',
                                                },
                                                '& .MuiSvgIcon-root': {
                                                  color: 'white',
                                                },
                                              }}
                                            >
                                              {getKFFields().map((kfField: any) => (
                                                <MenuItem
                                                  key={kfField.fieldName}
                                                  value={kfField.fieldName}
                                                >
                                                  {kfField.label} ({kfField.fieldName})
                                                </MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>
                                        </Grid>
                                      )}

                                      {mappedConfig?.chaField &&
                                        mappedConfig?.chaValue &&
                                        mappedConfig?.kfField && (
                                          <Grid item xs={12}>
                                            <Alert
                                              severity="success"
                                              sx={{ backgroundColor: '#4caf5020' }}
                                            >
                                              <Typography variant="body2" sx={{ color: 'white' }}>
                                                Mapped Value:{' '}
                                                {getKFValue(
                                                  mappedConfig.chaField,
                                                  mappedConfig.chaValue,
                                                  mappedConfig.kfField
                                                ) || 'No data'}
                                              </Typography>
                                            </Alert>
                                          </Grid>
                                        )}
                                    </Grid>
                                  )}
                                </Box>
                              )}
                            </FormControl>
                          ) : null;
                      })}
                      {selectedWidgetName === 'announcement' ? (() => {
                        const fieldMapping = fieldMappings[selectedWidget]?.fields['title'];
                        console.log(fieldMapping,)
                        return (
                          <>
                            <Box sx={{ color: 'white' }}>
                              <FormControl fullWidth variant="outlined" margin="normal" key={'title'}>
                                <TextField
                                  label='TITLE'
                                  onChange={(e) => handleAnnouncementValueChange('title', e.target.value)}
                                  fullWidth
                                  margin="normal"
                                  value={fieldMapping?.manualValue || ''}
                                  size="small"
                                  sx={{
                                    input: { color: 'white' },
                                    label: { color: 'white' },
                                    '& .MuiOutlinedInput-root': {
                                      '& fieldset': { borderColor: 'white' },
                                      '&:hover fieldset': { borderColor: 'white' },
                                      '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                      },
                                    },
                                  }}
                                />
                              </FormControl>
                              {/* Dropdown to choose number of announcements */}
                              <FormControl fullWidth variant="outlined" margin="normal">
                                <InputLabel sx={{ color: 'white' }}>Number of Announcements</InputLabel>
                                <Select
                                  value={announcementCount}
                                  onChange={handleCountChange}
                                  label="Number of Announcements"
                                  size="small"
                                  sx={{
                                    color: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                  }}
                                >
                                  {[...Array(5).keys()].map((num) => (
                                    <MenuItem key={num + 1} value={num + 1}>
                                      {num + 1}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              {/* Dynamic Announcement Fields */}
                              {announcementValues.map((value, index) => (
                                <FormControl fullWidth variant="outlined" margin="normal" key={`announcement-${index}`}>
                                  <TextField
                                    label={`ANNOUNCEMENT ${index + 1}`}
                                    value={value}
                                    onChange={(e) => handleAnnouncementValueChanges(index, e.target.value)}
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    InputProps={{
                                      style: {
                                        color: 'white',
                                        fontSize: '1.1rem', // <-- Bigger font
                                        fontWeight: '500',   // <-- Slightly bolder
                                      },
                                    }}
                                    InputLabelProps={{
                                      style: {
                                        color: 'white',
                                        fontSize: '1rem',
                                      },
                                    }}
                                    size="small"
                                    sx={{
                                      input: { color: 'white' },
                                      label: { color: 'white' },
                                      '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: 'white' },
                                        '&:hover fieldset': { borderColor: 'white' },
                                        '&.Mui-focused fieldset': {
                                          borderColor: 'white',
                                        },
                                      },
                                    }}
                                  />
                                </FormControl>
                              ))}
                            </Box>

                            {console.log(fieldMappings)}
                          </>
                        );
                      })() : null}

                    </TabPanel>

                    {/* Authorization/Roles Tab - Second tab */}
                    <TabPanel value={tabValue} index={tabIndices.authorization}>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                          Role Management
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2, backgroundColor: '#2196f320' }}>
                          <Typography sx={{ color: 'white' }}>
                            Add roles that are allowed to view this widget. If no roles are
                            specified, the widget will be visible to all users.
                          </Typography>
                        </Alert>

                        <Box mb={2}>
                          <TextField
                            label="Add Role"
                            fullWidth
                            size="small"
                            variant="outlined"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newRole.trim()) {
                                const currentRoles =
                                  widgetConfigurations[selectedWidget]?.roles || [];
                                const updatedRoles = [...currentRoles, newRole.trim()];
                                handleRolesChange(updatedRoles);
                                setNewRole('');
                              }
                            }}
                            sx={{
                              input: { color: 'white' },
                              label: { color: 'white' },
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'white' },
                                '&:hover fieldset': { borderColor: 'white' },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'white',
                                },
                              },
                            }}
                          />
                          <div className="mt-2">
                            <Button
                              label="Add Role"
                              onClick={() => {
                                if (newRole.trim()) {
                                  const currentRoles =
                                    widgetConfigurations[selectedWidget]?.roles || [];
                                  const updatedRoles = [...currentRoles, newRole.trim()];
                                  handleRolesChange(updatedRoles);
                                  setNewRole('');
                                }
                              }}
                              icon={<AddIcon />}
                            />
                          </div>
                        </Box>

                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
                          Assigned Roles:
                        </Typography>

                        <List>
                          {(widgetConfigurations[selectedWidget]?.roles || []).map(
                            (role: string, index: number) => (
                              <ListItem key={index} sx={{ px: 0 }}>
                                <Box
                                  width="100%"
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: '#ffffff10',
                                    borderRadius: 1,
                                    px: 2,
                                    py: 1,
                                  }}
                                >
                                  <Typography sx={{ color: 'white' }}>{role}</Typography>
                                  <IconButton
                                    edge="end"
                                    onClick={() => {
                                      const currentRoles =
                                        widgetConfigurations[selectedWidget]?.roles || [];
                                      const updatedRoles = currentRoles.filter(
                                        (_: string, i: number) => i !== index
                                      );
                                      handleRolesChange(updatedRoles);
                                    }}
                                  >
                                    <DeleteIcon sx={{ color: 'white' }} />
                                  </IconButton>
                                </Box>
                              </ListItem>
                            )
                          )}
                          {(widgetConfigurations[selectedWidget]?.roles || []).length === 0 && (
                            <Typography
                              variant="body2"
                              sx={{ color: 'white', fontStyle: 'italic' }}
                            >
                              No roles assigned. This widget will be visible to all users.
                            </Typography>
                          )}
                        </List>
                      </Box>
                    </TabPanel>
                    {/* Info Tab - Third tab */}
                    <TabPanel value={tabValue} index={tabIndices.info}>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                          Widget Information
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2, backgroundColor: '#2196f320' }}>
                          <Typography sx={{ color: 'white' }}>
                            Add a description to help users understand what this widget displays.
                          </Typography>
                        </Alert>

                        <TextField
                          label="Widget Description"
                          fullWidth
                          multiline
                          rows={4}
                          variant="outlined"
                          value={widgetConfigurations[selectedWidget]?.description || ''}
                          onChange={(e) => handleDescriptionChange(e.target.value)}
                          placeholder="Enter a description for this widget..."
                          sx={{
                            input: { color: 'white' },
                            label: { color: 'white' },
                            '& .MuiOutlinedInput-root': {
                              color: 'white',
                              '& fieldset': { borderColor: 'white' },
                              '&:hover fieldset': { borderColor: 'white' },
                              '&.Mui-focused fieldset': {
                                borderColor: 'white',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: 'white',
                            },
                            '& .MuiFormHelperText-root': { color: 'white' },
                          }}
                          helperText="This description will be saved with the widget configuration."
                        />

                        {/* Detailed Report Configuration Section */}
                        <Box mt={4}>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <AssignmentIcon sx={{ mr: 1 }} />
                            Detailed Report Configuration
                          </Typography>
                          <Alert severity="info" sx={{ mb: 2, backgroundColor: '#2196f320' }}>
                            <Typography sx={{ color: 'white' }}>
                              Configure the Detailed Report that this widget will open when
                              accessed.
                            </Typography>
                          </Alert>

                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <FormControl fullWidth>
                                <InputLabel sx={{ color: 'white' }}>Report Type</InputLabel>
                                <Select
                                  value={
                                    fieldMappings[selectedWidget]?.targetReport?.type || 'Bex Query'
                                  }
                                  onChange={(e) =>
                                    handleTargetReportChange('type', e.target.value as string)
                                  }
                                  label="Report Type"
                                  sx={{
                                    color: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '& .MuiSvgIcon-root': { color: 'white' },
                                  }}
                                >
                                  {REPORT_TYPE_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                label="Technical ID"
                                fullWidth
                                variant="outlined"
                                value={
                                  fieldMappings[selectedWidget]?.targetReport?.technicalId || ''
                                }
                                onChange={(e) =>
                                  handleTargetReportChange('technicalId', e.target.value)
                                }
                                placeholder="Enter technical report ID (e.g., YSCM_CT_PROC_OSS)"
                                sx={{
                                  input: { color: 'white' },
                                  label: { color: 'white' },
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'white' },
                                    '&:hover fieldset': { borderColor: 'white' },
                                    '&.Mui-focused fieldset': {
                                      borderColor: 'white',
                                    },
                                  },
                                }}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                label="Report Name"
                                fullWidth
                                variant="outlined"
                                value={fieldMappings[selectedWidget]?.targetReport?.name || ''}
                                onChange={(e) => handleTargetReportChange('name', e.target.value)}
                                placeholder="Enter the display name of the report"
                                sx={{
                                  input: { color: 'white' },
                                  label: { color: 'white' },
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'white' },
                                    '&:hover fieldset': { borderColor: 'white' },
                                    '&.Mui-focused fieldset': {
                                      borderColor: 'white',
                                    },
                                  },
                                }}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                label="Report Description"
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                value={
                                  fieldMappings[selectedWidget]?.targetReport?.description || ''
                                }
                                onChange={(e) =>
                                  handleTargetReportChange('description', e.target.value)
                                }
                                placeholder="Enter a description of what this report does"
                                sx={{
                                  input: { color: 'white' },
                                  label: { color: 'white' },
                                  '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': { borderColor: 'white' },
                                    '&:hover fieldset': { borderColor: 'white' },
                                    '&.Mui-focused fieldset': {
                                      borderColor: 'white',
                                    },
                                  },
                                  '& .MuiInputBase-input': {
                                    color: 'white',
                                  },
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Box>

                        <Box mt={3}>
                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
                            Widget Details:
                          </Typography>
                          <Paper elevation={2} sx={{ p: 2, backgroundColor: '#ffffff10' }}>
                            <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                              <strong>Widget Type:</strong> {getSelectedWidgetType()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                              <strong>Mapping Type:</strong>{' '}
                              {fieldMappings[selectedWidget]?.mappingType || 'Not configured'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                              <strong>Data Source:</strong> {reportName || 'Not specified'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                              <strong>Detailed Report:</strong>{' '}
                              {fieldMappings[selectedWidget]?.targetReport?.name ||
                                'Not configured'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              <strong>Roles Assigned:</strong>{' '}
                              {(widgetConfigurations[selectedWidget]?.roles || []).length > 0
                                ? (widgetConfigurations[selectedWidget]?.roles || []).join(', ')
                                : 'No roles assigned (visible to all)'}
                            </Typography>
                          </Paper>
                        </Box>
                      </Box>
                    </TabPanel>
                    {/* Chart Configuration Tab */}
                    {fieldMappings[selectedWidget]?.mappingType === 'chart' && (
                      <TabPanel value={tabValue} index={tabIndices.chartConfig!}>
                        <Box className="chart-config">
                          <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                            Chart Configuration
                          </Typography>

                          <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: '#ffffff20' }}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                              Query Configuration
                            </Typography>
                            <Alert severity="info" sx={{ mb: 2, backgroundColor: '#2196f320' }}>
                              <Typography sx={{ color: 'white' }}>
                                Configure the SAP BW report to fetch data from when using mapped
                                fields.
                              </Typography>
                            </Alert>

                            <FormControl fullWidth variant="outlined" margin="normal">
                              <TextField
                                label="Report Technical Name"
                                value={reportName}
                                onChange={handleReportNameChange}
                                helperText="Enter the technical name of the SAP BW report"
                                sx={{
                                  input: { color: 'white' },
                                  label: { color: 'white' },
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'white' },
                                    '&:hover fieldset': { borderColor: 'white' },
                                    '&.Mui-focused fieldset': { borderColor: 'white' },
                                  },
                                  '& .MuiFormHelperText-root': { color: 'white' },
                                }}
                              />
                              <Box mt={2} display="flex" alignItems="center" gap={2}>
                                <Button
                                  label="Fetch Report Data"
                                  onClick={fetchReportData}
                                  disabled={loading}
                                />
                                {loading && <CircularProgress size={20} />}
                              </Box>
                            </FormControl>
                          </Paper>

                          {!parsedResponse && (
                            <Alert severity="warning" sx={{ mb: 2, backgroundColor: '#ff980020' }}>
                              <Typography sx={{ color: 'white' }}>
                                Please fetch report data first to configure chart axes.
                              </Typography>
                            </Alert>
                          )}
                          {parsedResponse && (
                            <>
                              {/* Common X-Axis selection for all chart types */}
                              <Box mt={3}>
                                <FormControl fullWidth margin="normal">
                                  <InputLabel sx={{ color: 'white' }}>
                                    X-Axis (Categories)
                                  </InputLabel>
                                  <Select
                                    value={chartXAxis}
                                    onChange={(e) =>
                                      handleChartAxisChange(
                                        'xAxis',
                                        e.target.value as string,
                                        'CHA'
                                      )
                                    }
                                    label="X-Axis (Categories)"
                                    sx={{
                                      color: 'white',
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                      },
                                      '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                      },
                                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                      },
                                      '& .MuiSvgIcon-root': { color: 'white' },
                                    }}
                                  >
                                    {getCHAFields().map((field: any) => (
                                      <MenuItem key={field.fieldName} value={field.fieldName}>
                                        {field.label} ({field.fieldName})
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  <FormHelperText sx={{ color: 'white' }}>
                                    Select the character field to use for X-axis labels
                                  </FormHelperText>
                                </FormControl>
                              </Box>

                              {/* Y-Axis configuration based on chart type */}
                              {getWidgetCategory(getSelectedWidgetType() || '') ===
                                'stacked-bar' ? (
                                // Stacked bar chart - multiple Y axes with series
                                <Box mt={3} className="stacked-series-config">
                                  <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    sx={{ color: 'white' }}
                                  >
                                    Series Configuration
                                  </Typography>

                                  {/* Display current series */}
                                  <Box mb={2}>
                                    {stackedSeries.length > 0 ? (
                                      <Grid container spacing={2}>
                                        {stackedSeries.map((series, index) => (
                                          <Grid item xs={12} key={index}>
                                            <Card
                                              variant="outlined"
                                              sx={{ backgroundColor: '#ffffff20' }}
                                            >
                                              <CardContent className="py-2">
                                                <Grid container alignItems="center">
                                                  <Grid item xs={1}>
                                                    <Box
                                                      sx={{
                                                        width: 20,
                                                        height: 20,
                                                        backgroundColor: series.color,
                                                        borderRadius: '4px',
                                                      }}
                                                    />
                                                  </Grid>
                                                  <Grid item xs={8}>
                                                    <Typography
                                                      variant="body2"
                                                      sx={{ color: 'white' }}
                                                    >
                                                      {series.name} ({series.dataKey})
                                                    </Typography>
                                                  </Grid>
                                                  <Grid item xs={3} textAlign="right">
                                                    <IconButton
                                                      size="small"
                                                      color="error"
                                                      onClick={() =>
                                                        handleRemoveStackedSeries(index)
                                                      }
                                                    >
                                                      <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                  </Grid>
                                                </Grid>
                                              </CardContent>
                                            </Card>
                                          </Grid>
                                        ))}
                                      </Grid>
                                    ) : (
                                      <Typography sx={{ color: 'white' }}>
                                        No series configured yet. Add a data series below.
                                      </Typography>
                                    )}
                                  </Box>

                                  {/* Add new series */}
                                  <FormControl fullWidth margin="normal">
                                    <InputLabel sx={{ color: 'white' }}>Add Data Series</InputLabel>
                                    <Select
                                      value=""
                                      onChange={(e) =>
                                        handleChartAxisChange(
                                          'yAxis',
                                          e.target.value as string,
                                          'KF'
                                        )
                                      }
                                      label="Add Data Series"
                                      sx={{
                                        color: 'white',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'white',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'white',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'white',
                                        },
                                        '& .MuiSvgIcon-root': { color: 'white' },
                                      }}
                                    >
                                      {getKFFields()
                                        .filter((field: any) => {
                                          // Filter out fields already used in series
                                          return !stackedSeries.some(
                                            (s) => s.dataKey === field.fieldName
                                          );
                                        })
                                        .map((field: any) => (
                                          <MenuItem key={field.fieldName} value={field.fieldName}>
                                            {field.label} ({field.fieldName})
                                          </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText sx={{ color: 'white' }}>
                                      Select fields to include in the stacked chart
                                    </FormHelperText>
                                  </FormControl>
                                </Box>
                              ) : getWidgetCategory(getSelectedWidgetType() || '') ===
                                'dual-line' ? (
                                // Dual line chart - two Y axes
                                <Box mt={3}>
                                  <FormControl fullWidth margin="normal">
                                    <InputLabel sx={{ color: 'white' }}>
                                      First Y-Axis (Line 1)
                                    </InputLabel>
                                    <Select
                                      value={chartYAxis}
                                      onChange={(e) =>
                                        handleChartAxisChange(
                                          'yAxis',
                                          e.target.value as string,
                                          'KF'
                                        )
                                      }
                                      label="First Y-Axis (Line 1)"
                                      sx={{
                                        color: 'white',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'white',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'white',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'white',
                                        },
                                        '& .MuiSvgIcon-root': { color: 'white' },
                                      }}
                                    >
                                      {getKFFields().map((field: any) => (
                                        <MenuItem key={field.fieldName} value={field.fieldName}>
                                          {field.label} ({field.fieldName})
                                        </MenuItem>
                                      ))}
                                    </Select>
                                    <FormHelperText sx={{ color: 'white' }}>
                                      Select the first line to display
                                    </FormHelperText>
                                  </FormControl>

                                  <FormControl fullWidth margin="normal">
                                    <InputLabel sx={{ color: 'white' }}>
                                      Second Y-Axis (Line 2)
                                    </InputLabel>
                                    <Select
                                      value={chartYAxis2}
                                      onChange={(e) =>
                                        handleChartAxisChange(
                                          'yAxis2',
                                          e.target.value as string,
                                          'KF'
                                        )
                                      }
                                      label="Second Y-Axis (Line 2)"
                                      sx={{
                                        color: 'white',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'white',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'white',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'white',
                                        },
                                        '& .MuiSvgIcon-root': { color: 'white' },
                                      }}
                                    >
                                      {getKFFields().map((field: any) => (
                                        <MenuItem key={field.fieldName} value={field.fieldName}>
                                          {field.label} ({field.fieldName})
                                        </MenuItem>
                                      ))}
                                    </Select>
                                    <FormHelperText sx={{ color: 'white' }}>
                                      Select the second line to display
                                    </FormHelperText>
                                  </FormControl>
                                </Box>
                              ) : (
                                // Standard charts with single Y-axis
                                <FormControl fullWidth margin="normal">
                                  <InputLabel sx={{ color: 'white' }}>Y-Axis (Values)</InputLabel>
                                  <Select
                                    value={chartYAxis}
                                    onChange={(e) =>
                                      handleChartAxisChange('yAxis', e.target.value as string, 'KF')
                                    }
                                    label="Y-Axis (Values)"
                                    sx={{
                                      color: 'white',
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                      },
                                      '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                      },
                                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                      },
                                      '& .MuiSvgIcon-root': { color: 'white' },
                                    }}
                                  >
                                    {getKFFields().map((field: any) => (
                                      <MenuItem key={field.fieldName} value={field.fieldName}>
                                        {field.label} ({field.fieldName})
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  <FormHelperText sx={{ color: 'white' }}>
                                    Select the key figure field to use for Y-axis values
                                  </FormHelperText>
                                </FormControl>
                              )}
                            </>
                          )}
                        </Box>
                      </TabPanel>
                    )}
                    {/* Table Configuration Tab */}
                    {fieldMappings[selectedWidget]?.mappingType === 'table' && (
                      <TabPanel value={tabValue} index={tabIndices.tableConfig!}>
                        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                          Table Columns Configuration
                        </Typography>

                        <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: '#ffffff20' }}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                            Query Configuration
                          </Typography>
                          <Alert severity="info" sx={{ mb: 2, backgroundColor: '#2196f320' }}>
                            <Typography sx={{ color: 'white' }}>
                              Configure the SAP BW report to fetch data from when using mapped
                              fields.
                            </Typography>
                          </Alert>

                          <FormControl fullWidth variant="outlined" margin="normal">
                            <TextField
                              label="Report Technical Name"
                              value={reportName}
                              onChange={handleReportNameChange}
                              helperText="Enter the technical name of the SAP BW report"
                              sx={{
                                input: { color: 'white' },
                                label: { color: 'white' },
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': { borderColor: 'white' },
                                  '&:hover fieldset': { borderColor: 'white' },
                                  '&.Mui-focused fieldset': { borderColor: 'white' },
                                },
                                '& .MuiFormHelperText-root': { color: 'white' },
                              }}
                            />
                            <Box mt={2} display="flex" alignItems="center" gap={2}>
                              <Button
                                label="Fetch Report Data"
                                onClick={fetchReportData}
                                disabled={loading}
                              />
                              {loading && <CircularProgress size={20} />}
                            </Box>
                          </FormControl>
                        </Paper>

                        {!parsedResponse && (
                          <Alert severity="warning" sx={{ mb: 2, backgroundColor: '#ff980020' }}>
                            <Typography sx={{ color: 'white' }}>
                              Please fetch report data first to configure table columns.
                            </Typography>
                          </Alert>
                        )}
                        {parsedResponse && (
                          <Box mt={3}>
                            <Grid container spacing={2} alignItems="flex-end">
                              <Grid item xs={12}>
                                <FormControl fullWidth size="small">
                                  <InputLabel sx={{ color: 'white' }}>Select Field</InputLabel>
                                  <Select
                                    label="Select Field"
                                    value=""
                                    onChange={(e) => {
                                      const field = e.target.value as string;
                                      handleTableColumnAdd(field);
                                    }}
                                    sx={{
                                      color: 'white',
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                      },
                                      '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                      },
                                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                      },
                                      '& .MuiSvgIcon-root': { color: 'white' },
                                    }}
                                  >
                                    {parsedResponse.header.map((field: any) => (
                                      <MenuItem
                                        key={field.fieldName}
                                        value={field.fieldName}
                                        disabled={tableColumns.some(
                                          (col) => col.field === field.fieldName
                                        )}
                                      >
                                        {field.label} ({field.fieldName})
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                            </Grid>

                            <Box mt={3}>
                              <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
                                Current Columns
                              </Typography>

                              {tableColumns.length === 0 ? (
                                <Typography sx={{ color: 'white' }}>
                                  No columns added yet
                                </Typography>
                              ) : (
                                <Box>
                                  {tableColumns.map((column, idx) => (
                                    <Chip
                                      key={idx}
                                      label={`${column.header} (${column.field})`}
                                      onDelete={() => handleTableColumnRemove(idx)}
                                      className="m-1"
                                      sx={{
                                        backgroundColor: '#ffffff20',
                                        color: 'white',
                                        '& .MuiChip-deleteIcon': { color: 'white' },
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}
                      </TabPanel>
                    )}
                    {/* Quadrant Metrics Configuration Tab */}
                    {fieldMappings[selectedWidget]?.mappingType === 'quadrant' && (
                      <TabPanel value={tabValue} index={tabIndices.quadrantConfig!}>
                        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                          Quadrant Metrics Configuration
                        </Typography>

                        {!parsedResponse && (
                          <Alert severity="warning" sx={{ mb: 2, backgroundColor: '#ff980020' }}>
                            <Typography sx={{ color: 'white' }}>
                              Please fetch report data first to configure quadrant metrics.
                            </Typography>
                          </Alert>
                        )}

                        {parsedResponse && (
                          <Box mt={3}>
                            {/* CHA Field Selection for Categories */}
                            <FormControl fullWidth margin="normal">
                              <InputLabel sx={{ color: 'white' }}>Category Field</InputLabel>
                              <Select
                                value={chartXAxis}
                                onChange={(e) =>
                                  handleChartAxisChange('xAxis', e.target.value as string, 'CHA')
                                }
                                label="Category Field"
                                sx={{
                                  color: 'white',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'white',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'white',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'white',
                                  },
                                  '& .MuiSvgIcon-root': { color: 'white' },
                                }}
                              >
                                {getCHAFields().map((field: any) => (
                                  <MenuItem key={field.fieldName} value={field.fieldName}>
                                    {field.label} ({field.fieldName})
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText sx={{ color: 'white' }}>
                                Select the field for the quadrant categories
                              </FormHelperText>
                            </FormControl>

                            {/* Metric Selection for each Quadrant */}
                            {chartXAxis && (
                              <Box mt={3}>
                                <Typography
                                  variant="subtitle2"
                                  gutterBottom
                                  sx={{ color: 'white' }}
                                >
                                  Select Metrics for Each Quadrant
                                </Typography>

                                <Grid container spacing={2}>
                                  {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(
                                    (position, idx) => (
                                      <Grid item xs={6} key={position}>
                                        <Paper
                                          elevation={2}
                                          sx={{ p: 2, backgroundColor: '#ffffff20' }}
                                        >
                                          <Typography
                                            variant="body2"
                                            gutterBottom
                                            sx={{ color: 'white' }}
                                          >
                                            {position
                                              .split('-')
                                              .map(
                                                (word) =>
                                                  word.charAt(0).toUpperCase() + word.slice(1)
                                              )
                                              .join(' ')}{' '}
                                            Quadrant
                                          </Typography>

                                          <FormControl fullWidth margin="dense" size="small">
                                            <InputLabel sx={{ color: 'white' }}>Metric</InputLabel>
                                            <Select
                                              value={selectedMetrics[idx] || ''}
                                              onChange={(e) =>
                                                handleQuadrantMetricSelection(
                                                  e.target.value as string,
                                                  idx
                                                )
                                              }
                                              label="Metric"
                                              sx={{
                                                color: 'white',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                  borderColor: 'white',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                  borderColor: 'white',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                  borderColor: 'white',
                                                },
                                                '& .MuiSvgIcon-root': {
                                                  color: 'white',
                                                },
                                              }}
                                            >
                                              {/* Allow selection from both CHA values and KF fields */}
                                              <MenuItem value="" disabled>
                                                -- CHA Values --
                                              </MenuItem>
                                              {getCHAValues(chartXAxis)
                                                .filter((value) => value !== 'Overall Result')
                                                .map((value) => (
                                                  <MenuItem key={value} value={value}>
                                                    {value}
                                                  </MenuItem>
                                                ))}
                                            </Select>
                                          </FormControl>
                                        </Paper>
                                      </Grid>
                                    )
                                  )}
                                </Grid>
                              </Box>
                            )}
                          </Box>
                        )}
                      </TabPanel>
                    )}
                    {/* Data Preview Tab */}
                    <TabPanel value={tabValue} index={tabIndices.dataPreview}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                        Raw Data Preview
                      </Typography>

                      {transformedData ? (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
                            Available Fields:
                          </Typography>
                          <Box mb={3}>
                            <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                              Character Fields (CHA):
                            </Typography>
                            {getCHAFields().map((field: any) => (
                              <Chip
                                key={field.fieldName}
                                label={`${field.label} (${field.fieldName})`}
                                size="small"
                                sx={{
                                  m: 0.5,
                                  backgroundColor: '#e3f2fd20',
                                  color: 'white',
                                  border: '1px solid #2196f3',
                                }}
                              />
                            ))}
                          </Box>

                          <Box mb={3}>
                            <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                              Key Figure Fields (KF):
                            </Typography>
                            {getKFFields().map((field: any) => (
                              <Chip
                                key={field.fieldName}
                                label={`${field.label} (${field.fieldName})`}
                                size="small"
                                sx={{
                                  m: 0.5,
                                  backgroundColor: '#fff3e020',
                                  color: 'white',
                                  border: '1px solid #ff9800',
                                }}
                              />
                            ))}
                          </Box>

                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
                            Sample Data:
                          </Typography>
                          <Paper
                            elevation={3}
                            sx={{
                              p: 2,
                              backgroundColor: '#ffffff10',
                              maxHeight: 400,
                              overflow: 'auto',
                            }}
                          >
                            <pre
                              style={{
                                color: 'white',
                                fontSize: '12px',
                                margin: 0,
                              }}
                            >
                              {JSON.stringify(
                                {
                                  metadata: transformedData.FormMetadata,
                                  sampleStructure: Object.keys(
                                    transformedData.FormStructure
                                  ).reduce((acc: any, key: string) => {
                                    const values = transformedData.FormStructure[key];
                                    const firstKey = Object.keys(values)[0];
                                    if (firstKey) {
                                      acc[key] = { [firstKey]: values[firstKey] };
                                    }
                                    return acc;
                                  }, {}),
                                },
                                null,
                                2
                              )}
                            </pre>
                          </Paper>
                        </Box>
                      ) : (
                        <Typography sx={{ color: 'white' }} textAlign="center">
                          No data available. Please fetch report data first.
                        </Typography>
                      )}
                    </TabPanel>
                    {/* Widget Preview Tab */}
                    <TabPanel value={tabValue} index={tabIndices.widgetPreview}>
                      <Box textAlign="center" mb={3}>
                        <Button label="Generate Preview" onClick={generatePreview} />
                      </Box>

                      {previewData ? (
                        <Paper elevation={3} sx={{ p: 2, backgroundColor: '#ffffff10' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                            Widget Preview Data
                          </Typography>
                          <pre
                            style={{
                              color: 'white',
                              fontSize: '12px',
                              maxHeight: '300px',
                              overflow: 'auto',
                              margin: 0,
                              backgroundColor: '#00000020',
                              padding: '10px',
                              borderRadius: '4px',
                            }}
                          >
                            {JSON.stringify(previewData, null, 2)}
                          </pre>
                        </Paper>
                      ) : (
                        <Typography sx={{ color: 'white' }} textAlign="center">
                          Click "Generate Preview" to see how your widget will look with the mapped
                          data
                        </Typography>
                      )}
                    </TabPanel>
                  </>
                );
              })()}

                          <FormControl>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  // checked={fieldMapping?.descriptionEnabled || false}
                                 onChange={(e) => handleDescriptionToggle(e.target.checked)}
                                  sx={{
                                    color: 'white',
                                    '&.Mui-checked': { color: 'white' },
                                  }}
                                />
                              }
                              label={
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                  Add description icon
                                </Typography>
                              }
                            />

                            </FormControl>

              <Box mt={4} pt={2} borderTop={1} borderColor="rgba(255,255,255,0.2)">
                <Button
                  label="Apply Configuration"
                  className="mt-2 mr-2"
                  severity="secondary"
                  onClick={generatePreview}
                />
              </Box>
            </Box>
          ) : (
            <Typography sx={{ color: 'white' }}>Select a widget to configure it</Typography>
          )}

          <div className="absolute right-0 bottom-0 p-4">
            <Box mt={4} pt={2} borderColor="rgba(255,255,255,0.2)">
              <Button
                label={isSaving ? 'Saving...' : 'Save Layout'}
                onClick={saveLayout}
                disabled={isSaving}
                loading={isSaving}
              />
            </Box>
          </div>
        </div>
      </div>

      {/* Mapping Dialog */}
      <Dialog open={isMappingDialogOpen} onClose={closeMappingDialog} maxWidth="md" fullWidth>
        <DialogTitle>Map Field: {currentMappingField}</DialogTitle>
        <DialogContent>
          {parsedResponse && (
            <Box p={2}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>CHA Field</InputLabel>
                <Select
                  value={fieldMappings[selectedWidget || '']?.chaField || ''}
                  onChange={(e) => {
                    const chaField = e.target.value as string;
                    setFieldMappings((prev) => ({
                      ...prev,
                      [selectedWidget || '']: {
                        ...prev[selectedWidget || ''],
                        chaField: chaField,
                        chaValue: '', // Reset chaValue when chaField changes
                        kfField: '', // Reset kfField when chaField changes
                      },
                    }));
                  }}
                  label="CHA Field"
                >
                  {getCHAFields().map((field: any) => (
                    <MenuItem key={field.fieldName} value={field.fieldName}>
                      {field.label} ({field.fieldName})
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select the character field (categories)</FormHelperText>
              </FormControl>

              {fieldMappings[selectedWidget || '']?.chaField && (
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel>CHA Value</InputLabel>
                  <Select
                    value={fieldMappings[selectedWidget || '']?.chaValue || ''}
                    onChange={(e) => {
                      const chaValue = e.target.value as string;
                      setFieldMappings((prev) => ({
                        ...prev,
                        [selectedWidget || '']: {
                          ...prev[selectedWidget || ''],
                          chaValue: chaValue,
                          kfField: '', // Reset kfField when chaValue changes
                        },
                      }));
                    }}
                    label="CHA Value"
                  >
                    {getCHAValues(fieldMappings[selectedWidget || '']?.chaField || '').map(
                      (value: string) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      )
                    )}
                  </Select>
                  <FormHelperText>Select the specific category value</FormHelperText>
                </FormControl>
              )}

              {fieldMappings[selectedWidget || '']?.chaValue && (
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel>KF Field</InputLabel>
                  <Select
                    value={fieldMappings[selectedWidget || '']?.kfField || ''}
                    onChange={(e) => {
                      const kfField = e.target.value as string;
                      setFieldMappings((prev) => ({
                        ...prev,
                        [selectedWidget || '']: {
                          ...prev[selectedWidget || ''],
                          kfField: kfField,
                        },
                      }));
                    }}
                    label="KF Field"
                  >
                    {getKFFields().map((field: any) => (
                      <MenuItem key={field.fieldName} value={field.fieldName}>
                        {field.label} ({field.fieldName})
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select the key figure field (values)</FormHelperText>
                </FormControl>
              )}

              {fieldMappings[selectedWidget || '']?.kfField && (
                <FormControl fullWidth variant="outlined" margin="normal">
                  <TextField
                    label="KF Value"
                    value={
                      getKFValue(
                        fieldMappings[selectedWidget || '']?.chaField || '',
                        fieldMappings[selectedWidget || '']?.chaValue || '',
                        fieldMappings[selectedWidget || '']?.kfField || ''
                      ) || ''
                    }
                    disabled
                  />
                  <FormHelperText>
                    This is the value that will be used for {currentMappingField}
                  </FormHelperText>
                </FormControl>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button label="Cancel" onClick={closeMappingDialog} />
          <Button
            label="Apply"
            onClick={() => handleMappingSelection(currentMappingField)}
            disabled={!fieldMappings[selectedWidget || '']?.kfField}
          />
        </DialogActions>
      </Dialog>

      {/* Save Status Snackbar */}
      <Snackbar
        open={showSaveAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={saveAlertSeverity} sx={{ width: '100%' }}>
          {saveMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MappingScreen;
