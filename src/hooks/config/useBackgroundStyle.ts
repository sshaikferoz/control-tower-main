import { useMemo } from 'react';
import { UIConfiguration } from '../../types/configuration';
import { useTheme } from '@/contexts/ThemeContext';

export const useBackgroundStyle = (configuration: UIConfiguration) => {
    const { theme } = useTheme();
    return useMemo(() => {
        if (!configuration.background.enabled) {
            return {
                background: 'var(--dashboard-bg)',
            };
        }

        const mode = theme ?? configuration.background.mode ?? 'dark';
        const useLight = mode === 'light';
        const backgroundImageCandidate = useLight
            ? (configuration.background.useBase64Light ? configuration.background.imageBase64Light : configuration.background.imageUrlLight)
            : (configuration.background.useBase64 ? configuration.background.imageBase64 : configuration.background.imageUrl);
        const isLegacyDarkDefaultInLightMode = useLight && typeof backgroundImageCandidate === 'string' && (
            backgroundImageCandidate.includes('/background/bg.png')
            || backgroundImageCandidate.includes('/background/bg-low.png')
        );
        const backgroundImage = isLegacyDarkDefaultInLightMode ? '' : backgroundImageCandidate;

        const fallbackColor = useLight
            ? (configuration.background.fallbackColorLight ?? '#FFFFFF')
            : (configuration.background.fallbackColor ?? '#1a1a2e');

        return {
            backgroundColor: fallbackColor,
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: configuration.background.opacity / 100,
        };
    }, [configuration.background, theme]);
};

