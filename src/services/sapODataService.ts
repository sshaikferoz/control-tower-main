// services/sapODataService.ts

import { UIConfiguration } from "@/types/configuration";

export interface Role {
    RoleId: string;
    Id: string;
    Name: string;
    Description: string;
    Type: string;
    DelFlag: string;
}

export interface TabConfigResponse {
    id: string;
    appid: string;
    name: string;
    visible: string;
    description: string;
    type: string;
    sort_order: number;
    del_ind: string;
    created_by: string;
    created_on: string;
    created_at: string;
    changed_by: string;
    changed_on: string;
    changed_at: string;
    to_roles: {
        results: Role[];
    };
}

export interface SectionResponse {
    TabId: string;
    Id: string;
    Name: string;
    IsVisible: string;
    SortOrder: number;
    DelInd: string;
    created_by: string;
    created_on: string;
    created_at: string;
    changed_by: string;
    changed_on: string;
    changed_at: string;
    Description: string;
    Type: string;
    to_roles: {
        results: Role[];
    };
}

export interface WidgetResponse {
    id: string;
    del_flag: string;
    section_id: string;
    name: string;
    type: string;
    description: string;
    layout_config: string;
    field_mappings: string;
    properties: string;
    is_active: string;
    created_by: string;
    created_on: string;
    created_at: string;
    changed_by: string;
    changed_on: string;
    changed_at: string;
    to_roles: {
        results: Role[];
    };
}

export interface TabConfigPayload {
    Id: string;
    appid: string;
    Name: string;
    IsVisible: string;
    Description: string;
    Type: string;
    SortOrder: number;
    DelInd: string;
    Crudflag: string;
    // RolesItemSet: Role[];
    TabRolesItem: Role[];
}

export interface SectionPayload {
    Id: string;
    TabId: string;
    Name: string;
    IsVisible: string;
    Description: string;
    Type: string;
    SortOrder: number;
    DelInd: string;
    Crudflag: string;
    RolesSecItem: Role[];
}

export interface WidgetPayload {
    Id: string;
    SectionId: string;
    Name: string;
    Description: string;
    Type: string;
    LayoutConfig: string;
    FieldMappings: string;
    Properties: string;
    IsActive: string;
    DelFlag: string;
    Crudflag: string;
    RolesWidgetItem: Role[];
}

// New interfaces for the WidgetsHeadSet endpoint
export interface WidgetHeadItem {
    Id: string;
    SectionId: string;
    Name: string;
    Type: string;
    Description: string;
    LayoutConfig: string;
    FieldMappings: string;
    Properties: string;
    IsActive: string;
    SortOrder: number;
    DelFlag: string;
    CrudFlag: string;
}

export interface WidgetHeadRole {
    RoleId: string;
    Id: string; // associated_widget_id
    Name: string;
    Description: string;
    Type: string;
}

export interface WidgetHeadPayload {
    Id: string;
    CrudFlag: string;
    // headtowidget: WidgetHeadItem[];
    // HeadtoRoles: WidgetHeadRole[];
    WidgetHeadToConf: WidgetHeadItem[];
    WidgetHeadRolesItem: WidgetHeadRole[];
}

// New interfaces for ServiceUrlsSet endpoint
export interface ServiceUrl {
    Id: string;
    FullUrl: string;
}

export interface ServiceUrlsResponse {
    results: ServiceUrl[];
}

/** Single item for UpdatebyActionSet sort order (To_SortOrder). */
export interface SortOrderItem {
    Id: string;
    SortOrd: string;
}

/** Payload for UpdatebyActionSet when Action is SORTORDER. To_SortOrder accepts single object or array. */
export interface UpdatebyActionSetSortOrderPayload {
    Action: 'SORTORDER';
    To_SortOrder: SortOrderItem | SortOrderItem[];
}

export interface MenuItem {
    id: string;
    appid: string;
    name: string;
    description: string;
    visible: boolean;
    order: number;
    type: string;
    deleted: boolean;
    roles: Role[];
    // Additional fields for UI state
    isNew?: boolean;
    hasChanges?: boolean;
}

