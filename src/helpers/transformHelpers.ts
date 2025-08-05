import {
  FormTransformHeaders,
  FormTransformInputType,
  TransformedData,
  WidgetFieldMapping,
  WidgetMappingConfig,
  ObjectPath,
} from './types';

// Transform the raw response data into a more usable structure
export function transformFormMetadata(data: FormTransformInputType): TransformedData {
  const chaHeader = data.header.find((h) => h.type === 'CHA');
  if (!chaHeader) throw new Error('No CHA type header found');

  const chaKey = chaHeader.fieldName;

  // Create a nested structure where the CHA values are the keys
  const FormStructure: Record<string, any> = { [chaKey]: {} };
  data.chartData.forEach((row) => {
    const key = row[chaKey];
    if (key !== undefined) {
      FormStructure[chaKey][key] = Object.fromEntries(
        Object.entries(row).filter(([k]) => k !== chaKey)
      );
    }
  });

  // Organize metadata for easy access
  const FormMetadata: Record<string, FormTransformHeaders> = {};
  data.header.forEach((header) => {
    FormMetadata[header.fieldName] = {
      type: header.type,
      label: header.label,
      fieldName: header.fieldName,
      axisType: header.axisType, // For charting purposes
      displayStyle: header.displayStyle,
    };
  });

  return { FormStructure, FormMetadata };
}

// Get value from an object using a path string (e.g., "data.chart_data.0.value")
export function getValueByPath(obj: any, path: string): any {
  if (!path) return obj;
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    // Handle array indexing
    if (!isNaN(Number(part)) && Array.isArray(current)) {
      current = current[Number(part)];
    } else {
      current = current[part];
    }
  }

  return current;
}

// Set value in an object using a path string
export function setValueByPath(obj: any, path: string, value: any): any {
  if (!path) return value;

  const result = { ...obj };
  const parts = path.split('.');
  let current = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    // Create path if it doesn't exist
    if (!current[part]) {
      // If next part is a number, create an array, otherwise an object
      const nextIsNumber = !isNaN(Number(parts[i + 1]));
      current[part] = nextIsNumber ? [] : {};
    }

    current = current[part];
  }

  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;

  return result;
}

