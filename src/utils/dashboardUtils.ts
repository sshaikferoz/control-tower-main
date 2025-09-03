import { Section } from '@/services/sapODataService';
import { DashboardSection } from '../types/dashboard';

// Transform SAP sections to UI format
export const transformSectionsToUIFormat = (sections: Section[]): DashboardSection[] => {
  console.log('Transforming sections to UI format', sections);

  return sections?.filter((section) => !section.deleted && section.visible)
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      id: section.id,
      sectionName: section.name,
      expanded: section.expanded ? 'true' : 'false',
      layout: section.widgets?.filter((widget:any) => !widget.deleted )
        .map((widget, index) => {
          const defaultLayout = { w: 4, h: 3 };
          const savedLayout = widget.layoutConfig || {};

          return {
            i: widget.id,
            x: savedLayout.x ?? (index * defaultLayout.w) % 12,
            y: savedLayout.y ?? Math.floor((index * defaultLayout.w) / 12) * defaultLayout.h,
            w: savedLayout.w ?? defaultLayout.w,
            h: savedLayout.h ?? defaultLayout.h,
            minW: savedLayout.minW,
            maxW: savedLayout.maxW,
            minH: savedLayout.minH,
            maxH: savedLayout.maxH,
            static: savedLayout.static || false,
          };
        }),
      fieldMappings: section.widgets
        .filter((widget:any) => !widget.deleted )
        .reduce(
          (acc, widget) => {
            console.log(acc,widget,'widget--------------')
            acc[widget.id] = widget.fieldMappings || {};
            return acc;
          },
          {} as Record<string, any>
        ),
      widgets: section.widgets
        .filter((widget:any) => !widget.deleted)
        .map((widget) => ({
          id: widget.id,
          name: widget.type,
          props: widget.properties || {},
          description: widget.description || '',
          roles: widget.roles || [],
          fieldMappings: widget.fieldMappings || {},
        })),
      // Include original section data for editing
      originalSection: section,
    }));
};

// Get next section order
export const getNextSectionOrder = (sections: Section[]): number => {
  if (sections.length === 0) return 1;
  const maxOrder = Math.max(...sections.map((s) => s.order));
  return maxOrder + 1;
};

// Calculate widget grid position
export const calculateWidgetPosition = (
  index: number,
  defaultWidth = 4,
  defaultHeight = 3,
  gridCols = 12
) => {
  return {
    x: (index * defaultWidth) % gridCols,
    y: Math.floor((index * defaultWidth) / gridCols) * defaultHeight,
    w: defaultWidth,
    h: defaultHeight,
  };
};

// Validate section data
export const validateSectionData = (section: Partial<Section>): string[] => {
  const errors: string[] = [];

  if (!section.name || section.name.trim() === '') {
    errors.push('Section name is required');
  }

  if (section.name && section.name.length > 100) {
    errors.push('Section name must be less than 100 characters');
  }

  if (section.description && section.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  if (section.order !== undefined && section.order < 0) {
    errors.push('Order must be a positive number');
  }

  return errors;
};

// Sort sections by order
export const sortSectionsByOrder = (sections: Section[]): Section[] => {
  return [...sections].sort((a, b) => a.order - b.order);
};

// Find section by ID
export const findSectionById = (sections: Section[], id: string): Section | undefined => {
  return sections.find((section) => section.id === id);
};

// Filter visible sections
export const filterVisibleSections = (sections: Section[]): Section[] => {
  return sections.filter((section) => section.visible && !section.deleted);
};

// Update section order after drag and drop
export const updateSectionOrder = (
  sections: Section[],
  fromIndex: number,
  toIndex: number
): Section[] => {
  const reorderedSections = [...sections];
  const [movedSection] = reorderedSections.splice(fromIndex, 1);
  reorderedSections.splice(toIndex, 0, movedSection);

  // Update order property for all sections
  return reorderedSections.map((section, index) => ({
    ...section,
    order: index + 1,
    hasChanges: true,
  }));
};

// Check if section has unsaved changes
export const sectionHasUnsavedChanges = (section: Section): boolean => {
  return section.hasChanges === true || section.isNew === true;
};

// Format section type for display
export const formatSectionType = (type: string): string => {
  switch (type) {
    case 'SCM Report':
      return 'Supply Chain Report';
    case 'Dashboard':
      return 'Dashboard';
    case 'Analytics':
      return 'Analytics';
    case 'NewsClassifier':
      return 'News Classifier';
    default:
      return type;
  }
};

// Generate section summary
export const generateSectionSummary = (section: Section): string => {
  const widgetCount = section.widgets?.filter((w) => !w.deleted && w.active).length || 0;
  const roleCount = section.roles?.length || 0;

  let summary = `${widgetCount} widget${widgetCount !== 1 ? 's' : ''}`;

  if (roleCount > 0) {
    summary += `, ${roleCount} role${roleCount !== 1 ? 's' : ''}`;
  }

  if (!section.visible) {
    summary += ' (hidden)';
  }

  return summary;
};

// Prepare section for API submission
export const prepareSectionForSubmission = (section: Section): Section => {
  return {
    ...section,
    // Ensure required fields are present
    name: section.name.trim(),
    description: section.description?.trim() || '',
    visible: section.visible ?? true,
    deleted: section.deleted ?? false,
    order: section.order ?? 1,
    // Remove client-side only properties
    hasChanges: undefined,
    isNew: undefined,
  } as Section;
};

// Create default section
export const createDefaultSection = (tabId: string, order: number): Partial<Section> => {
  return {
    tabId,
    name: '',
    description: '',
    type: 'SCM Report',
    visible: true,
    deleted: false,
    order,
    widgets: [],
    roles: [],
    expanded: true,
    isNew: true,
    hasChanges: true,
  };
};

// Deep clone section (useful for editing without modifying original)
export const cloneSection = (section: Section): Section => {
  return JSON.parse(JSON.stringify(section));
};

// Merge section changes
export const mergeSectionChanges = (original: Section, changes: Partial<Section>): Section => {
  return {
    ...original,
    ...changes,
    hasChanges: true,
    // Preserve original ID and creation metadata
    id: original.id,
    tabId: original.tabId,
    // Handle nested objects properly
    roles: changes.roles || original.roles,
    widgets: changes.widgets || original.widgets,
  };
};
