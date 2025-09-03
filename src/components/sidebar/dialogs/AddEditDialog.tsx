import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Select,
  MenuItem as MuiMenuItem,
  IconButton,
  Typography,
} from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import { AddEditDialogProps } from '../types';

const AddEditDialog: React.FC<AddEditDialogProps> = ({
  open,
  dialogTitle,
  currentItem,
  onClose,
  onSave,
  setCurrentItem,
}) => {
  if (!currentItem) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'bg-gray-900 text-white border border-blue-500',
      }}
    >
      <DialogTitle className="flex justify-between">
        {dialogTitle}
        <IconButton onClick={onClose} className="absolute top-2 right-2" size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className="mt-4">
        <div className="space-y-4">
          <div>
            <Typography className="mb-1">Title*</Typography>
            <TextField
              fullWidth
              value={currentItem.name}
              onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
              placeholder="Type Here..."
              variant="outlined"
              size="small"
              InputProps={{
                className: ' border-gray-700',
              }}
            />
          </div>

          <div>
            <Typography className="mb-1">Description*</Typography>
            <TextField
              fullWidth
              value={currentItem.description}
              onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              placeholder="Type Here..."
              variant="outlined"
              size="small"
              multiline
              rows={2}
              InputProps={{
                className: ' border-gray-700',
              }}
            />
          </div>

          <div>
            <Typography className="mb-1">Order*</Typography>
            <div className="flex items-center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!currentItem.hidden}
                    onChange={() =>
                      setCurrentItem({
                        ...currentItem,
                        hidden: !currentItem.hidden,
                      })
                    }
                    color="primary"
                  />
                }
                label="Hide"
              />
              {/*  <TextField
                value={currentItem.order}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Type Here..."
                variant="outlined"
                size="small"
                type="number"
                InputProps={{
                  className: " border-gray-700",
                }}
              /> */}
            </div>
          </div>

          <div>
            <Typography className="mb-1">Type*</Typography>
            <Select
              fullWidth
              value={currentItem.type || 'Default'}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  type: e.target.value as string,
                })
              }
              size="small"
              className="border-gray-700"
            >
              <MuiMenuItem value="Default">Select Type</MuiMenuItem>
              <MuiMenuItem value="Link">Link</MuiMenuItem>
              <MuiMenuItem value="Tab">Tab</MuiMenuItem>
              <MuiMenuItem value="Section">Section</MuiMenuItem>
            </Select>
          </div>
        </div>
      </DialogContent>
      <DialogActions className="p-4">
        <Button variant="outlined" onClick={onClose} startIcon={<Close />} className="">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          startIcon={<Save />}
          disabled={!currentItem.name}
          className=""
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditDialog;
