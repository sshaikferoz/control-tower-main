// Add this component to handle LoansAppTray configuration
// This should be added to the MappingScreen component

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import * as MUIIcons from '@mui/icons-material';

// Get all available MUI icons
const getAllMUIIcons = () => {
  return Object.keys(MUIIcons).filter(
    (key) =>
      key !== 'createSvgIcon' && key !== 'default' && typeof (MUIIcons as any)[key] === 'function'
  );
};

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
  fetchReportData: (reportNameParam?: string) => Promise<void>;
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

  // Initialize menu item configurations
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

    // Update widget configuration
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
    <Dialog open={iconDialogOpen} onClose={() => setIconDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Select Icon</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Search icons..."
          value={iconSearchQuery}
          onChange={(e) => setIconSearchQuery(e.target.value)}
          margin="normal"
          InputProps={{
            startAdornment: <SearchIcon />,
          }}
        />
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Grid container spacing={1}>
            {filteredIcons.slice(0, 100).map((iconName) => {
              const IconComponent = (MUIIcons as any)[iconName];
              return (
                <Grid item xs={3} sm={2} key={iconName}>
                  <Paper
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'primary.light' },
                    }}
                    onClick={() => handleIconSelect(iconName)}
                  >
                    <IconComponent sx={{ fontSize: 24 }} />
                    <Typography variant="caption" display="block">
                      {iconName}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
        LoansAppTray Configuration
      </Typography>

      {/* Menu Items Configuration */}
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
              {/* Label */}
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

              {/* Icon Selection */}
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography sx={{ color: 'white' }}>Icon:</Typography>
                  {item.iconName && (
                    <Chip
                      icon={React.createElement((MUIIcons as any)[item.iconName])}
                      label={item.iconName}
                      sx={{ bgcolor: '#ffffff20', color: 'white' }}
                    />
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedMenuItemForIcon(item.id);
                      setIconDialogOpen(true);
                    }}
                    sx={{ color: 'white', borderColor: 'white' }}
                  >
                    Select Icon
                  </Button>
                </Box>
              </Grid>

              {/* Count Configuration */}
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

                    {/* Individual Report Name */}
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

                                    // Update the count value with mapped data
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

      {/* Chart Data Configuration */}
      <Typography variant="subtitle1" gutterBottom sx={{ color: 'white', mt: 3 }}>
        Chart Data Configuration
      </Typography>

      <Paper elevation={2} sx={{ p: 2, backgroundColor: '#ffffff20', mb: 2 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel sx={{ color: 'white' }}>Chart Input Type</InputLabel>
          <Select
            value={fieldMappings[selectedWidget]?.chartDataConfig?.inputType || 'manual'}
            onChange={(e) => {
              setFieldMappings((prev: any) => ({
                ...prev,
                [selectedWidget]: {
                  ...prev[selectedWidget],
                  chartDataConfig: {
                    ...prev[selectedWidget]?.chartDataConfig,
                    inputType: e.target.value,
                  },
                },
              }));
            }}
            label="Chart Input Type"
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

        {fieldMappings[selectedWidget]?.chartDataConfig?.inputType === 'mapped' && (
          <Box mt={2}>
            {/* Chart Query Configuration */}
            <Alert severity="info" sx={{ mb: 2, backgroundColor: '#2196f320' }}>
              <Typography sx={{ color: 'white' }}>
                Configure the SAP BW report to fetch chart data.
              </Typography>
            </Alert>

            <TextField
              label="Chart Report Name"
              fullWidth
              margin="normal"
              value={fieldMappings[selectedWidget]?.chartDataConfig?.reportName || reportName}
              onChange={(e) => {
                setFieldMappings((prev: any) => ({
                  ...prev,
                  [selectedWidget]: {
                    ...prev[selectedWidget],
                    chartDataConfig: {
                      ...prev[selectedWidget]?.chartDataConfig,
                      reportName: e.target.value,
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
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'white' }}>X-Axis (Categories)</InputLabel>
                    <Select
                      value={
                        fieldMappings[selectedWidget]?.chartDataConfig?.chartConfig?.xAxis?.field ||
                        ''
                      }
                      onChange={(e) => {
                        setFieldMappings((prev: any) => ({
                          ...prev,
                          [selectedWidget]: {
                            ...prev[selectedWidget],
                            chartDataConfig: {
                              ...prev[selectedWidget]?.chartDataConfig,
                              chartConfig: {
                                ...prev[selectedWidget]?.chartDataConfig?.chartConfig,
                                xAxis: { field: e.target.value, type: 'CHA' },
                              },
                            },
                          },
                        }));
                      }}
                      label="X-Axis (Categories)"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '& .MuiSvgIcon-root': { color: 'white' },
                      }}
                    >
                      {getCHAFields().map((field: any) => (
                        <MenuItem key={field.fieldName} value={field.fieldName}>
                          {field.label} ({field.fieldName})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'white' }}>Y-Axis (Values)</InputLabel>
                    <Select
                      value={
                        fieldMappings[selectedWidget]?.chartDataConfig?.chartConfig?.yAxis?.field ||
                        ''
                      }
                      onChange={(e) => {
                        setFieldMappings((prev: any) => ({
                          ...prev,
                          [selectedWidget]: {
                            ...prev[selectedWidget],
                            chartDataConfig: {
                              ...prev[selectedWidget]?.chartDataConfig,
                              chartConfig: {
                                ...prev[selectedWidget]?.chartDataConfig?.chartConfig,
                                yAxis: { field: e.target.value, type: 'KF' },
                              },
                            },
                          },
                        }));
                      }}
                      label="Y-Axis (Values)"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '& .MuiSvgIcon-root': { color: 'white' },
                      }}
                    >
                      {getKFFields().map((field: any) => (
                        <MenuItem key={field.fieldName} value={field.fieldName}>
                          {field.label} ({field.fieldName})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Paper>

      {renderIconDialog()}
    </Box>
  );
};

export default LoansAppTrayConfig;
