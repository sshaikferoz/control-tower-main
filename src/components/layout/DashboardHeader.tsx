// Updated DashboardHeader component with configuration support
import React, { useState, Suspense } from 'react';
import { IconButton, Button, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import Header from '@/components/Header';
import ChatbotDialog from '@/app/chat/ChatbotDialog';
import { UIConfiguration } from '@/types/configuration';
import ChatbotInterface from '@/app/chatbot/page';

interface DashboardHeaderProps {
  isAdmin: boolean;
  isEditModeAllowed: boolean;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onSaveDashboard: () => void;
  onAddSection: () => void;
  configuration?: UIConfiguration;
  onOpenConfigDialog?: () => void;
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
      classes.push('right-25');
    } else {
      classes.push('left-auto');
    }

    return classes.join(' ');
  };

  return (
    <div className="mb-4 flex w-full items-center justify-between px-8">
      <Header configuration={configuration} />

      {/* Chat Button - Only render if chatbot is enabled */}
      {chatbotConfig.enabled && (
        <div className={getPositionClasses()}>
          <button
            onClick={openChat}
            className="focus:ring-opacity-50 rounded-full p-4 text-white shadow-lg transition-all duration-300 hover:scale-110 focus:ring-4 focus:outline-none"
            style={{
              backgroundColor: chatbotConfig.color,
              //   '--hover-color': `${chatbotConfig.color}dd`, // Add transparency for hover
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${chatbotConfig.color}dd`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = chatbotConfig.color;
            }}
            aria-label="Open chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3V7a3 3 0 0 1 3 -3h12z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 9h.01M14.5 9h.01" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 13a3.5 3.5 0 0 0 5 0" />
            </svg>
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
