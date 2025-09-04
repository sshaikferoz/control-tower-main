import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
} from '@mui/material';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import MappingIcon from '@mui/icons-material/Map';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import RGL, { WidthProvider } from 'react-grid-layout';
import MyContractsIcon from '@/assets/MyContractsIcon';
import { DashboardSectionProps } from '@/types/dashboard';
import { LazyWidgetContent } from '@/components/widgets/LazyWidgetContent';
import { WidgetDetailsDialog } from '@/components/dialogs/WidgetDetailsDialog';
import { DataManager } from '@/services/DataManager';
import { processWidgetMappings } from '@/helpers/transformHelpers';
import { defaultPropsMapping, widgetMapping } from '@/constants/widgetConfig';
import { Announcement } from '@mui/icons-material';

const GridLayout = WidthProvider(RGL);

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  section,
  index,
  isEditMode,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDragOver,
  onEditSection,
  onDeleteSection,
  onOpenMapping,
  onAddWidgets,
}) => {
  const [reportData, setReportData] = useState<Record<string, any>>({});
  const [widgetProps, setWidgetProps] = useState<Record<string, any>>({});
  const [loadingWidgets, setLoadingWidgets] = useState<Set<string>>(new Set());
  const [errorReports, setErrorReports] = useState<Set<string>>(new Set());
  const [visibleWidgets, setVisibleWidgets] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    return section.expanded !== undefined ? section.expanded.toLowerCase() === 'true' : true;
  });

  const [widgetDetailsDialog, setWidgetDetailsDialog] = useState({
    open: false,
    widget: null,
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const sectionRef = useRef<HTMLDivElement>(null);
  const dataManager = useMemo(() => DataManager.getInstance(), []);
  const announcementWidgets = section.widgets?.filter((w: any) => w.name === 'announcement') || [];
  const gridWidgets = section.widgets?.filter((w: any) => w.name !== 'announcement') || [];

  // Initialize widget props with saved or default values
  useEffect(() => {
    const initialWidgetProps: Record<string, any> = {};

    section.widgets?.forEach((widget: any) => {
      console.log(widget.props, 'widgetpropssss');
      if (widget.props && Object.keys(widget.props).length > 0) {
        const { configType, widgetCategory, ...cleanProps } = widget.props;
        initialWidgetProps[widget.id] = cleanProps;
      } else {
        initialWidgetProps[widget.id] = defaultPropsMapping[widget.name] || {};
      }
    });

    setWidgetProps(initialWidgetProps);
  }, [section.widgets]);

  // Handle widget visibility and trigger data loading
  const handleWidgetVisible = useCallback(
    async (widgetId: string) => {
      if (visibleWidgets.has(widgetId)) return;

      setVisibleWidgets((prev) => new Set([...prev, widgetId]));

      const widget = section.widgets?.find((w: any) => w.id === widgetId);
      if (!widget) return;

      const mappingConfig = section.fieldMappings?.[widgetId];
      if (!mappingConfig?.reportName) return;

      if (widget.props && Object.keys(widget.props).length > 0) {
        console.log(`Widget ${widgetId} already has saved props, skipping data fetch`);
        return;
      }

      const reportName = mappingConfig.reportName;

      try {
        setLoadingWidgets((prev) => new Set([...prev, widgetId]));
        setErrorReports((prev) => {
          const newSet = new Set([...prev]);
          newSet.delete(reportName);
          return newSet;
        });

        const transformedData = await dataManager.getData(reportName);
        setReportData((prev) => ({ ...prev, [reportName]: transformedData }));

        const processedProps = processWidgetMappings(widget, mappingConfig, transformedData);
        setWidgetProps((prev) => ({ ...prev, [widgetId]: processedProps }));
      } catch (error) {
        console.error(`Error loading data for widget ${widgetId}:`, error);
        setErrorReports((prev) => new Set([...prev, reportName]));
        setReportData((prev) => ({ ...prev, [reportName]: null }));
      } finally {
        setLoadingWidgets((prev) => {
          const newSet = new Set([...prev]);
          newSet.delete(widgetId);
          return newSet;
        });
      }
    },
    [visibleWidgets, section.widgets, section.fieldMappings, dataManager]
  );

  const handleWidgetExpand = (widget: any) => {
    setWidgetDetailsDialog({
      open: true,
      widget,
    });
  };

  const handleWidgetDetailsClose = () => {
    setWidgetDetailsDialog({
      open: false,
      widget: null,
    });
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  // Section menu handlers
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!isEditMode) return;
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    if (!isEditMode) return;
    handleMenuClose();
    onEditSection(section.originalSection);
  };

  const handleDeleteClick = () => {
    if (!isEditMode) return;
    handleMenuClose();
    onDeleteSection(section.originalSection);
  };

  const handleMappingClick = () => {
    if (!isEditMode) return;
    handleMenuClose();
    onOpenMapping(section.originalSection, isExpanded);
  };

  const handleAddWidgetsClick = () => {
    if (!isEditMode) return;
    onAddWidgets(section.originalSection, isExpanded);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.dataTransfer.setData('text/plain', index.toString());
    setTimeout(() => {
      if (sectionRef.current) {
        sectionRef.current.style.opacity = '0.4';
      }
    }, 0);
    onDragStart(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    onDragOver(index);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    onDragEnter(index);
  };

  const handleDragEnd = () => {
    if (!isEditMode) return;
    if (sectionRef.current) {
      sectionRef.current.style.opacity = '1';
    }
    onDragEnd();
  };

  const handleOpenReport = (targetReport: any): void => {
    if (!targetReport?.technicalId) {
      alert('No Detailed Report configured for this widget.');
      return;
    }

    let reportUrl = '';

    switch (targetReport.type) {
      case 'Bex Query':
        reportUrl = `/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${targetReport.technicalId}`;
        break;
      case 'Lumira':
        reportUrl = `/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html#LumiraViewer-display&/lumira/${targetReport.technicalId}`;
        break;
      case 'WAD Template':
        reportUrl = `/sap/bc/bsp/sap/bw_web_template/webtemplate.htm?template=${targetReport.technicalId}`;
        break;
      case 'Web Link':
        reportUrl = targetReport.technicalId;
        break;
      default:
        alert('Unknown report type.');
        return;
    }

    window.open(reportUrl, '_blank', 'noopener,noreferrer');
  };

  const otherWidgets = section.widgets?.filter((w: any) => w.name !== 'announcement') || [];

  // Merge: announcements first
  const orderedWidgets = [...announcementWidgets, ...otherWidgets];

  // Recalculate layout: announcements on top, shift others down
  const originalLayout = section.layout || [];

  let currentY = 0;
  const layout = orderedWidgets
    .map((widget) => {
      const item = originalLayout.find((l: any) => l.i === widget.id);

      if (!item) return null;

      const newItem = { ...item, y: currentY };
      currentY += item.h;

      return newItem;
    })
    .filter(Boolean); // filter out nulls in case layout was missing

  return (
    <div
      ref={sectionRef}
      draggable={isEditMode}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragEnd={handleDragEnd}
      className={`mb-8 ${
        isEditMode ? 'cursor-move rounded-lg border-2 border-dashed border-blue-300' : ''
      }`}
      data-index={index}
    >
      <div className="m-2 flex items-center gap-2 p-4">
        {isEditMode && (
          <div className="mr-2">
            <DragIndicatorIcon className="text-white" />
          </div>
        )}
        <MyContractsIcon />
        <p className="text-[#fff]">{section.sectionName}</p>
        <div className="h-px flex-grow bg-[#E8E9EE80]"></div>

        {isEditMode && (
          <>
            <IconButton
              onClick={handleMenuClick}
              size="small"
              aria-label="section actions"
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem onClick={handleEditClick}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Section</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleMappingClick}>
                <ListItemIcon>
                  <MappingIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Section Mapping</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDeleteClick}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete Section</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
        <span className="cursor-pointer text-white" onClick={toggleExpanded}>
          {isExpanded ? '▼' : '►'}
        </span>
      </div>

      {/* FIXED: Conditionally render content based on isExpanded state */}
      {isExpanded && (
        <>
          {/* 🔔 Render announcement widgets outside the grid */}
          {announcementWidgets.map((widget) => {
            const Component = widgetMapping[widget.name];
            const props = widgetProps[widget.id] || defaultPropsMapping[widget.name] || {};
            const isLoading = loadingWidgets.has(widget.id);

            if (!Component) return null;

            return (
              <div key={widget.id} className="mb-4 rounded-lg p-4 shadow-md">
                <LazyWidgetContent
                  widget={widget}
                  Component={Component}
                  props={props}
                  onVisible={() => handleWidgetVisible(widget.id)}
                  isLoading={isLoading}
                />
              </div>
            );
          })}

          {/* 🧱 GridLayout for all other widgets */}
          <GridLayout
            className="layout w-full"
            layout={layout}
            cols={12}
            rowHeight={80}
            isResizable={false}
            isDraggable={false}
          >
            {gridWidgets.map((widget: any) => {
              const Component = widgetMapping[widget.name];
              const props = widgetProps[widget.id] || defaultPropsMapping[widget.name] || {};
              const isLoading = loadingWidgets.has(widget.id);
              const hasRoles = widget.roles?.length > 0;

              if (!Component) {
                console.error(`Component not found for widget type: ${widget.name}`);
                return (
                  <div
                    key={widget.id}
                    className="bg-opacity-30 relative flex items-center justify-center rounded-lg bg-red-500"
                  >
                    <div className="p-4 text-center text-white">
                      <p>Widget type not found: {widget.name}</p>
                      <p className="mt-2 text-xs">
                        Available types: {Object.keys(widgetMapping).join(', ')}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={widget.id}
                  onClick={() =>
                    widget.name !== 'news-feed' &&
                    props.showdescription &&
                    handleOpenReport(widget.fieldMappings?.targetReport)
                  }
                  className="relative cursor-pointer rounded-lg bg-transparent shadow-md transition-shadow duration-200 hover:shadow-lg"
                >
                  {props.showdescription && (
                    <div className="absolute top-2 right-2 z-50 flex space-x-1">
                      <Tooltip
                        title={widget.description || 'No description available'}
                        enterDelay={0}
                        leaveDelay={0}
                        placement="top"
                        arrow
                      >
                        <IconButton
                          onClick={() => handleWidgetExpand(widget)}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            },
                          }}
                        >
                          <InfoIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  )}

                  <div
                    style={{
                      pointerEvents: !isEditMode ? 'none' : 'auto',
                      display: 'contents',
                    }}
                  >
                    <LazyWidgetContent
                      widget={widget}
                      Component={Component}
                      props={props}
                      onVisible={() => handleWidgetVisible(widget.id)}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              );
            })}
          </GridLayout>
        </>
      )}

      <WidgetDetailsDialog
        open={widgetDetailsDialog.open}
        onClose={handleWidgetDetailsClose}
        widget={widgetDetailsDialog.widget as any}
        targetReport={(widgetDetailsDialog.widget as any)?.fieldMappings?.targetReport || undefined}
        description={(widgetDetailsDialog.widget as any)?.description || ''}
      />
    </div>
  );
};
