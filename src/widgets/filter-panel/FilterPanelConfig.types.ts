export type SelectionMode = 'single' | 'multi' | 'range';

export type FilterComponentType = 'input' | 'datePicker' | 'list';
export type DateFilterFormat = 'YYYY' | 'MM/YYYY' | 'MM/DD/YYYY';

// Type of hierarchy a list filter represents. Drives how the selected node key
// is normalized before being sent in the filter request.
export type HierarchyType = 'costcenter';

export interface FilterVariable {
    name: string; // Variable name that will be used in BEX queries
    value: string | string[] | { from: string; to: string } | null; // Current value(s)
}

export interface FilterComponent {
    id: string;
    type: FilterComponentType;
    label: string;
    selectionMode: SelectionMode;
    variableName: string; // Variable name to emit when filter is applied
    
    // For input component
    placeholder?: string;
    defaultValue?: string;
    
    // For datePicker component
    dateFormat?: DateFilterFormat;
    minDate?: string;
    maxDate?: string;
    
    // For list component (BEX Query)
    queryName?: string; // BEX query name to fetch list options
    isHierarchyQuery?: boolean; // If true, use hierarchy endpoint/response shape
    hierarchyType?: HierarchyType; // Type of hierarchy; drives value normalization on apply
    includeDisplayKey?: boolean; // Append display_key=X to query URL to fetch key fields
    displayField?: string | string[]; // Field(s) to display in the list
    valueField?: string; // Field to use as value
}

export interface FilterPanelWidgetConfig {
    eventName: string; // Event name to emit when filter button is clicked
    components: FilterComponent[];
}
