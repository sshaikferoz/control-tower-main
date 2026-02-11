export type SelectionMode = 'single' | 'multi' | 'range';

export type FilterComponentType = 'input' | 'datePicker' | 'list';

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
    dateFormat?: string;
    minDate?: string;
    maxDate?: string;
    
    // For list component (BEX Query)
    queryName?: string; // BEX query name to fetch list options
    displayField?: string; // Field to display in the list
    valueField?: string; // Field to use as value
}

export interface FilterPanelWidgetConfig {
    eventName: string; // Event name to emit when filter button is clicked
    components: FilterComponent[];
}
