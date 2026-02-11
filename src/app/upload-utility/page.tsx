'use client';
import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
    Paper,
    Typography,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    LinearProgress,
    Box,
    IconButton,
    Card,
    CardContent,
    ThemeProvider,
    createTheme,
    styled,
    keyframes,
    Fade,
    Slide,
    Collapse,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Send as SendIcon,
    Error as ErrorIcon,
    Clear as ClearIcon,
    GetApp as GetAppIcon,
    InsertDriveFile as FileIcon,
    CloudDone as CloudDoneIcon,
    TableChart as TableIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { useAdminCheck } from '@/hooks/auth/useAdminCheck';
import { useURLParams } from '@/hooks/ui/useURLParams';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorScreen } from '@/components/ui/ErrorScreen';


// Corporate dark theme
const corporateTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00d4ff',
            light: '#4de3ff',
            dark: '#0095cc',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
            contrastText: '#ffffff',
        },
        background: {
            default: 'transparent',
            paper: 'rgba(30, 41, 59, 0.9)',
        },
        text: {
            primary: '#ffffff',
            secondary: '#e2e8f0',
        },
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            color: '#ffffff',
        },
        h5: {
            fontWeight: 600,
            color: '#ffffff',
        },
        h6: {
            fontWeight: 600,
            color: '#ffffff',
        },
        body1: {
            color: '#ffffff',
        },
        body2: {
            color: '#e2e8f0',
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage:
                        'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage:
                        'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                    },
                },
                contained: {
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #4de3ff 0%, #00d4ff 100%)',
                        boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
                    },
                    '&.Mui-disabled': {
                        background: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
                        color: '#9ca3af',
                    },
                },
                outlined: {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    '&:hover': {
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        color: '#00d4ff',
                    },
                },
            },
        },
        MuiFormControl: {
            styleOverrides: {
                root: {
                    '& .MuiInputLabel-root': {
                        color: '#e2e8f0',
                        '&.Mui-focused': {
                            color: '#00d4ff',
                        },
                    },
                    '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#00d4ff',
                        },
                        '& .MuiSelect-select': {
                            color: '#ffffff',
                        },
                    },
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    color: '#ffffff',
                    backgroundColor: 'rgba(30, 41, 59, 1)',
                    '&:hover': {
                        backgroundColor: 'rgba(51, 65, 85, 1)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 212, 255, 0.2)',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 212, 255, 0.3)',
                        },
                    },
                },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    color: '#ffffff',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                },
                head: {
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    fontWeight: 700,
                    color: '#00d4ff',
                    borderBottom: '2px solid rgba(0, 212, 255, 0.3)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: '8px',
                },
                colorPrimary: {
                    backgroundColor: '#00d4ff',
                    color: '#0f172a',
                },
                colorSecondary: {
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                },
                colorError: {
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                },
                colorSuccess: {
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    height: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                bar: {
                    background: 'linear-gradient(90deg, #00d4ff 0%, #10b981 100%)',
                    borderRadius: '8px',
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                },
                standardSuccess: {
                    backgroundColor: 'rgba(16, 185, 129, 0.9)',
                    color: '#ffffff',
                },
                standardError: {
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    color: '#ffffff',
                },
            },
        },
    },
});

// Animations
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

// Styled components
const CorporateCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #00d4ff, #10b981)',
        zIndex: 1,
    },
}));

const UploadZone = styled(Box)(({ isDragOver }: { isDragOver: boolean }) => ({
    border: `2px dashed ${isDragOver ? '#00d4ff' : 'rgba(255, 255, 255, 0.3)'}`,
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: isDragOver
        ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    '&:hover': {
        borderColor: '#00d4ff',
        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
        transform: 'translateY(-2px)',
    },
}));

const FloatingIcon = styled(Box)(() => ({
    animation: `${floatAnimation} 3s ease-in-out infinite`,
    display: 'inline-block',
}));

// Interfaces
interface TableSchema {
    tableName: string;
    displayName: string;
    description: string;
    fields: TableField[];
    /** Override upload URL; if not set, uses default chatbot upload API */
    uploadUrl?: string;
}

interface TableField {
    fieldName: string;
    displayName: string;
    dataType: 'STRING' | 'INTEGER' | 'DECIMAL' | 'DATE' | 'BOOLEAN';
    maxLength?: number;
    required: boolean;
    constraints?: string[];
}

