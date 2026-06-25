//Home component
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Plus } from 'lucide-react';
import { sapODataService, Section } from '@/services/sapODataService';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { NewSectionDialog } from '@/components/dialogs/NewSectionDialog';
import { EditSectionDialog } from '@/components/dialogs/EditSectionDialog';
import { DeleteConfirmationDialog } from '@/components/dialogs/DeleteConfirmationDialog';
import { ConfigurationDialog } from '@/components/dialogs/ConfigurationDialog';
import { getNextSectionOrder } from '@/utils/dashboardUtils';
import { UIConfiguration, defaultConfiguration, ConfigurationManager } from '@/types/configuration';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { FilterPanelSidebarProvider } from '@/widgets/filter-panel/FilterPanelSidebarContext';
import { FilterPanelSidebar } from '@/widgets/filter-panel/FilterPanelSidebar';
import { TargetReportConfig } from '@/helpers/types';
import { WidgetPreviewPicker } from '@/components/dialogs/WidgetPreviewPicker';
import {
    UserTabWidgetPreferences,
    WidgetPreference,
    createEmptyUserTabPreferences,
    getUserTabWidgetPreferences,
    saveUserTabWidgetPreferences,
} from '@/lib/userWidgetPreferences';

// Define SearchResult interface
interface SearchResult {
    metadata: {
        TabId: string;
        TabDescription: string;
        SectionId: string;
        SectionName: string;
        SectionDescription: string;
        WidgetId: string;
        WidgetTitle: string;
        WidgetType: string;
        TechnicalName: string;
        WidgetDescription: string;
    };
    match_text: string;
    score: number;
    level: string;
    ai_title: string;
    ai_summary: string;
    /** When level is widget and result is a dashboard menu item: icon type (report / dashboard / user) or icon filename from public/icons. */
    menuItemIconType?: 'report' | 'dashboard' | 'user' | string;
    /** When result is a dashboard menu item, target report config so the search UI can show an Open link. */
    menuItemTargetReport?: TargetReportConfig;
}

// Helper to derive tab icon URL from configuration
const getTabIconFromConfiguration = (config: UIConfiguration): string | null => {
    // Prefer explicitly configured logo image as the tab icon
    if (config.branding.useLogoBase64 && config.branding.logoBase64) {
        return config.branding.logoBase64;
    }

    if (config.branding.logoUrl) {
        return config.branding.logoUrl;
    }

    // Fallback to default favicon (served from public/)
    return '/favicon.ico';
};

// Helper to update (or create) the favicon link element
const applyFavicon = (href: string | null) => {
    if (typeof document === 'undefined' || !href) return;

    const relValues = ['icon', 'shortcut icon'];

    relValues.forEach((rel) => {
        let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

        if (!link) {
            link = document.createElement('link');
            link.rel = rel;
            document.head.appendChild(link);
        }

        link.href = href;
    });
};

