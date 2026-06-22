import type { DimensionFormat } from '@/widgets/chart/multi-chart/ChartConfig.types';

/**
 * Formatting for X-Series dimension values (characteristic fields).
 *
 * BEx dimension values arrive in a variety of date encodings (YYYYMMDD,
 * YYYY-MM-DD, YYYYMM, ISO strings, …). This helper parses the common ones and
 * renders them with a simple token-based pattern. Anything that does not parse
 * as a date is returned unchanged so non-date dimensions are unaffected.
 */

const MONTHS_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const MONTHS_LONG = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n: number) => String(n).padStart(2, '0');

/** Supported date patterns offered in the configuration UI. */
export const DIMENSION_DATE_PATTERNS: string[] = [
    'DD.MM.YYYY',
    'DD/MM/YYYY',
    'MM/DD/YYYY',
    'YYYY-MM-DD',
    'DD MMM YYYY',
    'MMM YYYY',
    'MMMM YYYY',
    'MMM DD, YYYY',
];

/** Parse a raw dimension value into a Date, or null when it is not a date. */
const parseDimensionDate = (raw: unknown): Date | null => {
    if (raw === null || raw === undefined) return null;
    const str = String(raw).trim();
    if (!str) return null;

    // YYYYMMDD (BEx/SAP internal date)
    let m = str.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (m) {
        const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        return isNaN(d.getTime()) ? null : d;
    }
    // YYYY-MM-DD or YYYY/MM/DD (optionally followed by time)
    m = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m) {
        const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        return isNaN(d.getTime()) ? null : d;
    }
    // YYYYMM (calendar year-month)
    m = str.match(/^(\d{4})(\d{2})$/);
    if (m) {
        const month = Number(m[2]);
        if (month >= 1 && month <= 12) {
            const d = new Date(Number(m[1]), month - 1, 1);
            return isNaN(d.getTime()) ? null : d;
        }
    }
    // Last resort: native parsing (ISO timestamps, etc.)
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
};

/** Render a Date using a token pattern (YYYY, YY, MMMM, MMM, MM, DD). */
const formatWithPattern = (date: Date, pattern: string): string => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based
    const day = date.getDate();

    // Longer tokens are replaced first so they are not partially consumed.
    return pattern
        .replace(/YYYY/g, String(year))
        .replace(/YY/g, String(year).slice(-2))
        .replace(/MMMM/g, MONTHS_LONG[month])
        .replace(/MMM/g, MONTHS_SHORT[month])
        .replace(/MM/g, pad(month + 1))
        .replace(/DD/g, pad(day));
};

/**
 * Format a dimension value for display. Returns the raw value (stringified)
 * when there is no format configured or when the value cannot be parsed as a
 * date.
 */
export const formatDimensionValue = (
    raw: unknown,
    format?: DimensionFormat
): string => {
    const fallback =
        raw === null || raw === undefined || raw === '' ? '-' : String(raw);

    if (!format || format.type !== 'date' || !format.pattern) {
        return fallback;
    }

    const date = parseDimensionDate(raw);
    if (!date) return fallback;

    return formatWithPattern(date, format.pattern);
};
