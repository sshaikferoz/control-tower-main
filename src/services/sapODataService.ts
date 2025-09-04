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

export interface MenuItem {
    id: string;
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

class SAPODataService {
    private baseUrl =
        process.env.NODE_ENV === 'development'
            ? 'https://ctapitester-a4mel9cxg6.dispatcher.sa1.hana.ondemand.com/sap/opu/odata/sap/ZBW_CT_SCIC_SRV'
            : '/sap/opu/odata/sap/ZBW_CT_SCIC_SRV';



    // private baseUrl =
    // process.env.NODE_ENV === 'development'
    //   ? 'https://ctapitester-a4mel9cxg6.dispatcher.sa1.hana.ondemand.com/sap/opu/odata/sap/ZBW_CT_SCIC_SRV'
    //   : '/sap/opu/odata/sap/ZBW_CT_SCIC_SRV';

    // Fetch all menu items

    async fetchMenuItems(): Promise<any[]> {
        try {
            const response = await fetch(
                // `${this.baseUrl}/ZSCM_CT_V_TABS?$expand=to_roles&$format=json&$filter=id eq '${itemId}'`,
                `${this.baseUrl}/TabConfSet?&$expand=TabRolesItem&$format=json&`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return data.d.results.map(
                (item: any): MenuItem => ({
                    id: item.Id,
                    name: item.Name,
                    description: item.Description,
                    visible: item.IsVisible === 'X',
                    order: item.sort_order,
                    type: item.Type,
                    deleted: item.del_ind === 'X',
                    roles: item.TabRolesItem.results || [],
                    isNew: false,
                    hasChanges: false,
                })
            );
        } catch (error) {
            console.error('Error fetching menu items:', error);
            throw error;
        }
    }

    // Fetch sections for a specific tab
    async fetchSectionsByTabId(tabId: string): Promise<Section[]> {
        try {
            const response = await fetch(
                // `${this.baseUrl}/ZSCM_CT_V_SECTION?$expand=to_roles&$format=json&$filter=TabId eq '${tabId}'&orderby=sort_order`,
                `${this.baseUrl}/SectionConfSet?$filter=TabId eq '${tabId}'&$expand=RolesSecItem&$format=json&`,
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

            const sections = data.d.results.map(
                (item: any): Section => ({
                    id: item.Id,
                    tabId: item.TabId,
                    name: item.Name,
                    visible: true,
                    order: item.SortOrder,
                    description: item.Description,
                    type: item.Type,
                    deleted: item.DelInd === 'X',
                    roles: item.RolesSecItem?.result || [],
                    widgets: [], // Will be populated separately
                    isNew: false,
                    hasChanges: false,
                    expanded: item.IsVisible === 'X',
                })
            );

            // Fetch widgets for each section
            for (const section of sections) {
                section.widgets = await this.fetchWidgetsBySectionId(section.id);
            }

            return sections;
        } catch (error) {
            console.error('Error fetching sections:', error);
            throw error;
        }
    }

    // Fetch widgets for a specific section
    async fetchWidgetsBySectionId(sectionId: string): Promise<Widget[]> {
        try {
            const response = await fetch(
                // `${this.baseUrl}/ZSCM_CT_V_WIDGETS?$expand=to_roles&$format=json&$filter=section_id%20eq%20%27${sectionId}%27`,
                `${this.baseUrl}/WidgetConfSet?$filter=SectionId eq '${sectionId}'&$expand=WidgetConfRolesItem&$format=json`,

                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log("fetchwidgettriggered", response)


            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("fetchwidgettriggered-------", response, data)
            console.log(data.d.results, '----------------------------')


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
            console.error('Error fetching widgets:', error);
            throw error;
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
            const item = data.d;

            return {
                id: item.id,
                name: item.name,
                description: item.description,
                visible: item.is_visible === 'X',
                order: item.sort_order,
                type: item.type,
                deleted: item.del_ind === 'X',
                roles: item.to_roles.results || [],
                isNew: false,
                hasChanges: false,
            };
        } catch (error) {
            console.error('Error fetching menu item by ID:', error);
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
                RoleId: isUpdate && role.RoleId ? role.RoleId : '', // Empty for new roles
                Id: menuItem.id, // Empty for new roles
            }));

            const payload: TabConfigPayload = {
                Id: isUpdate ? menuItem.id : '', // Empty for new items
                Name: menuItem.name,
                IsVisible: menuItem.visible ? 'X' : '',
                Description: menuItem.description,
                Type: menuItem.type,
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
            console.log('odata result after generation', result);
            const generatedId = result.d?.Id || menuItem.id;

            // If we got a new ID, fetch the complete updated item
            if (generatedId && generatedId !== menuItem.id) {
                console.log(`Generated new ID: ${generatedId}, fetching updated item...`);

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
                    console.warn('Failed to fetch updated item, using response data:', fetchError);
                    // Fallback to constructing from response and original data
                    return {
                        ...menuItem,
                        id: generatedId,
                        isNew: false,
                        hasChanges: false,
                    };
                }
            }

            // For updates, return the original item with updated state
            return {
                ...menuItem,
                id: generatedId,
                isNew: false,
                hasChanges: false,
            };
        } catch (error) {
            console.error('Error saving menu item:', error);
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
                Type: section.type,
                SortOrder: section.order,
                DelInd: section.deleted ? 'X' : '',
                Crudflag: isUpdate ? 'U' : 'C',
                RolesSecItem: rolesForPayload,
            };

            console.log('Section payload for', isUpdate ? 'update' : 'create', ':', payload);

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
            console.log('Section odata result after', isUpdate ? 'update' : 'creation', result);
            const generatedId = result.d?.Id || section.id;

            // If we got a new ID, fetch the complete updated item
            if (generatedId && generatedId !== section.id) {
                console.log(`Generated new section ID: ${generatedId}, fetching updated item...`);

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
                    console.warn('Failed to fetch updated section, using response data:', fetchError);
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
            console.error('Error saving section:', error);
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
                console.log('widget id', widget.id);

                // Prepare the widget item
                const widgetItem: WidgetHeadItem = {
                    Id: widget.id.replace('widget-', ''), // Empty for new widgets
                    SectionId: sectionId,
                    Name: widget.name || widget.widgetType,
                    Type: widget.widgetType,
                    Description: widget.Description || '',
                    LayoutConfig: JSON.stringify(layoutConfig || {}),
                    FieldMappings: JSON.stringify(fieldMapping || {}),
                    Properties: JSON.stringify(widget.props || {}),
                    IsActive: widget.active ? 'X' : '',
                    SortOrder: i + 1,
                    DelFlag: widget.deleted ? 'X' : '',
                    CrudFlag: 'C',
                };

                // Add widget to the collection
                allWidgets.push(widgetItem);

                // Prepare roles for this widget and add to all roles collection
                const widgetRoles: WidgetHeadRole[] = (widget.roles || []).map((roleName) => ({
                    RoleId: '', // Leave empty as per requirement
                    Id: widget.id.replace('widget-', ''), // associated_widget_id
                    Name: roleName,
                    Description: `${roleName} role`,
                    Type: 'Custom',
                }));

                // Add all roles from this widget to the collection
                allRoles.push(...widgetRoles);
            }

            // Create single payload with all widgets and all roles
            const payload: WidgetHeadPayload = {
                Id: '',
                CrudFlag: 'C',
                // headtowidget: allWidgets,
                // HeadtoRoles: allRoles,
                WidgetHeadToConf: allWidgets,
                WidgetHeadRolesItem: allRoles,
            };

            console.log('Saving all widgets in single request:', payload);

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
            console.log('All widgets save result:', result);

            return result;
        } catch (error) {
            console.error('Error saving widget layout:', error);
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
            console.error('Error deleting menu item:', error);
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
                Type: section.type,
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
            console.error('Error deleting section:', error);
            throw error;
        }
    }

