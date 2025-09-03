'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { Suspense } from 'react';
import { CircularProgress, Typography, Button, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { HomeProps } from '@/types/dashboard';
import { sapODataService, Section } from '@/services/sapODataService';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { NewSectionDialog } from '@/components/dialogs/NewSectionDialog';
import { EditSectionDialog } from '@/components/dialogs/EditSectionDialog';
import { DeleteConfirmationDialog } from '@/components/dialogs/DeleteConfirmationDialog';
import { WidgetSkeleton } from '@/components/ui/WidgetSkeleton';
// import NewsFeed from '@/components/widgets/NewsFeed';
import { getNextSectionOrder } from '@/utils/dashboardUtils';
import { UIConfiguration } from '@/types/configuration';

export default function Home({
  selectedMenuItemId,
  isAdmin = false,
  isEditModeAllowed = false,
  configuration,
  onOpenConfigDialog,
}: any) {
  console.log('selected menu items id', selectedMenuItemId);
  console.log('isAdmin prop', isAdmin);
  console.log('isEditModeAllowed prop', isEditModeAllowed);

  const tabId = selectedMenuItemId?.id || '00000000000000000000000000000001';

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

  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showNewSectionDialog, setShowNewSectionDialog] = useState(false);
  const [showEditSectionDialog, setShowEditSectionDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const toggleEditMode = () => {
    if (!isEditModeAllowed) return;
    setIsEditMode(!isEditMode);
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
      setShowSaveSuccess(true);
      console.log('Dashboard saved to SAP successfully');
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
      console.log('Created new section:', newSection);

      const updatedSections = [...sapSections, newSection];
      updateDashboardData(updatedSections);

      setLoading(false);
      setShowSaveSuccess(true);
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
      console.log('Updating section with data:', updatedSection);

      const savedSection = await sapODataService.saveSection(updatedSection, true);
      console.log('Updated section response:', savedSection);

      const updatedSections = sapSections.map((section) =>
        section.id === savedSection.id ? savedSection : section
      );
      updateDashboardData(updatedSections);

      setLoading(false);
      setShowSaveSuccess(true);
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
      console.log('Deleted section:', selectedSection.id);

      const updatedSections = sapSections.filter((section) => section.id !== selectedSection.id);
      updateDashboardData(updatedSections);

      setLoading(false);
      setShowSaveSuccess(true);
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
    />
  );

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSaveDashboard = () => {
    // Save dashboard logic here
    console.log('Saving dashboard...');
    setIsEditMode(false);
  };

  const handleAddSection = () => {
    // Add section logic here
    setShowNewSectionDialog(true);
  };

  // Apply configuration-based styling
  const getContentStyle = () => {
    if (!configuration?.branding) return {};

    return {
      '--primary-color': configuration.branding.primaryColor,
      '--app-name': configuration.branding.appName,
    } as React.CSSProperties;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress />
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
    <div className="flex w-full">
      <div className="flex min-h-screen"></div>
      <div className="relative min-h-screen w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${process.env.NEXT_PUBLIC_BSP_NAME}/background/bg.png')`,
          }}
        ></div>

        <div className="relative z-10 flex max-h-screen flex-col overflow-y-auto text-white">
          <DashboardHeader
            isAdmin={isAdmin}
            isEditModeAllowed={isEditModeAllowed}
            isEditMode={isEditMode}
            onToggleEditMode={handleToggleEditMode}
            onSaveDashboard={handleSaveDashboard}
            onAddSection={handleAddSection}
            configuration={configuration}
            onOpenConfigDialog={onOpenConfigDialog}
          />
          {/* <div className="mx-auto flex w-full flex-col items-start gap-7 px-6 py-6">
            <Suspense fallback={<WidgetSkeleton />}>
              <NewsFeed />
            </Suspense>
          </div> */}

          {!dashboardData?.sections || dashboardData.sections.length === 0 ? (
            <div className="flex h-[60vh] flex-col items-center justify-center">
              <Typography variant="h5" className="mb-4 text-white">
                No dashboard sections found
              </Typography>
              {isEditModeAllowed ? (
                <>
                  <Typography className="mb-4 text-white">
                    Create a new section by clicking the + button in edit mode
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setShowNewSectionDialog(true)}
                    startIcon={<AddIcon />}
                    className="bg-green-500"
                  >
                    Create Section
                  </Button>
                </>
              ) : (
                <Typography className="mb-4 text-white">
                  Dashboard content will appear here when available
                  {isAdmin && !isEditModeAllowed && (
                    <span className="mt-2 block text-sm text-gray-300">
                      Add ?view=edit to the URL to enable editing features
                    </span>
                  )}
                </Typography>
              )}
            </div>
          ) : (
            <div className="flex flex-col">{dashboardData?.sections?.map(renderSection)}</div>
          )}
        </div>
      </div>

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

          <Snackbar
            open={showSaveSuccess}
            autoHideDuration={3000}
            onClose={() => setShowSaveSuccess(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity="success" sx={{ width: '100%' }}>
              Dashboard layout saved successfully!
            </Alert>
          </Snackbar>
        </>
      )}
    </div>
  );
}
