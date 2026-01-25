import React from 'react';
import Grid from '@mui/material/Grid';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Card,
    CardContent,
    Box,
    Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WidgetsIcon from '@mui/icons-material/Widgets';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DataObjectIcon from '@mui/icons-material/DataObject';
import LaunchIcon from '@mui/icons-material/Launch'
import { TargetReportConfig } from '../../types/dashboard';

interface WidgetDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    widget: any;
    targetReport?: TargetReportConfig;
    description?: string;
}

export const WidgetDetailsDialog: React.FC<WidgetDetailsDialogProps> = ({
    open,
    onClose,
    widget,
    targetReport,
    description,
}) => {
    const handleOpenReport = () => {
        if (!targetReport?.technicalId) {
            alert('No Detailed Report configured for this widget.');
            return;
        }

        let reportUrl = '';

        switch (targetReport.type) {
            case 'Bex Query':
                reportUrl = `/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${targetReport.technicalId}`;
                break;
            case 'Lumira':
                reportUrl = `/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html#LumiraViewer-display&/lumira/${targetReport.technicalId}`;
                break;
            case 'WAD Template':
                reportUrl = `/sap/bc/bsp/sap/bw_web_template/webtemplate.htm?template=${targetReport.technicalId}`;
                break;
            case 'Web Link':
                reportUrl = targetReport.technicalId;
                break;
            default:
                alert('Unknown report type.');
                return;
        }

        window.open(reportUrl, '_blank', 'noopener,noreferrer');
    };

    const getReportTypeIcon = (type: string) => {
        switch (type) {
            case 'Bex Query':
                return <DataObjectIcon sx={{ color: '#4CAF50' }} />;
            case 'Lumira':
                return <AssignmentIcon sx={{ color: '#2196F3' }} />;
            case 'WAD Template':
                return <WidgetsIcon sx={{ color: '#FF9800' }} />;
            case 'Web Link':
                return <LaunchIcon sx={{ color: '#9C27B0' }} />;
            default:
                return <InfoIcon sx={{ color: '#757575' }} />;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#1a3a6b',
                    color: 'white',
                    border: '1px solid #2a4a7b',
                },
            }}
        >
            <DialogTitle
                sx={{
                    color: 'white',
                    borderBottom: '1px solid #2a4a7b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WidgetsIcon sx={{ mr: 1, color: '#4CAF50' }} />
                    Widget Details
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 2 }}>
                <Grid container spacing={3}>
                    {/* Widget Information */}
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                bgcolor: '#2a4a7b',
                                border: '1px solid #3a5a8b',
                                margin: 1,
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    sx={{ color: 'white', display: 'flex', alignItems: 'center' }}
                                >
                                    <InfoIcon sx={{ mr: 1, color: '#2196F3' }} />
                                    Widget Information
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    {description && (
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#E3F2FD', mb: 1 }}>
                                                <strong>Description:</strong>
                                            </Typography>
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    bgcolor: '#3a5a8b',
                                                    border: '1px solid #4a6a9b',
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ color: 'white', fontStyle: 'italic' }}>
                                                    {description}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Detailed Report Configuration */}
                    <Grid item xs={12}>
                        <Card sx={{ bgcolor: '#2a4a7b', border: '1px solid #3a5a8b' }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    sx={{ color: 'white', display: 'flex', alignItems: 'center' }}
                                >
                                    <AssignmentIcon sx={{ mr: 1, color: '#4CAF50' }} />
                                    Detailed Report Configuration
                                </Typography>

                                {targetReport && targetReport.technicalId ? (
                                    <Box sx={{ mt: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    {getReportTypeIcon(targetReport.type)}
                                                    <Box sx={{ ml: 2 }}>
                                                        <Typography variant="body2" sx={{ color: '#E3F2FD' }}>
                                                            <strong>Type:</strong> {targetReport.type}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" sx={{ color: '#E3F2FD' }}>
                                                    <strong>Technical ID:</strong>
                                                </Typography>
                                                <Paper
                                                    sx={{
                                                        p: 1,
                                                        mt: 0.5,
                                                        bgcolor: '#3a5a8b',
                                                        border: '1px solid #4a6a9b',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'white',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.875rem',
                                                        }}
                                                    >
                                                        {targetReport.technicalId}
                                                    </Typography>
                                                </Paper>
                                            </Grid>

                                            {targetReport.name && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" sx={{ color: '#E3F2FD', mb: 1 }}>
                                                        <strong>Report Name:</strong>
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                                                        {targetReport.name}
                                                    </Typography>
                                                </Grid>
                                            )}

                                            {targetReport.description && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" sx={{ color: '#E3F2FD', mb: 1 }}>
                                                        <strong>Report Description:</strong>
                                                    </Typography>
                                                    <Paper
                                                        sx={{
                                                            p: 2,
                                                            bgcolor: '#3a5a8b',
                                                            border: '1px solid #4a6a9b',
                                                        }}
                                                    >
                                                        <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.6 }}>
                                                            {targetReport.description}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            )}
                                        </Grid>

                                        {/* <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<OpenInNewIcon />}
                        onClick={handleOpenReport}
                        sx={{
                          bgcolor: '#4CAF50',
                          color: 'white',
                          '&:hover': { bgcolor: '#45a049' },
                          px: 4,
                          py: 1.5,
                        }}
                      >
                        Open Report
                      </Button>
                    </Box> */}
                                    </Box>
                                ) : (
                                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ color: '#FFCDD2', fontStyle: 'italic' }}>
                                            No Detailed Report configured for this widget.
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#E3F2FD', mt: 1 }}>
                                            Configure a Detailed Report in the mapping screen to enable the "Open Report"
                                            functionality.
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ borderTop: '1px solid #2a4a7b', pt: 2, pb: 2 }}>
                <Button onClick={onClose} sx={{ color: 'white', borderColor: 'white' }} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