    // Batch update multiple menu items (for reordering)
    async batchUpdateMenuItems(menuItems: MenuItem[]): Promise<MenuItem[]> {
        try {
            const results: MenuItem[] = [];

            // Process each item sequentially to maintain order
            for (const item of menuItems) {
                if (item.hasChanges || item.isNew) {
                    const result = await this.saveMenuItem(item, !item.isNew);
                    results.push(result);
                } else {
                    results.push(item);
                }
            }

            return results;
        } catch (error) {
            console.error('Error batch updating menu items:', error);
            throw error;
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
            console.error('Error batch updating sections:', error);
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
            console.warn('Failed to parse JSON:', jsonString, error);
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
            // console.error('Error fetching news feed:', error);
            // throw error;
        }
    }

    /**
     * Check if the current user has admin role
     * @param userName Optional username, if not provided it will check current user
     * @returns Promise<boolean> - true if user is admin, false otherwise
     */
    async checkAdminRole(): Promise<boolean> {
        try {
            // Construct the URL - if userName is provided, filter by it
            const url = `${this.baseUrl}/ZSCM_CT_V_ADMIN_ROLE_CHECK?$format=json`;

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

            const data = await response.json();

            // Check if results exist and if IsAdmin flag is set
            if (data.d.results && data.d.results.length > 0) {
                const adminCheck: AdminRoleCheckResponse = data.d.results[0];
                return adminCheck.IsAdmin === '';
            }

            // If no results, user is not admin
            return false;
        } catch (error) {
            console.error('Error checking admin role:', error);
            // In case of error, default to non-admin for security
            return false;
        }
    }


    /**
     * Fetch UI configuration settings for a specific tab
     */
    async fetchSettingsByTabId(tabId: string): Promise<UIConfiguration | null> {
        try {
            const response = await fetch(
                `${this.baseUrl}/SettingsSet?$filter=TabId eq '${tabId}'&$format=json`,
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

            if (data.d.results && data.d.results.length > 0) {
                const settingsData: SettingsResponse = data.d.results[0];

                // Parse the ConfigJson string to get the actual configuration
                try {
                    const configJson = JSON.parse(settingsData.ConfigJson);
                    return {
                        ...configJson,
                        _metadata: {
                            id: settingsData.Id,
                            tabId: settingsData.TabId,
                            isVisible: settingsData.IsVisible === 'X',
                        }
                    };
                } catch (parseError) {
                    console.warn('Failed to parse ConfigJson, returning default configuration:', parseError);
                    return null;
                }
            }

            // No settings found for this tab
            return null;
        } catch (error) {
            console.error('Error fetching settings by tab ID:', error);
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

            console.log('Settings payload for', isUpdate ? 'update' : 'create', ':', payload);

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
            console.log('Settings save result:', result);

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
            console.error('Error saving settings:', error);
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
                return data.d.results[0].Id;
            }

            return null;
        } catch (error) {
            console.error('Error getting settings ID:', error);
            return null;
        }
    }

}

export const sapODataService = new SAPODataService();
