import { useState, useEffect, useRef } from 'react';
import { MenuItem, ItemRefs } from '../types';

export default function useMenuItems(
  initialItems: MenuItem[],
  selectedItem: string,
  onItemSelect: (item: string) => void
) {
  // State hooks
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialItems);
  const [search, setSearch] = useState<string>('');
  // const [selectedItem, setSelectedItem] = useState<string>('My SCM');
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

  return {
    menuItems,
    setMenuItems,
    search,
    setSearch,
    selectedItem,
    addDialogOpen,
    setAddDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    currentItem,
    setCurrentItem,
    isEditing,
    setIsEditing,
    filteredItems,
    setFilteredItems,
    draggedIndex,
    isDragging,
    itemRefs,
    newItemTemplate,
    handleAddClick,
    handleEditClick,
    handleDialogClose,
    handleDialogSave,
    handleDeleteItem,
    handleToggleHidden,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragEnd,
    handleSaveEdit,
  };
}