interface UploadedData {
    fileName: string;
    fileSize: number;
}

const TABLE_SCHEMAS: TableSchema[] = [
    {
        tableName: 'Supply_Chain.PSCCT_Al::SCIC_CURRENT_REPORTS',
        displayName: 'Chatbot Training Data',
        description: 'Chatbot Training Data',
        fields: [
            {
                fieldName: 'CATEGORY',
                displayName: 'CATEGORY',
                dataType: 'STRING',
                maxLength: 200,
                required: true,
            },
            {
                fieldName: 'INFORMATION_AREA',
                displayName: 'INFORMATION_AREA',
                dataType: 'STRING',
                maxLength: 100,
                required: false,
            },
            {
                fieldName: 'NAME',
                displayName: 'NAME',
                dataType: 'STRING',
                maxLength: 200,
                required: false,
            },
            {
                fieldName: 'TYPE',
                displayName: 'TYPE',
                dataType: 'STRING',
                maxLength: 50,
                required: false,
            },
            {
                fieldName: 'DESCRIPTION',
                displayName: 'DESCRIPTION',
                dataType: 'STRING',
                maxLength: 2000,
                required: false,
            },
            {
                fieldName: 'QUERY_TECHNICAL_NAME/URL',
                displayName: 'QUERY_TECHNICAL_NAME/URL',
                dataType: 'STRING',
                maxLength: 2000,
                required: false,
            },
            {
                fieldName: 'SYSTEM',
                displayName: 'SYSTEM',
                dataType: 'STRING',
                maxLength: 30,
                required: false,
            },
            {
                fieldName: 'ROLE',
                displayName: 'ROLE',
                dataType: 'STRING',
                maxLength: 200,
                required: false,
            },
            {
                fieldName: 'AVAILABLE_FIELDS',
                displayName: 'AVAILABLE_FIELDS',
                dataType: 'STRING',
                maxLength: 5000,
                required: false,
            },
        ],
    },
    {
        tableName: 'news',
        displayName: 'News Upload',
        description: 'News articles for manual upload (TITLE, DATEPUBLISHED, BRIEF, CONTENT, LINK)',
        uploadUrl: 'https://manual-upload-api.cml.apps.cdp-ds-prod.aramco.com/upload',
        fields: [
            {
                fieldName: 'TITLE',
                displayName: 'TITLE',
                dataType: 'STRING',
                maxLength: 500,
                required: true,
            },
            {
                fieldName: 'DATEPUBLISHED',
                displayName: 'DATEPUBLISHED',
                dataType: 'DATE',
                required: false,
            },
            {
                fieldName: 'BRIEF',
                displayName: 'BRIEF',
                dataType: 'STRING',
                maxLength: 2000,
                required: false,
            },
            {
                fieldName: 'CONTENT',
                displayName: 'CONTENT',
                dataType: 'STRING',
                maxLength: 10000,
                required: false,
            },
            {
                fieldName: 'LINK',
                displayName: 'LINK',
                dataType: 'STRING',
                maxLength: 2000,
                required: false,
            },
        ],
    },
];