// Process field mappings to generate actual widget props
export function processWidgetMappings(
  widgetConfig: WidgetMappingConfig,
  reportData: TransformedData,
  transformedData: TransformedData
): Record<string, any> {
  // Result object that will hold all processed values
  const result: Record<string, any> = {};

  // Process each field
  Object.entries(widgetConfig.fields).forEach(([fieldName, fieldMapping]) => {
    if (fieldMapping.inputType === 'manual' && fieldMapping.manualValue !== undefined) {
      // Use manual value directly
      result[fieldName] = fieldMapping.manualValue;
    } else if (fieldMapping.inputType === 'mapped' && fieldMapping.mappedConfig) {
      // Process mapped field
      const { chaField, chaValue, kfField } = fieldMapping.mappedConfig;

      // Access data using the path
      if (
        reportData.FormStructure[chaField] &&
        reportData.FormStructure[chaField][chaValue] &&
        reportData.FormStructure[chaField][chaValue][kfField] !== undefined
      ) {
        result[fieldName] = reportData.FormStructure[chaField][chaValue][kfField];
      }
    }
  });

  // Special handling for charts
  if (widgetConfig.mappingType === 'chart' && widgetConfig.chartConfig) {
    // Process chart data - this will depend on the specific chart structure
    // Here we're creating a sample chart data structure
    const { xAxis, yAxis } = widgetConfig.chartConfig;

    if (xAxis.type === 'CHA' && yAxis.type === 'KF') {
      // Find CHA values
      const chaField = xAxis.field;
      const chaValues = Object.keys(reportData.FormStructure[chaField] || {});

      // Generate chart data array
      const chartData = chaValues.map((chaValue) => {
        const kfValue = reportData.FormStructure[chaField][chaValue][yAxis.field];
        return {
          x: chaValue, // X-axis label (CHA value)
          y: kfValue, // Y-axis value (KF value)
          [yAxis.field]: kfValue, // Include the original field name
        };
      });

      // Set chart data in the result
      result.data = {
        chart_data: chartData,
        chart_yaxis: yAxis.field,
        // Include other chart metadata as needed
        // metric_data: {
        //   metric_label: reportData.FormMetadata[yAxis.field]?.label || yAxis.field,
        //   // Other metrics can be calculated or fetched
        //   metric_value: '',
        //   metric_variance: '',
        // },
        widget_name: reportData.FormMetadata[yAxis.field]?.label || 'Chart',
      };
    }
  }

  // Special handling for comparison charts
  if (widgetConfig.mappingType === 'comparison-chart' && widgetConfig.comparisonChartConfig) {
    const { xAxis, yAxes } = widgetConfig.comparisonChartConfig;

    if (xAxis.type === 'CHA' && yAxes.length > 0) {
      // Generate multi-series comparison chart data
      const chartData = generateComparisonChartData(reportData, xAxis.field, yAxes);

      // Prepare series data with values and colors
      const series = yAxes.map((axis) => {
        // Get the total value from "Overall Result" for this KF if it exists
        const totalValue = reportData.FormStructure[xAxis.field]?.['Overall Result']?.[axis.field];
        const formattedValue = formatValue(totalValue, 'currency');

        return {
          name: axis.field,
          value: formattedValue,
          color: '#fff',
        };
      });

      // Set the result data
      result.data = chartData;
      result.series = series;
      result.title =
        widgetConfig.fields.title?.manualValue ||
        reportData.FormMetadata.description ||
        'Chart Comparison';
      result.subtitle = widgetConfig.fields.subtitle?.manualValue || 'Report Data';
      result.maxValue = widgetConfig.fields.maxValue?.manualValue;
    }
  }

  // Special handling for tables
  if (widgetConfig.mappingType === 'table' && widgetConfig.tableConfig) {
    // Process table data
    const { columns } = widgetConfig.tableConfig;

    // For tables, we often use the entire dataset with specific columns
    // This is just an example approach - actual implementation might differ
    // based on your specific table component needs
    const tableData: any[] = [];

    // Find the CHA field (assuming first column is from CHA)
    const chaField = columns[0].field;
    const chaValues = Object.keys(reportData.FormStructure[chaField] || {});

    // For each CHA value, create a row
    chaValues.forEach((chaValue) => {
      const row: Record<string, any> = {};

      // For each column, get the corresponding value
      columns.forEach((column) => {
        // If it's the CHA column
        if (column.field === chaField) {
          row[column.header] = chaValue;
        }
        // Otherwise it's a KF column
        else {
          row[column.header] = reportData.FormStructure[chaField][chaValue][column.field];
        }
      });

      tableData.push(row);
    });

    result.data = tableData;

    // Calculate total amount if needed
    if (columns.some((col) => col.field.includes('VALUE'))) {
      // Example: Sum all values for a specific KF field
      const kfField = columns.find((col) => col.field.includes('VALUE'))?.field;
      if (kfField) {
        let total = 0;
        chaValues.forEach((chaValue) => {
          const value = reportData.FormStructure[chaField][chaValue][kfField];
          if (!isNaN(Number(value))) {
            total += Number(value);
          }
        });
        result.totalAmount = `${total.toLocaleString()}`;
      }
    }
  }

  return result;
}

// Generate chart data from FormStructure based on mapping
export function generateChartData(
  formData: TransformedData,
  chaField: string,
  kfField: string,
  excludeValues: string[] = []
): any[] {
  const chartData: any[] = [];

  // Ensure the required fields exist
  if (!formData.FormStructure[chaField]) {
    return [];
  }

  // For each CHA value, create a data point
  Object.entries(formData.FormStructure[chaField]).forEach(
    ([chaValue, kfValues]: [string, any]) => {
      // Skip excluded values (like "Overall Result")
      if (excludeValues.includes(chaValue)) {
        return;
      }

      // Get the KF value for this CHA value
      const value = kfValues[kfField];

      // Only add if the value exists
      if (value !== undefined && value !== '') {
        chartData.push({
          date: chaValue, // For line charts, assuming CHA values are dates
          [kfField]: Number(value),
          label: chaValue, // For pie charts
          value: Number(value), // For pie charts
          // Add other needed properties here
        });
      }
    }
  );

  return chartData;
}

// Generate comparison chart data with multiple series
export function generateComparisonChartData(
  formData: TransformedData,
  chaField: string,
  yAxes: Array<{ field: string; type: string; color: string }>
): any[] {
  const chartData: any[] = [];

  // Ensure the required fields exist
  if (!formData.FormStructure[chaField]) {
    return [];
  }

  // Get all CHA values except "Overall Result"
  const chaValues = Object.keys(formData.FormStructure[chaField]).filter(
    (val) => val !== 'Overall Result'
  );

  // For each CHA value, create a data point with multiple series
  chaValues.forEach((chaValue) => {
    const dataPoint: Record<string, any> = {
      period: chaValue, // X-axis label
    };

    // Add each y-axis field as a separate series in the data point
    yAxes.forEach((axis) => {
      const value = formData.FormStructure[chaField][chaValue][axis.field];
      dataPoint[axis.field] = value ? parseFloat(value) : 0;
    });

    chartData.push(dataPoint);
  });

  return chartData;
}

