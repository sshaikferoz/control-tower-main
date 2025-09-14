// Updated DashboardHeader component with configuration support
import React, { useState, Suspense } from 'react';
import { IconButton, Button, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import Header from '@/components/Header';
import ChatbotDialog from '@/components/dialogs/ChatbotDialog';
import { UIConfiguration } from '@/types/configuration';

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
      classes.push('bottom-6');
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
    <div className="mb-4 flex w-full items-center justify-between px-8">
      <Header configuration={configuration} tabId={tabId} />

      {/* Chat Button - Only render if chatbot is enabled */}
      {chatbotConfig.enabled && (
        <div className={getPositionClasses()}>
          <button
            onClick={openChat}
            className="focus:ring-opacity-50 rounded-full p-4 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:cursor-pointer focus:outline-none"
            aria-label="Open chat"
          >
            <img src="chatbot/SCAI.png" width={100}></img>
          </button>
        </div>
      )}

      <Suspense fallback={<div />}>
        <ChatbotDialog isOpen={isChatOpen} onClose={closeChat} />
      </Suspense>

      {/* Admin controls */}
      {isAdmin && isEditModeAllowed && (
        <div className="flex items-center justify-center gap-2">
          {/* Configuration Button */}
          <Tooltip title="UI Configuration" placement="top">
            <span>
              <IconButton
                color="primary"
                onClick={onOpenConfigDialog}
                className="bg-purple-500"
                aria-label="Open Configuration"
              >
                <SettingsIcon className="text-white" />
              </IconButton>
            </span>
          </Tooltip>

          {isEditMode ? (
            <>
              <IconButton
                color="primary"
                onClick={onAddSection}
                className="bg-green-500"
                aria-label="Add Section"
              >
                <AddIcon className="text-white" />
              </IconButton>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={onSaveDashboard}
                className="bg-blue-500"
              >
                Save Layout
              </Button>
            </>
          ) : (
            <Tooltip title="Edit Layout" placement="top">
              <span>
                <IconButton
                  color="primary"
                  onClick={onToggleEditMode}
                  className="bg-blue-500"
                  aria-label="Edit Layout"
                >
                  <EditIcon className="text-white" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};
