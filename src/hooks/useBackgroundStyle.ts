import { useMemo } from 'react';
import { UIConfiguration } from '../types/configuration';

export const useBackgroundStyle = (configuration: UIConfiguration) => {
    return useMemo(() => {
        if (!configuration.background.enabled) {
            return {
                background: 'linear-gradient(to bottom right, #0a1a35, #1a3a6b)',
            };
        }

        const backgroundImage =
            configuration.background.useBase64 && configuration.background.imageBase64
                ? configuration.background.imageBase64
                : configuration.background.imageUrl;

        return {
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: configuration.background.opacity / 100,
        };
    }, [configuration.background]);
};