export default function Home({
    selectedMenuItemId,
    isAdmin = false,
    isEditModeAllowed = false,
}: any) {
    const tabId = selectedMenuItemId || '';

    const {
        dashboardData,
        setDashboardData,
        sapSections,
        setSapSections,
        loading,
        setLoading,
        error,
        setError,
        updateDashboardData,
    } = useDashboardData(tabId);

    // Configuration state
    const [configuration, setConfiguration] = useState<UIConfiguration>(defaultConfiguration);
    const [configurationLoading, setConfigurationLoading] = useState(true);
    const [showConfigDialog, setShowConfigDialog] = useState(false);
    const fallbackBackground = configuration.background.fallbackColor ?? defaultConfiguration.background.fallbackColor;
    const { theme } = useTheme();

    // Search highlighting state
    const [highlightSectionId, setHighlightSectionId] = useState<string>('');
    const [highlightWidgetIds, setHighlightWidgetIds] = useState<string[]>([]);

    // Existing dashboard state
    const [isEditMode, setIsEditMode] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showNewSectionDialog, setShowNewSectionDialog] = useState(false);
    const [showEditSectionDialog, setShowEditSectionDialog] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [currentUserId, setCurrentUserId] = useState('anonymous');
    const [savedWidgetPreferences, setSavedWidgetPreferences] = useState<UserTabWidgetPreferences | null>(null);
    const [draftWidgetPreferences, setDraftWidgetPreferences] = useState<UserTabWidgetPreferences | null>(null);
    const [isWidgetPreferenceEditMode, setIsWidgetPreferenceEditMode] = useState(false);
    const [showWidgetVisibilityDialog, setShowWidgetVisibilityDialog] = useState(false);

    // Toast ref for notifications
    const toast = useRef<Toast>(null);

    // Update favicon whenever configuration changes
    useEffect(() => {
        const icon = getTabIconFromConfiguration(configuration);
        applyFavicon(icon);
    }, [configuration]);

    useEffect(() => {
        let mounted = true;
        const loadCurrentUser = async () => {
            try {
                const profile = await sapODataService.fetchUserProfile();
                if (mounted && profile?.UserName) {
                    setCurrentUserId(profile.UserName);
                }
            } catch {
                // Keep anonymous profile when user profile API is unavailable.
            }
        };
        loadCurrentUser();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!tabId) return;
        const loaded = getUserTabWidgetPreferences(currentUserId, tabId);
        setSavedWidgetPreferences(loaded);
        setDraftWidgetPreferences(loaded);
        setIsWidgetPreferenceEditMode(false);
    }, [currentUserId, tabId]);

    // Load configuration when tab changes
    useEffect(() => {
        if (tabId) {
            loadConfiguration();
        }
    }, [tabId]);

    const loadConfiguration = async () => {
        if (!tabId) return;
        try {
            setConfigurationLoading(true);
            const configManager = ConfigurationManager.getInstance();
            const tabConfig = await configManager.getConfiguration(tabId);
            setConfiguration(tabConfig);
        } catch (error) {
            console.error('Failed to load configuration:', error);
            setConfiguration(defaultConfiguration);
            setError('Failed to load UI configuration');
        } finally {
            setConfigurationLoading(false);
        }
    };

    // Safely flatten any widget/section metadata/value object into a single searchable string
    const flattenMetadata = (value: any, depth = 0): string => {
        if (value == null) return '';

        // Avoid going too deep or into huge structures unexpectedly
        if (depth > 4) return '';

        const valueType = typeof value;

        if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
            return String(value);
        }

        if (Array.isArray(value)) {
            return value.map((item) => flattenMetadata(item, depth + 1)).join(' ');
        }

        if (valueType === 'object') {
            return Object.values(value)
                .map((v) => flattenMetadata(v, depth + 1))
                .join(' ');
        }

        return '';
    };

    // Perform a client-side Fuse.js search over current dashboard sections/widgets
    const performLocalWidgetSearch = (query: string): SearchResult[] => {
        if (!query || !dashboardData?.sections || dashboardData.sections.length === 0) {
            return [];
        }

        type SearchEntity =
            | {
                kind: 'section';
                section: any;
            }
            | {
                kind: 'widget';
                section: any;
                widget: any;
            }
            | {
                kind: 'menuItem';
                section: any;
                widget: any;
                menuItem: any;
            };

        const entities: SearchEntity[] = [];

        // Initialize Fuse with the raw response objects for sections and widgets
        dashboardData.sections.forEach((section) => {
            entities.push({ kind: 'section', section });
            section.widgets?.forEach((widget: any) => {
                entities.push({ kind: 'widget', section, widget });
                // Dashboard menu widget: add each menu item as a searchable entity
                if (widget.name === 'dashboard-menu') {
                    const items = widget.props?.dashboardMenuConfig?.items || [];
                    items.forEach((menuItem: any) => {
                        entities.push({ kind: 'menuItem', section, widget, menuItem });
                    });
                }
            });
        });

        if (entities.length === 0) {
            return [];
        }

        const fuse = new Fuse<SearchEntity>(entities, {
            keys: [
                // Section-level fields
                'section.sectionName',
                'section.originalSection.sectionName',
                'section.originalSection.sectionDescription',
                'section.originalSection.description',
                // Widget-level fields
                'widget.name',
                'widget.title',
                'widget.props.title',
                'widget.props.name',
                'widget.props.customTitle',
                'widget.description',
                'widget.originalWidget.title',
                'widget.originalWidget.name',
                'widget.props.targetReport.description',
                // Dashboard menu item fields (inner menu entries)
                'menuItem.targetReport.name',
                'menuItem.targetReport.description',
                'menuItem.targetReport.technicalId',
                'menuItem.targetReport.type',
            ],
            includeScore: true,
            threshold: 0.4,
        });

        // Use the correct type for Fuse results
        const fuseResults = fuse.search(query).slice(0, 10);

        return fuseResults.map((res) => {
            const { item, score } = res;

            if (item.kind === 'section') {
                const section = item.section;
                const sectionName = section.sectionName || section.originalSection?.sectionName || '';
                const sectionDescription =
                    section.originalSection?.sectionDescription || section.originalSection?.description || '';
                const sectionText = `${sectionName} ${sectionDescription}`.trim();

                return {
                    metadata: {
                        TabId: tabId,
                        TabDescription: '',
                        SectionId: section.id || section.originalSection?.id || '',
                        SectionName: sectionName,
                        SectionDescription: sectionDescription,
                        WidgetTitle: '',
                        WidgetId: '',
                        WidgetType: '',
                        TechnicalName: '',
                        WidgetDescription: '',
                    },
                    match_text: sectionText,
                    level: 'section',
                    ai_title: sectionName || 'Section match',
                    ai_summary: sectionDescription || `Matched section "${sectionName}" for "${query}".`,
                    // Fuse score is 0 (best) to 1 (worst); invert so higher is better.
                    score: typeof score === 'number' ? 1 - score : 0,
                } as SearchResult;
            }

            if (item.kind === 'menuItem') {
                const section = item.section;
                const widget = item.widget;
                const menuItem = item.menuItem;
                const tr = menuItem?.targetReport || {};
                const menuItemName = tr.name || 'Untitled report';
                const menuItemDesc = tr.description || '';
                const sectionName = section.sectionName || section.originalSection?.sectionName || '';
                const sectionDescription =
                    section.originalSection?.sectionDescription || section.originalSection?.description || '';
                const matchText = [menuItemName, menuItemDesc, tr.technicalId, tr.type].filter(Boolean).join(' ');

                return {
                    metadata: {
                        TabId: tabId,
                        TabDescription: '',
                        SectionId: section.id || section.originalSection?.id || '',
                        SectionName: sectionName,
                        SectionDescription: sectionDescription,
                        WidgetId: widget.id,
                        WidgetTitle: widget.props?.title || menuItemName,
                        WidgetType: widget.name || 'dashboard-menu',
                        TechnicalName: tr.technicalId || '',
                        WidgetDescription: menuItemDesc || menuItemName,
                    },
                    match_text: matchText,
                    level: 'widget',
                    ai_title: menuItemName,
                    ai_summary: menuItemDesc || `Menu item in "${sectionName}" matching "${query}".`,
                    score: typeof score === 'number' ? 1 - score : 0,
                    menuItemIconType: menuItem?.iconType || 'report',
                    menuItemTargetReport:
                        menuItem?.targetReport?.technicalId
                            ? (menuItem.targetReport as TargetReportConfig)
                            : undefined,
                } as SearchResult;
            }

            // Widget-level result
            const section = item.section;
            const widget = item.widget;

            const sectionName = section.sectionName || section.originalSection?.sectionName || '';
            const sectionDescription =
                section.originalSection?.sectionDescription || section.originalSection?.description || '';

            const widgetName = widget.name || '';
            const widgetTitle =
                widget.props?.title ||
                widget.props?.name ||
                widget.description ||
                widget.originalWidget?.title ||
                widget.originalWidget?.name ||
                widgetName.replace(/-/g, ' ');
            const widgetDescription =
                widget.props?.targetReport?.description ||
                section.fieldMappings?.[widget.id]?.targetReport?.description ||
                widget.description ||
                '';

            const mapping = section.fieldMappings?.[widget.id];
            const technicalName = mapping?.reportName || mapping?.targetReport?.technicalId || '';

            // Flatten all widget props & mapping metadata for match_text/summary (not for Fuse indexing)
            const propsText = flattenMetadata(widget.props || {});
            const mappingText = flattenMetadata(mapping || {});

            const combinedText = `${widgetTitle} ${widgetDescription} ${widgetName} ${technicalName} ${propsText} ${mappingText}`.trim();

            return {
                metadata: {
                    TabId: tabId,
                    TabDescription: '',
                    SectionId: section.id || section.originalSection?.id || '',
                    SectionName: sectionName,
                    SectionDescription: sectionDescription,
                    WidgetId: widget.id,
                    WidgetTitle: widgetTitle,
                    WidgetType: widgetName,
                    TechnicalName: technicalName,
                    WidgetDescription: widgetDescription || widgetTitle,
                },
                match_text: combinedText,
                level: 'widget',
                ai_title: widgetTitle || widgetName,
                ai_summary: '',
                // Fuse score is 0 (best) to 1 (worst); invert so higher is better.
                score: typeof score === 'number' ? 1 - score : 0,
            } as SearchResult;
        });
    };

    // Handle search selection for highlighting
    const handleSearchSelect = (result: SearchResult | null) => {
        if (!result) {
            // Clear highlighting
            setHighlightSectionId('');
            setHighlightWidgetIds([]);
            return;
        }

        // Set highlighting based on search result level and metadata
        switch (result.level) {
            case 'widget':
                // Highlight specific widget and its section
                setHighlightSectionId(result.metadata.SectionId);
                setHighlightWidgetIds([result.metadata.WidgetId]);
                break;
            case 'section':
                // Highlight entire section
                setHighlightSectionId(result.metadata.SectionId);
                setHighlightWidgetIds([]);
                break;
            case 'tab':
                // For tab level, highlight the section mentioned in the result
                setHighlightSectionId(result.metadata.SectionId);
                setHighlightWidgetIds([]);
                break;
            default:
                // Fallback: highlight section if available
                if (result.metadata.SectionId) {
                    setHighlightSectionId(result.metadata.SectionId);
                    setHighlightWidgetIds(result.metadata.WidgetId ? [result.metadata.WidgetId] : []);
                }
                break;
        }

        // Auto-scroll to highlighted element after a brief delay
        setTimeout(() => {
            let targetElement = null;

            // For widget-level searches, try to scroll to the specific widget first
            if (result.level === 'widget' && result.metadata.WidgetId) {
                targetElement = document.querySelector(`[data-widget-id="${result.metadata.WidgetId}"]`);
            }

            // If no widget found or it's a section/tab level search, scroll to the section
            if (!targetElement && result.metadata.SectionId) {
                targetElement = document.querySelector(`[data-section-id="${result.metadata.SectionId}"]`);
            }

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    const handleOpenConfigDialog = () => {
        if (!isAdmin) return;
        setShowConfigDialog(true);
    };

    const handleCloseConfigDialog = () => {
        setShowConfigDialog(false);
    };

    const handleSaveConfiguration = async (newConfig: UIConfiguration): Promise<boolean> => {
        if (!isAdmin) return false;

        try {
            setConfigurationLoading(true);
            const configManager = ConfigurationManager.getInstance();
            const savedConfig = await configManager.saveConfiguration(tabId, newConfig);

            setConfiguration(savedConfig);
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Configuration saved successfully!',
                life: 3000,
            });

            return true;
        } catch (error) {
            console.error('Failed to save configuration:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save configuration. Please try again.',
                life: 3000,
            });
            return false;
        } finally {
            setConfigurationLoading(false);
        }
    };

    const handleResetConfiguration = async () => {
        if (!isAdmin) return;

        try {
            setConfigurationLoading(true);
            const configManager = ConfigurationManager.getInstance();

            // Clear cache for this tab and reload defaults
            configManager.clearCache(tabId);
            const defaultConfig = { ...defaultConfiguration };

            // Save default configuration to server
            const savedConfig = await configManager.saveConfiguration(tabId, defaultConfig);
            setConfiguration(savedConfig);

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Configuration reset to defaults successfully!',
                life: 3000,
            });
        } catch (error) {
            console.error('Failed to reset configuration:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to reset configuration. Please try again.',
                life: 3000,
            });
        } finally {
            setConfigurationLoading(false);
        }
    };


    // Existing dashboard handlers
    const toggleEditMode = () => {
        if (!isEditModeAllowed) return;
        setIsEditMode(!isEditMode);

        // Clear highlighting when entering edit mode
        if (!isEditMode) {
            setHighlightSectionId('');
            setHighlightWidgetIds([]);
        }
    };

    const saveDashboard = async () => {
        if (!isEditModeAllowed) return;

        try {
            setLoading(true);

            const updatedSections = sapSections.map((section, index) => ({
                ...section,
                order: index + 1,
                hasChanges: true,
            }));

            const savedSections = await sapODataService.batchUpdateSections(updatedSections);
            updateDashboardData(savedSections);

            setIsEditMode(false);
            setLoading(false);
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Dashboard layout saved successfully!',
                life: 3000,
            });
        } catch (err) {
            console.error('Error saving dashboard data:', err);
            setError('Failed to save dashboard configuration to SAP');
            setLoading(false);
        }
    };

    const handleCreateSection = async (sectionData: Partial<Section>) => {
        if (!isEditModeAllowed) return;

        try {
            setLoading(true);

            const newOrder = getNextSectionOrder(sapSections);
            const sectionWithOrder = {
                ...sectionData,
                order: newOrder,
            };

            const newSection = await sapODataService.saveSection(sectionWithOrder as Section, false);

            const updatedSections = [...sapSections, newSection];
            updateDashboardData(updatedSections);

            setLoading(false);
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Section created successfully!',
                life: 3000,
            });
        } catch (err) {
            console.error('Error creating section:', err);
            setError('Failed to create new section');
            setLoading(false);
        }
    };

    const handleEditSection = (section: Section) => {
        if (!isEditModeAllowed) return;
        setSelectedSection(section);
        setShowEditSectionDialog(true);
    };

    const handleUpdateSection = async (updatedSection: Section) => {
        if (!isEditModeAllowed) return;

        try {
            setLoading(true);

            const savedSection = await sapODataService.saveSection(updatedSection, true);

            const updatedSections = sapSections.map((section) =>
                section.id === savedSection.id ? savedSection : section
            );
            updateDashboardData(updatedSections);

            setLoading(false);
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Section updated successfully!',
                life: 3000,
            });
            setSelectedSection(null);
        } catch (err) {
            console.error('Error updating section:', err);
            setError('Failed to update section');
            setLoading(false);
        }
    };

    const handleDeleteSection = (section: Section) => {
        if (!isEditModeAllowed) return;
        setSelectedSection(section);
        setShowDeleteConfirmation(true);
    };

    const confirmDeleteSection = async () => {
        if (!selectedSection || !isEditModeAllowed) return;

        try {
            setLoading(true);

            await sapODataService.deleteSection(selectedSection);

            const updatedSections = sapSections.filter((section) => section.id !== selectedSection.id);
            updateDashboardData(updatedSections);

            setLoading(false);
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Section deleted successfully!',
                life: 3000,
            });
            setShowDeleteConfirmation(false);
            setSelectedSection(null);
        } catch (err) {
            console.error('Error deleting section:', err);
            setError('Failed to delete section');
            setLoading(false);
        }
    };

    const handleOpenMapping = (section: Section, isExpanded: boolean) => {
        if (!isEditModeAllowed) return;

        const encodedSectionName = encodeURIComponent(section.name);
        const sectionParams = new URLSearchParams({
            sectionId: section.id,
            sectionName: section.name,
            // sectionDescription: section.description || '',
            // sectionType: section.type,
            // tabId: section.tabId,
            // expanded: isExpanded.toString(),
            // state: section.isNew ? 'create' : 'edit',
        });

        const mappingUrl =
            process.env.NODE_ENV === 'development'
                ? `/mapping-new?${sectionParams.toString()}`
                : `${process.env.NEXT_PUBLIC_BSP_NAME}/mapping-new.html?${sectionParams.toString()}`;

        window.location.href = mappingUrl;
    };

    const handleAddWidgets = (section: Section, isExpanded: boolean) => {
        if (!isEditModeAllowed) return;

        const encodedSectionName = encodeURIComponent(section.name);
        const sectionParams = new URLSearchParams({
            sectionId: section.id,
            sectionName: section.name,
            sectionDescription: section.description || '',
            sectionType: section.type,
            tabId: section.tabId,
            expanded: isExpanded.toString(),
            state: 'add_widgets',
            action: 'add_widgets',
        });

        const mappingUrl =
            process.env.NODE_ENV === 'development'
                ? `/mapping?${sectionParams.toString()}`
                : `${process.env.NEXT_PUBLIC_BSP_NAME}/mapping.html?${sectionParams.toString()}`;

        window.location.href = mappingUrl;
    };

    const handleDragStart = (index: number) => {
        if (!isEditModeAllowed) return;
        setDraggedIndex(index);
        setIsDragging(true);
    };

    const handleDragEnter = (targetIndex: number) => {
        if (!isEditModeAllowed) return;

        if (draggedIndex === null || draggedIndex === targetIndex || !dashboardData?.sections) return;

        const reorderedSections = [...dashboardData.sections];
        const [movedSection] = reorderedSections.splice(draggedIndex, 1);
        reorderedSections.splice(targetIndex, 0, movedSection);

        setDashboardData({ ...dashboardData, sections: reorderedSections });

        const reorderedSapSections = [...sapSections];
        const [movedSapSection] = reorderedSapSections.splice(draggedIndex, 1);
        reorderedSapSections.splice(targetIndex, 0, movedSapSection);

        const updatedSapSections = reorderedSapSections.map((section, index) => ({
            ...section,
            order: index + 1,
            hasChanges: true,
        }));

        setSapSections(updatedSapSections);
        setDraggedIndex(targetIndex);
    };

    const handleDragEnd = () => {
        if (!isEditModeAllowed) return;
        setDraggedIndex(null);
        setIsDragging(false);
    };

    const handleDragOver = (index: number) => {
        if (!isEditModeAllowed) return;
    };

    const clonePreferences = (preferences: UserTabWidgetPreferences): UserTabWidgetPreferences =>
        JSON.parse(JSON.stringify(preferences));

    const getWorkingPreferences = (): UserTabWidgetPreferences => {
        const active = isWidgetPreferenceEditMode ? draftWidgetPreferences : savedWidgetPreferences;
        return active || createEmptyUserTabPreferences(currentUserId, tabId);
    };

    const upsertWidgetPreference = (
        source: UserTabWidgetPreferences,
        sectionId: string,
        widgetId: string,
        patch: Partial<WidgetPreference>
    ): UserTabWidgetPreferences => {
        const sectionPrefs = source.sections[sectionId] || { sectionId, widgets: {} };
        const existingWidgetPref = sectionPrefs.widgets[widgetId];
        const fallbackOrder = Object.keys(sectionPrefs.widgets).length;
        const nextWidgetPref: WidgetPreference = {
            ...existingWidgetPref,
            widgetId,
            sectionId,
            tabId,
            hidden: existingWidgetPref?.hidden ?? false,
            order: existingWidgetPref?.order ?? fallbackOrder,
            ...patch,
            updatedAt: new Date().toISOString(),
        };
        return {
            ...source,
            updatedAt: new Date().toISOString(),
            sections: {
                ...source.sections,
                [sectionId]: {
                    ...sectionPrefs,
                    widgets: {
                        ...sectionPrefs.widgets,
                        [widgetId]: nextWidgetPref,
                    },
                },
            },
        };
    };

    const handleToggleWidgetPreferenceEditMode = () => {
        if (!tabId || isEditMode) return;
        if (isWidgetPreferenceEditMode) {
            setIsWidgetPreferenceEditMode(false);
            setShowWidgetVisibilityDialog(false);
            return;
        }
        const nextDraft = clonePreferences(
            savedWidgetPreferences || createEmptyUserTabPreferences(currentUserId, tabId)
        );
        setDraftWidgetPreferences(nextDraft);
        setIsWidgetPreferenceEditMode(true);
    };

    const handleCancelWidgetPreferences = () => {
        const restored = clonePreferences(
            savedWidgetPreferences || createEmptyUserTabPreferences(currentUserId, tabId)
        );
        setDraftWidgetPreferences(restored);
        setIsWidgetPreferenceEditMode(false);
        setShowWidgetVisibilityDialog(false);
    };

    const handleSaveWidgetPreferences = () => {
        if (!tabId || !draftWidgetPreferences) return;
        const payloadToSave: UserTabWidgetPreferences = {
            ...draftWidgetPreferences,
            userId: currentUserId,
            tabId,
            updatedAt: new Date().toISOString(),
        };
        saveUserTabWidgetPreferences(currentUserId, tabId, payloadToSave);
        setSavedWidgetPreferences(payloadToSave);
        setDraftWidgetPreferences(clonePreferences(payloadToSave));
        setIsWidgetPreferenceEditMode(false);
        setShowWidgetVisibilityDialog(false);
        toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Widget preferences saved successfully!',
            life: 3000,
        });
    };

    const handleOpenWidgetVisibilityDialog = () => {
        if (!isWidgetPreferenceEditMode) return;
        setShowWidgetVisibilityDialog(true);
    };

    const handleWidgetVisibilityPreferenceChange = (
        sectionId: string,
        widgetId: string,
        hidden: boolean
    ) => {
        const base = getWorkingPreferences();
        const next = upsertWidgetPreference(base, sectionId, widgetId, { hidden });
        setDraftWidgetPreferences(next);
        if (!isWidgetPreferenceEditMode) {
            setSavedWidgetPreferences(next);
            saveUserTabWidgetPreferences(currentUserId, tabId, next);
        }
    };

    const handleWidgetLayoutPreferenceChange = (
        sectionId: string,
        layoutItems: Array<{ i: string; x: number; y: number; w: number; h: number }>
    ) => {
        const base = getWorkingPreferences();
        let next = base;
        layoutItems.forEach((layoutItem, order) => {
            next = upsertWidgetPreference(next, sectionId, layoutItem.i, {
                order,
                layout: {
                    x: layoutItem.x,
                    y: layoutItem.y,
                    w: layoutItem.w,
                    h: layoutItem.h,
                },
            });
        });
        setDraftWidgetPreferences(next);
    };

    const renderSection = (section: any, index: number) => {
        const sectionId = section.id || section.originalSection?.id || '';
        const workingPreferences = getWorkingPreferences();
        const sectionPrefs = sectionId ? workingPreferences.sections?.[sectionId]?.widgets || {} : {};
        return (
            <DashboardSection
                key={`section-${section.id || index}`}
                section={section}
                index={index}
                isAdmin={isAdmin}
                isEditMode={isEditMode && isEditModeAllowed}
                isWidgetPreferenceEditMode={isWidgetPreferenceEditMode}
                sectionWidgetPreferences={sectionPrefs}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onEditSection={handleEditSection}
                onDeleteSection={handleDeleteSection}
                onOpenMapping={handleOpenMapping}
                onAddWidgets={handleAddWidgets}
                onWidgetVisibilityPreferenceChange={handleWidgetVisibilityPreferenceChange}
                onWidgetLayoutPreferenceChange={handleWidgetLayoutPreferenceChange}
                // Pass highlighting props
                highlightSectionId={highlightSectionId}
                highlightWidgetIds={highlightWidgetIds}
                // Pass dashboard configuration
                dashboardType={configuration.dashboard?.type || 'Sections'}
            />
        );
    };

    const handleToggleEditMode = () => {
        if (isWidgetPreferenceEditMode) return;
        setIsEditMode(!isEditMode);
    };

    const handleSaveDashboard = async () => {
        if (!isEditModeAllowed) return;

        setIsEditMode(false);

        try {
            setLoading(true);

            // Prepare reordered sections with updated order
            const updatedSections = sapSections.map((section, index) => ({
                ...section,
                order: index + 1,
                hasChanges: true,
            }));

            // Save updated order to SAP
            const savedSections = await sapODataService.batchUpdateSections(updatedSections);

            // Update UI state
            updateDashboardData(savedSections);
            setSapSections(savedSections);

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Dashboard layout saved successfully!',
                life: 3000,
            });
        } catch (err) {
            console.error('Error saving dashboard layout:', err);
            setError('Failed to save dashboard layout');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSection = () => {
        setShowNewSectionDialog(true);
    };

    // Get computed styles based on configuration (theme from toggle overrides config mode)
    const configManager = ConfigurationManager.getInstance();
    const backgroundStyle = configManager.getBackgroundStyle(configuration, theme);
    const themeVariables = configManager.getThemeVariables(configuration);

    if (loading || configurationLoading) {
        return <LoadingScreen />
    }

    if (error) {
        return (
            <div
                className="flex h-screen items-center justify-center"
                style={{ backgroundColor: fallbackBackground }}
            >
                <div className="rounded-lg bg-red-500 p-4 text-white">{error}</div>
            </div>
        );
    }

    return (
        <div className="flex w-full" style={themeVariables}>
            <Toast ref={toast} />
            <div className="relative min-h-screen w-full">
                {/* Dynamic background based on configuration */}
                <div className="absolute inset-0" style={backgroundStyle}></div>

                <FilterPanelSidebarProvider>
                    <FilterPanelSidebar />
                    <div className="relative z-10 flex max-h-screen flex-col overflow-y-auto" style={{ color: 'var(--foreground)' }}>
                        <div className="sticky top-0 z-20 flex-shrink-0">
                            <DashboardHeader
                                isAdmin={isAdmin}
                                isEditModeAllowed={isEditModeAllowed}
                                isEditMode={isEditMode}
                                onToggleEditMode={handleToggleEditMode}
                                onSaveDashboard={handleSaveDashboard}
                                onAddSection={handleAddSection}
                                configuration={configuration}
                                onOpenConfigDialog={handleOpenConfigDialog}
                                tabId={tabId}
                                onSearchSelect={handleSearchSelect}
                                isWidgetPreferenceEditMode={isWidgetPreferenceEditMode}
                                onToggleWidgetPreferenceEditMode={handleToggleWidgetPreferenceEditMode}
                                onSaveWidgetPreferences={handleSaveWidgetPreferences}
                                onCancelWidgetPreferences={handleCancelWidgetPreferences}
                                onOpenWidgetVisibilityDialog={handleOpenWidgetVisibilityDialog}
                                canEditWidgetPreferences={Boolean(tabId)}
                                // Provide local fuzzy search over current dashboard widgets/sections
                                onLocalSearch={performLocalWidgetSearch}
                            />
                        </div>

                        {/* Removed the separate Announcement component since it's now integrated in the header */}

                        {!dashboardData?.sections || dashboardData.sections.length === 0 ? (
                            <div className="flex h-[60vh] flex-col items-center justify-center">
                                <h5 className="mb-4 text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                                    No dashboard sections found
                                </h5>
                                {isEditModeAllowed ? (
                                    <>
                                        <p className="mb-4" style={{ color: 'var(--foreground)' }}>
                                            Create a new section by clicking the + button in edit mode
                                        </p>
                                        <Button
                                            label="Create Section"
                                            icon={<Plus className="w-4 h-4" />}
                                            onClick={() => setShowNewSectionDialog(true)}
                                            className="bg-green-500 hover:bg-green-600"
                                        />
                                    </>
                                ) : (
                                    <p className="mb-4" style={{ color: 'var(--foreground)' }}>
                                        Dashboard content will appear here when available
                                        {isAdmin && !isEditModeAllowed && (
                                            <span className="mt-2 block text-sm" style={{ color: 'var(--text-muted)' }}>
                                                Add ?view=edit to the URL to enable editing features
                                            </span>
                                        )}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col">{dashboardData?.sections?.map(renderSection)}</div>
                        )}
                    </div>
                </FilterPanelSidebarProvider>
            </div>

            {/* Configuration Dialog */}
            {isAdmin && (
                <ConfigurationDialog
                    visible={showConfigDialog}
                    onHide={handleCloseConfigDialog}
                    configuration={configuration}
                    onSave={handleSaveConfiguration}
                    onReset={handleResetConfiguration}
                />
            )}

            {/* Dashboard Dialogs */}
            {isEditModeAllowed && (
                <>
                    <NewSectionDialog
                        open={showNewSectionDialog}
                        onClose={() => setShowNewSectionDialog(false)}
                        onSave={handleCreateSection}
                        tabId={tabId}
                    />

                    <EditSectionDialog
                        open={showEditSectionDialog}
                        onClose={() => setShowEditSectionDialog(false)}
                        onSave={handleUpdateSection}
                        section={selectedSection}
                    />

                    <DeleteConfirmationDialog
                        open={showDeleteConfirmation}
                        onClose={() => setShowDeleteConfirmation(false)}
                        onConfirm={confirmDeleteSection}
                        sectionName={selectedSection?.name || ''}
                    />
                </>
            )}

            <WidgetPreviewPicker
                open={showWidgetVisibilityDialog}
                onClose={() => setShowWidgetVisibilityDialog(false)}
                sections={dashboardData?.sections || []}
                dashboardType={configuration.dashboard?.type || 'Sections'}
                getHidden={(sectionId, widgetId) =>
                    getWorkingPreferences().sections?.[sectionId]?.widgets?.[widgetId]?.hidden ?? false
                }
                onToggle={handleWidgetVisibilityPreferenceChange}
            />
        </div>
    );
}