export interface Section {
    id: string;
    tabId: string;
    name: string;
    visible: boolean;
    order: number;
    description: string;
    type: string;
    deleted: boolean;
    roles: Role[];
    widgets: Widget[];
    /** Icon filename from DASHBOARD_MENU_ICONS (e.g. "dashboard-icon.png") */
    icon?: string;
    // Additional fields for UI state
    isNew?: boolean;
    hasChanges?: boolean;
    expanded?: boolean;
}

export interface Widget {
    description: string;
    id: string;
    sectionId: string;
    name: string;
    type: string;
    layoutConfig: any;
    fieldMappings: any;
    properties: any;
    active: boolean;
    deleted: boolean;
    roles: Role[];
    // Additional fields for UI state
    isNew?: boolean;
    hasChanges?: boolean;
}

// Interface for layout data from MappingScreen
export interface LayoutWidget {
    active: any;
    deleted: any;
    id: string;
    name: string;
    Description: string;
    props: any;
    roles?: string[];
    widgetType: string;
}

export interface LayoutItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    static: boolean;
    sectionName?: string;
}

export interface LayoutData {
    sectionName: string;
    layout: LayoutItem[];
    fieldMappings: any;
    widgets: LayoutWidget[];
    expanded?: string;
}


export interface NewsItem {
    CONTENT: string;
    DATEPUBLISHED: string;
    DATECLASSIFIED: string;
    LABEL: string;
    LINK: string;
    TITLE: string;
    BRIEF: string;
    ID: number;
    REGION: string;
}
export interface SettingsResponse {
    Id: string;
    TabId: string;
    IsVisible: string;
    Crudflag: string;
    ConfigJson: string;
    CreatedBy: string;
    CreatedOn: string;
    CreatedAt: string;
    ChangedBy: string;
    ChangedOn: string;
    ChangedAt: string;
}

export interface SettingsPayload {
    Id: string;
    Crudflag: string;
    CreatedBy: string;
    CreatedOn: string;
    CreatedAt: string;
    ChangedBy: string;
    ChangedOn: string;
    ConfigJson: string;
    IsVisible: string;
    TabId: string;
}

export interface NewsFeedResponse {
    result: NewsItem[];
}

export interface AdminRoleCheckResponse {
    UserName: string;
    IsAdmin: string;
}

export interface UserRoleResponseItem {
    UserName: string;
    RoleName: string;
}

export interface UIConfigEntry {
    Id?: string;
    ConfigName: string;
    ConfigJson: string;
}

class SAPODataService {
    private baseUrl =
        process.env.NODE_ENV === 'development'
            ? 'https://ctapitester-a4mel9cxg6.dispatcher.sa1.hana.ondemand.com/sap/opu/odata/sap/ZBW_CT_SCIC_SRV'
            : '/sap/opu/odata/sap/ZBW_CT_SCIC_SRV';

    // Cache for service URLs to avoid repeated API calls
    private serviceUrlsCache: Map<string, string> = new Map();
    private serviceUrlsCacheTime: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Deduplicate in-flight GET requests (e.g. from React Strict Mode double-mount)
    private inFlightGet: Map<string, Promise<any>> = new Map();

    /**
     * GET request with deduplication: identical concurrent requests share one promise.
     */
    private async dedupedGetJson<T = any>(url: string): Promise<T> {
        const existing = this.inFlightGet.get(url);
        if (existing) return existing as Promise<T>;
        const promise = (async () => {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })();
        this.inFlightGet.set(url, promise);
        promise.finally(() => this.inFlightGet.delete(url));
        return promise as Promise<T>;
    }

    // private baseUrl =
    // process.env.NODE_ENV === 'development'
    //   ? 'https://ctapitester-a4mel9cxg6.dispatcher.sa1.hana.ondemand.com/sap/opu/odata/sap/ZBW_CT_SCIC_SRV'
    //   : '/sap/opu/odata/sap/ZBW_CT_SCIC_SRV';

    // Fetch all menu items

