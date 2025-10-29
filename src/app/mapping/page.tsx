'use client';

import SidebarMapping from '@/components/SidebarMapping';
import React, { useEffect, useMemo, useState } from 'react';
import RGL, { WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import MultiMetrics from '@/components/widgets/MultiMetrics';
import PieMetric from '@/components/widgets/PieMetric';
import SimpleMetric from '@/components/widgets/SimpleMetric';
import SimpleMetricDate from '@/components/widgets/SimpleMetricDate';
import SingleLineChart from '@/components/widgets/SingleLineChart';
import TableMetric from '@/components/widgets/TableMetric';
import BarMetric from '@/components/widgets/BarMetric';
import StackedBarChart from '@/components/widgets/StackedBarChart';
import OrdersLineChart from '@/components/widgets/OrdersLineChart';
import AnnouncementWidget from '@/components/widgets/Announcement1';
import DualLineChart from '@/components/widgets/DualLineChart';
import PieChartWithTotal from '@/components/widgets/PieChartWithTotal';
import QuadrantMetrics from '@/components/widgets/QuadrantMetrics';
import MultiChart from '@/components/widgets/MultiChart';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { transformFormMetadata, getValueByPath, formatValue } from '@/helpers/transformHelpers';
import {
  TransformedData,
  widgetConfigFields,
  WidgetFieldMapping,
  WidgetMappingConfig,
} from '@/helpers/types';
import LoansAppTray from '@/components/widgets/LoansAppTray';
import mirageServer from '@/lib/mirage/mirageServer';
import { sapODataService, LayoutData } from '@/services/sapODataService';
import GeoSpendMapWidget from '@/components/widgets/GeoSpendMapWidget';
import NewsFeed from '@/components/widgets/NewsFeed';
import { get } from 'http';
import { title } from 'process';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useURLParams } from '@/hooks/useURLParams';
import * as MUIIcons from '@mui/icons-material';
import PieChartComponent from '@/components/widgets/PieChart';
import StackedColumn from '@/components/widgets/ColumnChart';
import PredictionChart from '@/components/widgets/Prediction';
import RadarChartComponent from '@/components/widgets/RadarChart';
import { FormatConfigUI } from '@/components/FormatConfigUI';
import { applyValueFormat } from '@/helpers/formatConfig';
import type { FormatConfig } from '@/helpers/formatConfig';
import { TypographyConfig, WidgetTypographyConfig } from '@/helpers/types';
import { getTypographyElementsForWidget } from '@/helpers/typographyHelper';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import { TypographyConfigUI } from '@/components/TypographyConfigUI';

const GridLayout = WidthProvider(RGL);

