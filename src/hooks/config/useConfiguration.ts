//useConfiguration.ts
import { useState, useEffect } from 'react';
import { UIConfiguration, defaultConfiguration } from '../../types/configuration';

const CONFIG_STORAGE_KEY = 'ui_configuration';

export const useConfiguration = () => {
    const [configuration, setConfiguration] = useState<UIConfiguration>(defaultConfiguration);
    const [isLoading, setIsLoading] = useState(true);

    // Load configuration from sessionStorage on mount
    useEffect(() => {
        try {
            const savedConfig = sessionStorage.getItem(CONFIG_STORAGE_KEY);
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                setConfiguration({ ...defaultConfiguration, ...parsedConfig });
            }
        } catch (error) {
            console.error('Error loading configuration:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save configuration to sessionStorage
    const saveConfiguration = (newConfig: UIConfiguration) => {
        try {
            sessionStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
            setConfiguration(newConfig);
            return true;
        } catch (error) {
            console.error('Error saving configuration:', error);
            return false;
        }
    };

    // Update specific configuration section
    const updateConfiguration = (
        section: keyof UIConfiguration,
        updates: Partial<UIConfiguration[keyof UIConfiguration]>
    ) => {
        const newConfig = {
            ...configuration,
            [section]: {
                ...configuration[section],
                ...updates,
            },
        };
        return saveConfiguration(newConfig);
    };

    // Reset to default configuration
    const resetConfiguration = () => {
        sessionStorage.removeItem(CONFIG_STORAGE_KEY);
        setConfiguration(defaultConfiguration);
    };

    return {
        configuration,
        isLoading,
        saveConfiguration,
        updateConfiguration,
        resetConfiguration,
    };
};