    async fetchMenuItems(): Promise<any[]> {
        try {
            const url = `${this.baseUrl}/TabConfSet?&$expand=TabRolesItem&$format=json&`;
            const data = await this.dedupedGetJson<{ d: { results: any[] } }>(url);

            return data.d.results.map(
                (item: any): MenuItem => ({
                    id: item.Id,
                    appid: item.appid || '',
                    name: item.Name,
                    description: item.Description,
                    visible: item.IsVisible === 'X',
                    order: item.SortOrder,
                    type: item.Type,
                    deleted: item.del_ind === 'X',
                    roles: item.TabRolesItem.results || [],
                    isNew: false,
                    hasChanges: false,
                })
            );
        } catch (error) {
            throw error;
        }
    }

    // Fetch sections for a specific tab
    async fetchSectionsByTabId(tabId: string): Promise<Section[]> {
        try {
            const url = `${this.baseUrl}/SectionConfSet?$filter=TabId eq '${tabId}'&$expand=RolesSecItem&$format=json&`;
            const data = await this.dedupedGetJson<{ d: { results: any[] } }>(url);

            const sections = data.d.results.map(
                (item: any): Section => {
                    // Extract roles from RolesSecItem.results (plural)
                    const roles = item.RolesSecItem?.results || [];

                    // Map roles to the expected format
                    const formattedRoles = roles.map((role: any) => ({
                        RoleId: role.RoleId || '',
                        Id: role.Id || item.Id || '',
                        Name: role.Name || '',
                        Description: role.Description || '',
                        Type: role.Type || 'Custom',
                        DelFlag: role.DelFlag || '',
                    }));

                    return {
                        id: item.Id,
                        tabId: item.TabId,
                        name: item.Name,
                        visible: item.IsVisible === 'X',
                        order: item.SortOrder,
                        description: item.Description,
                        type: item.Type,
                        icon: item.Type || undefined, // Type field stores icon name in SectionConfSet
                        deleted: item.DelInd === 'X',
                        roles: formattedRoles,
                        widgets: [], // Will be populated separately
                        isNew: false,
                        hasChanges: false,
                        expanded: item.IsVisible === 'X',
                    };
                }
            );

            // Fetch widgets for each section
            for (const section of sections) {
                section.widgets = await this.fetchWidgetsBySectionId(section.id);
            }

            return sections;
        } catch (error) {
            throw error;
        }
    }

    // Fetch widgets for a specific section
    async fetchWidgetsBySectionId(sectionId: string): Promise<Widget[]> {
        try {
            const url = `${this.baseUrl}/WidgetConfSet?$filter=SectionId eq '${sectionId}'&$expand=WidgetConfRolesItem&$format=json`;
            const data = await this.dedupedGetJson<{ d: { results: any[] } }>(url);


            return data.d.results?.map(
                (item: any): any => ({
                    id: item.Id,
                    sectionId: item.SectionId,
                    name: item.Name,
                    type: item.Type,
                    description: item.Description || '',
                    layoutConfig: this.safeJsonParse(item.LayoutConfig),
                    fieldMappings: this.safeJsonParse(item.FieldMappings),
                    properties: this.safeJsonParse(item.Properties),
                    active: item.IsActive === 'X',
                    deleted: item.DelFlag === 'X',
                    roles: item.WidgetConfRolesItem?.results || [],
                    isNew: false,
                    hasChanges: false,
                })
            );
        } catch (error) {
            throw error;
        }
    }