interface Widget {
  id: string;
  name: string;
  props: Record<string, any>;
  deleted?: boolean;
  isNew?: boolean; // Add this property
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

interface TargetReportConfig {
  type: 'Bex Query' | 'Lumira' | 'WAD Template' | 'Web Link';
  technicalId: string;
  name: string;
  description: string;
}

interface TableColumn {
  field: string;
  header: string;
  formatConfig?: FormatConfig;
}

if (process.env.NODE_ENV === 'development') mirageServer();

const widgetMapping: Record<string, React.ComponentType<any>> = {
  'two-metrics': MultiMetrics,
  'two-metrics-piechart': PieMetric,
  'one-metric': SimpleMetric,
  'one-metric-date': SimpleMetricDate,
  'two-metrics-linechart': SingleLineChart,
  'one-metric-table': TableMetric,
  'bar-chart': BarMetric,
  'stacked-bar-chart': StackedBarChart,
  'orders-line-chart': OrdersLineChart,
  'dual-line-chart': DualLineChart,
  'pie-chart-total': PieChartWithTotal,
  'quadrant-metrics': QuadrantMetrics,
  'loans-app-tray': LoansAppTray,
  'news-feed': NewsFeed,
  announcement: AnnouncementWidget,
  'pie-chart': PieChartComponent,
  'column-chart': StackedColumn,
  'prediction-chart': PredictionChart,
  'radar-chart': RadarChartComponent,
  'multi-chart': MultiChart,
};

const widgetSizes: Record<string, { w: number; h: number }> = {
  'one-metric': { w: 2, h: 1.5 },
  'one-metric-date': { w: 2, h: 1.5 },
  'two-metrics-linechart': { w: 4, h: 3 },
  'two-metrics': { w: 2.5, h: 1.5 },
  'two-metrics-piechart': { w: 2.5, h: 1.5 },
  'one-metric-table': { w: 3, h: 3 },
  'bar-chart': { w: 2.5, h: 3 },
  'stacked-bar-chart': { w: 6, h: 3 },
  'orders-line-chart': { w: 4, h: 3 },
  'dual-line-chart': { w: 4, h: 3 },
  'pie-chart-total': { w: 2.5, h: 3 },
  'quadrant-metrics': { w: 4, h: 3 },
  'loans-app-tray': { w: 6, h: 3 },
  'news-feed': { w: 12, h: 3 },
  announcement: { w: 12, h: 3 },
  'pie-chart': { w: 4, h: 3 },
  'column-chart': { w: 6, h: 3 },
  'prediction-chart': { w: 6, h: 3 },
  'radar-chart': { w: 6, h: 3 },
  'multi-chart': { w: 6, h: 3 },
};

const REPORT_TYPE_OPTIONS = [
  { value: 'Bex Query', label: 'Bex Query' },
  { value: 'Lumira', label: 'Lumira' },
  { value: 'WAD Template', label: 'WAD Template' },
  { value: 'Web Link', label: 'Web Link' },
];

const getWidgetMappingType = (
  widgetName: string
): 'simple' | 'chart' | 'table' | 'quadrant' | 'loans-app-tray' => {
  if (widgetName === 'loans-app-tray') {
    return 'loans-app-tray';
  } else if (widgetName.includes('table')) {
    return 'table';
  } else if (widgetName === 'quadrant-metrics') {
    return 'quadrant';
  } else if (
    widgetName.includes('linechart') ||
    widgetName.includes('piechart') ||
    widgetName.includes('bar-chart') ||
    widgetName.includes('stacked-bar') ||
    widgetName.includes('column-chart') ||
    widgetName.includes('line-chart') ||
    widgetName.includes('pie-chart') ||
    widgetName.includes('prediction') ||
    widgetName === 'multi-chart'
  ) {
    return 'chart';
  } else {
    return 'simple';
  }
};

const getWidgetCategory = (widgetName: string): string => {
  if (widgetName === 'bar-chart') {
    return 'bar';
  } else if (widgetName === 'stacked-bar-chart') {
    return 'stacked-bar';
  } else if (widgetName === 'column-chart') {
    return 'stacked-bar';
  } else if (widgetName === 'prediction-chart') {
    return 'prediction-chart';
  } else if (widgetName === 'orders-line-chart') {
    return 'single-line';
  } else if (widgetName === 'dual-line-chart') {
    return 'dual-line';
  } else if (widgetName === 'pie-chart-total') {
    return 'pie-total';
  } else if (widgetName === 'quadrant-metrics') {
    return 'quadrant';
  } else if (widgetName === 'loans-app-tray') {
    return 'loans-app-tray';
  } else if (widgetName.includes('piechart')) {
    return 'pie';
  } else if (widgetName.includes('pie-chart')) {
    return 'pie';
  } else if (widgetName.includes('linechart')) {
    return 'line';
  } else if (widgetName.includes('table')) {
    return 'table';
  } else if (widgetName === 'radar-chart') {
    return 'stacked-bar';
  } else if (widgetName === 'multi-chart') {
    return 'multi-chart';
  } else {
    return 'simple';
  }
};

const getAllMUIIcons = () => {
  return [
    'Assignment',
    'Schedule',
    'Pending',
    'TrendingUp',
    'Dashboard',
    'Settings',
    'AccountCircle',
    'ShoppingCart',
    'Favorite',
    'Star',
    'Work',
    'LocalShipping',
    'AttachMoney',
    'Assessment',
    'Description',
    'Event',
    'ExitToApp',
    'Folder',
    'Help',
    'Home',
    'Info',
    'Language',
    'Lock',
    'Mail',
    'Notifications',
    'People',
    'Phone',
    'Search',
    'Security',
    'ThumbUp',
    'Visibility',
    'Warning',
    'AddCircle',
    'Delete',
    'Edit',
    'Check',
    'Close',
    'ArrowBack',
    'ArrowForward',
    'ExpandMore',
    'Menu',
    'MoreVert',
  ];
};

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
    },
    widget_name: 'Successful Payments',
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
    title: 'Top Suppliers',
    data: [
      { supplier_name: 'Reliable Suppliers', contracts: 7, value: '52,345' },
      { supplier_name: 'Supply Solutions', contracts: 5, value: '42,345' },
    ],
  },
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
  'column-chart': {
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
  },
  'quadrant-metrics': {
    metrics: [
      { title: 'In Process', value: '53', position: 'top-left' },
      { title: 'With Supplier', value: '18', position: 'top-right' },
      { title: 'B2B Order', value: '1,335', position: 'bottom-left' },
      { title: 'Completed Order', value: '1,247', position: 'bottom-right' },
    ],
  },
  'loans-app-tray': {
    menuItems: [
      {
        id: 1,
        iconName: 'Assignment',
        label: 'Open PR',
        count: 13,
      },
      {
        id: 2,
        iconName: 'Schedule',
        label: 'Contract Expiring',
        count: 85,
      },
      {
        id: 3,
        iconName: 'Pending',
        label: 'Pending SES',
        count: 32,
      },
      {
        id: 4,
        iconName: 'TrendingUp',
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
    menuItemConfigs: {},
    chartDataConfig: {},
  },
  announcement: {
    title: 'Welcome to Our Platform! 🎉',
    announcement: [
      '🚧 Important Update! System maintenance scheduled for 2 AM.',
      "⚠️ New Feature! We've just released a new dashboard.",
      '🔒 Security Alert! Please update your password for better security.',
    ],
  },
  'pie-chart': {
    data: [
      { label: 'Segment 1', value: 400, fill: '#84BD00' },
      { label: 'Segment 2', value: 300, fill: '#E1553F' },
      { label: 'Segment 3', value: 200, fill: '#5899DA' },
      { label: 'Segment 4', value: 100, fill: '#FFC846' },
    ],
    title: 'Distribution Chart',
  },
  'radar-chart': {
    data: [
      { name: 'Speed', actual: 80, predicted: 75 },
      { name: 'Quality', actual: 95, predicted: 90 },
      { name: 'Efficiency', actual: 70, predicted: 85 },
      { name: 'Innovation', actual: 85, predicted: 80 },
      { name: 'Reliability', actual: 90, predicted: 88 },
      { name: 'Cost', actual: 75, predicted: 82 },
    ],
    title: 'Performance Metrics',
    series: [
      { name: 'Actual', dataKey: 'actual', color: '#8884d8' },
      { name: 'Predicted', dataKey: 'predicted', color: '#82ca9d' },
    ],
  },

  'multi-chart': {
    data: [
      { name: 'Jan', sales: 1200000, marketing: 800000, operations: 650000 },
      { name: 'Feb', sales: 950000, marketing: 720000, operations: 500000 },
      { name: 'Mar', sales: 2100000, marketing: 1600000, operations: 900000 },
      { name: 'Apr', sales: 1780000, marketing: 1200000, operations: 870000 },
      { name: 'May', sales: 2500000, marketing: 1900000, operations: 1100000 },
    ],
    title: 'Multi Chart Widget',
    series: [
      { name: 'Sales', dataKey: 'sales', color: '#8884d8', type: 'line' },
      { name: 'Marketing', dataKey: 'marketing', color: '#82ca9d', type: 'line' },
      { name: 'Operations', dataKey: 'operations', color: '#ffc658', type: 'line' },
    ],
    chartType: 'line',
    showLegend: true,
    stacked: false,
    selectedLabels: [],
    valueFormat: 'non-currency', // NEW
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

interface LoansAppTrayConfigProps {
  selectedWidget: string;
  fieldMappings: any;
  setFieldMappings: (mappings: any) => void;
  widgetConfigurations: any;
  setWidgetConfigurations: (configs: any) => void;
  parsedResponse: any;
  getCHAFields: () => any[];
  getKFFields: () => any[];
  getCHAValues: (chaField: string) => string[];
  getKFValue: (chaField: string, chaValue: string, kfField: string) => any;
  reportName: string;
  handleReportNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fetchReportData: () => void;
  loading: boolean;
}

const LoansAppTrayConfig: React.FC<LoansAppTrayConfigProps> = ({
  selectedWidget,
  fieldMappings,
  setFieldMappings,
  widgetConfigurations,
  setWidgetConfigurations,
  parsedResponse,
  getCHAFields,
  getKFFields,
  getCHAValues,
  getKFValue,
  reportName,
  handleReportNameChange,
  fetchReportData,
  loading,
}) => {
  const [iconDialogOpen, setIconDialogOpen] = useState(false);
  const [selectedMenuItemForIcon, setSelectedMenuItemForIcon] = useState<number | null>(null);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([
    { id: 1, label: 'Open PR', iconName: 'Assignment', count: 13 },
    { id: 2, label: 'Contract Expiring', iconName: 'Schedule', count: 85 },
    { id: 3, label: 'Pending SES', iconName: 'Pending', count: 32 },
    { id: 4, label: 'Contract with 80% Consumed Values', iconName: 'TrendingUp', count: 24 },
  ]);

  const allIcons = getAllMUIIcons();
  const filteredIcons = allIcons.filter((iconName) =>
    iconName.toLowerCase().includes(iconSearchQuery.toLowerCase())
  );

  useEffect(() => {
    if (selectedWidget && !fieldMappings[selectedWidget]?.menuItemConfigs) {
      const defaultMenuItemConfigs = menuItems.reduce((acc, item) => {
        acc[item.id] = {
          reportName: reportName,
          queryConfig: {
            inputType: 'manual',
            manualValue: item.count,
          },
        };
        return acc;
      }, {} as any);

      setFieldMappings((prev: any) => ({
        ...prev,
        [selectedWidget]: {
          ...prev[selectedWidget],
          menuItemConfigs: defaultMenuItemConfigs,
          chartDataConfig: {
            reportName: reportName,
            inputType: 'manual',
            manualData: [
              { name: 'PR', value: 86, color: '#449ca4' },
              { name: 'CE', value: 156, color: '#5899da' },
              { name: 'SES', value: 114, color: '#ffaa04' },
              { name: 'CV', value: 126, color: '#ff0000' },
            ],
          },
        },
      }));
    }
  }, [selectedWidget]);

  const handleMenuItemChange = (itemId: number, field: string, value: any) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );

    setWidgetConfigurations((prev: any) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        menuItems: menuItems.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const handleMenuItemQueryConfigChange = (itemId: number, configField: string, value: any) => {
    setFieldMappings((prev: any) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        menuItemConfigs: {
          ...prev[selectedWidget]?.menuItemConfigs,
          [itemId]: {
            ...prev[selectedWidget]?.menuItemConfigs?.[itemId],
            queryConfig: {
              ...prev[selectedWidget]?.menuItemConfigs?.[itemId]?.queryConfig,
              [configField]: value,
            },
          },
        },
      },
    }));
  };

  const handleIconSelect = (iconName: string) => {
    if (selectedMenuItemForIcon !== null) {
      handleMenuItemChange(selectedMenuItemForIcon, 'iconName', iconName);
      setIconDialogOpen(false);
      setSelectedMenuItemForIcon(null);
    }
  };

  const renderIconDialog = () => (
    <Dialog
      open={iconDialogOpen}
      onClose={() => setIconDialogOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(to bottom, #00214E, #0164B0)',
          color: 'white',
        },
      }}
    >
      <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        Select Icon
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Search icons..."
          value={iconSearchQuery}
          onChange={(e) => setIconSearchQuery(e.target.value)}
          margin="normal"
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'white', mr: 1 }} />,
          }}
          sx={{
            input: { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'white' },
              '&:hover fieldset': { borderColor: 'white' },
              '&.Mui-focused fieldset': { borderColor: 'white' },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255,255,255,0.7)',
              opacity: 1,
            },
          }}
        />
        <Box sx={{ maxHeight: 400, overflow: 'auto', mt: 2 }}>
          <Grid container spacing={1}>
            {filteredIcons.slice(0, 100).map((iconName) => {
              const IconComponent = (MUIIcons as any)[iconName];

              if (!IconComponent) {
                console.log('Icon not found:', iconName);
                return null;
              }

              return (
                <Grid item xs={3} sm={2} key={iconName}>
                  <Paper
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#ffffff20',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#ffffff40',
                        transform: 'scale(1.05)',
                        transition: 'all 0.2s',
                      },
                    }}
                    onClick={() => handleIconSelect(iconName)}
                  >
                    <IconComponent sx={{ fontSize: 24, color: 'white' }} />
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{
                        fontSize: '0.65rem',
                        color: 'white',
                        mt: 0.5,
                        wordBreak: 'break-word',
                      }}
                    >
                      {iconName}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', p: 2 }}>
        <Button label="Close" onClick={() => setIconDialogOpen(false)} outlined />
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
        LoansAppTray Configuration
      </Typography>

      <Typography variant="subtitle1" gutterBottom sx={{ color: 'white', mt: 2 }}>
        Menu Items Configuration
      </Typography>

      {menuItems.map((item, index) => (
        <Accordion
          key={item.id}
          sx={{
            backgroundColor: '#ffffff20',
            color: 'white',
            mb: 1,
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
            <Typography sx={{ color: 'white' }}>
              Menu Item {item.id}: {item.label}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Label"
                  fullWidth
                  value={item.label}
                  onChange={(e) => handleMenuItemChange(item.id, 'label', e.target.value)}
                  sx={{
                    input: { color: 'white' },
                    label: { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'white' },
                      '&:hover fieldset': { borderColor: 'white' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography sx={{ color: 'white' }}>Icon:</Typography>
                  {item.iconName &&
                    (() => {
                      const IconComponent = (MUIIcons as any)[item.iconName];
                      return IconComponent ? (
                        <Chip icon={<IconComponent />} label={item.iconName} />
                      ) : (
                        <Chip label={item.iconName} sx={{ bgcolor: '#ffff', color: 'white' }} />
                      );
                    })()}

                  <Box mt={0} pt={1} borderColor="rgba(255,255,255,0.2)">
                    <Button
                      label="Select Icon"
                      onClick={() => {
                        setSelectedMenuItemForIcon(item.id);
                        setIconDialogOpen(true);
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Count Configuration
                </Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: 'white' }}>Input Type</InputLabel>
                  <Select
                    value={
                      fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]?.queryConfig
                        ?.inputType || 'manual'
                    }
                    onChange={(e) =>
                      handleMenuItemQueryConfigChange(item.id, 'inputType', e.target.value)
                    }
                    label="Input Type"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                      '& .MuiSvgIcon-root': { color: 'white' },
                    }}
                  >
                    <MenuItem value="manual">Manual Input</MenuItem>
                    <MenuItem value="mapped">Query Mapping</MenuItem>
                  </Select>
                </FormControl>

                {fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]?.queryConfig
                  ?.inputType === 'manual' ? (
                  <TextField
                    label="Count Value"
                    type="number"
                    fullWidth
                    value={
                      fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]?.queryConfig
                        ?.manualValue || 0
                    }
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      handleMenuItemQueryConfigChange(item.id, 'manualValue', value);
                      handleMenuItemChange(item.id, 'count', value);
                    }}
                    sx={{
                      input: { color: 'white' },
                      label: { color: 'white' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'white' },
                        '&:hover fieldset': { borderColor: 'white' },
                        '&.Mui-focused fieldset': { borderColor: 'white' },
                      },
                    }}
                  />
                ) : (
                  <Box mt={2} p={2} border={1} borderColor="rgba(255,255,255,0.3)" borderRadius={1}>
                    <Typography variant="subtitle2" sx={{ color: 'white', mb: 2 }}>
                      Query Mapping for Menu Item {item.id}
                    </Typography>

                    <TextField
                      label={`Report Name for ${item.label}`}
                      fullWidth
                      margin="normal"
                      value={
                        fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]?.reportName ||
                        reportName
                      }
                      onChange={(e) => {
                        setFieldMappings((prev: any) => ({
                          ...prev,
                          [selectedWidget]: {
                            ...prev[selectedWidget],
                            menuItemConfigs: {
                              ...prev[selectedWidget]?.menuItemConfigs,
                              [item.id]: {
                                ...prev[selectedWidget]?.menuItemConfigs?.[item.id],
                                reportName: e.target.value,
                              },
                            },
                          },
                        }));
                      }}
                      sx={{
                        input: { color: 'white' },
                        label: { color: 'white' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'white' },
                          '&:hover fieldset': { borderColor: 'white' },
                          '&.Mui-focused fieldset': { borderColor: 'white' },
                        },
                      }}
                    />

                    {parsedResponse && (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: 'white' }}>CHA Field</InputLabel>
                            <Select
                              value={
                                fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]
                                  ?.queryConfig?.mappedConfig?.chaField || ''
                              }
                              onChange={(e) => {
                                handleMenuItemQueryConfigChange(item.id, 'mappedConfig', {
                                  ...fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]
                                    ?.queryConfig?.mappedConfig,
                                  chaField: e.target.value,
                                });
                              }}
                              label="CHA Field"
                              sx={{
                                color: 'white',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'white',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'white',
                                },
                                '& .MuiSvgIcon-root': { color: 'white' },
                              }}
                            >
                              {getCHAFields().map((chaField: any) => (
                                <MenuItem key={chaField.fieldName} value={chaField.fieldName}>
                                  {chaField.label} ({chaField.fieldName})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        {fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]?.queryConfig
                          ?.mappedConfig?.chaField && (
                          <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                              <InputLabel sx={{ color: 'white' }}>CHA Value</InputLabel>
                              <Select
                                value={
                                  fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]
                                    ?.queryConfig?.mappedConfig?.chaValue || ''
                                }
                                onChange={(e) => {
                                  handleMenuItemQueryConfigChange(item.id, 'mappedConfig', {
                                    ...fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]
                                      ?.queryConfig?.mappedConfig,
                                    chaValue: e.target.value,
                                  });
                                }}
                                label="CHA Value"
                                sx={{
                                  color: 'white',
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'white',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'white',
                                  },
                                  '& .MuiSvgIcon-root': { color: 'white' },
                                }}
                              >
                                {getCHAValues(
                                  fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]
                                    ?.queryConfig?.mappedConfig?.chaField
                                ).map((value) => (
                                  <MenuItem key={value} value={value}>
                                    {value}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        )}

                        {fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]?.queryConfig
                          ?.mappedConfig?.chaField &&
                          fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]?.queryConfig
                            ?.mappedConfig?.chaValue && (
                            <Grid item xs={12}>
                              <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: 'white' }}>KF Field</InputLabel>
                                <Select
                                  value={
                                    fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]
                                      ?.queryConfig?.mappedConfig?.kfField || ''
                                  }
                                  onChange={(e) => {
                                    const kfField = e.target.value;
                                    const chaField =
                                      fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]
                                        ?.queryConfig?.mappedConfig?.chaField;
                                    const chaValue =
                                      fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]
                                        ?.queryConfig?.mappedConfig?.chaValue;

                                    handleMenuItemQueryConfigChange(item.id, 'mappedConfig', {
                                      ...fieldMappings[selectedWidget]?.menuItemConfigs?.[item.id]
                                        ?.queryConfig?.mappedConfig,
                                      kfField: kfField,
                                    });

                                    if (chaField && chaValue && kfField) {
                                      const mappedValue = getKFValue(chaField, chaValue, kfField);
                                      if (mappedValue !== null) {
                                        handleMenuItemChange(
                                          item.id,
                                          'count',
                                          parseInt(mappedValue) || 0
                                        );
                                      }
                                    }
                                  }}
                                  label="KF Field"
                                  sx={{
                                    color: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '& .MuiSvgIcon-root': { color: 'white' },
                                  }}
                                >
                                  {getKFFields().map((kfField: any) => (
                                    <MenuItem key={kfField.fieldName} value={kfField.fieldName}>
                                      {kfField.label} ({kfField.fieldName})
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          )}
                      </Grid>
                    )}
                  </Box>
                )}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {renderIconDialog()}
    </Box>
  );
};

