'use client';
import React, { useState, useCallback, useRef } from 'react';
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
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Send as SendIcon,
    Clear as ClearIcon,
    InsertDriveFile as FileIcon,
    CloudDone as CloudDoneIcon,
    Api as ApiIcon,
    Code as CodeIcon,
} from '@mui/icons-material';

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

const ResponseBox = styled(Box)(() => ({
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxHeight: '400px',
    overflow: 'auto',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
}));

// API Endpoint interface
interface ApiEndpoint {
    id: string;
    name: string;
    url: string;
    description?: string;
}

// Default API endpoints - can be extended
const DEFAULT_API_ENDPOINTS: ApiEndpoint[] = [
    {
        id: 'manual-upload',
        name: 'Manual Upload API',
        url: 'https://manual.cml.apps.cdp-ds-test.aramco.com/upload',
        description: 'Upload files to manual processing endpoint',
    },
];

export default function FileUploadPage() {
    const [selectedApi, setSelectedApi] = useState<string>('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    const [apiResponse, setApiResponse] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedEndpoint = DEFAULT_API_ENDPOINTS.find((ep) => ep.id === selectedApi);

    const handleFileUpload = useCallback(
        async (file: File) => {
            if (!selectedEndpoint) {
                setErrorMessage('Please select an API endpoint first');
                setShowError(true);
                return;
            }

            setUploadedFile(file);
            setApiResponse(null);
        },
        [selectedEndpoint]
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
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        },
        [handleFileUpload]
    );

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFileUpload(file);
            }
        },
        [handleFileUpload]
    );

    const handleUploadToAPI = async () => {
        if (!uploadedFile || !selectedEndpoint) return;

        setIsProcessing(true);
        setUploadProgress(0);
        setApiResponse(null);

        try {
            // Construct FormData payload as per server requirements
            const formData = new FormData();
            formData.append('file', uploadedFile);

            // Simulate progress
            setUploadProgress(30);

            const controller = new AbortController();
            const response = await fetch(selectedEndpoint.url, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
                // Don't set Content-Type header - let browser set it with boundary for FormData
            });

            setUploadProgress(70);

            let responseData: any;
            const contentType = response.headers.get('content-type');

            // Parse response based on content type
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                const text = await response.text();
                try {
                    responseData = JSON.parse(text);
                } catch {
                    responseData = { rawResponse: text, status: response.status, statusText: response.statusText };
                }
            }

            setUploadProgress(100);

            // Format response according to server response structure
            setApiResponse({
                status: response.status,
                statusText: response.statusText,
                timestamp: new Date().toISOString(),
                ...(response.ok
                    ? {
                        success: true,
                        message: responseData.message || 'File processed successfully',
                        filename: responseData.filename,
                        rows: responseData.rows,
                        columns: responseData.columns,
                        rawResponse: responseData,
                    }
                    : {
                        success: false,
                        error: responseData.error || `Upload failed with status ${response.status}`,
                        rawResponse: responseData,
                    }),
            });

            if (response.ok) {
                setShowSuccess(true);
                // Clear error message if any
                setErrorMessage('');
            } else {
                const errorMsg = responseData.error || `Upload failed with status ${response.status}`;
                setErrorMessage(errorMsg);
                setShowError(true);
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMsg = error.message || 'Failed to upload file to API';
            setErrorMessage(errorMsg);
            setShowError(true);
            setApiResponse({
                success: false,
                error: errorMsg,
                timestamp: new Date().toISOString(),
            });
        } finally {
            setIsProcessing(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const handleClearAll = () => {
        setUploadedFile(null);
        setSelectedApi('');
        setApiResponse(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
                                        File Upload
                                    </Typography>
                                    <Typography variant="body2" className="text-gray-400">
                                        Select an API endpoint and upload your file
                                    </Typography>
                                </Box>
                            </Fade>

                            {/* API Selection */}
                            <Slide in timeout={1000}>
                                <CorporateCard className="mb-6">
                                    <CardContent className="p-6">
                                        <Box className="mb-4 flex items-center">
                                            <ApiIcon sx={{ color: '#00d4ff', mr: 2, fontSize: 28 }} />
                                            <Typography variant="h5" className="font-semibold text-white">
                                                API Endpoint Selection
                                            </Typography>
                                        </Box>

                                        <FormControl fullWidth className="mb-4">
                                            <InputLabel id="api-endpoint-select-label">Select API Endpoint</InputLabel>
                                            <Select
                                                labelId="api-endpoint-select-label"
                                                value={selectedApi}
                                                label="Select API Endpoint"
                                                onChange={(e) => {
                                                    setSelectedApi(e.target.value);
                                                    setApiResponse(null);
                                                }}
                                                sx={{ borderRadius: '12px', mb: 3 }}
                                            >
                                                {DEFAULT_API_ENDPOINTS.map((endpoint) => (
                                                    <MenuItem key={endpoint.id} value={endpoint.id}>
                                                        <Box>
                                                            <Typography variant="body1" className="font-medium text-white">
                                                                {endpoint.name}
                                                            </Typography>
                                                            {endpoint.description && (
                                                                <Typography variant="caption" className="text-gray-400">
                                                                    {endpoint.description}
                                                                </Typography>
                                                            )}
                                                            <Typography variant="caption" className="block text-xs text-gray-500 mt-1">
                                                                {endpoint.url}
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {selectedEndpoint && (
                                            <Fade in timeout={500}>
                                                <Box className="rounded-lg border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4">
                                                    <Box className="flex items-center">
                                                        <CodeIcon sx={{ color: '#00d4ff', mr: 2 }} />
                                                        <Box>
                                                            <Typography variant="body2" className="font-medium text-white">
                                                                Selected Endpoint
                                                            </Typography>
                                                            <Typography variant="caption" className="text-gray-400 break-all">
                                                                {selectedEndpoint.url}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
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
                                                        : 'Drag & drop your file'}
                                            </Typography>
                                            <Typography variant="body2" className="mb-4 text-gray-400">
                                                {isDragOver
                                                    ? 'Release to upload'
                                                    : 'or click to browse • All file types supported'}
                                            </Typography>

                                            {!uploadedFile && (
                                                <Button variant="outlined" size="large">
                                                    Choose File
                                                </Button>
                                            )}

                                            <input
                                                ref={fileInputRef}
                                                type="file"
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
                                                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB •{' '}
                                                                    {uploadedFile.type || 'Unknown type'}
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
                                                            Uploading file...
                                                        </Typography>
                                                        <Typography variant="body2" className="font-medium text-white">
                                                            {uploadProgress}%
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress variant="determinate" value={uploadProgress} />
                                                </Box>
                                            </Fade>
                                        )}

                                        {uploadedFile && selectedEndpoint && !isProcessing && (
                                            <Fade in timeout={500}>
                                                <Box className="mt-6 flex justify-end">
                                                    <Button
                                                        startIcon={<SendIcon />}
                                                        onClick={handleUploadToAPI}
                                                        variant="contained"
                                                        disabled={isProcessing}
                                                        size="large"
                                                    >
                                                        Upload to API
                                                    </Button>
                                                </Box>
                                            </Fade>
                                        )}
                                    </CardContent>
                                </CorporateCard>
                            </Slide>

                            {/* API Response */}
                            {apiResponse && (
                                <Slide in timeout={1400}>
                                    <CorporateCard className="mb-6">
                                        <CardContent className="p-6">
                                            <Box className="mb-4 flex items-center">
                                                <CloudDoneIcon
                                                    sx={{
                                                        color: apiResponse.success ? '#10b981' : '#ef4444',
                                                        mr: 2,
                                                        fontSize: 28,
                                                    }}
                                                />
                                                <Typography variant="h5" className="font-semibold text-white">
                                                    API Response
                                                </Typography>
                                            </Box>

                                            {apiResponse.success && apiResponse.message && (
                                                <Box className="mb-4 rounded-lg border border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4">
                                                    <Typography variant="body1" className="mb-2 font-semibold text-green-400">
                                                        {apiResponse.message}
                                                    </Typography>
                                                    <Box className="grid grid-cols-2 gap-4">
                                                        {apiResponse.filename && (
                                                            <Box>
                                                                <Typography variant="caption" className="text-gray-400">
                                                                    Filename
                                                                </Typography>
                                                                <Typography variant="body2" className="text-white">
                                                                    {apiResponse.filename}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {apiResponse.rows !== undefined && (
                                                            <Box>
                                                                <Typography variant="caption" className="text-gray-400">
                                                                    Rows Processed
                                                                </Typography>
                                                                <Typography variant="body2" className="text-white">
                                                                    {apiResponse.rows}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {apiResponse.columns !== undefined && (
                                                            <Box>
                                                                <Typography variant="caption" className="text-gray-400">
                                                                    Columns
                                                                </Typography>
                                                                <Typography variant="body2" className="text-white">
                                                                    {apiResponse.columns}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            )}

                                            {apiResponse.error && (
                                                <Box className="mb-4 rounded-lg border border-red-500/20 bg-gradient-to-r from-red-500/10 to-rose-500/10 p-4">
                                                    <Typography variant="body1" className="font-semibold text-red-400">
                                                        Error: {apiResponse.error}
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Typography variant="body2" className="mb-2 text-gray-400">
                                                Full Response:
                                            </Typography>
                                            <ResponseBox>
                                                {JSON.stringify(apiResponse, null, 2)}
                                            </ResponseBox>
                                        </CardContent>
                                    </CorporateCard>
                                </Slide>
                            )}
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
                                    <Typography variant="body2">File uploaded successfully to API</Typography>
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
                            <Typography variant="body1" className="font-semibold">
                                {errorMessage}
                            </Typography>
                        </Alert>
                    </Snackbar>
                </div>
            </div>
        </ThemeProvider>
    );
}