    // NEW: Fetch service URLs from ServiceUrlsSet endpoint
    async fetchServiceUrls(): Promise<Map<string, string>> {
        try {
            const response = await fetch(
                `${this.baseUrl}/ServiceUrlsSet?$format=json`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const serviceUrlsMap = new Map<string, string>();

            data.d.results.forEach((item: ServiceUrl) => {
                serviceUrlsMap.set(item.Id, item.FullUrl);
            });

            return serviceUrlsMap;
        } catch (error) {
            throw error;
        }
    }

    // NEW: Get specific service URL with caching
    async getServiceUrl(serviceType: string): Promise<string | null> {
        try {
            const now = Date.now();

            // Check if cache is valid and contains the requested service type
            if (this.serviceUrlsCache.has(serviceType) &&
                (now - this.serviceUrlsCacheTime) < this.CACHE_DURATION) {
                return this.serviceUrlsCache.get(serviceType) || null;
            }

            // If cache is expired or doesn't contain the service type, fetch all URLs
            if ((now - this.serviceUrlsCacheTime) > this.CACHE_DURATION || this.serviceUrlsCache.size === 0) {
                const serviceUrlsMap = await this.fetchServiceUrls();
                this.serviceUrlsCache = serviceUrlsMap;
                this.serviceUrlsCacheTime = now;
            }

            return this.serviceUrlsCache.get(serviceType) || null;
        } catch (error) {
            return null;
        }
    }

    // Fetch a specific menu item by ID
    async fetchMenuItemById(itemId: string): Promise<MenuItem> {
        try {
            const response = await fetch(
                // `${this.baseUrl}/ZSCM_CT_V_TABS?$expand=to_roles&$format=json&$filter=id eq '${itemId}'`,
                `${this.baseUrl}/TabConfSet?$filter=Id eq '${itemId}'&$expand=TabRolesItem&$format=json&`,

                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Handle both single result and results array
            const item = data.d.results?.[0] || data.d;

            return {
                id: item.Id,
                appid: item.appid || '',
                name: item.Name,
                description: item.Description,
                visible: item.IsVisible === 'X',
                order: item.SortOrder,
                type: item.Type,
                deleted: item.del_ind === 'X',
                roles: item.TabRolesItem?.results || item.TabRolesItem || [],
                isNew: false,
                hasChanges: false,
            };
        } catch (error) {
            throw error;
        }
    }

    // Create or update menu item
    async saveMenuItem(menuItem: MenuItem, isUpdate: boolean = false): Promise<MenuItem> {
        try {
            // Prepare roles with empty IDs for new roles
            const rolesForPayload = menuItem.roles.map((role) => ({
                Description: role.Description,
                Type: role.Type,
                Name: role.Name,
                DelFlag: role.DelFlag,
                RoleId: role.RoleId ? role.RoleId : '', // Empty for new roles
                Id: menuItem.id, // Empty for new roles
            }));

            const payload: TabConfigPayload = {
                Id: isUpdate ? menuItem.id : '', // Empty for new items
                appid: menuItem.appid,
                Name: menuItem.name,
                IsVisible: menuItem.visible ? 'X' : '',
                Description: menuItem.description,
                Type: menuItem.type,
                // SortOrder: menuItem.order,
                SortOrder: menuItem.order,
                DelInd: menuItem.deleted ? 'X' : '',
                Crudflag: isUpdate ? 'U' : 'C',
                // RolesItemSet: rolesForPayload,
                TabRolesItem: rolesForPayload,
            };

            const newCSRFToken = await this.getNewCsrfToken(`${this.baseUrl}/TabConfSet`);
            const response = await fetch(`${this.baseUrl}/TabConfSet`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': newCSRFToken,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            const generatedId = result.d?.Id || menuItem.id;

            // Always fetch the complete updated item to get RoleIds for newly added roles
            if (generatedId) {
                // Wait a bit for the server to process
                await new Promise((resolve) => setTimeout(resolve, 500));

                try {
                    const updatedItem = await this.fetchMenuItemById(generatedId);
                    return {
                        ...updatedItem,
                        isNew: false,
                        hasChanges: false,
                    };
                } catch (fetchError) {
                    // Fallback to constructing from response and original data
                    return {
                        ...menuItem,
                        id: generatedId,
                        isNew: false,
                        hasChanges: false,
                    };
                }
            }

            // Fallback if no ID was generated
            return {
                ...menuItem,
                id: generatedId || menuItem.id,
                isNew: false,
                hasChanges: false,
            };
        } catch (error) {
            throw error;
        }
    }

    // Create or update section
    async saveSection(section: Section, isUpdate: boolean = false): Promise<Section> {
        try {
            // Prepare roles with proper IDs for updates
            const rolesForPayload = section.roles.map((role) => ({
                DelFlag: role.DelFlag || '',
                RoleId: isUpdate && role.RoleId ? role.RoleId : '', // Keep existing RoleId for updates, empty for new roles
                Id: section.id, // Always use the section ID
                Name: role.Name,
                Description: role.Description,
                Type: role.Type,
            }));

            const payload: SectionPayload = {
                Id: isUpdate ? section.id : '', // Empty for new items
                TabId: section.tabId,
                Name: section.name,
                IsVisible: section.visible ? 'X' : '',
                Description: section.description,
                Type: section.icon || section.type || '', // Store icon in Type field for SectionConfSet
                SortOrder: section.order,
                DelInd: section.deleted ? 'X' : '',
                Crudflag: isUpdate ? 'U' : 'C',
                RolesSecItem: rolesForPayload,
            };

            const newCSRFToken = await this.getNewCsrfToken(`${this.baseUrl}/SectionConfSet`);
            const response = await fetch(`${this.baseUrl}/SectionConfSet`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': newCSRFToken,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            const generatedId = result.d?.Id || section.id;

            // If we got a new ID, fetch the complete updated item
            if (generatedId && generatedId !== section.id) {
                // Wait a bit for the server to process
                await new Promise((resolve) => setTimeout(resolve, 500));

                try {
                    const updatedSections = await this.fetchSectionsByTabId(section.tabId);
                    const updatedSection = updatedSections.find((s) => s.id === generatedId);
                    if (updatedSection) {
                        return {
                            ...updatedSection,
                            isNew: false,
                            hasChanges: false,
                        };
                    }
                } catch (fetchError) {
                    // Fallback to constructing from response and original data
                }

                // Fallback to constructing from response and original data
                return {
                    ...section,
                    id: generatedId,
                    isNew: false,
                    hasChanges: false,
                };
            }

            // For updates, return the original section with updated state
            return {
                ...section,
                id: generatedId,
                isNew: false,
                hasChanges: false,
            };
        } catch (error) {
            throw error;
        }
    }

    // NEW: Save widgets using the WidgetsHeadSet endpoint
    async saveWidgetLayout(layoutData: LayoutData, sectionId: string): Promise<any> {
        try {
            // Prepare all widgets for a single request
            const allWidgets: WidgetHeadItem[] = [];
            const allRoles: WidgetHeadRole[] = [];

            // Process each widget and collect all widgets and roles
            for (let i = 0; i < layoutData.widgets.length; i++) {
                const widget = layoutData.widgets[i];
                const layoutConfig = layoutData.layout.find((l) => l.i === widget.id);
                const fieldMapping = layoutData.fieldMappings[widget.id];

                // Prepare the widget item
                const widgetItem: WidgetHeadItem = {
                    Id: widget.id.replace('widget-', ''),
                    SectionId: sectionId,
                    Name: widget.name || widget.widgetType,
                    Type: widget.widgetType,
                    Description: widget.Description || '',
                    LayoutConfig: JSON.stringify(layoutConfig || {}),
                    FieldMappings: JSON.stringify(fieldMapping || {}),
                    Properties: JSON.stringify(widget.props || {}),
                    IsActive: widget.active ? 'X' : '',
                    SortOrder: i + 1,
                    DelFlag: widget.deleted ? 'X' : '', // Set DelFlag based on deleted status
                    CrudFlag: widget.deleted ? 'D' : 'C', // Use 'D' for delete operation
                };

                // Add widget to the collection
                allWidgets.push(widgetItem);
                // Prepare roles for this widget and add to all roles collection
                const widgetRoles: WidgetHeadRole[] = (widget.roles || [])
                    .map((role: any) => {
                        // Handle both string and object formats
                        const isRoleObject = typeof role === 'object';
                        const roleName = isRoleObject ? role.Name : role;
                        const existingRoleId = isRoleObject ? (role.RoleId || '') : '';
                        const isDeleted = isRoleObject ? (role.DelFlag === 'X') : false;

                        // Skip deleted roles that are new (no RoleId)
                        if (isDeleted && !existingRoleId) {
                            return null;
                        }

                        return {
                            RoleId: existingRoleId, // Keep existing RoleId if present, empty for new roles
                            Id: widget.id.replace('widget-', ''), // associated_widget_id
                            Name: roleName,
                            Description: isRoleObject ? (role.Description || `${roleName} role`) : `${roleName} role`,
                            Type: isRoleObject ? (role.Type || 'Custom') : 'Custom',
                            DelFlag: isDeleted ? 'X' : '', // Set DelFlag for deleted roles
                        };
                    })
                    .filter(Boolean) as WidgetHeadRole[]; // Remove null entries

                // Add all roles from this widget to the collection
                allRoles.push(...widgetRoles);
            }

            // Create single payload with all widgets and all roles
            const payload: WidgetHeadPayload = {
                Id: '',
                CrudFlag: 'U',
                // headtowidget: allWidgets,
                // HeadtoRoles: allRoles,
                WidgetHeadToConf: allWidgets,
                WidgetHeadRolesItem: allRoles,
            };

            // Get CSRF token and make the single request
            const newCSRFToken = await this.getNewCsrfToken(`${this.baseUrl}/WidgetHeadSet`);
            const response = await fetch(`${this.baseUrl}/WidgetHeadSet`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': newCSRFToken,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();

            return result;
        } catch (error) {
            throw error;
        }
    }
    // Delete menu item (soft delete by setting DelInd)
    async deleteMenuItem(menuItem: MenuItem): Promise<void> {
        try {
            const rolesForPayload = menuItem.roles.map((role) => ({
                Description: role.Description,
                Type: role.Type,
                Name: role.Name,
                DelFlag: role.DelFlag,
                RoleId: role.RoleId,
                Id: menuItem.id, // Empty for new roles
            }));

            const payload: TabConfigPayload = {
                Id: menuItem.id,
                appid: menuItem.appid,
                Name: menuItem.name,
                IsVisible: menuItem.visible ? 'X' : '',
                Description: menuItem.description,
                Type: menuItem.type,
                SortOrder: menuItem.order,
                DelInd: 'X', // Mark as deleted
                Crudflag: 'U', // Update operation
                // RolesItemSet: rolesForPayload,
                TabRolesItem: rolesForPayload,
            };

            const newCSRFToken = await this.getNewCsrfToken(`${this.baseUrl}/TabConfSet`);
            const response = await fetch(`${this.baseUrl}/TabConfSet`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': newCSRFToken,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
        } catch (error) {
            throw error;
        }
    }

    // Delete section (soft delete by setting DelInd)
    async deleteSection(section: Section): Promise<void> {
        try {
            const payload: SectionPayload = {
                Id: section.id,
                TabId: section.tabId,
                Name: section.name,
                IsVisible: section.visible ? 'X' : '',
                Description: section.description,
                Type: section.icon || section.type || '', // Store icon in Type field for SectionConfSet
                SortOrder: section.order,
                DelInd: 'X', // Mark as deleted
                Crudflag: 'U', // Update operation
                RolesSecItem: section.roles || [],
            };

            const newCSRFToken = await this.getNewCsrfToken(`${this.baseUrl}/SectionConfSet`);
            const response = await fetch(`${this.baseUrl}/SectionConfSet`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': newCSRFToken,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update menu items sort order via UpdatebyActionSet.
     * To_SortOrder accepts a single object or array of objects.
     * Call this when the user reorders sidebar items.
     */
    async updateMenuItemsSortOrder(
        items: SortOrderItem | SortOrderItem[]
    ): Promise<void> {
        const list = Array.isArray(items) ? items : [items];
        if (list.length === 0) return;

        const payload: UpdatebyActionSetSortOrderPayload = {
            Action: 'SORTORDER',
            To_SortOrder: list.length === 1 ? list[0] : list,
        };

        const newCSRFToken = await this.getNewCsrfToken(
            `${this.baseUrl}`
        );
        const response = await fetch(`${this.baseUrl}/UpdatebyActionSet`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-Token': newCSRFToken,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `UpdatebyActionSet (SORTORDER) failed: ${response.status}, ${errorText}`
            );
        }
    }

    // Batch update multiple sections (for reordering)
    async batchUpdateSections(sections: Section[]): Promise<Section[]> {
        try {
            const results: Section[] = [];

            // Process each section sequentially to maintain order
            for (const section of sections) {
                if (section.hasChanges || section.isNew) {
                    const result = await this.saveSection(section, !section.isNew);
                    results.push(result);
                } else {
                    results.push(section);
                }
            }

            return results;
        } catch (error) {
            throw error;
        }
    }

    // Generate a new GUID for new items (SAP format) - but this won't be used in payloads
    generateGUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            })
            .replace(/-/g, '')
            .toUpperCase()
            .padStart(32, '0');
    }

    async getNewCsrfToken(url: string): Promise<any> {
        const response = await fetch(url, {
            headers: {
                'X-CSRF-Token': 'Fetch',
                credentials: 'same-origin',
            },
        });
        return response.headers.get('x-csrf-token');
    }

    // Helper method to safely parse JSON strings
    private safeJsonParse(jsonString: string): any {
        try {
            return jsonString ? JSON.parse(jsonString) : {};
        } catch (error) {
            return {};
        }
    }

    // Fetch news feed from the news classifier API
    async fetchNewsFeed(): Promise<NewsItem[]> {
        try {
            const response = await fetch(
                'https://news-classifier-prw.cml.apps.cdp-ds-prod.aramco.com/news_classifier',
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: NewsFeedResponse = await response.json();

            return data.result || [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Check if the current user has admin role
     * @param userName Optional username, if not provided it will check current user
     * @returns Promise<boolean> - true if user is admin, false otherwise
     */
    async checkAdminRole(): Promise<boolean> {
        try {
            const url = `${this.baseUrl}/ZSCM_CT_V_ADMIN_ROLE_CHECK?$format=json`;
            const data = await this.dedupedGetJson<{ d: { results: AdminRoleCheckResponse[] } }>(url);

            // Check if results exist and if IsAdmin flag is set
            if (data.d.results && data.d.results.length > 0) {
                const adminCheck: AdminRoleCheckResponse = data.d.results[0];
                return adminCheck.IsAdmin === 'X';
            }

            // If no results, user is not admin
            return false;
        } catch (error) {
            // In case of error, default to non-admin for security
            return false;
        }
    }

    /**
     * Fetch all roles for the current user from GetRolesSet.
     * Returns an array of role name strings (e.g. "BA:BW:DASHBOARD_ADMIN").
     */
    async fetchCurrentUserRoles(): Promise<string[]> {
        try {
            const url = `${this.baseUrl}/GetRolesSet?$format=json`;
            const data = await this.dedupedGetJson<{ d: { results: UserRoleResponseItem[] } }>(url);

            if (!data?.d?.results) {
                return [];
            }

            return data.d.results
                .map((item) => item.RoleName)
                .filter((name): name is string => typeof name === 'string' && !!name.trim());
        } catch {
            // In case of error, return empty list so that non-admin users
            // will effectively see only items without role restrictions.
            return [];
        }
    }

    /**
     * Fetch current user profile (UserProfileSet). Deduplicated with other GETs.
     */
    async fetchUserProfile(): Promise<{
        UserName?: string;
        UserFullName?: string;
        LastAccessDate?: string;
        LastAccessTime?: string;
    } | null> {
        try {
            const url = `${this.baseUrl}/UserProfileSet('')?$format=json`;
            const data = await this.dedupedGetJson<{ d?: { UserName?: string; UserFullName?: string; LastAccessDate?: string; LastAccessTime?: string } }>(url);
            return data?.d ?? null;
        } catch {
            return null;
        }
    }

    /**
     * Fetch UI configuration settings for a specific tab
     */
    async fetchSettingsByTabId(tabId: string): Promise<UIConfiguration | null> {
        try {
            const url = `${this.baseUrl}/SettingsSet?$filter=TabId eq '${tabId}'&$format=json`;
            const data = await this.dedupedGetJson<{ d: { results: any[] } }>(url);

            if (data.d.results && data.d.results.length > 0) {
                const settingsData: SettingsResponse = data.d.results[0];

                // Parse the ConfigJson string to get the actual configuration
                try {
                    const configJson = this.safeJsonParse(settingsData.ConfigJson);

                    // Check if configJson is an empty object and return null if so
                    if (configJson && typeof configJson === 'object' && Object.keys(configJson).length === 0) {
                        return null;
                    }
                    return {
                        ...configJson,
                        _metadata: {
                            id: settingsData.Id,
                            tabId: settingsData.TabId,
                            isVisible: settingsData.IsVisible === 'X',
                        }
                    };
                } catch (parseError) {
                    return null;
                }
            }

            // No settings found for this tab
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Save UI configuration settings for a specific tab
     */
    async saveSettings(tabId: string, configuration: UIConfiguration, existingId?: string): Promise<UIConfiguration> {
        try {
            const isUpdate = !!existingId;

            // Remove metadata from configuration before saving
            const configToSave = { ...configuration };
            delete (configToSave as any)._metadata;

            const payload: SettingsPayload = {
                Id: isUpdate ? existingId : '', // Empty for new settings
                Crudflag: isUpdate ? 'U' : 'C',
                CreatedBy: '',
                CreatedOn: '',
                CreatedAt: '',
                ChangedBy: '',
                ChangedOn: '',
                ConfigJson: JSON.stringify(configToSave),
                IsVisible: 'X',
                TabId: tabId,
            };

            const newCSRFToken = await this.getNewCsrfToken(`${this.baseUrl}/SettingsSet`);
            const response = await fetch(`${this.baseUrl}/SettingsSet`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': newCSRFToken,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            const savedId = result.d?.Id || existingId;

            // Return the configuration with updated metadata
            return {
                ...configToSave,
                _metadata: {
                    id: savedId,
                    tabId: tabId,
                    isVisible: true,
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get settings ID for a specific tab (helper method)
     */
    async getSettingsId(tabId: string): Promise<string | null> {
        try {
            const response = await fetch(
                `${this.baseUrl}/SettingsSet?$filter=TabId eq '${tabId}'&$format=json&$select=Id`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            if (data.d.results && data.d.results.length > 0) {
                return data.d.results[0].Id === '00000000000000000000000000000000' ? null : data.d.results[0].Id;
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Fetch UI configuration by ConfigName from UIConfigSet
     */
    async fetchUIConfig(configName: string): Promise<Record<string, any> | null> {
        try {
            const url = `${this.baseUrl}/UIConfigSet?$format=json`;
            const data = await this.dedupedGetJson<{ d?: { results?: UIConfigEntry[] } }>(url);
            const results: UIConfigEntry[] = data?.d?.results || [];

            // Filter by ConfigName in JavaScript
            const entry = results.find((item) => item.ConfigName === configName);

            if (!entry) {
                return null;
            }

            const parsed = this.safeJsonParse(entry.ConfigJson);
            return {
                ...parsed,
                _metadata: {
                    id: entry.Id,
                    configName: entry.ConfigName,
                },
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Save UI configuration to UIConfigSet
     */
    async saveUIConfig(
        configName: string,
        configuration: Record<string, any>,
        existingConfigName?: string
    ): Promise<Record<string, any>> {
        try {
            const isUpdate = !!existingConfigName;
            const payload = {
                ConfigName: configName,
                ConfigJson: JSON.stringify(configuration),
            };

            const newCSRFToken = await this.getNewCsrfToken(`${this.baseUrl}/UIConfigSet`);
            const encodedName = encodeURIComponent(configName);
            const url = isUpdate
                ? `${this.baseUrl}/UIConfigSet(ConfigName='${encodedName}')`
                : `${this.baseUrl}/UIConfigSet`;

            const response = await fetch(url, {
                method: isUpdate ? 'PUT' : 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': newCSRFToken,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = response.status === 204 ? null : await response.json();
            const savedId = result?.d?.Id || existingConfigName || '';

            return {
                ...configuration,
                _metadata: {
                    id: savedId,
                    configName,
                },
            };
        } catch (error) {
            throw error;
        }
    }

}

export const sapODataService = new SAPODataService();