// Format values for display (add currency symbols, percentages, etc.)
export function formatValue(value: any, type: string = 'number'): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  switch (type) {
    case 'currency':
      const num = Number(value);
      if (isNaN(num)) return String(value);

      if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(1)}K`;
      } else {
        return `$${num.toLocaleString()}`;
      }
    case 'percentage':
      return `${Number(value).toFixed(2)}%`;
    case 'number':
      return Number(value).toLocaleString();
    default:
      return String(value);
  }
}

// Generate a unique color for chart elements
export function generateChartColors(index: number): string {
  const colors = [
    '#84BD00',
    '#E1553F',
    '#2D7FF9',
    '#FFA500',
    '#8E44AD',
    '#16A085',
    '#DC143C',
    '#4682B4',
  ];
  return colors[index % colors.length];
}

/**
 * Generate bar chart data from transformed form data
 *
 * @param formData Transformed data from API
 * @param chaField Character field (category)
 * @param kfField Key figure field (value)
 * @returns Formatted data for bar chart
 */
export function generateBarChartData(formData: TransformedData, chaField: string, kfField: string) {
  if (!formData.FormStructure[chaField]) {
    return [];
  }

  // Generate bar data
  const data = Object.entries(formData.FormStructure[chaField])
    .filter(([chaValue]) => chaValue !== 'Overall Result')
    .map(([chaValue, values]: [string, any], index) => {
      const value = values[kfField] ? Number(values[kfField]) : 0;

      // Assign different colors based on index
      const colors = ['#83bd01', '#FFC846', '#E1553F', '#5899DA', '#8979FF'];

      return {
        name: chaValue,
        value: value,
        fill: colors[index % colors.length],
      };
    });

  // Get title from metadata if available
  const title = formData.FormMetadata[kfField]?.label || 'Chart';

  // Calculate variance (difference between first and last values if multiple)
  let variance = '+0.00%';
  if (data.length > 1) {
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    if (firstValue > 0) {
      const diff = ((lastValue - firstValue) / firstValue) * 100;
      variance = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%`;
    }
  }

  return {
    data,
    title,
    variance,
  };
}

/**
 * Generate stacked bar chart data from transformed form data
 *
 * @param formData Transformed data from API
 * @param chaField Character field (for X-axis)
 * @param kfFields Array of key figure fields (for series)
 * @returns Formatted data for stacked bar chart
 */
export function generateStackedBarChartData(
  formData: TransformedData,
  chaField: string,
  kfFields: string[]
) {
  if (!formData.FormStructure[chaField]) {
    return { data: [], series: [], title: 'No Data' };
  }

  // Get X-axis values (excluding "Overall Result")
  const xValues = Object.keys(formData.FormStructure[chaField]).filter(
    (key) => key !== 'Overall Result'
  );

  // Create data array with each X value and corresponding Y values
  const data = xValues.map((xValue) => {
    const entry: Record<string, any> = { name: xValue };

    // Add each Y series value
    kfFields.forEach((kfField) => {
      const fieldName = formData.FormMetadata[kfField]?.label || kfField;
      entry[fieldName] = Number(formData.FormStructure[chaField][xValue][kfField] || 0);
    });

    return entry;
  });

  // Create series configuration
  const series = kfFields.map((kfField, index) => {
    const colors = ['#84BD00', '#FFC846', '#8979FF', '#E1553F', '#5899DA'];
    const name = formData.FormMetadata[kfField]?.label || kfField;

    return {
      name,
      dataKey: name,
      color: colors[index % colors.length],
    };
  });

  // Get total value from "Overall Result" if available
  let totalValue = '';
  if (formData.FormStructure[chaField]['Overall Result']) {
    const total = kfFields.reduce((sum, kfField) => {
      return sum + Number(formData.FormStructure[chaField]['Overall Result'][kfField] || 0);
    }, 0);
    totalValue = `${total.toLocaleString()}`;
  }

  // Get title from metadata
  const title = formData.FormMetadata[chaField]?.label || 'Stacked Chart';

  return {
    data,
    series,
    title,
    totalValue,
  };
}

/**
 * Generate data for line charts
 *
 * @param formData Transformed data from API
 * @param chaField Character field (for X-axis)
 * @param kfField Key figure field (for Y-axis)
 * @returns Formatted data for line chart
 */
export function generateLineChartData(
  formData: TransformedData,
  chaField: string,
  kfField: string
) {
  if (!formData.FormStructure[chaField]) {
    return { data: [], title: 'No Data', totalValue: '$0' };
  }

  // Generate line data
  const data = Object.entries(formData.FormStructure[chaField])
    .filter(([chaValue]) => chaValue !== 'Overall Result')
    .map(([chaValue, values]: [string, any]) => {
      return {
        name: chaValue,
        value: Number(values[kfField] || 0),
      };
    });

  // Calculate total value
  let totalValue = '$0';
  if (formData.FormStructure[chaField]['Overall Result']) {
    const total = Number(formData.FormStructure[chaField]['Overall Result'][kfField] || 0);
    totalValue = `${total.toLocaleString()}`;
  }

  // Get title from metadata
  const title = formData.FormMetadata[kfField]?.label || 'Line Chart';

  return {
    data,
    title,
    totalValue,
  };
}

