import { ReactNode } from 'react';

export interface Report {
    id: string;
    title: string;
    icon: ReactNode;
    category: string;
}

export interface UserInfo {
    user_id: string;
    session_id: string;
    userFullName?: string;
    networkId?: string;
    lastAccessDate?: string;
    lastAccessTime?: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    visible: boolean;
    order: number;
    type: string;
    deleted: boolean;
    roles: Role[];
    isNew?: boolean;
    hasChanges?: boolean;
}

export interface Role {
    RoleId: string;
    Id: string;
    Name: string;
    Description: string;
    Type: string;
    DelFlag: string;
}

export interface AdminRoleCheckResponse {
    UserName: string;
    IsAdmin: string;
}

export type AppView = 'Dashboard' | 'mapping' | 'b2b-reports' | 'generic';

export interface AppState {
    view: AppView;
    selectedMenuItem: any;
    mappingParams?: {
        sectionName: string;
        expanded: string;
    };
}

export interface ModalState {
    isOpen: boolean;
    mode: 'add' | 'edit' | 'delete' | 'view';
    report?: Report;
    category?: string;
}

export interface SidebarModalState {
    isOpen: boolean;
    mode: 'add' | 'edit';
    item?: MenuItem;
}

export interface Report {
    id: string;
    title: string;
    icon: ReactNode;
    category: string;
    targetReport?: TargetReportConfig;
}

export interface TargetReportConfig {
    type: 'Bex Query' | 'Lumira' | 'WAD Template' | 'Web Link';
    technicalId: string;
    name: string;
    description: string;
}

export interface Section {
    id: string;
    name: string;
    description?: string;
    reports: Report[];
    createdAt: string;
}

export interface UserInfo {
    user_id: string;
    session_id: string;
    userFullName?: string;
    networkId?: string;
    lastAccessDate?: string;
    lastAccessTime?: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    visible: boolean;
    order: number;
    type: string;
    deleted: boolean;
    roles: Role[];
    isNew?: boolean;
    hasChanges?: boolean;
}

export interface Role {
    RoleId: string;
    Id: string;
    Name: string;
    Description: string;
    Type: string;
    DelFlag: string;
}

export interface AdminRoleCheckResponse {
    UserName: string;
    IsAdmin: string;
}

export interface AppState {
    view: AppView;
    selectedMenuItem: any;
    mappingParams?: {
        sectionName: string;
        expanded: string;
    };
}

export interface ModalState {
    isOpen: boolean;
    mode: 'add' | 'edit' | 'delete' | 'view';
    report?: Report;
    section?: Section;
}

export interface SectionModalState {
    isOpen: boolean;
    mode: 'add' | 'edit';
    section?: Section;
}

export interface SidebarModalState {
    isOpen: boolean;
    mode: 'add' | 'edit';
    item?: MenuItem;
}
