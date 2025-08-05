'use client';
import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import PSCLogo from '@/assets/PSCLogo';
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
  MenuItem,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Close, Save, DragIndicator } from '@mui/icons-material';

// Define interfaces
interface MenuItem {
  id: string;
  name: string;
  description: string;
  order: number;
  type: string;
  hidden: boolean;
}

interface ItemRefs {
  [key: number]: HTMLLIElement | null;
}

const Sidebar: React.FC = () => {
  // Initial menu items with extended properties
  const initialMenuItems: MenuItem[] = [
    'My SCM',
    'Material Procurement',
    'Inventory',
    'Warehousing',
    'Logistics',
    'Supplier Lifecycle',
    'General Supply Chain',
    'Customers',
  ].map((name, index) => ({
    id: `item-${index}`,
    name,
    description: `Description for ${name}`,
    order: index,
    type: 'Default',
    hidden: false,
  }));

  // State hooks
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [search, setSearch] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('My SCM');
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>(menuItems);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Item ref for opacity change during drag
  const itemRefs = useRef<ItemRefs>({});

  // New item template
  const newItemTemplate: MenuItem = {
    id: '',
    name: '',
    description: '',
    order: menuItems.length,
    type: 'Default',
    hidden: false,
  };

  // Update filtered items when search or items change
  useEffect(() => {
    const filtered = menuItems
      .filter((item) => !item.hidden || isEditing)
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.order - b.order);

    setFilteredItems(filtered);
  }, [search, menuItems, isEditing]);

  // Dialog handlers
  const handleAddClick = (): void => {
    setCurrentItem({ ...newItemTemplate, id: `item-${Date.now()}` });
    setAddDialogOpen(true);
  };

  const handleEditClick = (item: MenuItem): void => {
    setCurrentItem({ ...item });
    setEditDialogOpen(true);
  };

  const handleDialogClose = (): void => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setCurrentItem(null);
  };

  const handleDialogSave = (): void => {
    if (!currentItem) return;

    if (addDialogOpen) {
      setMenuItems([...menuItems, currentItem]);
    } else {
      setMenuItems(menuItems.map((item) => (item.id === currentItem.id ? currentItem : item)));
    }
    handleDialogClose();
  };

  const handleDeleteItem = (itemId: string): void => {
    setMenuItems(menuItems.filter((item) => item.id !== itemId));
  };

  const handleToggleHidden = (itemId: string): void => {
    setMenuItems(
      menuItems.map((item) => (item.id === itemId ? { ...item, hidden: !item.hidden } : item))
    );
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number): void => {
    // Store the dragged item's index
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
    setIsDragging(true);

    // Add a slight delay to improve visual feedback
    setTimeout(() => {
      if (itemRefs.current[index]) {
        const element = itemRefs.current[index];
        if (element) {
          element.style.opacity = '0.4';
        }
      }
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>): void => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, targetIndex: number): void => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === targetIndex) return;

    // Create a new array with reordered items
    const reorderedItems = [...filteredItems];
    const [movedItem] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(targetIndex, 0, movedItem);

    // Update order values
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    // Update filtered items
    setFilteredItems(updatedItems);

    // Update all menu items, preserving hidden ones
    setMenuItems(
      menuItems.map((item) => {
        const updatedItem = updatedItems.find((u) => u.id === item.id);
        return updatedItem || item;
      })
    );

    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = (): void => {
    // Reset opacity
    if (draggedIndex !== null && itemRefs.current[draggedIndex]) {
      const element = itemRefs.current[draggedIndex];
      if (element) {
        element.style.opacity = '1';
      }
    }

    setDraggedIndex(null);
    setIsDragging(false);
  };

  const handleSaveEdit = (): void => {
    setIsEditing(false);
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
      <div className="flex flex-row items-center space-x-2">
        <PSCLogo />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">P&SC</h1>
          <h1 className="text-lg font-semibold">Intelligence Centre</h1>
        </div>
      </div>

      <div className="relative mt-4">
        <MagnifyingGlassIcon className="absolute top-3 left-3 h-5 w-5" />
        <input
          type="text"
          placeholder="Search Menu"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md bg-[#ffffff20] p-2 pl-10 text-white placeholder-gray-300 outline-none"
        />
      </div>

      {isEditing && (
        <div className="mt-2 flex items-center justify-between">
          <Typography variant="caption" className="">
            Editing Mode
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleSaveEdit}
            startIcon={<Save />}
            className="bg-blue-500 py-1 text-xs hover:bg-blue-600"
          >
            Save
          </Button>
        </div>
      )}

      <nav className="mt-6 flex-grow overflow-y-auto">
        <ul className="space-y-2">
          {filteredItems.map((item, index) => (
            <li
              key={item.id}
              //   ref={(el) => (itemRefs.current[index] = el)}
              draggable={isEditing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              className={`rounded px-4 py-2 ${item.hidden && isEditing ? 'opacity-50' : ''} ${
                selectedItem === item.name
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-[#ffffff30]'
              } ${
                isEditing ? 'border border-dashed border-gray-400' : ''
              } group flex items-center justify-between`}
              data-index={index}
            >
              <div className="flex flex-1 items-center">
                {isEditing && (
                  <div className="mr-2 cursor-grab">
                    <DragIndicator fontSize="small" />
                  </div>
                )}
                <span className="flex-1" onClick={() => !isEditing && setSelectedItem(item.name)}>
                  {item.name}
                </span>
              </div>

              {isEditing && (
                <div className="flex space-x-1">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(item)}
                      className="hover:text-white"
                    >
                      <PencilIcon className="h-4 w-4 text-white" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={item.hidden ? 'Show' : 'Hide'}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleHidden(item.id)}
                      className="hover:text-white"
                    >
                      {item.hidden ? (
                        <EyeIcon className="h-4 w-4 text-white" />
                      ) : (
                        <EyeSlashIcon className="h-4 w-4 text-white" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteItem(item.id)}
                      className="hover:text-white"
                    >
                      <TrashIcon className="h-4 w-4 text-white" />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4 flex justify-center gap-2">
        <Button
          variant="contained"
          color="primary"
          startIcon={isEditing ? <Close /> : <PencilIcon className="h-4 w-4" />}
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-500 text-xs hover:bg-blue-600"
          size="small"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddClick}
          className="bg-green-500 text-xs hover:bg-green-600"
          size="small"
        >
          Add
        </Button>
      </div>

      <div className="mt-4 flex items-center space-x-3 rounded bg-[#ffffff20] p-2">
        <img
          src={`${process.env.NEXT_PUBLIC_BSP_NAME}/user.png`}
          alt="User"
          className="rounded-full"
        />
        <div>
          <p className="text-sm font-medium">Abdulmajeed</p>
          <p className="text-xs">Last Login: 12/11/2024 19:23:32</p>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: ' text-white border border-blue-500 !rounded-[1vw] ',
        }}
      >
        <DialogTitle className="flex justify-between">
          Add Tab
          <IconButton onClick={handleDialogClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="mt-4">
          <div className="space-y-4">
            <div>
              <Typography className="mb-1">Title*</Typography>
              <TextField
                fullWidth
                value={currentItem?.name || ''}
                onChange={(e) =>
                  setCurrentItem(currentItem ? { ...currentItem, name: e.target.value } : null)
                }
                placeholder="Type Here..."
                variant="outlined"
                size="small"
                InputProps={{
                  className: 'text-white border-gray-700',
                }}
              />
            </div>

            <div>
              <Typography className="mb-1">Description*</Typography>
              <TextField
                fullWidth
                value={currentItem?.description || ''}
                onChange={(e) =>
                  setCurrentItem(
                    currentItem ? { ...currentItem, description: e.target.value } : null
                  )
                }
                placeholder="Type Here..."
                variant="outlined"
                size="small"
                multiline
                rows={2}
                InputProps={{
                  className: ' text-white border-gray-700',
                }}
              />
            </div>

            <div>
              <Typography className="mb-1">Order*</Typography>
              <div className="flex items-center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentItem ? !currentItem.hidden : false}
                      onChange={() =>
                        setCurrentItem(
                          currentItem ? { ...currentItem, hidden: !currentItem.hidden } : null
                        )
                      }
                      color="primary"
                    />
                  }
                  label="Hide"
                />
                {/*  <TextField
                  value={currentItem?.order || ''}
                  onChange={(e) =>
                    setCurrentItem(
                      currentItem
                        ? {
                            ...currentItem,
                            order: parseInt(e.target.value) || 0,
                          }
                        : null,
                    )
                  }
                  placeholder="Type Here..."
                  variant="outlined"
                  size="small"
                  type="number"
                  InputProps={{
                    className: 'text-white border-gray-700',
                  }}
                /> */}
              </div>
            </div>

            <div>
              <Typography className="mb-1">Type*</Typography>
              <Select
                fullWidth
                value={currentItem?.type || 'Default'}
                onChange={(e) =>
                  setCurrentItem(
                    currentItem ? { ...currentItem, type: e.target.value as string } : null
                  )
                }
                size="small"
                className="border-gray-700 text-white"
              >
                <MenuItem value="Default">Select Type</MenuItem>
                <MenuItem value="Link">Link</MenuItem>
                <MenuItem value="Tab">Tab</MenuItem>
                <MenuItem value="Section">Section</MenuItem>
              </Select>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4">
          <Button
            variant="outlined"
            onClick={handleDialogClose}
            startIcon={<Close />}
            className="border-gray-500 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDialogSave}
            startIcon={<Save />}
            disabled={!currentItem?.name}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog - Reusing same structure */}
      <Dialog
        open={editDialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'text-white border border-blue-500 !rounded-[1vw]',
        }}
      >
        <DialogTitle className="flex justify-between">
          Edit Tab
          <IconButton onClick={handleDialogClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent className="mt-4">
          <div className="space-y-4">
            <div>
              <Typography className="mb-1">Title*</Typography>
              <TextField
                fullWidth
                value={currentItem?.name || ''}
                onChange={(e) =>
                  setCurrentItem(currentItem ? { ...currentItem, name: e.target.value } : null)
                }
                placeholder="Type Here..."
                variant="outlined"
                size="small"
                InputProps={{
                  className: ' text-white border-gray-700',
                }}
              />
            </div>

            <div>
              <Typography className="mb-1">Description*</Typography>
              <TextField
                fullWidth
                value={currentItem?.description || ''}
                onChange={(e) =>
                  setCurrentItem(
                    currentItem ? { ...currentItem, description: e.target.value } : null
                  )
                }
                placeholder="Type Here..."
                variant="outlined"
                size="small"
                multiline
                rows={2}
                InputProps={{
                  className: 'text-white border-gray-700',
                }}
              />
            </div>

            <div>
              <Typography className="mb-1">Order*</Typography>
              <div className="flex items-center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentItem ? !currentItem.hidden : false}
                      onChange={() =>
                        setCurrentItem(
                          currentItem ? { ...currentItem, hidden: !currentItem.hidden } : null
                        )
                      }
                      color="primary"
                    />
                  }
                  label="Hide"
                />
                {/*  <TextField
                  value={currentItem?.order || ''}
                  onChange={(e) =>
                    setCurrentItem(
                      currentItem
                        ? {
                            ...currentItem,
                            order: parseInt(e.target.value) || 0,
                          }
                        : null,
                    )
                  }
                  placeholder="Type Here..."
                  variant="outlined"
                  size="small"
                  type="number"
                  InputProps={{
                    className: 'bg-gray-800 text-white border-gray-700',
                  }}
                /> */}
              </div>
            </div>

            <div>
              <Typography className="mb-1">Type*</Typography>
              <Select
                fullWidth
                value={currentItem?.type || 'Default'}
                onChange={(e) =>
                  setCurrentItem(
                    currentItem ? { ...currentItem, type: e.target.value as string } : null
                  )
                }
                size="small"
                className="text-white"
              >
                <MenuItem value="Default">Select Type</MenuItem>
                <MenuItem value="Link">Link</MenuItem>
                <MenuItem value="Tab">Tab</MenuItem>
                <MenuItem value="Section">Section</MenuItem>
              </Select>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={handleDialogClose} startIcon={<Close />}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDialogSave}
            startIcon={<Save />}
            disabled={!currentItem?.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Sidebar;
