//Home component
'use client';
import React, { useState, useEffect, useRef } from 'react';
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

// Define SearchResult interface
interface SearchResult {
    metadata: {
        TabId: string;
        TabDescription: string;
        SectionId: string;
        SectionName: string;
        SectionDescription: string;
        WidgetId: string;
        WidgetType: string;
        TechnicalName: string;
        WidgetDescription: string;
    };
    match_text: string;
    score: number;
    level: string;
    ai_title: string;
    ai_summary: string;
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

    // Toast ref for notifications
    const toast = useRef<Toast>(null);

    // Update favicon whenever configuration changes
    useEffect(() => {
        const icon = getTabIconFromConfiguration(configuration);
        applyFavicon(icon);
    }, [configuration]);

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
            sectionDescription: section.description || '',
            sectionType: section.type,
            tabId: section.tabId,
            expanded: isExpanded.toString(),
            state: section.isNew ? 'create' : 'edit',
        });

        const mappingUrl =
            process.env.NODE_ENV === 'development'
                ? `/mapping?${sectionParams.toString()}`
                : `${process.env.NEXT_PUBLIC_BSP_NAME}/mapping.html?${sectionParams.toString()}`;

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

    const renderSection = (section: any, index: number) => (
        <DashboardSection
            key={`section-${section.id || index}`}
            section={section}
            index={index}
            isEditMode={isEditMode && isEditModeAllowed}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onEditSection={handleEditSection}
            onDeleteSection={handleDeleteSection}
            onOpenMapping={handleOpenMapping}
            onAddWidgets={handleAddWidgets}
            // Pass highlighting props
            highlightSectionId={highlightSectionId}
            highlightWidgetIds={highlightWidgetIds}
            // Pass dashboard configuration
            dashboardType={configuration.dashboard?.type || 'Sections'}
        />
    );

    const handleToggleEditMode = () => {
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

    // Get computed styles based on configuration
    const configManager = ConfigurationManager.getInstance();
    const backgroundStyle = configManager.getBackgroundStyle(configuration);
    const themeVariables = configManager.getThemeVariables(configuration);

    if (loading || configurationLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <ProgressSpinner />
                <div className="ml-4 text-white">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="rounded-lg bg-red-500 p-4 text-white">{error}</div>
            </div>
        );
    }

    return (
        <div className="flex w-full" style={themeVariables}>
            <Toast ref={toast} />
            <div className="flex min-h-screen"></div>
            <div className="relative min-h-screen w-full">
                {/* Dynamic background based on configuration */}
                <div className="absolute inset-0" style={backgroundStyle}></div>

                <div className="relative z-10 flex max-h-screen flex-col overflow-y-auto text-white">
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
                        onSearchSelect={handleSearchSelect} // Pass search selection handler
                    />

                    {/* Removed the separate Announcement component since it's now integrated in the header */}

                    {!dashboardData?.sections || dashboardData.sections.length === 0 ? (
                        <div className="flex h-[60vh] flex-col items-center justify-center">
                            <h5 className="mb-4 text-white text-xl font-semibold">
                                No dashboard sections found
                            </h5>
                            {isEditModeAllowed ? (
                                <>
                                    <p className="mb-4 text-white">
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
                                <p className="mb-4 text-white">
                                    Dashboard content will appear here when available
                                    {isAdmin && !isEditModeAllowed && (
                                        <span className="mt-2 block text-sm text-gray-300">
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
        </div>
    );
}

