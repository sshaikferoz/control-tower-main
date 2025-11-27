// /helpers/typographyHelper.ts
import type { CSSProperties } from 'react';
import { TypographyConfig, WidgetTypographyConfig } from '@/types/helpers';

/**
 * Apply typography styles to an element
 * @param elementType - The type of element (title, value, label, etc.)
 * @param typographyConfig - The typography configuration object
 * @returns CSS properties object
 */
export function applyTypographyStyles(
  elementType: string,
  typographyConfig?: WidgetTypographyConfig
): CSSProperties {
  if (!typographyConfig || !typographyConfig[elementType]) {
    return {};
  }

  const config = typographyConfig[elementType] as TypographyConfig;

  return {
    fontFamily: config.fontFamily,
    fontSize: config.fontSize,
    fontWeight: config.fontWeight,
    color: config.color,
    textAlign: config.textAlign,
    textTransform: config.textTransform,
    letterSpacing: config.letterSpacing,
    lineHeight: config.lineHeight,
  };
}

/**
 * Get clean typography styles (removes undefined values)
 * @param elementType - The type of element
 * @param typographyConfig - The typography configuration object
 * @returns Cleaned CSS properties object
 */
export function getCleanTypographyStyles(
  elementType: string,
  typographyConfig?: WidgetTypographyConfig
): CSSProperties {
  const styles = applyTypographyStyles(elementType, typographyConfig);

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(styles).filter(([_, value]) => value !== undefined)
  ) as CSSProperties;
}

/**
 * Merge typography styles with existing styles
 * @param existingStyles - Existing CSS properties
 * @param elementType - The type of element
 * @param typographyConfig - The typography configuration object
 * @returns Merged CSS properties
 */
export function mergeTypographyStyles(
  existingStyles: CSSProperties,
  elementType: string,
  typographyConfig?: WidgetTypographyConfig
): CSSProperties {
  const typographyStyles = getCleanTypographyStyles(elementType, typographyConfig);
  return { ...existingStyles, ...typographyStyles };
}

/**
 * Get element types for a specific widget
 * @param widgetType - The type of widget
 * @returns Array of element types that can be configured
 */
export function getTypographyElementsForWidget(widgetType: string): string[] {
  const widgetElementMap: Record<string, string[]> = {
    'one-metric': ['name', 'value'],
    'one-metric-date': ['name', 'value', 'date'],
    'two-metrics': ['metric1', 'value1', 'metric2', 'value2'],
    'two-metrics-linechart': ['title', 'value', 'label'],
    'two-metrics-piechart': ['label', 'value'],
    'one-metric-table': ['title', 'header', 'cell'],
    'bar-chart': ['title', 'value', 'label'],
    'stacked-bar-chart': ['title', 'value', 'label', 'legend'],
    'orders-line-chart': ['title', 'value', 'label'],
    'dual-line-chart': ['title', 'label', 'legend'],
    'pie-chart-total': ['title', 'value', 'label'],
    'quadrant-metrics': ['title', 'value'],
    'pie-chart': ['title', 'label', 'value'],
    'column-chart': ['title', 'value', 'label', 'legend'],
    'prediction-chart': ['title', 'label', 'legend'],
    'radar-chart': ['title', 'label', 'legend'],
    announcement: ['title', 'description'],
    'multi-chart': ['title', 'value', 'legend'],
  };

  return widgetElementMap[widgetType] || ['title', 'value', 'label'];
}
