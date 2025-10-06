// types/configuration.ts - Updated with multiple announcements support

export interface AnnouncementItem {
    id: string;
    title: string;
    description: string;
}

export interface UIConfiguration {
    background: {
        enabled: boolean;
        imageUrl: string;
        imageBase64: string;
        useBase64: boolean;
        opacity: number;
    };
    chatbot: {
        enabled: boolean;
        position: string; // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
        color: string;
    };
    search: {
        enabled: boolean;
        placeholder: string;
    };
    branding: {
        logoUrl: string;
        logoBase64: string;
        useLogoBase64: boolean;
        appName: string;
        primaryColor: string;
    };
    announcement: {
        enabled: boolean;
        items: AnnouncementItem[];
        autoScroll: boolean;
        scrollDelay: number; // in milliseconds
        scrollDirection: 'left' | 'right';
    };
    // Metadata for tracking server state
    _metadata?: {
        id: string;
        tabId: string;
        isVisible: boolean;
    };
}

export const defaultConfiguration: UIConfiguration = {
    background: {
        enabled: true,
        imageUrl: `${process.env.NEXT_PUBLIC_BSP_NAME}/background/bg.png`,
        imageBase64: '',
        useBase64: false,
        opacity: 100,
    },
    chatbot: {
        enabled: false,
        position: 'bottom-right',
        color: '#83BD01',
    },
    search: {
        enabled: false,
        placeholder: 'Search My Contract, Spend, Notification, Localization, KPI',
    },
    branding: {
        logoUrl: '',
        logoBase64: '',
        useLogoBase64: false,
        appName: 'mySCAI',
        primaryColor: '#0164B0',
    },
    announcement: {
        enabled: false,
        items: [
            {
                id: '1',
                title: 'Welcome to mySCAI Dashboard',
                description: 'Stay updated with the latest announcements and important information.',
            }
        ],
        autoScroll: true,
        scrollDelay: 5000,
        scrollDirection: 'left',
    },
};

// Configuration manager for handling tab-specific settings
export class ConfigurationManager {
    private static instance: ConfigurationManager;
    private cache: Map<string, UIConfiguration> = new Map();

    static getInstance(): ConfigurationManager {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
        }
        return ConfigurationManager.instance;
    }

    /**
     * Get configuration for a specific tab
     */
    async getConfiguration(tabId: string): Promise<UIConfiguration> {
        // Check cache first
        if (this.cache.has(tabId)) {
            return this.cache.get(tabId)!;
        }

        try {
            // Try to fetch from server
            const { sapODataService } = await import('@/services/sapODataService');
            const serverConfig = await sapODataService.fetchSettingsByTabId(tabId);

            if (serverConfig) {
                // Ensure the announcement config has the new structure
                if (serverConfig.announcement && !('items' in serverConfig.announcement)) {
                    // Migrate old format to new format
                    const oldConfig = serverConfig.announcement as any;
                    serverConfig.announcement = {
                        enabled: oldConfig.enabled || false,
                        items: oldConfig.enabled ? [{
                            id: '1',
                            title: oldConfig.title || 'Welcome to mySCAI Dashboard',
                            description: oldConfig.description || 'Stay updated with the latest announcements and important information.',
                        }] : [],
                        autoScroll: true,
                        scrollDelay: 5000,
                        scrollDirection: 'left',
                    };
                }

                // Cache and return server configuration
                this.cache.set(tabId, serverConfig);
                return serverConfig;
            }
        } catch (error) {
            console.warn('Failed to fetch configuration from server, using defaults:', error);
        }

        // Return default configuration if server config not available
        const defaultConfig = { ...defaultConfiguration };
        this.cache.set(tabId, defaultConfig);
        return defaultConfig;
    }

    /**
     * Save configuration for a specific tab
     */
    async saveConfiguration(tabId: string, configuration: UIConfiguration): Promise<UIConfiguration> {
        try {
            const { sapODataService } = await import('@/services/sapODataService');

            // Get existing settings ID if available
            const existingId = configuration._metadata?.id || await sapODataService.getSettingsId(tabId);

            // Save to server
            const savedConfig = await sapODataService.saveSettings(tabId, configuration, existingId || undefined);

            // Update cache
            this.cache.set(tabId, savedConfig);

            return savedConfig;
        } catch (error) {
            console.error('Failed to save configuration:', error);
            throw error;
        }
    }

    /**
     * Clear cache for a specific tab or all tabs
     */
    clearCache(tabId?: string): void {
        if (tabId) {
            this.cache.delete(tabId);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Apply background styling based on configuration
     */
    getBackgroundStyle(configuration: UIConfiguration): React.CSSProperties {
        if (!configuration.background.enabled) {
            return {};
        }

        const imageSource = configuration.background.useBase64
            ? configuration.background.imageBase64
            : configuration.background.imageUrl;

        if (!imageSource) {
            return {};
        }

        return {
            backgroundImage: `url('${imageSource}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: configuration.background.opacity / 100,
        };
    }

    /**
     * Apply theme variables based on configuration
     */
    getThemeVariables(configuration: UIConfiguration): React.CSSProperties {
        return {
            '--primary-color': configuration.branding.primaryColor,
            '--chatbot-color': configuration.chatbot.color,
            '--app-name': `"${configuration.branding.appName}"`,
        } as React.CSSProperties;
    }
}