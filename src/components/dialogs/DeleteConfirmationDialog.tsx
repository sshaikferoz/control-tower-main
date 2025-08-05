import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sectionName: string;
  loading?: boolean;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  sectionName,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
          gap: 1,
        }}
      >
        <DeleteIcon sx={{ color: '#f44336' }} />
        Delete Section
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            bgcolor: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            color: '#ffb74d',
            '& .MuiAlert-icon': {
              color: '#ff9800',
            },
          }}
        >
          This action cannot be undone!
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
            Are you sure you want to delete the section:
          </Typography>

          <Box
            sx={{
              p: 2,
              bgcolor: '#2a4a7b',
              border: '1px solid #3a5a8b',
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#4fc3f7',
                fontWeight: 'bold',
                wordBreak: 'break-word',
              }}
            >
              "{sectionName}"
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
            Deleting this section will:
          </Typography>

          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2, color: '#e0e0e0' }}>
            <li>Remove the section from your dashboard</li>
            <li>Delete all widgets within this section</li>
            <li>Remove all associated data mappings</li>
            <li>Clear any configured roles for this section</li>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: '1px solid #2a4a7b',
          pt: 2,
          pb: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              borderColor: '#e0e0e0',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
          variant="outlined"
        >
          Cancel
        </Button>

        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? null : <DeleteIcon />}
          sx={{
            bgcolor: '#f44336',
            '&:hover': {
              bgcolor: '#d32f2f',
            },
            '&:disabled': {
              bgcolor: '#666',
              color: '#999',
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <div
                className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"
                style={{
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderLeftColor: 'transparent',
                }}
              />
              Deleting...
            </Box>
          ) : (
            'Delete Section'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
