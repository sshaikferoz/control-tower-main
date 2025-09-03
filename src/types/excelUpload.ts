// types/excelUpload.ts

export interface SAPTableField {
  fieldName: string;
  displayName: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  enumValues?: string[];
  description?: string;
}

export interface ValidationError {
  row: number;
  column: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
}

export interface ExcelUploadData {
  fileName: string;
  uploadedAt: Date;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  data: Record<string, any>[];
  validationErrors: ValidationError[];
}

export interface FilterState {
  [key: string]: {
    value: string;
    operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  };
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

// SAP Table Schema Definition
export const SAP_TABLE_SCHEMA: Record<string, SAPTableField[]> = {
  USERS: [
    {
      fieldName: 'USER_ID',
      displayName: 'User ID',
      dataType: 'string',
      required: true,
      maxLength: 20,
      pattern: '^[A-Z0-9]+$',
      description: 'Unique user identifier',
    },
    {
      fieldName: 'FIRST_NAME',
      displayName: 'First Name',
      dataType: 'string',
      required: true,
      maxLength: 50,
      minLength: 1,
      description: 'User first name',
    },
    {
      fieldName: 'LAST_NAME',
      displayName: 'Last Name',
      dataType: 'string',
      required: true,
      maxLength: 50,
      minLength: 1,
      description: 'User last name',
    },
    {
      fieldName: 'EMAIL',
      displayName: 'Email Address',
      dataType: 'string',
      required: true,
      maxLength: 100,
      pattern: '^[^@]+@[^@]+\\.[^@]+$',
      description: 'Valid email address',
    },
    {
      fieldName: 'DEPARTMENT',
      displayName: 'Department',
      dataType: 'string',
      required: true,
      enumValues: ['IT', 'HR', 'FINANCE', 'SALES', 'MARKETING', 'OPERATIONS'],
      description: 'User department',
    },
    {
      fieldName: 'HIRE_DATE',
      displayName: 'Hire Date',
      dataType: 'date',
      required: true,
      description: 'Employee hire date',
    },
    {
      fieldName: 'SALARY',
      displayName: 'Salary',
      dataType: 'number',
      required: false,
      description: 'Employee salary',
    },
    {
      fieldName: 'ACTIVE',
      displayName: 'Active Status',
      dataType: 'boolean',
      required: true,
      description: 'Employee active status',
    },
  ],
  PRODUCTS: [
    {
      fieldName: 'PRODUCT_ID',
      displayName: 'Product ID',
      dataType: 'string',
      required: true,
      maxLength: 15,
      pattern: '^PRD[0-9]+$',
      description: 'Product identifier with PRD prefix',
    },
    {
      fieldName: 'PRODUCT_NAME',
      displayName: 'Product Name',
      dataType: 'string',
      required: true,
      maxLength: 100,
      minLength: 3,
      description: 'Product name',
    },
    {
      fieldName: 'CATEGORY',
      displayName: 'Category',
      dataType: 'string',
      required: true,
      enumValues: ['ELECTRONICS', 'CLOTHING', 'BOOKS', 'HOME', 'SPORTS'],
      description: 'Product category',
    },
    {
      fieldName: 'PRICE',
      displayName: 'Price',
      dataType: 'number',
      required: true,
      description: 'Product price',
    },
    {
      fieldName: 'STOCK_QUANTITY',
      displayName: 'Stock Quantity',
      dataType: 'number',
      required: true,
      description: 'Available stock quantity',
    },
    {
      fieldName: 'LAUNCH_DATE',
      displayName: 'Launch Date',
      dataType: 'date',
      required: false,
      description: 'Product launch date',
    },
    {
      fieldName: 'ACTIVE',
      displayName: 'Active',
      dataType: 'boolean',
      required: true,
      description: 'Product active status',
    },
  ],
};

export const UPLOAD_SETTINGS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: ['.xlsx', '.xls'],
  maxRows: 10000,
  validationTimeout: 30000, // 30 seconds
};