/**
 * Generate data for dual line charts
 *
 * @param formData Transformed data from API
 * @param chaField Character field (for X-axis)
 * @param kfFields Array of two key figure fields (for the two lines)
 * @returns Formatted data for dual line chart
 */
export function generateDualLineChartData(
  formData: TransformedData,
  chaField: string,
  kfFields: [string, string]
) {
  if (!formData.FormStructure[chaField] || kfFields.length < 2) {
    return { data: [], series: [], title: 'No Data' };
  }

  // Generate line data
  const data = Object.entries(formData.FormStructure[chaField])
    .filter(([chaValue]) => chaValue !== 'Overall Result')
    .map(([chaValue, values]: [string, any]) => {
      return {
        name: chaValue,
        line1: Number(values[kfFields[0]] || 0),
        line2: Number(values[kfFields[1]] || 0),
      };
    });

  // Create series configuration
  const series = [
    {
      name: formData.FormMetadata[kfFields[0]]?.label || kfFields[0],
      dataKey: 'line1',
      color: '#5899DA',
    },
    {
      name: formData.FormMetadata[kfFields[1]]?.label || kfFields[1],
      dataKey: 'line2',
      color: '#FFC846',
    },
  ];

  // Get title from metadata
  const title = `${formData.FormMetadata[kfFields[0]]?.label || kfFields[0]} vs ${formData.FormMetadata[kfFields[1]]?.label || kfFields[1]}`;

  return {
    data,
    series,
    title,
  };
}

/**
 * Generate data for pie chart with total
 *
 * @param formData Transformed data from API
 * @param chaField Character field (for segments)
 * @param kfField Key figure field (for values)
 * @returns Formatted data for pie chart
 */
export function generatePieChartWithTotalData(
  formData: TransformedData,
  chaField: string,
  kfField: string
) {
  if (!formData.FormStructure[chaField]) {
    return {
      data: [],
      title: 'No Data',
      totalValue: '$0',
      subValue: '$0',
      variance: '0%',
    };
  }

  // Generate pie data (exclude "Overall Result")
  const data = Object.entries(formData.FormStructure[chaField])
    .filter(([chaValue]) => chaValue !== 'Overall Result')
    .map(([chaValue, values]: [string, any], index) => {
      const value = Number(values[kfField] || 0);
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
  if (formData.FormStructure[chaField]['Overall Result']) {
    overallValue = Number(formData.FormStructure[chaField]['Overall Result'][kfField] || 0);
  }
  const subValue = `${overallValue.toLocaleString()}`;

  // Calculate variance
  let variance = '+0.00%';
  if (data.length > 0 && totalSum > 0) {
    const diff = ((overallValue - totalSum) / totalSum) * 100;
    variance = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%`;
  }

  // Get title from metadata
  const title = formData.FormMetadata[kfField]?.label || 'Pie Chart';

  return {
    data,
    title,
    totalValue,
    subValue,
    variance,
  };
}

/**
 * Generate data for quadrant metrics
 *
 * @param formData Transformed data from API
 * @param chaField Character field for categories
 * @param kfField Key figure field for values
 * @returns Formatted data for quadrant metrics
 */
export function generateQuadrantMetricsData(
  formData: TransformedData,
  chaField: string,
  kfFields: string[]
) {
  if (!formData.FormStructure[chaField] || kfFields.length < 4) {
    return { metrics: [] };
  }

  // Get specific chaValues (or use first 4 if not enough)
  const chaValues = Object.keys(formData.FormStructure[chaField])
    .filter((key) => key !== 'Overall Result')
    .slice(0, 4);

  // Define positions
  const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  // Create metrics
  const metrics = chaValues.map((chaValue, index) => {
    // Use correct kfField if available, otherwise use first one
    const kfField = kfFields[index] || kfFields[0];
    const value = formData.FormStructure[chaField][chaValue][kfField];

    return {
      title: chaValue,
      value: String(value || 0),
      position: positions[index] as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    };
  });

  // If we don't have enough metrics, fill in the rest
  while (metrics.length < 4) {
    metrics.push({
      title: 'No Data',
      value: '0',
      position: positions[metrics.length] as
        | 'top-left'
        | 'top-right'
        | 'bottom-left'
        | 'bottom-right',
    });
  }

  return { metrics };
}