export default function ExcelUploadComponent() {
    const { isAdmin, adminCheckLoading, adminCheckError } = useAdminCheck();

    const [selectedTable, setSelectedTable] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    const [schemaTableExpanded, setSchemaTableExpanded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedSchema = TABLE_SCHEMAS.find((schema) => schema.tableName === selectedTable);

    const handleFileUpload = useCallback(
        async (file: File) => {
            if (!selectedSchema) {
                setErrorMessage('Please select a table first');
                setShowError(true);
                return;
            }

            setIsProcessing(true);
            setUploadProgress(20);

            try {
                // Just store file info without processing
                setUploadedData({
                    fileName: file.name,
                    fileSize: file.size,
                });

                setUploadProgress(100);
                setIsProcessing(false);
            } catch (error) {
                console.error('Error processing file:', error);
                setErrorMessage('Error processing file. Please try again.');
                setShowError(true);
                setIsProcessing(false);
                setUploadProgress(0);
            }
        },
        [selectedSchema]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            const files = Array.from(e.dataTransfer.files);
            const excelFile = files.find(
                (file) =>
                    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.type === 'application/vnd.ms-excel' ||
                    file.name.endsWith('.xlsx') ||
                    file.name.endsWith('.xls')
            );

            if (excelFile) {
                setUploadedFile(excelFile);
                handleFileUpload(excelFile);
            } else {
                setErrorMessage('Please upload a valid Excel file (.xlsx or .xls)');
                setShowError(true);
            }
        },
        [handleFileUpload]
    );

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                setUploadedFile(file);
                handleFileUpload(file);
            }
        },
        [handleFileUpload]
    );

    const handleUploadToAPI = async () => {
        if (!uploadedData || !selectedSchema || !uploadedFile) return;

        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            const uploadUrl =
                selectedSchema.uploadUrl ??
                'https://scic-chatbot.cml.apps.cdp-ds-prod.aramco.com/api/uploadExcel';
            if (!selectedSchema.uploadUrl) {
                formData.append('tableName', selectedTable);
            }

            const res = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            });

            const response = await res.json();

            if (response.status === 'error') {
                setErrorMessage(response.message || 'Upload failed');
                setShowError(true);
            } else {
                setShowSuccess(true);
                setTimeout(() => {
                    handleClearAll();
                }, 3000);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setErrorMessage('Failed to upload data to server');
            setShowError(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClearAll = () => {
        setUploadedFile(null);
        setUploadedData(null);
        setSelectedTable('');
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const downloadTemplate = () => {
        if (!selectedSchema) return;

        const headers = selectedSchema.fields.map((field) => field.displayName);
        const sampleRow = selectedSchema.fields.map((field) => {
            if (selectedSchema.tableName === 'Supply_Chain.PSCCT_Al::SCIC_CURRENT_REPORTS') {
                switch (field.fieldName) {
                    case 'CATEGORY':
                        return 'Technology';
                    case 'INFORMATION_AREA':
                        return 'Software Development';
                    case 'NAME':
                        return 'Sample API Documentation';
                    case 'TYPE':
                        return 'Technical Document';
                    case 'DESCRIPTION':
                        return 'This is a sample description for the news classifier entry containing detailed information about the item.';
                    case 'QUERY_TECHNICAL_NAME/URL':
                        return 'https://api.example.com/docs/v1/users';
                    case 'SYSTEM':
                        return 'Production System';
                    case 'ROLE':
                        return 'Administrator';
                    case 'AVAILABLE_FIELDS':
                        return 'id, name, email, created_date, status, department';
                    default:
                        return '';
                }
            }
            if (selectedSchema.tableName === 'news') {
                switch (field.fieldName) {
                    case 'TITLE':
                        return 'Sample News Article Title';
                    case 'DATEPUBLISHED':
                        return '2024-01-15';
                    case 'BRIEF':
                        return 'Short summary of the news article.';
                    case 'CONTENT':
                        return 'Full article content goes here...';
                    case 'LINK':
                        return 'https://example.com/article/sample-news';
                    default:
                        return '';
                }
            }
            switch (field.dataType) {
                case 'STRING':
                    return field.maxLength && field.maxLength > 1000
                        ? 'Long text content sample...'
                        : 'Sample Text';
                case 'INTEGER':
                    return 123;
                case 'DECIMAL':
                    return 123.45;
                case 'DATE':
                    return '2024-01-01';
                case 'BOOLEAN':
                    return 'Yes';
                default:
                    return '';
            }
        });

        const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, `${selectedSchema.displayName}_Template.xlsx`);
    };

    if (adminCheckLoading) {
        return <LoadingScreen />;
    }

    if (adminCheckError) {
        return (
            <ErrorScreen
                title="Access Error"
                message={adminCheckError || 'Unable to verify permissions'}
                onRetry={() => window.location.reload()}
            />
        );
    }

    if (!isAdmin) {
        return (
            <ErrorScreen
                title="Access Denied"
                message="You don't have permission to access the Excel upload functionality."
                onRetry={() => {
                    window.location.href =
                        process.env.NODE_ENV === 'development'
                            ? '/'
                            : `${process.env.NEXT_PUBLIC_BSP_NAME}/index.html`;
                }}
            />
        );
    }

    return (
        <ThemeProvider theme={corporateTheme}>
            <div className="flex w-full">
                <div className="relative min-h-screen w-full">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url('${process.env.NEXT_PUBLIC_BSP_NAME}/background/bg-low.png')`,
                        }}
                    />

                    <div className="relative z-10 flex max-h-screen flex-col overflow-y-auto p-6 text-white">
                        <div className="mx-auto w-full max-w-6xl">
                            <Fade in timeout={800}>
                                <Box className="mb-8 text-center">
                                    <Typography variant="h4" className="mb-4 font-bold text-white">
                                        Excel Data Upload
                                    </Typography>
                                </Box>
                            </Fade>

                            {/* Table Selection */}
                            <Slide in timeout={1000}>
                                <CorporateCard className="mb-6">
                                    <CardContent className="p-6">
                                        <Box className="mb-4 flex items-center">
                                            <TableIcon sx={{ color: '#00d4ff', mr: 2, fontSize: 28 }} />
                                            <Typography variant="h5" className="font-semibold text-white">
                                                Target Table Selection
                                            </Typography>
                                        </Box>

                                        <FormControl fullWidth className="mb-4">
                                            <InputLabel>Select Destination Table</InputLabel>
                                            <Select
                                                value={selectedTable}
                                                onChange={(e) => setSelectedTable(e.target.value)}
                                                sx={{ borderRadius: '12px' }}
                                            >
                                                {TABLE_SCHEMAS.map((schema) => (
                                                    <MenuItem key={schema.tableName} value={schema.tableName}>
                                                        <Box>
                                                            <Typography variant="body1" className="font-medium text-white">
                                                                {schema.displayName}
                                                            </Typography>
                                                            <Typography variant="caption" className="text-gray-400">
                                                                {schema.description} • {schema.fields.length} fields
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {selectedSchema && (
                                            <Fade in timeout={500}>
                                                <Box>
                                                    <Box className="mb-4 flex items-center justify-between">
                                                        <Box
                                                            className="flex cursor-pointer items-center gap-2"
                                                            onClick={() => setSchemaTableExpanded((prev) => !prev)}
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    setSchemaTableExpanded((prev) => !prev);
                                                                }
                                                            }}
                                                            aria-expanded={schemaTableExpanded}
                                                        >
                                                            <IconButton size="small" sx={{ color: '#e2e8f0' }}>
                                                                {schemaTableExpanded ? (
                                                                    <ExpandLessIcon />
                                                                ) : (
                                                                    <ExpandMoreIcon />
                                                                )}
                                                            </IconButton>
                                                            <Box>
                                                                <Typography variant="h6" className="text-white">
                                                                    Schema: {selectedSchema.displayName}
                                                                </Typography>
                                                                <Typography variant="body2" className="text-gray-400">
                                                                    {selectedSchema.description}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Button
                                                            startIcon={<GetAppIcon />}
                                                            onClick={downloadTemplate}
                                                            variant="contained"
                                                            sx={{
                                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                                '&:hover': {
                                                                    background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                                                                },
                                                            }}
                                                        >
                                                            Download Template
                                                        </Button>
                                                    </Box>

                                                    <Collapse in={schemaTableExpanded}>
                                                        <TableContainer>
                                                            <Table size="small">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell>Field Name</TableCell>
                                                                        <TableCell>Data Type</TableCell>
                                                                        <TableCell>Max Length</TableCell>
                                                                        <TableCell>Required</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {selectedSchema.fields.map((field) => (
                                                                        <TableRow key={field.fieldName}>
                                                                            <TableCell>
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    className="font-medium text-white"
                                                                                >
                                                                                    {field.fieldName}
                                                                                </Typography>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Chip
                                                                                    label={field.dataType}
                                                                                    size="small"
                                                                                    color={
                                                                                        field.dataType === 'STRING' ? 'primary' : 'secondary'
                                                                                    }
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell className="text-gray-300">
                                                                                {field.maxLength || 'N/A'}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Chip
                                                                                    label={field.required ? 'Required' : 'Optional'}
                                                                                    size="small"
                                                                                    color={field.required ? 'error' : 'success'}
                                                                                />
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </Collapse>
                                                </Box>
                                            </Fade>
                                        )}
                                    </CardContent>
                                </CorporateCard>
                            </Slide>

                            {/* File Upload */}
                            <Slide in timeout={1200}>
                                <CorporateCard className="mb-6">
                                    <CardContent className="p-6">
                                        <Box className="mb-4 flex items-center">
                                            <UploadIcon sx={{ color: '#00d4ff', mr: 2, fontSize: 28 }} />
                                            <Typography variant="h5" className="font-semibold text-white">
                                                File Upload
                                            </Typography>
                                        </Box>

                                        <UploadZone
                                            isDragOver={isDragOver}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <FloatingIcon>
                                                <UploadIcon
                                                    sx={{
                                                        fontSize: '4rem',
                                                        color: isDragOver ? '#00d4ff' : 'rgba(255, 255, 255, 0.6)',
                                                        mb: 2,
                                                    }}
                                                />
                                            </FloatingIcon>
                                            <Typography variant="h6" className="mb-2 font-medium text-white">
                                                {uploadedFile
                                                    ? uploadedFile.name
                                                    : isDragOver
                                                        ? 'Drop file here!'
                                                        : 'Drag & drop your Excel file'}
                                            </Typography>
                                            <Typography variant="body2" className="mb-4 text-gray-400">
                                                {isDragOver
                                                    ? 'Release to upload'
                                                    : 'or click to browse • Supports .xlsx, .xls'}
                                            </Typography>

                                            {!uploadedFile && (
                                                <Button variant="outlined" size="large">
                                                    Choose File
                                                </Button>
                                            )}

                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".xlsx,.xls"
                                                onChange={handleFileInputChange}
                                                className="hidden"
                                            />
                                        </UploadZone>

                                        {uploadedFile && (
                                            <Fade in timeout={300}>
                                                <Box className="mt-4 rounded-lg border border-green-500/20 bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4">
                                                    <Box className="flex items-center justify-between">
                                                        <Box className="flex items-center">
                                                            <FileIcon sx={{ color: '#10b981', mr: 2 }} />
                                                            <Box>
                                                                <Typography className="font-medium text-white">
                                                                    {uploadedFile.name}
                                                                </Typography>
                                                                <Typography variant="caption" className="text-gray-400">
                                                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <IconButton onClick={handleClearAll} size="small">
                                                            <ClearIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </Fade>
                                        )}

                                        {isProcessing && (
                                            <Fade in timeout={300}>
                                                <Box className="mt-6">
                                                    <Box className="mb-2 flex items-center justify-between">
                                                        <Typography variant="body2" className="text-gray-300">
                                                            Processing file...
                                                        </Typography>
                                                        <Typography variant="body2" className="font-medium text-white">
                                                            {uploadProgress}%
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress variant="determinate" value={uploadProgress} />
                                                </Box>
                                            </Fade>
                                        )}

                                        {uploadedData && (
                                            <Fade in timeout={500}>
                                                <Box className="mt-6 flex justify-end">
                                                    <Button
                                                        startIcon={<SendIcon />}
                                                        onClick={handleUploadToAPI}
                                                        variant="contained"
                                                        disabled={isProcessing}
                                                        size="large"
                                                    >
                                                        {isProcessing ? 'Uploading...' : 'Upload to Database'}
                                                    </Button>
                                                </Box>
                                            </Fade>
                                        )}
                                    </CardContent>
                                </CorporateCard>
                            </Slide>
                        </div>
                    </div>

                    {/* Notifications */}
                    <Snackbar
                        open={showSuccess}
                        autoHideDuration={6000}
                        onClose={() => setShowSuccess(false)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert severity="success" sx={{ width: '100%' }}>
                            <Box className="flex items-center">
                                <CloudDoneIcon sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="body1" className="font-semibold">
                                        Upload Successful
                                    </Typography>
                                    <Typography variant="body2">Data uploaded successfully</Typography>
                                </Box>
                            </Box>
                        </Alert>
                    </Snackbar>

                    <Snackbar
                        open={showError}
                        autoHideDuration={6000}
                        onClose={() => setShowError(false)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert severity="error" sx={{ width: '100%' }}>
                            <Box className="flex items-center">
                                <ErrorIcon sx={{ mr: 2 }} />
                                <Typography variant="body1" className="font-semibold">
                                    {errorMessage}
                                </Typography>
                            </Box>
                        </Alert>
                    </Snackbar>
                </div>
            </div>
        </ThemeProvider>
    );
}