const MappingScreen: React.FC = () => {
  const urlParams = useURLParams();
  const { isAdmin, adminCheckLoading, adminCheckError } = useAdminCheck();

  const isEditModeAllowed = useMemo(() => {
    if (!isAdmin) return false;
    return urlParams?.get('state') === 'edit';
  }, [isAdmin, urlParams]);

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
  const [reportName, setReportName] = useState<string>('');
  const [parsedResponse, setParsedResponse] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<TransformedData | null>(null);
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState<boolean>(false);
  const [currentMappingField, setCurrentMappingField] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [previewData, setPreviewData] = useState<any>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [widgetConfigurations, setWidgetConfigurations] = useState<Record<string, any>>({});
  const [chartXAxis, setChartXAxis] = useState<string>('');
  const [chartYAxis, setChartYAxis] = useState<string>('');
  const [chartYAxis2, setChartYAxis2] = useState<string>('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  //   const [tableColumns, setTableColumns] = useState<Array<{ field: string; header: string }>>([]);
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [stackedSeries, setStackedSeries] = useState<
    Array<{ name: string; dataKey: string; color: string }>
  >([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [showSaveAlert, setShowSaveAlert] = useState<boolean>(false);
  const [saveAlertSeverity, setSaveAlertSeverity] = useState<'success' | 'error'>('success');
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [announcementValues, setAnnouncementValues] = useState<string[]>([]);
  const [changeColor, setChangeColorOneMetric] = useState<string>('');
  const [currentLoadedReport, setCurrentLoadedReport] = useState<string>('');
  const [deleteRoleConfirmDialog, setDeleteRoleConfirmDialog] = useState<{
    open: boolean;
    roleIndex: number | null;
    roleName: string | null;
  }>({
    open: false,
    roleIndex: null,
    roleName: null,
  });
  // useEffect(() => {
  //   if (!adminCheckLoading && isAdmin) {
  //     fetch('/api/endpoints')
  //       .then((res) => res.json())
  //       .then((data) => setApiEndpoints(data.endpoints))
  //       .catch((err) => console.error('Failed to fetch endpoints:', err));

  //     fetchReportData();
  //   }
  // }, [adminCheckLoading, isAdmin]);

  useEffect(() => {
    const loadExistingWidgets = async () => {
      if (sectionId && sectionId !== 'undefined') {
        try {
          setLoading(true);

          const widgets = await sapODataService.fetchWidgetsBySectionId(sectionId);

          if (widgets && widgets.length > 0) {
            const activeWidgets = widgets.filter((widget: any) => widget.active && !widget.deleted);

            if (activeWidgets.length > 0) {
              const transformedWidgets: Widget[] = activeWidgets.map((widget: any) => ({
                id: widget.id,
                name: widget.type,
                props: widget.properties || {},
                isNew: false, // Mark as existing widget
              }));

              setWidgets(transformedWidgets);

              const transformedLayout: LayoutItem[] = activeWidgets.map(
                (widget: any, index: number) => {
                  const layoutConfig = widget.layoutConfig || {};
                  const { w, h } = widgetSizes[widget.type] || { w: 2, h: 2 };

                  return {
                    i: widget.id,
                    x: layoutConfig.x ?? (index * w) % 12,
                    y: layoutConfig.y ?? Math.floor((index * w) / 12) * h,
                    w: layoutConfig.w ?? w,
                    h: layoutConfig.h ?? h,
                    static: layoutConfig.static || false,
                    sectionName: sectionName,
                  };
                }
              );

              setLayout(transformedLayout);

              const transformedFieldMappings: any = {};
              const transformedWidgetConfigs: Record<string, any> = {};

              activeWidgets.forEach((widget: any) => {
                if (widget.fieldMappings) {
                  transformedFieldMappings[widget.id] = widget.fieldMappings;
                } else {
                  transformedFieldMappings[widget.id] = {
                    reportName: reportName,
                    mappingType: getWidgetMappingType(widget.type),
                    fields: {},
                    targetReport: {
                      type: 'Bex Query',
                      technicalId: '',
                      name: '',
                      description: '',
                    },
                  };
                }
                transformedWidgetConfigs[widget.id] = {
                  ...widget.properties,
                  widgetType: widget.type,
                  configType: getWidgetMappingType(widget.type),
                  widgetCategory: getWidgetCategory(widget.type),
                  // Preserve the full role object to keep RoleId
                  roles: widget.roles
                    ? widget.roles.map((role: any) => {
                        // If role is already an object with RoleId, keep it
                        if (typeof role === 'object' && role.RoleId !== undefined) {
                          return role;
                        }
                        // If role is just a string or object without RoleId, convert it
                        return {
                          Name: role.Name || role,
                          RoleId: role.RoleId || '', // Empty for new roles
                          Description: role.Description || '',
                          Type: role.Type || 'Custom',
                          DelFlag: role.DelFlag || '',
                        };
                      })
                    : [],
                  description: widget.description || '',
                };
              });

              setFieldMappings(transformedFieldMappings);
              setWidgetConfigurations(transformedWidgetConfigs);

              const firstWidgetMapping = activeWidgets[0]?.fieldMappings;
              if (firstWidgetMapping?.reportName) {
                setReportName(firstWidgetMapping.reportName);
              }
            }
          }

          setLoading(false);
        } catch (error) {
          console.error('Error loading existing widgets:', error);
          setLoading(false);
          setWidgets([]);
          setLayout([]);
          setFieldMappings({});
          setWidgetConfigurations({});
        }
      }
    };

    if (sectionId && sectionId !== 'undefined' && sectionId !== '') {
      loadExistingWidgets();
    }
  }, [sectionId, sectionName]);

  // useEffect(() => {
  //   if (reportName && reportName !== currentLoadedReport && isAdmin) {
  //     fetchReportData();
  //   }
  // }, [reportName, currentLoadedReport, isAdmin]);

  useEffect(() => {
    setFieldsForAnnouncement();
  }, [announcementValues]);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  const initializeWidgetMappingConfig = (widgetId: string, widgetName: string) => {
    const mappingType = getWidgetMappingType(widgetName);
    const widgetCategory = getWidgetCategory(widgetName);
    const fields: Record<string, WidgetFieldMapping> = {};
    const configFields = widgetConfigFields[widgetName as keyof typeof widgetConfigFields] || [];

    configFields.forEach(({ field, path }) => {
      fields[field] = {
        fieldPath: path,
        inputType: 'manual',
        manualValue: getValueByPath(defaultPropsMapping[widgetName], path),
      };
    });

    const targetReportConfig: TargetReportConfig = {
      type: 'Bex Query',
      technicalId: '',
      name: '',
      description: '',
    };

    const baseConfig = {
      reportName: reportName,
      mappingType: mappingType,
      fields: fields,
      targetReport: targetReportConfig,
    };

    let configToSave;

    if (widgetName === 'loans-app-tray') {
      const defaultMenuItemConfigs = {
        1: {
          reportName: reportName,
          queryConfig: {
            inputType: 'manual',
            manualValue: 13,
          },
        },
        2: {
          reportName: reportName,
          queryConfig: {
            inputType: 'manual',
            manualValue: 85,
          },
        },
        3: {
          reportName: reportName,
          queryConfig: {
            inputType: 'manual',
            manualValue: 32,
          },
        },
        4: {
          reportName: reportName,
          queryConfig: {
            inputType: 'manual',
            manualValue: 24,
          },
        },
      };

      const chartDataConfig = {
        reportName: reportName,
        inputType: 'manual',
        manualData: [
          { name: 'PR', value: 86, color: '#449ca4' },
          { name: 'CE', value: 156, color: '#5899da' },
          { name: 'SES', value: 114, color: '#ffaa04' },
          { name: 'CV', value: 126, color: '#ff0000' },
        ],
      };

      configToSave = {
        ...baseConfig,
        mappingType: 'loans-app-tray',
        menuItemConfigs: defaultMenuItemConfigs,
        chartDataConfig: chartDataConfig,
      };
    } else if (mappingType === 'chart') {
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
        const defaultSeries = defaultPropsMapping[widgetName]?.series || [];
        configToSave = {
          ...baseConfig,
          chartConfig: {
            xAxis: { field: '', type: 'CHA' },
            yAxis: { fields: [], type: 'KF' },
          },
          seriesConfig: {
            series: [...defaultSeries],
          },
        };
      } else if (widgetCategory === 'multi-chart') {
        const defaultSeries = defaultPropsMapping[widgetName]?.series || [];
        configToSave = {
          ...baseConfig,
          chartConfig: {
            xAxis: { field: '', type: 'CHA' },
            yAxis: { fields: [], type: 'KF' },
          },
          seriesConfig: {
            series: [...defaultSeries],
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
    } else if (mappingType === 'table') {
      configToSave = {
        ...baseConfig,
        tableConfig: {
          columns: [],
        },
      };
    } else if (mappingType === 'quadrant') {
      configToSave = {
        ...baseConfig,
        quadrantConfig: {
          chaField: '',
          metrics: [],
        },
      };
    } else {
      configToSave = baseConfig;
    }

    setFieldMappings((prev: any) => ({
      ...prev,
      [widgetId]: configToSave,
    }));

    setWidgetConfigurations((prev) => ({
      ...prev,
      [widgetId]: {
        ...defaultPropsMapping[widgetName],
        widgetType: widgetName,
        configType: mappingType,
        widgetCategory: widgetCategory,
        roles: [],
        description: '',
      },
    }));
  };

  const addWidget = (name: string, existingWidgetId?: string) => {
    if (!widgetMapping[name]) return;

    const widgetId = existingWidgetId || `widget-${Date.now()}`;
    const { w, h } = widgetSizes[name] || { w: 2, h: 2 };

    if (!existingWidgetId) {
      setWidgets((prev) => [
        ...prev,
        {
          id: widgetId,
          name,
          props: {},
          isNew: true, // Mark as new widget
        },
      ]);
      setLayout((prev: any) => [
        ...prev,
        { i: widgetId, x: 0, y: Infinity, w, h, static: false, sectionName },
      ]);
    }

    if (!fieldMappings[widgetId]) {
      initializeWidgetMappingConfig(widgetId, name);
    }
  };

  const handleDeleteRoleClick = (role: any, index: number) => {
    const roleName = typeof role === 'object' ? role.Name : role;
    setDeleteRoleConfirmDialog({
      open: true,
      roleIndex: index,
      roleName: roleName,
    });
  };

  const handleConfirmRoleDelete = () => {
    if (!selectedWidget || deleteRoleConfirmDialog.roleIndex === null) return;

    const currentRoles = widgetConfigurations[selectedWidget]?.roles || [];
    const roleToDelete = currentRoles[deleteRoleConfirmDialog.roleIndex];

    // Check if it's an existing role with RoleId
    const isExistingRole = typeof roleToDelete === 'object' && roleToDelete.RoleId;

    if (isExistingRole) {
      // Mark existing role as deleted instead of removing it
      const updatedRoles = currentRoles.map((role: any, i: number) => {
        if (i === deleteRoleConfirmDialog.roleIndex) {
          return {
            ...role,
            DelFlag: 'X', // Mark as deleted
          };
        }
        return role;
      });
      handleRolesChange(updatedRoles);
    } else {
      // Completely remove new role
      const updatedRoles = currentRoles.filter(
        (_: any, i: number) => i !== deleteRoleConfirmDialog.roleIndex
      );
      handleRolesChange(updatedRoles);
    }

    setDeleteRoleConfirmDialog({ open: false, roleIndex: null, roleName: null });
  };

  const handleCancelRoleDelete = () => {
    setDeleteRoleConfirmDialog({ open: false, roleIndex: null, roleName: null });
  };

  const removeWidget = (id: string) => {
    const widget = widgets.find((w) => w.id === id);
    if (!widget) return;

    // If it's an existing widget (already saved), mark as deleted
    if (!widget.isNew) {
      setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, deleted: true } : w)));

      // Remove from layout but keep in widgets array for save operation
      setLayout((prev) => prev.filter((item) => item.i !== id));

      // Mark as deleted in field mappings
      setFieldMappings((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          deleted: true,
        },
      }));

      // Mark as deleted in widget configurations
      setWidgetConfigurations((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          deleted: true,
        },
      }));
    } else {
      // If it's a new widget (not saved yet), completely remove it
      setWidgets((prev) => prev.filter((w) => w.id !== id));
      setLayout((prev) => prev.filter((item) => item.i !== id));

      // Remove from field mappings
      const { [id]: removed, ...rest } = fieldMappings;
      setFieldMappings(rest);

      // Remove from widget configurations
      const { [id]: removedConfig, ...restConfig } = widgetConfigurations;
      setWidgetConfigurations(restConfig);
    }

    // Clear selection if deleted widget was selected
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

    // Include both active and deleted widgets
    if (widgets.length === 0) {
      setSaveMessage('No widgets to save.');
      setSaveAlertSeverity('error');
      setShowSaveAlert(true);
      return;
    }

    setIsSaving(true);

    try {
      const updatedLayout = layout.map((item) => ({
        ...item,
      }));

      const cleanedFieldMappings = Object.entries(fieldMappings).reduce(
        (acc, [widgetId, config]) => {
          acc[widgetId] = JSON.parse(JSON.stringify(config));
          return acc;
        },
        {} as FieldMappings
      );

      // Include all widgets (both active and deleted)
      const widgetsWithCompleteData = widgets.map((widget) => {
        const widgetConfig = widgetConfigurations[widget.id] || {};
        const { widgetType, roles, description, typography, ...cleanProps } = widgetConfig;

        return {
          id: widget.id,
          name: widget.name,
          props: {
            ...cleanProps,
            typography,
          },
          roles: roles || [],
          Description: description || '',
          widgetType: widgetType || widget.name,
          deleted: widget.deleted || false, // Include deleted flag
          active: !widget.deleted, // Set active based on deleted status
        };
      });

      const layoutData: LayoutData = {
        sectionName: sectionName,
        layout: updatedLayout,
        fieldMappings: cleanedFieldMappings,
        widgets: widgetsWithCompleteData,
        expanded: isExpanded,
      };

      const result = await sapODataService.saveWidgetLayout(layoutData, sectionId);

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

      setSaveMessage(`Layout saved successfully!`);
      setSaveAlertSeverity('success');
      setShowSaveAlert(true);

      // After successful save, remove deleted widgets from the widgets array
      setWidgets((prev) => prev.filter((w) => !w.deleted));
      setTimeout(() => {
        window.location.href =
          process.env.NODE_ENV === 'development'
            ? '/?view=edit'
            : `${process.env.NEXT_PUBLIC_BSP_NAME}/index.html?view=edit`;
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

    const widgetInfo = getWidgetName(id);
    if (widgetInfo && widgetInfo.name) {
      setSelectedWidgetName(widgetInfo.name);
    }

    if (selectedWidget && previewData) {
      setWidgetConfigurations((prev) => ({
        ...prev,
        [selectedWidget]: {
          ...prev[selectedWidget],
          ...previewData,
        },
      }));
    }

    setSelectedWidget(id);
    setPreviewData(null);
    setTabValue(0);

    const widget = widgets.find((w) => w.id === id);
    if (!widget) return;

    if (!fieldMappings[id]) {
      initializeWidgetMappingConfig(id, widget.name);
    } else {
      const widgetMapping = fieldMappings[id];
      if (widgetMapping.reportName && widgetMapping.reportName !== reportName) {
        setReportName(widgetMapping.reportName);
      }

      const config = fieldMappings[id];
      const widgetCategory = getWidgetCategory(widget.name);

      if (config?.mappingType === 'chart' && config.chartConfig) {
        setChartXAxis(config.chartConfig.xAxis?.field || '');

        if (widgetCategory === 'dual-line' && Array.isArray(config.chartConfig.yAxis)) {
          setChartYAxis(config.chartConfig.yAxis[0]?.field || '');
          setChartYAxis2(config.chartConfig.yAxis[1]?.field || '');
        } else if (
          (widgetCategory === 'stacked-bar' || 'column-chart') &&
          config.chartConfig.yAxis?.fields
        ) {
          if (config.seriesConfig?.series) {
            setStackedSeries([...config.seriesConfig.series]);
          }
        } else {
          setChartYAxis(config.chartConfig.yAxis?.field || '');
        }
      } else if (config?.mappingType === 'table' && config.tableConfig) {
        setTableColumns(config.tableConfig.columns || []);
      } else if (config?.mappingType === 'quadrant' && config?.quadrantConfig) {
        setSelectedMetrics(config.quadrantConfig.metrics || []);
      }
    }
  };

  const setChangeColor = (color: string) => {
    if (!selectedWidget) return;
    const field = 'color';
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

    handleLiveValueUpdate(field, color);
  };

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

  const handleTargetReportChange = (field: keyof TargetReportConfig, value: string) => {
    if (!selectedWidget) return;

    setFieldMappings((prev: any) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        targetReport: {
          ...prev[selectedWidget]?.targetReport,
          [field]: value,
        },
      },
    }));
  };

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

    if (previewData) {
      setPreviewData((prev: any) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // NEW: Handler for format config changes
  const handleFormatConfigChange = (field: string, formatConfig: FormatConfig) => {
    if (!selectedWidget) return;

    setFieldMappings((prev) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        fields: {
          ...prev[selectedWidget].fields,
          [field]: {
            ...prev[selectedWidget].fields[field],
            formatConfig: formatConfig,
          },
        },
      },
    }));
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

    if (axisType === 'xAxis') {
      setChartXAxis(field);
    } else if (axisType === 'yAxis') {
      setChartYAxis(field);
    } else if (axisType === 'yAxis2') {
      setChartYAxis2(field);
    }

    if (widgetCategory === 'stacked-bar') {
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
        setFieldMappings((prev) => {
          const config = JSON.parse(JSON.stringify(prev[selectedWidget]));
          const currentFields = config.chartConfig?.yAxis?.fields || [];

          if (!currentFields.includes(field)) {
            const colors = ['#84BD00', '#FFC846', '#8979FF', '#E1553F', '#5899DA'];
            const newSeriesIndex = stackedSeries.length;
            const seriesName =
              parsedResponse?.header.find((h: any) => h.fieldName === field)?.label || field;

            config.chartConfig = {
              ...config.chartConfig,
              yAxis: {
                ...config.chartConfig?.yAxis,
                fields: [...currentFields, field],
                type: fieldType,
              },
            };

            const newSeries = {
              name: seriesName,
              dataKey: field,
              color: colors[newSeriesIndex % colors.length],
            };

            const updatedSeries = [...stackedSeries, newSeries];
            setStackedSeries(updatedSeries);

            if (!config.seriesConfig) {
              config.seriesConfig = { series: [] };
            }

            config.seriesConfig.series = updatedSeries;
          }

          return { ...prev, [selectedWidget]: config };
        });
      }
    } else if (widgetCategory === 'dual-line') {
      setFieldMappings((prev: any) => {
        const config = { ...prev[selectedWidget] };

        if (!config.chartConfig) {
          config.chartConfig = {};
        }

        if (axisType === 'xAxis') {
          config.chartConfig.xAxis = { field, type: fieldType };
        } else if (axisType === 'yAxis') {
          if (!Array.isArray(config.chartConfig.yAxis)) {
            config.chartConfig.yAxis = [null, null];
          }
          config.chartConfig.yAxis[0] = { field, type: fieldType };
        } else if (axisType === 'yAxis2') {
          if (!Array.isArray(config.chartConfig.yAxis)) {
            config.chartConfig.yAxis = [null, null];
          }
          config.chartConfig.yAxis[1] = { field, type: fieldType };
        }

        return { ...prev, [selectedWidget]: config };
      });
    } else {
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
  };

  const handleRemoveStackedSeries = (index: number) => {
    if (!selectedWidget) return;

    setStackedSeries((prev) => {
      const newSeries = [...prev];
      const removed = newSeries.splice(index, 1)[0];

      setFieldMappings((prevMappings) => {
        const config = JSON.parse(JSON.stringify(prevMappings[selectedWidget]));

        if (config.chartConfig?.yAxis?.fields) {
          const fields = config.chartConfig.yAxis.fields.filter((f: any) => f !== removed.dataKey);
          config.chartConfig.yAxis.fields = fields;
        }

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
          chaField: chartXAxis,
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

    handleLiveValueUpdate(field, value);
  };

  const handleAnnouncementValueChange = (field: string, value: any) => {
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
            manualValue: value,
          },
        },
      },
    }));

    handleLiveValueUpdate(field, value);
  };

  const handleCountChange = (e: any) => {
    const count = parseInt(e.target.value);
    setAnnouncementCount(count);
    setAnnouncementValues(Array(count).fill(''));
  };

  const handleAnnouncementValueChanges = (index: any, value: any) => {
    if (!selectedWidget) return;
    const updatedValues = [...announcementValues];
    updatedValues[index] = value;
    setAnnouncementValues(updatedValues);
    setFieldsForAnnouncement();
  };

  const setFieldsForAnnouncement = () => {
    const field = 'announcement';
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

    handleLiveValueUpdate(field, announcementValues);
  };

  const handleDescriptionToggle = (value: boolean) => {
    if (!selectedWidget) return;
    const field = 'showdescription';

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

    handleLiveValueUpdate(field, value);
  };

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

    const headerLabel =
      parsedResponse.header.find((h: any) => h.fieldName === field)?.label || field;

    const newColumn = { field, header: headerLabel, formatConfig: undefined };

    setTableColumns((prev) => [...prev, newColumn]);

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

    const newColumns = [...tableColumns];
    newColumns.splice(index, 1);
    setTableColumns(newColumns);

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

  const handleTableColumnFormatChange = (index: number, formatConfig: FormatConfig) => {
    if (!selectedWidget) return;

    const newColumns = [...tableColumns];
    newColumns[index] = { ...newColumns[index], formatConfig };
    setTableColumns(newColumns);

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
    const widget = widgets.find((w) => w.id == id);
    return widget;
  };

  const getWidgetConfigFields = () => {
    const widgetType = getSelectedWidgetType();
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
      );
      const data = await res.text();
      const parsedJSON = parseXMLToJson(data);
      setParsedResponse(parsedJSON);

      const transformed = transformFormMetadata(parsedJSON);
      setTransformedData(transformed);
      setCurrentLoadedReport(reportName);
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

  const hasAnyMappedFields = () => {
    if (!selectedWidget || !fieldMappings[selectedWidget]) return false;

    const fields = fieldMappings[selectedWidget].fields || {};
    return Object.values(fields).some((field: any) => field.inputType === 'mapped');
  };
  const getTabIndices = () => {
    if (!selectedWidget || !fieldMappings[selectedWidget]) return {};
    const mappingType: any = fieldMappings[selectedWidget]?.mappingType;
    const widgetType = getSelectedWidgetType();
    let currentIndex = 0;

    const indices: any = {
      dataMapping: currentIndex++,
      authorization: currentIndex++,
      info: currentIndex++,
    };

    if (widgetType === 'loans-app-tray') {
      indices.loansAppTrayConfig = currentIndex++;
    } else if (mappingType === 'chart') {
      indices.chartConfig = currentIndex++;
    } else if (mappingType === 'table') {
      indices.tableConfig = currentIndex++;
    } else if (mappingType === 'quadrant') {
      indices.quadrantConfig = currentIndex++;
    }

    indices.typography = currentIndex++; // ADD THIS LINE
    indices.dataPreview = currentIndex++;
    indices.widgetPreview = currentIndex++;

    return indices;
  };

  const generateLoansAppTrayPreview = () => {
    if (!selectedWidget || !fieldMappings[selectedWidget]) return;

    const config: any = fieldMappings[selectedWidget];
    const previewProps: any = {
      menuItems: [],
      chartData: [],
      menuItemConfigs: config.menuItemConfigs || {},
      chartDataConfig: config.chartDataConfig || {},
    };

    if (config.menuItemConfigs) {
      const processedMenuItems = Object.entries(config.menuItemConfigs).map(
        ([itemId, itemConfig]: [string, any]) => {
          let count = 0;

          if (itemConfig.queryConfig?.inputType === 'manual') {
            count = itemConfig.queryConfig.manualValue || 0;
          } else if (
            itemConfig.queryConfig?.inputType === 'mapped' &&
            itemConfig.queryConfig.mappedConfig
          ) {
            const { chaField, chaValue, kfField } = itemConfig.queryConfig.mappedConfig;
            if (chaField && chaValue && kfField && transformedData) {
              const mappedValue = getKFValue(chaField, chaValue, kfField);
              count = mappedValue ? parseInt(mappedValue) : 0;
            }
          }

          const widgetConfig = widgetConfigurations[selectedWidget];
          const menuItem = widgetConfig?.menuItems?.find(
            (item: any) => item.id === parseInt(itemId)
          );

          return {
            id: parseInt(itemId),
            iconName: menuItem?.iconName || 'Assignment',
            label: menuItem?.label || `Menu Item ${itemId}`,
            count: count,
          };
        }
      );

      previewProps.menuItems = processedMenuItems;
    }

    if (config.chartDataConfig?.inputType === 'manual') {
      previewProps.chartData = config.chartDataConfig.manualData || [
        { name: 'PR', value: 86, color: '#449ca4' },
        { name: 'CE', value: 156, color: '#5899da' },
        { name: 'SES', value: 114, color: '#ffaa04' },
        { name: 'CV', value: 126, color: '#ff0000' },
      ];
    } else if (
      config.chartDataConfig?.inputType === 'mapped' &&
      config.chartDataConfig?.chartConfig &&
      transformedData
    ) {
      const { xAxis, yAxis } = config.chartDataConfig.chartConfig;

      if (xAxis?.field && yAxis?.field) {
        const chartData = Object.entries(transformedData.FormStructure[xAxis.field] || {})
          .filter(([chaValue]) => chaValue !== 'Overall Result')
          .map(([chaValue, values]: [string, any], index) => {
            const value = values[yAxis.field] ? Number(values[yAxis.field]) : 0;
            const colors = ['#449ca4', '#5899da', '#ffaa04', '#ff0000', '#8979FF'];

            return {
              name: chaValue,
              value: value,
              color: colors[index % colors.length],
            };
          });

        previewProps.chartData = chartData;
      }
    }

    updateWidgetConfiguration(selectedWidget, previewProps);
  };

  const generatePreview = () => {
    if (!selectedWidget) return;

    const widgetType = getSelectedWidgetType();
    if (!widgetType) return;

    if (widgetType === 'loans-app-tray') {
      generateLoansAppTrayPreview();
      return;
    }

    const config = fieldMappings[selectedWidget];
    const widgetCategory = getWidgetCategory(widgetType);

    let previewProps: any = {};

    if (config.mappingType === 'simple') {
      Object.entries(config.fields).forEach(([field, fieldMapping]) => {
        let value: any;

        if (fieldMapping.inputType === 'manual') {
          value = fieldMapping.manualValue;
        } else if (fieldMapping.inputType === 'mapped' && fieldMapping.mappedConfig) {
          const { chaField, chaValue, kfField } = fieldMapping.mappedConfig;
          value = getKFValue(chaField, chaValue, kfField);
        }

        // APPLY FORMATTING HERE
        if (fieldMapping.formatConfig && value !== null && value !== undefined) {
          previewProps[field] = applyValueFormat(value, fieldMapping.formatConfig);
        } else {
          previewProps[field] = value;
        }
      });
      updateWidgetConfiguration(selectedWidget, previewProps);
    } else if (config.mappingType === 'chart' && config.chartConfig) {
      if (!transformedData) {
        console.error('transformedData is required for chart mapping');
        return;
      }
      try {
        if (widgetCategory === 'bar') {
          const { xAxis, yAxis } = config.chartConfig;
          if (xAxis?.field && yAxis?.field) {
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

            const title = widgetConfigurations[selectedWidget]?.title;
            previewProps = {
              data: chartData || [],
              title: title,
              variance: '+0.00%',
            };
          }
          updateWidgetConfiguration(selectedWidget, previewProps);
        } else if (widgetCategory === 'stacked-bar' || widgetCategory === 'column-chart') {
          const { xAxis, yAxis } = config.chartConfig;
          previewProps = {
            data: [],
            series: [],
            title: 'Stacked Chart',
          };

          if (xAxis?.field && yAxis?.fields?.length > 0) {
            const xValues = Object.keys(transformedData.FormStructure[xAxis.field] || {}).filter(
              (key) => key !== 'Overall Result'
            );

            const data = xValues.map((xValue) => {
              const entry: Record<string, any> = { name: xValue };

              yAxis.fields.forEach((kfField: any) => {
                entry[kfField] = Number(
                  transformedData.FormStructure[xAxis.field][xValue][kfField] || 0
                );
              });

              return entry;
            });

            const title = widgetConfigurations[selectedWidget]?.title;
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
            const data = Object.entries(transformedData.FormStructure[xAxis.field] || {})
              .filter(([chaValue]) => chaValue !== 'Overall Result')
              .map(([chaValue, values]: [string, any]) => {
                return {
                  name: chaValue,
                  value: Number(values[yAxis.field] || 0),
                };
              });

            let totalValue = '0';
            if (transformedData.FormStructure[xAxis.field]['Overall Result']) {
              const total = Number(
                transformedData.FormStructure[xAxis.field]['Overall Result'][yAxis.field] || 0
              );

              // APPLY FORMATTING to totalValue if configured
              const totalValueFieldMapping = config.fields['totalValue'];
              if (totalValueFieldMapping?.formatConfig) {
                totalValue = applyValueFormat(total, totalValueFieldMapping.formatConfig);
              } else {
                totalValue = `${total.toLocaleString()}`;
              }
            }

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
            const data = Object.entries(transformedData.FormStructure[xAxis.field] || {})
              .filter(([chaValue]) => chaValue !== 'Overall Result')
              .map(([chaValue, values]: [string, any]) => {
                return {
                  name: chaValue,
                  line1: Number(values[yAxis[0].field] || 0),
                  line2: Number(values[yAxis[1].field] || 0),
                };
              });

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

            const title = widgetConfigurations[selectedWidget]?.title;

            previewProps = {
              data: data,
              series: series,
              title: title,
            };
          }
          updateWidgetConfiguration(selectedWidget, previewProps);
        } else if (widgetCategory === 'pie-total') {
          const { xAxis, yAxis } = config.chartConfig;
          previewProps = {
            data: [],
            title: 'Pie Chart',
            totalValue: '$0',
            subValue: '$0',
            variance: '0%',
          };

          if (xAxis?.field && yAxis?.field) {
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

            const totalSum = data.reduce((sum, item) => sum + item.value, 0);

            // APPLY FORMATTING to totalValue if configured
            const totalValueFieldMapping = config.fields['totalValue'];
            const totalValue = totalValueFieldMapping?.formatConfig
              ? applyValueFormat(totalSum, totalValueFieldMapping.formatConfig)
              : `${totalSum.toLocaleString()}`;

            let overallValue = 0;
            if (transformedData.FormStructure[xAxis.field]['Overall Result']) {
              overallValue = Number(
                transformedData.FormStructure[xAxis.field]['Overall Result'][yAxis.field] || 0
              );
            }
            const subValue = `${overallValue.toLocaleString()}`;

            let variance = '+0.00%';
            if (data.length > 0 && totalSum > 0) {
              const diff = ((overallValue - totalSum) / totalSum) * 100;
              variance = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%`;
            }

            const title = transformedData.FormMetadata[yAxis.field]?.label || 'Pie Chart';

            previewProps = {
              data,
              title,
              totalValue,
              subValue,
              variance,
            };
          }
          updateWidgetConfiguration(selectedWidget, previewProps);
        } else if (widgetCategory === 'pie') {
          const { xAxis, yAxis }: any = config.chartConfig;
          if (xAxis?.field && yAxis?.field) {
            const chartData = Object.entries(transformedData.FormStructure[xAxis.field] || {})
              .filter(([chaValue]) => chaValue !== 'Overall Result')
              .map(([chaValue, values]: [string, any], index) => {
                const value = Number(values[yAxis.field] || 0);
                const colors = ['#84BD00', '#E1553F', '#5899DA', '#FFC846', '#8979FF'];

                return {
                  label: chaValue,
                  value: value,
                  fill: colors[index % colors.length],
                };
              });

            const totalSum = chartData.reduce((sum, item) => sum + item.value, 0);
            const title = widgetConfigurations[selectedWidget]?.title;
            const totalValue = widgetConfigurations[selectedWidget]?.totalValue;

            previewProps = {
              data: chartData,
              title: title,
              totalValue: totalValue,
            };
          }
          updateWidgetConfiguration(selectedWidget, previewProps);
        } else if (widgetCategory === 'multi-chart') {
          const { xAxis, yAxis } = config.chartConfig;
          if (!xAxis?.field || !yAxis?.fields || yAxis.fields.length === 0) {
            console.error('Multi-chart requires xAxis and yAxis fields');
            return;
          }

          // Get unique x-axis values
          const xValues = Object.keys(transformedData.FormStructure[xAxis.field] || {}).filter(
            (key) => key !== 'Overall Result'
          );

          // Build chart data
          const data = xValues.map((xValue) => {
            const entry: Record<string, any> = { name: xValue };

            // Check if there's a label field for grouping
            const labelField = parsedResponse.header.find(
              (h: any) => h.fieldName.toLowerCase().includes('label') && h.type === 'CHA'
            );

            if (labelField) {
              // Add label to data entry
              entry.label =
                transformedData.FormStructure[xAxis.field][xValue][labelField.fieldName] || '';
            }

            // Add all y-axis values
            yAxis.fields.forEach((kfField: any) => {
              entry[kfField] = Number(
                transformedData.FormStructure[xAxis.field][xValue][kfField] || 0
              );
            });

            return entry;
          });

          // Build series configuration
          const series = config.seriesConfig?.series || [];

          // Calculate total value if needed
          let totalValue = '';
          if (transformedData.FormStructure[xAxis.field]['Overall Result']) {
            const total = yAxis.fields.reduce((sum: number, kfField: any) => {
              return (
                sum +
                Number(transformedData.FormStructure[xAxis.field]['Overall Result'][kfField] || 0)
              );
            }, 0);
            totalValue = `${total.toLocaleString()}`;
          }

          const title = widgetConfigurations[selectedWidget]?.title || 'Multi Chart';
          const chartType = widgetConfigurations[selectedWidget]?.chartType || 'line';
          const showLegend = widgetConfigurations[selectedWidget]?.showLegend !== false;
          const stacked = widgetConfigurations[selectedWidget]?.stacked || false;
          const selectedLabels = widgetConfigurations[selectedWidget]?.selectedLabels || [];
          const valueFormat = widgetConfigurations[selectedWidget]?.valueFormat || 'non-currency'; // NEW
          previewProps = {
            data,
            series,
            title,
            totalValue,
            chartType,
            showLegend,
            stacked,
            selectedLabels,
            valueFormat,
          };

          updateWidgetConfiguration(selectedWidget, previewProps);
        } else if (widgetCategory === 'line') {
          const { xAxis, yAxis } = config.chartConfig;
          if (xAxis?.field && yAxis?.field) {
            const chartData = Object.entries(transformedData.FormStructure[xAxis.field] || {})
              .filter(([chaValue]) => chaValue !== 'Overall Result')
              .map(([chaValue, values]: [string, any]) => {
                return {
                  date: chaValue,
                  [yAxis.field]: Number(values[yAxis.field] || 0),
                  unit: transformedData.FormMetadata[yAxis.field]?.type || '%',
                };
              });

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
                widget_name: transformedData.FormMetadata[yAxis.field]?.label || 'Chart',
              },
            };
          }
          updateWidgetConfiguration(selectedWidget, previewProps);
        } else if (widgetCategory === 'prediction-chart') {
          const { xAxis, yAxis } = config.chartConfig;

          if (!xAxis?.field || !parsedResponse) {
            console.error('xAxis field and parsedResponse required for prediction chart');
            return;
          }

          // Get the category field (O2TFPLNEXF0ML95F2Z32W3L equivalent)
          const categoryField = parsedResponse.header.find(
            (h: any) => h.type === 'CHA' && h.fieldName !== xAxis.field
          )?.fieldName;

          if (!categoryField) {
            console.error('Category field not found');
            return;
          }

          // Transform the data into prediction chart format
          const chartData: any[] = [];
          const categories = Object.keys(transformedData.FormStructure[xAxis.field] || {}).filter(
            (key) => key !== 'Overall Result'
          );

          // Get all unique category values
          const uniqueCategories = new Set<string>();
          categories.forEach((timePeriod) => {
            const data = transformedData.FormStructure[xAxis.field][timePeriod];
            if (data && data[categoryField]) {
              // If the category field has subcategories
              const subCategories = Object.keys(data).filter(
                (key) => key !== categoryField && typeof data[key] === 'object'
              );
              if (subCategories.length > 0) {
                subCategories.forEach((cat) => uniqueCategories.add(cat));
              }
            }
          });

          // If we have parsedResponse.chartData, use it directly
          if (parsedResponse.chartData && Array.isArray(parsedResponse.chartData)) {
            // Group by category
            const categoriesFromData = [
              ...new Set(
                parsedResponse.chartData
                  .map((item: any) => {
                    // Find the category field value
                    const categoryFieldName = Object.keys(item).find(
                      (key) =>
                        key !== 'CALMONTH' &&
                        typeof item[key] === 'string' &&
                        !key.startsWith('VALUE')
                    );
                    return categoryFieldName ? item[categoryFieldName] : null;
                  })
                  .filter(Boolean)
              ),
            ];

            previewProps = {
              data: {
                header: parsedResponse.header,
                chartData: parsedResponse.chartData,
              },
              title:
                widgetConfigurations[selectedWidget]?.title ||
                transformedData.FormMetadata[xAxis.field]?.label ||
                'Prediction Chart',
            };
          } else {
            // Fallback: construct from transformedData
            categories.forEach((timePeriod) => {
              const data = transformedData.FormStructure[xAxis.field][timePeriod];

              // Try to find category subdivisions
              Object.keys(data).forEach((key) => {
                if (typeof data[key] === 'object' && key !== 'Overall Result') {
                  const categoryData = data[key];
                  chartData.push({
                    CALMONTH: timePeriod,
                    O2TFPLNEXF0ML95F2Z32W3L: key,
                    VALUE001:
                      categoryData.VALUE001 || categoryData[Object.keys(categoryData)[0]] || '',
                    VALUE002:
                      categoryData.VALUE002 || categoryData[Object.keys(categoryData)[1]] || '',
                    VALUE003:
                      categoryData.VALUE003 || categoryData[Object.keys(categoryData)[2]] || '',
                    VALUE004:
                      categoryData.VALUE004 || categoryData[Object.keys(categoryData)[3]] || '',
                  });
                }
              });
            });

            previewProps = {
              data: {
                header: parsedResponse.header,
                chartData: chartData.length > 0 ? chartData : parsedResponse.chartData,
              },
              title: widgetConfigurations[selectedWidget]?.title || 'Prediction Chart',
            };
          }

          updateWidgetConfiguration(selectedWidget, previewProps);
        }
      } catch (err) {
        console.error('Error generating chart preview:', err);
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
              widget_name: 'Chart Preview Error',
            },
          };
        } else {
          previewProps = { data: [], title: 'Chart Preview Error' };
        }
        updateWidgetConfiguration(selectedWidget, previewProps);
      }
    } else if (config.mappingType === 'quadrant' && config.quadrantConfig) {
      try {
        if (!transformedData) {
          console.error('transformedData is required for chart mapping');
          return;
        }
        const { chaField, metrics } = config.quadrantConfig;
        previewProps = { metrics: [] };

        if (chaField && metrics && metrics.length > 0) {
          const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

          const quadrantMetrics = metrics.map((metricName: any, index: number) => {
            let value = '0';

            if (metricName) {
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
        previewProps = {
          metrics: [
            { title: 'Error', value: '0', position: 'top-left' },
            { title: 'Error', value: '0', position: 'top-right' },
            { title: 'Error', value: '0', position: 'bottom-left' },
            { title: 'Error', value: '0', position: 'bottom-right' },
          ],
        };
        updateWidgetConfiguration(selectedWidget, previewProps);
      }
    } else if (config.mappingType === 'table' && config.tableConfig) {
      if (!transformedData) {
        console.error('transformedData is required for chart mapping');
        return;
      }
      const { columns } = config.tableConfig;

      if (columns && columns.length > 0) {
        const chaField = columns[0].field;
        const chaValues = getCHAValues(chaField).filter((val) => val !== 'Overall Result');

        const tableData =
          chaValues.length > 0
            ? chaValues.map((chaValue) => {
                const row: any = {};

                columns.forEach((column: any) => {
                  if (column.field === chaField) {
                    row[column.field] = chaValue;
                  } else {
                    const rawValue = getKFValue(chaField, chaValue, column.field);

                    // APPLY FORMATTING if configured for this column
                    if (column.formatConfig && rawValue !== null && rawValue !== undefined) {
                      const numValue = parseFloat(rawValue);
                      if (!isNaN(numValue)) {
                        row[column.field] = applyValueFormat(numValue, column.formatConfig);
                      } else {
                        row[column.field] = rawValue;
                      }
                    } else {
                      // No formatting - use raw value
                      row[column.field] = rawValue;
                    }
                  }
                });

                return row;
              })
            : [];

        let totalColumn = columns.length > 1 ? columns[1].field : null;
        if (!totalColumn) {
          for (let i = 0; i < columns.length; i++) {
            if (columns[i].field !== chaField) {
              totalColumn = columns[i].field;
              break;
            }
          }
        }

        const total = totalColumn ? getKFValue(chaField, 'Overall Result', totalColumn) : 0;
        // const tableTitle = transformedData.FormMetadata[chaField]?.label || 'Top Items';

        const tableTitle = widgetConfigurations[selectedWidget]?.title;

        previewProps = {
          title: tableTitle,
          data: tableData,
          columns: columns.map((col: any) => {
            const headerLabel =
              parsedResponse.header.find((h: any) => h.fieldName === col.field)?.label ||
              col.header ||
              col.field;
            return {
              field: col.field,
              header: headerLabel,
              formatConfig: col.formatConfig, // Include format config in preview
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

  if (adminCheckLoading) {
    return <LoadingScreen title="Loading..." message="Checking user permissions..." />;
  }

  if (adminCheckError) {
    return (
      <ErrorScreen
        title="Access Error"
        message={adminCheckError || 'Unable to verify permissions'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!isAdmin) {
    return (
      <ErrorScreen
        title="Access Denied"
        message="You don't have permission to access the mapping configuration."
        onRetry={() => {
          window.location.href =
            process.env.NODE_ENV === 'development'
              ? '/'
              : `${process.env.NEXT_PUBLIC_BSP_NAME}/index.html`;
        }}
      />
    );
  }

  const handleTypographyChange = (config: WidgetTypographyConfig) => {
    if (!selectedWidget) return;

    setWidgetConfigurations((prev: any) => ({
      ...prev,
      [selectedWidget]: {
        ...prev[selectedWidget],
        typography: config,
      },
    }));

    // Update preview if active
    if (previewData) {
      setPreviewData((prev: any) => ({
        ...prev,
        typography: config,
      }));
    }
  };

  if (!isEditModeAllowed) {
    return (
      <ErrorScreen
        title="Edit Mode Required"
        message="Mapping configuration requires edit mode. Add '?state=edit' to the URL."
        onRetry={() => {
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('state', 'edit');
          window.location.href = currentUrl.toString();
        }}
      />
    );
  }

  return (
    <div className="relative flex h-screen w-full">
      <div className="h-full bg-white">
        <SidebarMapping onItemClick={addWidget} />
      </div>

      <Splitter
        className="h-100vh w-full overflow-y-auto"
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_BSP_NAME}/background/bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        layout="vertical"
      >
        <SplitterPanel>
          <div className="max-xl flex flex-1 flex-col p-4 text-white">
            <Typography variant="h5" component="h1" gutterBottom>
              {sectionName}
            </Typography>

            <GridLayout
              className="layout h-full w-full"
              layout={layout}
              cols={12}
              rowHeight={80}
              width={80}
              isResizable={true}
              resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
              isDraggable={true}
              onLayoutChange={(newLayout) => setLayout(newLayout as LayoutItem[])}
            >
              {widgets
                .filter((widget) => !widget.deleted)
                .map(({ id, name }) => {
                  const Component = widgetMapping[name];
                  const widgetProps =
                    previewData && selectedWidget === id
                      ? previewData
                      : widgetConfigurations[id] || defaultPropsMapping[name];

                  // Add typography to widget props
                  const propsWithTypography = {
                    ...widgetProps,
                    typography: widgetConfigurations[id]?.typography,
                  };

                  const hasRoles = widgetConfigurations[id]?.roles?.length > 0;
                  const hasDescription = widgetConfigurations[id]?.description?.trim();

                  return (
                    <div
                      key={id}
                      className={`relative z-100 rounded-lg shadow-md ${
                        selectedWidget === id ? 'border-2 border-blue-500' : ''
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
                      <Component {...propsWithTypography} setChangeColor={setChangeColor} />
                    </div>
                  );
                })}
            </GridLayout>
          </div>
        </SplitterPanel>
      </Splitter>

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

              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="mapping tabs"
                className="!bg-[#ffffff20]"
                variant="scrollable"
                scrollButtons={true}
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
                      <Tab key="info" icon={<InfoIcon />} label="Info" className="!text-white" />,
                      getSelectedWidgetType() === 'loans-app-tray' && (
                        <Tab
                          key="loans-app-tray"
                          icon={<DataIcon />}
                          label="LoansApp Config"
                          className="!text-white"
                        />
                      ),
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
                        key="typography"
                        icon={<FormatPaintIcon />}
                        label="Typography"
                        className="!text-white"
                      />, // ADD THIS
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
                    <TabPanel value={tabValue} index={tabIndices.dataMapping}>
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

                      {getWidgetConfigFields().map(({ field }) => {
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
                          field !== 'menuItemConfigs' &&
                          field !== 'chartDataConfig' &&
                          selectedWidgetName !== 'announcement' ? (
                          <FormControl fullWidth variant="outlined" margin="normal" key={field}>
                            <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                              {field === 'name' || field === 'widget_name'
                                ? 'TITLE'
                                : field?.toUpperCase()}
                            </Typography>

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

                            {/* ADD FORMATTING UI HERE */}
                            {(field === 'value' ||
                              field === 'value1' ||
                              field === 'value2' ||
                              field === 'totalValue' ||
                              field === 'amount' ||
                              field.toLowerCase().includes('value')) && (
                              <FormatConfigUI
                                value={fieldMapping?.formatConfig}
                                onChange={(config) => handleFormatConfigChange(field, config)}
                                sampleValue={
                                  isManualInput
                                    ? parseFloat(fieldMapping?.manualValue) || 1234567.89
                                    : mappedConfig?.chaField &&
                                        mappedConfig?.chaValue &&
                                        mappedConfig?.kfField
                                      ? parseFloat(
                                          getKFValue(
                                            mappedConfig.chaField,
                                            mappedConfig.chaValue,
                                            mappedConfig.kfField
                                          )
                                        ) || 1234567.89
                                      : 1234567.89
                                }
                                label={`Format ${field}`}
                              />
                            )}
                          </FormControl>
                        ) : null;
                      })}

                      {selectedWidgetName === 'announcement'
                        ? (() => {
                            const fieldMapping = fieldMappings[selectedWidget]?.fields['title'];
                            return (
                              <>
                                <Box sx={{ color: 'white' }}>
                                  <FormControl
                                    fullWidth
                                    variant="outlined"
                                    margin="normal"
                                    key={'title'}
                                  >
                                    <TextField
                                      label="TITLE"
                                      onChange={(e) =>
                                        handleAnnouncementValueChange('title', e.target.value)
                                      }
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

                                  <FormControl fullWidth variant="outlined" margin="normal">
                                    <InputLabel sx={{ color: 'white' }}>
                                      Number of Announcements
                                    </InputLabel>
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

                                  {announcementValues.map((value, index) => (
                                    <FormControl
                                      fullWidth
                                      variant="outlined"
                                      margin="normal"
                                      key={`announcement-${index}`}
                                    >
                                      <TextField
                                        label={`ANNOUNCEMENT ${index + 1}`}
                                        value={value}
                                        onChange={(e) =>
                                          handleAnnouncementValueChanges(index, e.target.value)
                                        }
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        InputProps={{
                                          style: {
                                            color: 'white',
                                            fontSize: '1.1rem',
                                            fontWeight: '500',
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
                              </>
                            );
                          })()
                        : null}
                    </TabPanel>

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
                                // Add new role as an object with empty RoleId
                                const newRoleObj = {
                                  Name: newRole.trim(),
                                  RoleId: '', // Empty for new roles
                                  Description: '',
                                  Type: 'Custom',
                                  DelFlag: '',
                                };
                                const updatedRoles = [...currentRoles, newRoleObj];
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
                                  // Add new role as an object with empty RoleId
                                  const newRoleObj = {
                                    Name: newRole.trim(),
                                    RoleId: '', // Empty for new roles
                                    Description: '',
                                    Type: 'Custom',
                                    DelFlag: '',
                                  };
                                  const updatedRoles = [...currentRoles, newRoleObj];
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
                          {(widgetConfigurations[selectedWidget]?.roles || [])
                            .filter((role: any) => {
                              // Filter out deleted roles from display
                              if (typeof role === 'object' && role.DelFlag === 'X') {
                                return false;
                              }
                              return true;
                            })
                            .map((role: any, index: number) => {
                              // Get the actual index in the original array
                              const actualIndex = (
                                widgetConfigurations[selectedWidget]?.roles || []
                              ).findIndex((r: any, i: number) => {
                                if (typeof role === 'object' && typeof r === 'object') {
                                  return r.Name === role.Name && r.RoleId === role.RoleId;
                                }
                                return r === role;
                              });

                              return (
                                <ListItem key={actualIndex} sx={{ px: 0 }}>
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
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Typography sx={{ color: 'white' }}>
                                        {typeof role === 'object' ? role.Name : role}
                                      </Typography>
                                      {typeof role === 'object' && role.RoleId && (
                                        <Chip
                                          size="small"
                                          label="Existing"
                                          sx={{
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            fontSize: '0.7rem',
                                            height: '20px',
                                          }}
                                        />
                                      )}
                                    </Box>
                                    <IconButton
                                      edge="end"
                                      onClick={() => handleDeleteRoleClick(role, actualIndex)}
                                      sx={{ color: 'white' }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                </ListItem>
                              );
                            })}
                          {(widgetConfigurations[selectedWidget]?.roles || []).filter(
                            (role: any) => {
                              // Count non-deleted roles
                              if (typeof role === 'object' && role.DelFlag === 'X') {
                                return false;
                              }
                              return true;
                            }
                          ).length === 0 && (
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

                    {getSelectedWidgetType() === 'loans-app-tray' && (
                      <TabPanel value={tabValue} index={tabIndices.loansAppTrayConfig!}>
                        <LoansAppTrayConfig
                          selectedWidget={selectedWidget}
                          fieldMappings={fieldMappings}
                          setFieldMappings={setFieldMappings}
                          widgetConfigurations={widgetConfigurations}
                          setWidgetConfigurations={setWidgetConfigurations}
                          parsedResponse={parsedResponse}
                          getCHAFields={getCHAFields}
                          getKFFields={getKFFields}
                          getCHAValues={getCHAValues}
                          getKFValue={getKFValue}
                          reportName={reportName}
                          handleReportNameChange={handleReportNameChange}
                          fetchReportData={fetchReportData}
                          loading={loading}
                        />
                      </TabPanel>
                    )}

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

                              {getWidgetCategory(getSelectedWidgetType() || '') ===
                              'stacked-bar' ? (
                                <Box mt={3} className="stacked-series-config">
                                  <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    sx={{ color: 'white' }}
                                  >
                                    Series Configuration
                                  </Typography>

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
                              ) : getWidgetCategory(getSelectedWidgetType() || '') ===
                                'prediction-chart' ? (
                                <Box mt={3}>
                                  <Alert
                                    severity="info"
                                    sx={{ mb: 2, backgroundColor: '#2196f320' }}
                                  >
                                    <Typography sx={{ color: 'white' }}>
                                      Prediction charts automatically detect categories and display:
                                    </Typography>
                                    <ul
                                      style={{
                                        color: 'white',
                                        paddingLeft: '20px',
                                        marginTop: '8px',
                                      }}
                                    >
                                      <li>Actual values (solid lines)</li>
                                      <li>Predicted values (dashed lines)</li>
                                      <li>Forecast range (shaded area with boundaries)</li>
                                    </ul>
                                  </Alert>

                                  <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                                    Expected Data Fields:
                                  </Typography>
                                  <Box sx={{ backgroundColor: '#ffffff10', p: 2, borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                      • <strong>Time Period:</strong> Selected X-Axis field
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                      • <strong>Categories:</strong> Automatically detected from
                                      data structure
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                      • <strong>VALUE001:</strong> Actual values
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                      • <strong>VALUE002:</strong> Predicted values
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                      • <strong>VALUE003:</strong> Forecast upper bound
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'white' }}>
                                      • <strong>VALUE004:</strong> Forecast lower bound
                                    </Typography>
                                  </Box>
                                </Box>
                              ) : (
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
                          {/* Add Multi-Chart Specific Config */}
                          {getWidgetCategory(getSelectedWidgetType() || '') === 'multi-chart' && (
                            <Box mt={3} className="multi-chart-config">
                              {/* Chart Type Selection */}
                              <FormControl fullWidth margin="normal">
                                <InputLabel sx={{ color: 'white' }}>Chart Type</InputLabel>
                                <Select
                                  value={widgetConfigurations[selectedWidget]?.chartType || 'line'}
                                  onChange={(e) => {
                                    setWidgetConfigurations((prev) => ({
                                      ...prev,
                                      [selectedWidget]: {
                                        ...prev[selectedWidget],
                                        chartType: e.target.value,
                                      },
                                    }));
                                  }}
                                  label="Chart Type"
                                  sx={{
                                    color: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '& .MuiSvgIcon-root': { color: 'white' },
                                  }}
                                >
                                  <MenuItem value="line">Line Chart</MenuItem>
                                  <MenuItem value="bar">Bar Chart (Vertical)</MenuItem>
                                  <MenuItem value="horizontal-bar">Bar Chart (Horizontal)</MenuItem>
                                  <MenuItem value="area">Area Chart</MenuItem>
                                  <MenuItem value="composed">Composed Chart (Mixed)</MenuItem>
                                  <MenuItem value="scatter">Scatter Plot</MenuItem>
                                  <MenuItem value="pie">Pie Chart</MenuItem>
                                  <MenuItem value="radar">Radar Chart</MenuItem>
                                </Select>
                                <FormHelperText sx={{ color: 'white' }}>
                                  Select the visualization type for this widget
                                </FormHelperText>
                              </FormControl>

                              {/* VALUE FORMAT CONFIGURATION*/}
                              <FormControl fullWidth margin="normal">
                                <InputLabel sx={{ color: 'white' }}>Value Format</InputLabel>
                                <Select
                                  value={
                                    widgetConfigurations[selectedWidget]?.valueFormat ||
                                    'non-currency'
                                  }
                                  onChange={(e) => {
                                    setWidgetConfigurations((prev) => ({
                                      ...prev,
                                      [selectedWidget]: {
                                        ...prev[selectedWidget],
                                        valueFormat: e.target.value,
                                      },
                                    }));
                                  }}
                                  label="Value Format"
                                  sx={{
                                    color: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'white',
                                    },
                                    '& .MuiSvgIcon-root': { color: 'white' },
                                  }}
                                >
                                  <MenuItem value="currency">
                                    Currency (Thousand → M, Million → MM, Billion → B)
                                  </MenuItem>
                                  <MenuItem value="non-currency">
                                    Non-Currency (Thousand → K, Million → M, Billion → B)
                                  </MenuItem>
                                </Select>
                                <FormHelperText sx={{ color: 'white' }}>
                                  Select how numbers should be abbreviated in the chart
                                </FormHelperText>
                              </FormControl>

                              {/* Show Legend Toggle */}
                              <FormControl fullWidth margin="normal">
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={
                                        widgetConfigurations[selectedWidget]?.showLegend !== false
                                      }
                                      onChange={(e) => {
                                        setWidgetConfigurations((prev) => ({
                                          ...prev,
                                          [selectedWidget]: {
                                            ...prev[selectedWidget],
                                            showLegend: e.target.checked,
                                          },
                                        }));
                                      }}
                                      sx={{
                                        color: 'white',
                                        '&.Mui-checked': { color: 'white' },
                                      }}
                                    />
                                  }
                                  label={
                                    <Typography variant="body2" sx={{ color: 'white' }}>
                                      Show Legend
                                    </Typography>
                                  }
                                />
                                <FormHelperText sx={{ color: 'white', ml: 0 }}>
                                  Display legend below the chart
                                </FormHelperText>
                              </FormControl>

                              {/* Stacked Toggle (for applicable chart types) */}
                              {['bar', 'horizontal-bar', 'area'].includes(
                                widgetConfigurations[selectedWidget]?.chartType || 'line'
                              ) && (
                                <FormControl fullWidth margin="normal">
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={
                                          widgetConfigurations[selectedWidget]?.stacked || false
                                        }
                                        onChange={(e) => {
                                          setWidgetConfigurations((prev) => ({
                                            ...prev,
                                            [selectedWidget]: {
                                              ...prev[selectedWidget],
                                              stacked: e.target.checked,
                                            },
                                          }));
                                        }}
                                        sx={{
                                          color: 'white',
                                          '&.Mui-checked': { color: 'white' },
                                        }}
                                      />
                                    }
                                    label={
                                      <Typography variant="body2" sx={{ color: 'white' }}>
                                        Stacked
                                      </Typography>
                                    }
                                  />
                                  <FormHelperText sx={{ color: 'white', ml: 0 }}>
                                    Stack series on top of each other
                                  </FormHelperText>
                                </FormControl>
                              )}

                              {/* Selected Labels Multi-Select */}
                              {parsedResponse &&
                                (() => {
                                  // Check if data has label field
                                  const labelField = parsedResponse.header.find(
                                    (h: any) =>
                                      h.fieldName.toLowerCase().includes('label') &&
                                      h.type === 'CHA'
                                  );

                                  if (labelField && chartXAxis) {
                                    const labelValues = getCHAValues(labelField.fieldName).filter(
                                      (val) => val !== 'Overall Result'
                                    );

                                    return (
                                      <FormControl fullWidth margin="normal">
                                        <InputLabel sx={{ color: 'white' }}>
                                          Filter by Labels
                                        </InputLabel>
                                        <Select
                                          multiple
                                          value={
                                            widgetConfigurations[selectedWidget]?.selectedLabels ||
                                            []
                                          }
                                          onChange={(e) => {
                                            setWidgetConfigurations((prev) => ({
                                              ...prev,
                                              [selectedWidget]: {
                                                ...prev[selectedWidget],
                                                selectedLabels: e.target.value as string[],
                                              },
                                            }));
                                          }}
                                          label="Filter by Labels"
                                          renderValue={(selected) => (
                                            <Box
                                              sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                                            >
                                              {(selected as string[]).map((value) => (
                                                <Chip
                                                  key={value}
                                                  label={value}
                                                  size="small"
                                                  sx={{
                                                    backgroundColor: '#ffffff20',
                                                    color: 'white',
                                                  }}
                                                />
                                              ))}
                                            </Box>
                                          )}
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
                                          {labelValues.map((label) => (
                                            <MenuItem key={label} value={label}>
                                              <Checkbox
                                                checked={
                                                  (
                                                    widgetConfigurations[selectedWidget]
                                                      ?.selectedLabels || []
                                                  ).indexOf(label) > -1
                                                }
                                              />
                                              {label}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                        <FormHelperText sx={{ color: 'white' }}>
                                          Select specific labels to display (leave empty for all)
                                        </FormHelperText>
                                      </FormControl>
                                    );
                                  }
                                  return null;
                                })()}

                              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

                              {/* DATA SERIES CONFIGURATION */}
                              <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{ color: 'white', fontWeight: 'bold' }}
                              >
                                Data Series Configuration
                              </Typography>

                              <Box mb={2}>
                                {stackedSeries.length > 0 ? (
                                  <Grid container spacing={2}>
                                    {stackedSeries.map((series: any, index) => (
                                      <Grid item xs={12} key={index}>
                                        <Card
                                          variant="outlined"
                                          sx={{ backgroundColor: '#ffffff20' }}
                                        >
                                          <CardContent className="py-2">
                                            <Grid container spacing={2} alignItems="center">
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
                                              <Grid item xs={4}>
                                                <Typography variant="body2" sx={{ color: 'white' }}>
                                                  {series.name}
                                                </Typography>
                                                <Typography
                                                  variant="caption"
                                                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                                                >
                                                  {series.dataKey}
                                                </Typography>
                                              </Grid>
                                              <Grid item xs={3}>
                                                <FormControl fullWidth size="small">
                                                  <Select
                                                    value={series.type || 'line'}
                                                    onChange={(e) => {
                                                      const newSeries: any = [...stackedSeries];
                                                      newSeries[index] = {
                                                        ...newSeries[index],
                                                        type: e.target.value as
                                                          | 'line'
                                                          | 'bar'
                                                          | 'area',
                                                      };
                                                      setStackedSeries(newSeries);

                                                      setFieldMappings((prev) => ({
                                                        ...prev,
                                                        [selectedWidget]: {
                                                          ...prev[selectedWidget],
                                                          seriesConfig: {
                                                            ...prev[selectedWidget].seriesConfig,
                                                            series: newSeries,
                                                          },
                                                        },
                                                      }));
                                                    }}
                                                    sx={{
                                                      color: 'white',
                                                      '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'white',
                                                      },
                                                      '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'white',
                                                      },
                                                      '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                                                        {
                                                          borderColor: 'white',
                                                        },
                                                      '& .MuiSvgIcon-root': { color: 'white' },
                                                    }}
                                                  >
                                                    <MenuItem value="line">Line</MenuItem>
                                                    <MenuItem value="bar">Bar</MenuItem>
                                                    <MenuItem value="area">Area</MenuItem>
                                                  </Select>
                                                </FormControl>
                                              </Grid>
                                              <Grid item xs={3}>
                                                <TextField
                                                  size="small"
                                                  type="color"
                                                  value={series.color}
                                                  onChange={(e) => {
                                                    const newSeries = [...stackedSeries];
                                                    newSeries[index] = {
                                                      ...newSeries[index],
                                                      color: e.target.value,
                                                    };
                                                    setStackedSeries(newSeries);

                                                    setFieldMappings((prev) => ({
                                                      ...prev,
                                                      [selectedWidget]: {
                                                        ...prev[selectedWidget],
                                                        seriesConfig: {
                                                          ...prev[selectedWidget].seriesConfig,
                                                          series: newSeries,
                                                        },
                                                      },
                                                    }));
                                                  }}
                                                  sx={{
                                                    '& input': {
                                                      height: '30px',
                                                      cursor: 'pointer',
                                                    },
                                                  }}
                                                />
                                              </Grid>
                                              <Grid item xs={1}>
                                                <IconButton
                                                  size="small"
                                                  color="error"
                                                  onClick={() => handleRemoveStackedSeries(index)}
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
                                  <Alert severity="info" sx={{ backgroundColor: '#2196f320' }}>
                                    <Typography sx={{ color: 'white' }}>
                                      No data series configured yet. Add a series below.
                                    </Typography>
                                  </Alert>
                                )}
                              </Box>

                              {/* Add New Series */}
                              <FormControl fullWidth margin="normal">
                                <InputLabel sx={{ color: 'white' }}>Add Data Series</InputLabel>
                                <Select
                                  value=""
                                  onChange={(e) => {
                                    const field = e.target.value as string;
                                    const fieldLabel =
                                      parsedResponse?.header.find((h: any) => h.fieldName === field)
                                        ?.label || field;

                                    const colors = [
                                      '#84BD00',
                                      '#FFC846',
                                      '#8979FF',
                                      '#E1553F',
                                      '#5899DA',
                                      '#4DD0E1',
                                      '#FF6F61',
                                    ];
                                    const newSeriesIndex = stackedSeries.length;

                                    const newSeries = {
                                      name: fieldLabel,
                                      dataKey: field,
                                      color: colors[newSeriesIndex % colors.length],
                                      type: 'line' as 'line' | 'bar' | 'area',
                                    };

                                    const updatedSeries = [...stackedSeries, newSeries];
                                    setStackedSeries(updatedSeries);

                                    setFieldMappings((prev) => {
                                      const config = JSON.parse(
                                        JSON.stringify(prev[selectedWidget])
                                      );

                                      // Initialize yAxis.fields array if it doesn't exist
                                      if (!config.chartConfig) config.chartConfig = {};
                                      if (!config.chartConfig.yAxis) config.chartConfig.yAxis = {};
                                      if (!config.chartConfig.yAxis.fields)
                                        config.chartConfig.yAxis.fields = [];

                                      // Add the field to yAxis.fields
                                      config.chartConfig.yAxis.fields = [
                                        ...config.chartConfig.yAxis.fields,
                                        field,
                                      ];
                                      config.chartConfig.yAxis.type = 'KF';

                                      // Update seriesConfig
                                      if (!config.seriesConfig)
                                        config.seriesConfig = { series: [] };
                                      config.seriesConfig.series = updatedSeries;

                                      return { ...prev, [selectedWidget]: config };
                                    });
                                  }}
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
                                  Select key figure fields to include as data series in the chart
                                </FormHelperText>
                              </FormControl>
                            </Box>
                          )}
                        </Box>
                      </TabPanel>
                    )}

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
                                  <InputLabel sx={{ color: 'white' }}>Add Column</InputLabel>
                                  <Select
                                    label="Add Column"
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
                                Configured Columns
                              </Typography>

                              {tableColumns.length === 0 ? (
                                <Typography sx={{ color: 'white' }}>
                                  No columns added yet
                                </Typography>
                              ) : (
                                <Box>
                                  {tableColumns.map((column, idx) => (
                                    <Accordion
                                      key={idx}
                                      sx={{
                                        backgroundColor: '#ffffff20',
                                        color: 'white',
                                        mb: 1,
                                        '&:before': { display: 'none' },
                                      }}
                                    >
                                      <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                                      >
                                        <Box
                                          display="flex"
                                          justifyContent="space-between"
                                          alignItems="center"
                                          width="100%"
                                        >
                                          <Typography sx={{ color: 'white' }}>
                                            {column.header} ({column.field})
                                          </Typography>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleTableColumnRemove(idx);
                                            }}
                                            sx={{ color: 'white' }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </AccordionSummary>
                                      <AccordionDetails>
                                        <Box>
                                          <Typography
                                            variant="subtitle2"
                                            gutterBottom
                                            sx={{ color: 'white' }}
                                          >
                                            Column Formatting
                                          </Typography>

                                          {/* Get sample value for this column */}
                                          {(() => {
                                            let sampleValue = 1234567.89;

                                            // Try to get a real sample value from the data
                                            if (transformedData && tableColumns.length > 0) {
                                              try {
                                                const chaField = tableColumns[0].field;
                                                const chaValues = getCHAValues(chaField).filter(
                                                  (val) => val !== 'Overall Result'
                                                );

                                                if (
                                                  chaValues.length > 0 &&
                                                  column.field !== chaField
                                                ) {
                                                  const value = getKFValue(
                                                    chaField,
                                                    chaValues[0],
                                                    column.field
                                                  );
                                                  if (value && !isNaN(parseFloat(value))) {
                                                    sampleValue = parseFloat(value);
                                                  }
                                                }
                                              } catch (e) {
                                                console.log('Could not get sample value:', e);
                                              }
                                            }

                                            return (
                                              <FormatConfigUI
                                                value={column.formatConfig}
                                                onChange={(config) =>
                                                  handleTableColumnFormatChange(idx, config)
                                                }
                                                sampleValue={sampleValue}
                                                label={`Format for ${column.header}`}
                                              />
                                            );
                                          })()}
                                        </Box>
                                      </AccordionDetails>
                                    </Accordion>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}
                      </TabPanel>
                    )}

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
                    <TabPanel value={tabValue} index={tabIndices.typography!}>
                      <TypographyConfigUI
                        value={widgetConfigurations[selectedWidget]?.typography}
                        onChange={handleTypographyChange}
                        elementTypes={getTypographyElementsForWidget(getSelectedWidgetType() || '')}
                      />
                    </TabPanel>
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
                        chaValue: '',
                        kfField: '',
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
                          kfField: '',
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
      {/* Role Delete Confirmation Dialog */}
      <Dialog
        open={deleteRoleConfirmDialog.open}
        onClose={handleCancelRoleDelete}
        PaperProps={{
          sx: {
            background: 'linear-gradient(to bottom, #00214E, #0164B0)',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <Box display="flex" alignItems="center">
            <SecurityIcon sx={{ mr: 1, color: '#ff5252' }} />
            Confirm Role Deletion
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2, backgroundColor: '#ff980020' }}>
            <Typography sx={{ color: 'white' }}>
              {(() => {
                if (
                  selectedWidget &&
                  deleteRoleConfirmDialog.roleIndex !== null &&
                  widgetConfigurations[selectedWidget]?.roles
                ) {
                  const role =
                    widgetConfigurations[selectedWidget].roles[deleteRoleConfirmDialog.roleIndex];
                  const isExistingRole = typeof role === 'object' && role.RoleId;

                  if (isExistingRole) {
                    return 'This role is already saved. It will be marked as deleted and removed from the widget authorization.';
                  }
                  return 'This role has not been saved yet. It will be permanently removed from the widget.';
                }
                return 'This role will be removed from the widget authorization.';
              })()}
            </Typography>
          </Alert>
          <Typography sx={{ color: 'white' }}>
            Are you sure you want to remove the role{' '}
            <strong>{deleteRoleConfirmDialog.roleName}</strong> from this widget?
          </Typography>
          {selectedWidget && (
            <Box mt={2} p={2} sx={{ backgroundColor: '#ffffff10', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: 'white' }}>
                <strong>Note:</strong> After removing this role, users with this role will{' '}
                {(widgetConfigurations[selectedWidget]?.roles || []).filter((r: any) => {
                  if (typeof r === 'object' && r.DelFlag === 'X') return false;
                  return true;
                }).length === 1
                  ? 'make the widget visible to all users (no role restrictions).'
                  : 'no longer have access to this widget.'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', p: 2 }}>
          <Button label="Cancel" onClick={handleCancelRoleDelete} outlined />
          <Button
            label="Remove Role"
            onClick={handleConfirmRoleDelete}
            severity="danger"
            icon={<DeleteIcon />}
          />
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MappingScreen;
