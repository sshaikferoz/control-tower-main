export interface WidgetPositionPreference {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
}

export interface WidgetPreference {
    widgetId: string;
    sectionId: string;
    tabId: string;
    hidden: boolean;
    order: number;
    layout?: WidgetPositionPreference;
    updatedAt: string;
}

export interface SectionWidgetPreferences {
    sectionId: string;
    widgets: Record<string, WidgetPreference>;
}

export interface UserTabWidgetPreferences {
    userId: string;
    tabId: string;
    updatedAt: string;
    sections: Record<string, SectionWidgetPreferences>;
}

interface PreferencesStore {
    version: 1;
    records: Record<string, UserTabWidgetPreferences>;
}

export const USER_WIDGET_PREFERENCES_STORAGE_KEY = 'ct:user-widget-preferences:v1';

const EMPTY_STORE: PreferencesStore = {
    version: 1,
    records: {},
};

const getStorageKey = (userId: string, tabId: string) => `${userId}::${tabId}`;

const safeParseStore = (rawValue: string | null): PreferencesStore => {
    if (!rawValue) return EMPTY_STORE;
    try {
        const parsed = JSON.parse(rawValue) as PreferencesStore;
        if (!parsed || parsed.version !== 1 || typeof parsed.records !== 'object') {
            return EMPTY_STORE;
        }
        return parsed;
    } catch {
        return EMPTY_STORE;
    }
};

const readStore = (): PreferencesStore => {
    if (typeof window === 'undefined') return EMPTY_STORE;
    return safeParseStore(window.localStorage.getItem(USER_WIDGET_PREFERENCES_STORAGE_KEY));
};

const writeStore = (store: PreferencesStore) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(USER_WIDGET_PREFERENCES_STORAGE_KEY, JSON.stringify(store));
};

export const createEmptyUserTabPreferences = (userId: string, tabId: string): UserTabWidgetPreferences => ({
    userId,
    tabId,
    updatedAt: new Date().toISOString(),
    sections: {},
});

export const getUserTabWidgetPreferences = (
    userId: string,
    tabId: string
): UserTabWidgetPreferences => {
    const store = readStore();
    const key = getStorageKey(userId, tabId);
    return store.records[key] || createEmptyUserTabPreferences(userId, tabId);
};

export const saveUserTabWidgetPreferences = (
    userId: string,
    tabId: string,
    preferences: UserTabWidgetPreferences
) => {
    const store = readStore();
    const key = getStorageKey(userId, tabId);
    const nextStore: PreferencesStore = {
        version: 1,
        records: {
            ...store.records,
            [key]: {
                ...preferences,
                userId,
                tabId,
                updatedAt: new Date().toISOString(),
            },
        },
    };
    writeStore(nextStore);
};
