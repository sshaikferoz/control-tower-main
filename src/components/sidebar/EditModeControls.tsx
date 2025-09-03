import React from 'react';
import { Typography, Button } from '@mui/material';
import { Save } from '@mui/icons-material';
import { EditModeControlsProps } from './types';

const EditModeControls: React.FC<EditModeControlsProps> = ({ isEditing, onSaveEdit }) => {
  if (!isEditing) return null;

  return (
    <div className="mt-2 flex items-center justify-between">
      <Typography variant="caption" className="text-gray-300">
        Editing Mode
      </Typography>
      <Button
        variant="contained"
        size="small"
        onClick={onSaveEdit}
        startIcon={<Save />}
        className="bg-blue-500 py-1 text-xs hover:bg-blue-600"
      >
        Save
      </Button>
    </div>
  );
};

export default EditModeControls;
