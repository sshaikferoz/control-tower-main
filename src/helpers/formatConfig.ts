
export type ScaleType = 'none' | 'thousand' | 'million' | 'billion';
export type RoundingType = 'none' | 'ceil' | 'floor' | 'round';

export interface FormatConfig {
    scale?: ScaleType;
    decimals?: number;
    rounding?: RoundingType;
    prefix?: string;
    suffix?: string;
    showSign?: boolean; // Show +/- for positive/negative
}

// Default format configurations for common use cases
export const FORMAT_PRESETS: Record<string, FormatConfig> = {
    currency: {
        scale: 'none',
        decimals: 2,
        prefix: '$',
        rounding: 'round',
    },
    'currency-k': {
        scale: 'thousand',
        decimals: 1,
        prefix: '$',
        suffix: 'M',
        rounding: 'round',
    },
    'currency-m': {
        scale: 'million',
        decimals: 1,
        prefix: '$',
        suffix: 'MM',
        rounding: 'round',
    },
    'currency-b': {
        scale: 'billion',
        decimals: 2,
        prefix: '$',
        suffix: 'B',
        rounding: 'round',
    },
    percentage: {
        scale: 'none',
        decimals: 2,
        suffix: '%',
        rounding: 'round',
    },
    integer: {
        scale: 'none',
        decimals: 0,
        rounding: 'round',
    },
    decimal: {
        scale: 'none',
        decimals: 2,
        rounding: 'round',
    },
};

/**
 * Apply formatting to a numeric value based on format configuration
 */
export function applyValueFormat(value: any, config?: FormatConfig): string {
    // Handle null/undefined/empty
    if (value === null || value === undefined || value === '') {
        return '';
    }

    // Convert to number
    let numValue = typeof value === 'string' ? parseFloat(value) : Number(value);

    // Return original if not a valid number
    if (isNaN(numValue)) {
        return String(value);
    }

    // If no config, return the number as-is with basic formatting
    if (!config) {
        return numValue.toLocaleString();
    }

    // Apply scaling
    const scaleDivisors: Record<ScaleType, number> = {
        none: 1,
        thousand: 1000,
        million: 1000000,
        billion: 1000000000,
    };

    const scale = config.scale || 'none';
    numValue = numValue / scaleDivisors[scale];

    // Apply rounding
    const decimals = config.decimals ?? 0;
    switch (config.rounding) {
        case 'ceil':
            numValue = Math.ceil(numValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
            break;
        case 'floor':
            numValue = Math.floor(numValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
            break;
        case 'round':
        default:
            numValue = Math.round(numValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
            break;
    }

    // Format the number with decimals
    let formatted = numValue.toFixed(decimals);

    // Add thousand separators
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formatted = parts.join('.');

    // Add sign if configured
    if (config.showSign && numValue > 0) {
        formatted = '+' + formatted;
    }

    // Add prefix and suffix
    const prefix = config.prefix || '';
    const suffix = config.suffix || '';

    return `${prefix}${formatted}${suffix}`;
}

/**
 * Parse a formatted value back to a number (useful for editing)
 */
export function parseFormattedValue(formatted: string, config?: FormatConfig): number | null {
    if (!formatted || !config) return null;

    // Remove prefix and suffix
    let cleaned = formatted;
    if (config.prefix) {
        cleaned = cleaned.replace(config.prefix, '');
    }
    if (config.suffix) {
        cleaned = cleaned.replace(config.suffix, '');
    }

    // Remove commas and signs
    cleaned = cleaned.replace(/,/g, '').replace(/^\+/, '');

    // Parse to number
    let numValue = parseFloat(cleaned);

    if (isNaN(numValue)) return null;

    // Reverse scaling
    const scaleDivisors: Record<ScaleType, number> = {
        none: 1,
        thousand: 1000,
        million: 1000000,
        billion: 1000000000,
    };

    const scale = config.scale || 'none';
    numValue = numValue * scaleDivisors[scale];

    return numValue;
}
