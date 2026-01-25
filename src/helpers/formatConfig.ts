export type ScaleType = 'none' | 'thousand' | 'million' | 'billion' | 'auto';
export type RoundingType = 'none' | 'ceil' | 'floor' | 'round';

export interface FormatConfig {
    scale?: ScaleType;
    decimals?: number;
    rounding?: RoundingType;
    prefix?: string;
    suffix?: string;
    showSign?: boolean; // Show +/- for positive/negative
    autoScale?: boolean; // Automatically determine scale (K/M/B) based on value size
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
        suffix: 'K',
        rounding: 'round',
    },
    'currency-k-with-suffix-M': {
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
    'number-k': {
        scale: 'thousand',
        decimals: 1,
        suffix: 'K',
        rounding: 'round',
    },
    'number-m': {
        scale: 'million',
        decimals: 1,
        suffix: 'M',
        rounding: 'round',
    },
    'number-b': {
        scale: 'billion',
        decimals: 1,
        suffix: 'B',
        rounding: 'round',
    },
    'number-auto': {
        scale: 'auto',
        decimals: 1,
        rounding: 'round',
        autoScale: true,
    },
    'currency-auto': {
        scale: 'auto',
        decimals: 1,
        prefix: '$',
        rounding: 'round',
        autoScale: true,
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

    const decimals = config.decimals ?? 0;
    const prefix = config.prefix || '';
    const isCurrency = prefix === '$';

    // Handle auto-scaling (similar to MultiChart formatNumber)
    if (config.autoScale || config.scale === 'auto') {
        const absValue = Math.abs(numValue);

        if (absValue >= 1_000_000_000) {
            // Billion
            let scaledValue = numValue / 1_000_000_000;
            switch (config.rounding) {
                case 'ceil':
                    scaledValue = Math.ceil(scaledValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
                    break;
                case 'floor':
                    scaledValue = Math.floor(scaledValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
                    break;
                case 'round':
                default:
                    scaledValue = Math.round(scaledValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
                    break;
            }
            const formatted = scaledValue.toFixed(decimals);
            const suffix = 'B';
            return `${prefix}${formatted}${suffix}`;
        } else if (absValue >= 1_000_000) {
            // Million
            let scaledValue = numValue / 1_000_000;
            switch (config.rounding) {
                case 'ceil':
                    scaledValue = Math.ceil(scaledValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
                    break;
                case 'floor':
                    scaledValue = Math.floor(scaledValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
                    break;
                case 'round':
                default:
                    scaledValue = Math.round(scaledValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
                    break;
            }
            const formatted = scaledValue.toFixed(decimals);
            // Currency uses MM, non-currency uses M
            const suffix = isCurrency ? 'MM' : 'M';
            return `${prefix}${formatted}${suffix}`;
        } else if (absValue >= 1_000) {
            // Thousand
            let scaledValue = numValue / 1_000;
            switch (config.rounding) {
                case 'ceil':
                    scaledValue = Math.ceil(scaledValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
                    break;
                case 'floor':
                    scaledValue = Math.floor(scaledValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
                    break;
                case 'round':
                default:
                    scaledValue = Math.round(scaledValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
                    break;
            }
            const formatted = scaledValue.toFixed(decimals);
            // Currency uses M, non-currency uses K
            const suffix = isCurrency ? 'M' : 'K';
            return `${prefix}${formatted}${suffix}`;
        } else {
            // No scaling needed
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
            let formatted = numValue.toFixed(decimals);
            // Add thousand separators
            const parts = formatted.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            formatted = parts.join('.');

            if (config.showSign && numValue > 0) {
                formatted = '+' + formatted;
            }

            return `${prefix}${formatted}${config.suffix || ''}`;
        }
    }

    // Apply scaling (non-auto mode)
    const scaleDivisors: Record<ScaleType, number> = {
        none: 1,
        thousand: 1000,
        million: 1000000,
        billion: 1000000000,
        auto: 1, // Should not reach here if auto is handled above
    };

    const scale = config.scale || 'none';
    numValue = numValue / scaleDivisors[scale];

    // Apply rounding
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
        auto: 1, // Should not reach here if auto is handled above, but needed for type safety
    };

    const scale = config.scale || 'none';
    numValue = numValue * scaleDivisors[scale];

    return numValue;
}
