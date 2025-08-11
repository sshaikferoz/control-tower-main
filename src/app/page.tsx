// Updated Dashboard component with configuration support and dynamic sections
'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { AppState, AppView, ModalState, Report, Section } from '../types';
import { useURLParams } from '../hooks/useURLParams';
import { useAdminCheck } from '../hooks/useAdminCheck';
import { useMenuItems } from '../hooks/useMenuItems';
import { useConfiguration } from '../hooks/useConfiguration';
import { Sidebar } from '@/components/layout/Sidebar';
import { B2BReportsPage } from '@/components/pages/B2BReportsPage';
import { GenericPage } from '@/components//pages/GenericPage';
import { MappingScreen } from '@/components//pages/MappingScreen';
import { ReportModal } from '@/components//modals/ReportModal';
import { ConfigurationDialog } from '@/components/dialogs/ConfigurationDialog';
import { LoadingScreen } from '@/components//ui/LoadingScreen';
import { ErrorScreen } from '@/components/ui/ErrorScreen';
import Home from '@/app/home/page'; // Assuming this exists
import { MenuItem } from 'primereact/menuitem';

const Dashboard: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    view: 'generic',
    selectedMenuItem: 'My SCM',
  });
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    mode: 'add',
  });
  const [configDialogVisible, setConfigDialogVisible] = useState(false);

  // Custom hooks
  const urlParams = useURLParams();
  const { isAdmin, adminCheckLoading, adminCheckError } = useAdminCheck();
  const { menuItems, setMenuItems, isLoading, error } = useMenuItems(isAdmin, adminCheckLoading);
  const {
    configuration,
    isLoading: configLoading,
    saveConfiguration,
    resetConfiguration,
  } = useConfiguration();

  // Check if edit mode is allowed based on admin status and URL parameter
  const isEditModeAllowed = useMemo(() => {
    if (!isAdmin) return false;
    return urlParams?.get('view') === 'edit';
  }, [isAdmin, urlParams]);

  // Handle menu item selection (restrict for non-admin users)
  const handleMenuItemSelect = (item: any) => {
    if (!isAdmin && item.type !== 'Section') {
      return;
    }

    if (item.type === 'Section') {
      setAppState({
        view: 'dashboard',
        selectedMenuItem: item,
      });
    } else if (item.type === 'Dashboard') {
      setAppState({
        view: 'b2b-reports',
        selectedMenuItem: item,
      });
    } else {
      setAppState({
        view: 'generic',
        selectedMenuItem: item,
      });
    }
  };

  // Handle navigation to mapping screen (admin only with edit permission)
  const handleNavigateToMapping = (sectionName: string) => {
    if (!isEditModeAllowed) return;

    setAppState({
      view: 'mapping',
      selectedMenuItem: appState.selectedMenuItem,
      mappingParams: {
        sectionName,
        expanded: 'true',
      },
    });
  };

  // Handle report actions - updated for dynamic sections
  const handleReportView = useCallback((report: Report) => {
    setModal({
      isOpen: true,
      mode: 'view',
      report,
    });
  }, []);

  const handleReportEdit = useCallback((report: Report) => {
    setModal({
      isOpen: true,
      mode: 'edit',
      report,
    });
  }, []);

  const handleReportDelete = useCallback((report: Report) => {
    setModal({
      isOpen: true,
      mode: 'delete',
      report,
    });
  }, []);

  const handleAddReport = useCallback((sectionId: string, sectionName?: string) => {
    const section = {
      id: sectionId,
      name: sectionName || '',
      description: '',
      reports: [],
      createdAt: '',
    };
    setModal({
      isOpen: true,
      mode: 'add',
      section,
    });
  }, []);

  // Handle modal save - this will be passed to ReportModal
  const handleModalSave = useCallback(
    (report: Report) => {
      // The actual saving logic will be handled by B2BReportsPage
      // This is just to close the modal and pass the data
      return report;
    },
    [modal.mode, modal.section]
  );

  // Handle modal delete - this will be passed to ReportModal
  const handleModalDelete = useCallback((reportId: string) => {
    // The actual deletion logic will be handled by B2BReportsPage
    // This is just to pass the delete request
    return reportId;
  }, []);

  // Close modal
  const handleModalClose = useCallback(() => {
    setModal({
      isOpen: false,
      mode: 'add',
    });
  }, []);

  // Configuration handlers
  const handleOpenConfigDialog = useCallback(() => {
    setConfigDialogVisible(true);
  }, []);

  const handleCloseConfigDialog = useCallback(() => {
    setConfigDialogVisible(false);
  }, []);

  const handleSaveConfiguration = useCallback(
    (config: any) => {
      return saveConfiguration(config);
    },
    [saveConfiguration]
  );

  const handleResetConfiguration = useCallback(() => {
    resetConfiguration();
  }, [resetConfiguration]);

  // Generate background style based on configuration
  const backgroundStyle = useMemo(() => {
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

  // Render based on current view
  const renderContent = () => {
    const selectedMenuItemData = menuItems.find((item) => item.name === appState.selectedMenuItem);
    console.log("renderer called",menuItems,selectedMenuItemData,appState.selectedMenuItem)

    switch (appState.view) {
      case 'dashboard':
        return (
          <Home
            selectedMenuItemId={appState.selectedMenuItem}
            isAdmin={isAdmin}
            isEditModeAllowed={isEditModeAllowed}
            configuration={configuration}
            onOpenConfigDialog={handleOpenConfigDialog}
          />
        );

      case 'b2b-reports':
        if (!isAdmin) {
          return (
            <Home
              selectedMenuItemId={selectedMenuItemData?.id}
              isAdmin={isAdmin}
              isEditModeAllowed={isEditModeAllowed}
              configuration={configuration}
              onOpenConfigDialog={handleOpenConfigDialog}
            />
          );
        }
        return (
          <B2BReportsPage
            onAddReport={handleAddReport}
            onViewReport={handleReportView}
            onEditReport={handleReportEdit}
            onDeleteReport={handleReportDelete}
            // modal={modal}
            // onModalSave={handleModalSave}
            // onModalDelete={handleModalDelete}
            // onModalClose={handleModalClose}
          />
        );

      case 'generic':
        if (!isAdmin) {
          return (
            <Home
              selectedMenuItemId={selectedMenuItemData?.id}
              isAdmin={isAdmin}
              isEditModeAllowed={isEditModeAllowed}
              configuration={configuration}
              onOpenConfigDialog={handleOpenConfigDialog}
            />
          );
        }
        return (
          <GenericPage
            sectionName={appState.selectedMenuItem}
            onNavigateToMapping={handleNavigateToMapping}
          />
        );

      case 'mapping':
        if (!isEditModeAllowed) {
          return (
            <Home
              selectedMenuItemId={selectedMenuItemData?.id}
              isAdmin={isAdmin}
              isEditModeAllowed={isEditModeAllowed}
              configuration={configuration}
              onOpenConfigDialog={handleOpenConfigDialog}
            />
          );
        }
        return <MappingScreen />;

      default:
        return (
          <Home
            selectedMenuItemId={selectedMenuItemData?.id}
            isAdmin={isAdmin}
            isEditModeAllowed={isEditModeAllowed}
            configuration={configuration}
            onOpenConfigDialog={handleOpenConfigDialog}
          />
        );
    }
  };

  // Show loading screen while checking admin status or loading configuration
  if (adminCheckLoading || configLoading) {
    return (
      <LoadingScreen
        title="Loading..."
        message="Checking user permissions and loading configuration..."
      />
    );
  }

  // Show error message if there's an error
  if (error || adminCheckError) {
    return (
      <ErrorScreen
        title="Warning"
        message={error || adminCheckError || 'An error occurred'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div
      className="flex h-screen bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]"
      style={backgroundStyle}
    >
      {/* Show sidebar for admin users (regardless of edit mode) */}
      {isAdmin && appState.view !== 'mapping' && (
        <Sidebar
          selectedItem={appState.selectedMenuItem}
          onItemSelect={handleMenuItemSelect}
          menuItems={menuItems}
          onMenuItemsChange={setMenuItems}
          isLoading={isLoading}
          isEditModeAllowed={isEditModeAllowed}
        />
      )}

      {renderContent()}

      {/* Configuration Dialog for admin users with edit permission */}
      {isEditModeAllowed && (
        <ConfigurationDialog
          visible={configDialogVisible}
          onHide={handleCloseConfigDialog}
          configuration={configuration}
          onSave={handleSaveConfiguration}
          onReset={handleResetConfiguration}
        />
      )}
    </div>
  );
};

export default Dashboard;
