import { UIConfiguration } from './configuration';

export interface HomeProps {
  selectedMenuItemId?: string;
  isAdmin?: boolean;
  isEditModeAllowed?: boolean;
  configuration?: UIConfiguration;
  onOpenConfigDialog?: () => void;
}

export interface TargetReportConfig {
  type: 'Bex Query' | 'Lumira' | 'WAD Template' | 'Web Link';
  technicalId: string;
  name: string;
  description: string;
}

export interface DashboardSection {
  id: string;
  sectionName: string;
  expanded: string;
  layout: any[];
  fieldMappings: Record<string, any>;
  widgets: any[];
  originalSection: any;
}

export interface DashboardData {
  sections: DashboardSection[];
}

export interface DashboardSectionProps {
  section: DashboardSection;
  index: number;
  isAdmin?: boolean;
  isEditMode: boolean;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  onDragOver: (index: number) => void;
  onEditSection: (section: any) => void;
  onDeleteSection: (section: any) => void;
  onOpenMapping: (section: any, isExpanded: boolean) => void;
  onAddWidgets: (section: any, isExpanded: boolean) => void;
}
