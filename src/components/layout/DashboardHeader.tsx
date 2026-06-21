//DashboardHeader.tsx

// Updated DashboardHeader component with search selection support
import React, { useState, Suspense } from 'react';
import { IconButton, Button, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import Header from '@/components/Header';
import ChatbotDialog from '@/components/dialogs/ChatbotDialog';
import { UIConfiguration } from '@/types/configuration';

// Define SearchResult interface locally since it's used here
interface SearchResult {
    metadata: {
        TabId: string;
        TabDescription: string;
        SectionId: string;
        SectionName: string;
        SectionDescription: string;
        WidgetId: string;
        WidgetType: string;
        WidgetTitle: string;
        TechnicalName: string;
        WidgetDescription: string;
    };
    match_text: string;
    score: number;
    level: string;
    ai_title: string;
    ai_summary: string;
}

interface DashboardHeaderProps {
    isAdmin: boolean;
    isEditModeAllowed: boolean;
    isEditMode: boolean;
    onToggleEditMode: () => void;
    onSaveDashboard: () => void;
    onAddSection: () => void;
    configuration?: UIConfiguration;
    onOpenConfigDialog?: () => void;
    tabId: any;
    onSearchSelect?: (result: SearchResult | null) => void; // Search selection/highlighting
    onLocalSearch?: (query: string) => SearchResult[]; // Local fuzzy search over widgets
    isWidgetPreferenceEditMode?: boolean;
    onToggleWidgetPreferenceEditMode?: () => void;
    onSaveWidgetPreferences?: () => void;
    onCancelWidgetPreferences?: () => void;
    onOpenWidgetVisibilityDialog?: () => void;
    canEditWidgetPreferences?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    isAdmin,
    isEditModeAllowed,
    isEditMode,
    onToggleEditMode,
    onSaveDashboard,
    onAddSection,
    configuration,
    onOpenConfigDialog,
    tabId,
    onSearchSelect,
    onLocalSearch,
    isWidgetPreferenceEditMode = false,
    onToggleWidgetPreferenceEditMode,
    onSaveWidgetPreferences,
    onCancelWidgetPreferences,
    onOpenWidgetVisibilityDialog,
    canEditWidgetPreferences = true,
}) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const openChat = () => setIsChatOpen(true);
    const closeChat = () => setIsChatOpen(false);

    // Get chatbot configuration with defaults
    const chatbotConfig = configuration?.chatbot || {
        enabled: true,
        position: 'bottom-right' as const,
        color: '#83BD01',
    };

    // Calculate position classes based on configuration
    const getPositionClasses = () => {
        const position = chatbotConfig.position;
        const classes = ['fixed', 'z-50', 'm-2'];

        if (position.includes('bottom')) {
            // Push chatbot lower when in edit mode to avoid edit controls
            classes.push(isEditMode ? 'bottom-28' : 'bottom-6');
        } else {
            classes.push('top-25');
        }

        if (position.includes('right')) {
            classes.push('right-6');
        } else {
            classes.push('left-auto');
        }

        return classes.join(' ');
    };
    return (
        <div className="flex w-full items-center justify-between px-8">
            <Header
                configuration={configuration}
                tabId={tabId}
                onSearchSelect={onSearchSelect}
                // Provide optional local fuzzy search implementation
                onLocalSearch={onLocalSearch}
                isEditMode={isEditMode}
                isWidgetPreferenceEditMode={isWidgetPreferenceEditMode}
                canEditWidgetPreferences={canEditWidgetPreferences}
                onToggleWidgetPreferenceEditMode={onToggleWidgetPreferenceEditMode}
                onOpenWidgetVisibilityDialog={onOpenWidgetVisibilityDialog}
                onSaveWidgetPreferences={onSaveWidgetPreferences}
                onCancelWidgetPreferences={onCancelWidgetPreferences}
            />

            {/* Chat Button - Only render if chatbot is enabled */}
            {chatbotConfig.enabled && (
                <div className={getPositionClasses()}>
                    <button
                        onClick={openChat}
                        className="rounded-2xl p-2 text-white transition-all duration-300 hover:scale-105 hover:cursor-pointer focus:outline-none focus:ring-0"
                        aria-label="Open chat"
                    >
                        <img src="chatbot/SCAI.png" width={90}></img>
                    </button>
                </div>
            )}

            <Suspense fallback={<div />}>
                <ChatbotDialog isOpen={isChatOpen} onClose={closeChat} />
            </Suspense>

            {/* Admin controls */}
            <div className="flex items-center justify-center gap-2">
                {isAdmin && isEditModeAllowed && (
                    <>
                        {/* Configuration Button */}
                        <Tooltip title="UI Configuration" placement="top">
                            <span>
                                <IconButton
                                    onClick={onOpenConfigDialog}
                                    aria-label="Open Configuration"
                                    sx={{
                                        backgroundColor: 'var(--primary2)',
                                        color: 'white',
                                        '&:hover': { backgroundColor: 'var(--primary2)', opacity: 0.9 },
                                    }}
                                >
                                    <SettingsIcon sx={{ color: 'inherit' }} />
                                </IconButton>
                            </span>
                        </Tooltip>

                        {isEditMode ? (
                            <>
                                <IconButton
                                    onClick={onAddSection}
                                    aria-label="Add Section"
                                    sx={{
                                        backgroundColor: 'var(--primary2)',
                                        color: 'white',
                                        '&:hover': { backgroundColor: 'var(--primary2)', opacity: 0.9 },
                                    }}
                                >
                                    <AddIcon sx={{ color: 'inherit' }} />
                                </IconButton>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon sx={{ color: 'inherit' }} />}
                                    onClick={onSaveDashboard}
                                    sx={{
                                        backgroundColor: 'var(--secondary1)',
                                        color: 'white',
                                        '&:hover': { backgroundColor: 'var(--secondary1)', opacity: 0.9 },
                                    }}
                                >
                                    Save Layout
                                </Button>
                            </>
                        ) : (
                            <Tooltip title="Edit Layout" placement="top">
                                <span>
                                    <IconButton
                                        onClick={onToggleEditMode}
                                        aria-label="Edit Layout"
                                        sx={{
                                            backgroundColor: 'var(--primary2)',
                                            color: 'white',
                                            '&:hover': { backgroundColor: 'var(--primary2)', opacity: 0.9 },
                                        }}
                                    >
                                        <EditIcon sx={{ color: 'inherit' }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
