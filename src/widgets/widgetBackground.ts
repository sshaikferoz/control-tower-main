import type { CSSProperties } from 'react';

/**
 * Shared widget background helper.
 *
 * Widgets that expose a configurable `backgroundColor` (set via the
 * Background tab in the widget configuration panel) render a vertical
 * gradient from the picked color to a 50%-opacity (`+80`) version of it.
 *
 * Defaults used across the dashboard widgets when no color is configured.
 */
export const WIDGET_DEFAULT_BASE_COLOR = '#00214E';
export const WIDGET_DEFAULT_LIGHTER_COLOR = '#0164B0';

interface WidgetBackgroundOptions {
    /** When true, render a transparent background (overrides the color). */
    transparent?: boolean;
}

/**
 * Build the inline background style for a widget container.
 *
 * - `transparent` → transparent background.
 * - a `backgroundColor` → `linear-gradient(base → base+'80')`.
 * - neither → `undefined`, so the caller keeps its own default styling.
 */
export const getWidgetBackgroundStyle = (
    backgroundColor?: string,
    options?: WidgetBackgroundOptions
): CSSProperties | undefined => {
    if (options?.transparent) {
        return { backgroundColor: 'transparent' };
    }

    if (!backgroundColor) {
        return undefined;
    }

    return {
        backgroundImage: `linear-gradient(to bottom, ${backgroundColor}, ${backgroundColor}80)`,
    };
};

/**
 * Expose a configured background color to CSS via the `--widget-config-bg`
 * custom property.
 *
 * The themed widget rules in globals.css force a default gradient with
 * `!important` (which beats inline styles). Those rules read
 * `var(--widget-config-bg, <theme default>)`, so setting this variable lets a
 * user-configured color win while leaving the default untouched when no color
 * is set. Returns an empty object when no color is configured.
 */
export const getWidgetConfigBgStyle = (
    backgroundColor?: string,
    transparent?: boolean
): CSSProperties => {
    if (transparent) {
        return { ['--widget-config-bg']: 'transparent' } as CSSProperties;
    }

    if (!backgroundColor) {
        return {};
    }

    return {
        ['--widget-config-bg']: `linear-gradient(to bottom, ${backgroundColor}, ${backgroundColor}80)`,
    } as CSSProperties;
};
