/**
 * Number formatting utilities for charts and widgets
 * 
 * This module provides reusable number formatting functions that handle
 * currency and non-currency formatting with automatic scaling (K/M/B).
 */

export type ValueFormat = 'currency' | 'non-currency';

export interface FormatNumberOptions {
    /**
     * Format type: 'currency' or 'non-currency'
     * - currency: Uses $ prefix, M/MM/B suffixes
     * - non-currency: Uses K/M/B suffixes
     */
    format?: ValueFormat;

    /**
     * Number of decimal places for scaled values (K/M/B)
     * @default 1
     */
    scaledDecimals?: number;

    /**
     * Number of decimal places for non-scaled values
     * If undefined:
     *   - currency: preserves original number format (no forced decimals)
     *   - non-currency: uses 2 decimals
     */
    decimals?: number;

    /**
     * Number of decimal places for value formatting (alias for decimals)
     * This is the preferred parameter name for widget configurations.
     * If both decimalPrecision and decimals are provided, decimalPrecision takes precedence.
     * @default 2 (when format is 'non-currency'), preserves format (when format is 'currency')
     */
    decimalPrecision?: number;
}

/**
 * Format a number with automatic scaling (K/M/B) based on value size
 * 
 * @param num - The number to format
 * @param options - Formatting options
 * @returns Formatted string (e.g., "$1.5M", "2.3K", "1.2B")
 * 
 * @example
 * formatNumber(1500000, { format: 'currency' }) // "$1.5MM"
 * formatNumber(1500000, { format: 'non-currency' }) // "1.5M"
 * formatNumber(500, { format: 'currency' }) // "$500"
 * formatNumber(500, { format: 'non-currency' }) // "500.00"
 */
export function formatNumber(num: number, options: FormatNumberOptions = {}): string {
    const {
        format = 'non-currency',
        scaledDecimals = 1,
        decimals,
        decimalPrecision,
    } = options;

    // Use decimalPrecision if provided, otherwise fall back to decimals
    // This allows components to pass decimalPrecision from config directly
    const effectiveDecimals = decimalPrecision !== undefined ? decimalPrecision : decimals;

    // Handle invalid numbers
    if (isNaN(num) || !isFinite(num)) {
        return String(num);
    }

    const absNum = Math.abs(num);

    if (format === 'currency') {
        // Currency format: Thousand → M, Million → MM, Billion → B
        if (absNum >= 1_000_000_000) {
            return `$${(num / 1_000_000_000).toFixed(scaledDecimals)}B`;
        }
        if (absNum >= 1_000_000) {
            return `$${(num / 1_000_000).toFixed(scaledDecimals)}MM`;
        }
        if (absNum >= 1_000) {
            return `$${(num / 1_000).toFixed(scaledDecimals)}M`;
        }
        // For values < 1000, use effectiveDecimals if provided, otherwise preserve format
        if (effectiveDecimals !== undefined) {
            return `$${num.toFixed(effectiveDecimals)}`;
        }
        return `$${num}`;
    } else {
        // Non-currency format: Thousand → K, Million → M, Billion → B
        if (absNum >= 1_000_000_000) {
            return `${(num / 1_000_000_000).toFixed(scaledDecimals)}B`;
        }
        if (absNum >= 1_000_000) {
            return `${(num / 1_000_000).toFixed(scaledDecimals)}M`;
        }
        if (absNum >= 1_000) {
            return `${(num / 1_000).toFixed(scaledDecimals)}K`;
        }
        // For values < 1000, use effectiveDecimals if provided, otherwise default to 2
        const defaultDecimals = effectiveDecimals !== undefined ? effectiveDecimals : 2;
        return num.toFixed(defaultDecimals);
    }
}

/**
 * Format a number with a simple format type (backward compatibility)
 * 
 * @param num - The number to format
 * @param formatType - 'currency' or 'non-currency'
 * @returns Formatted string
 * 
 * @example
 * formatNumberSimple(1500000, 'currency') // "$1.5MM"
 * formatNumberSimple(1500000, 'non-currency') // "1.5M"
 */
export function formatNumberSimple(num: number, formatType: ValueFormat = 'non-currency'): string {
    return formatNumber(num, { format: formatType });
}
