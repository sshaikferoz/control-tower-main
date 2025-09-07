import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MenuItem, SidebarModalState } from '../../types';
import { useUserInfo } from '../../hooks/useUserInfo';
import { sapODataService } from '../../services/sapODataService';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  CheckIcon,
  ArrowPathIcon,
  PlusIcon,
  Bars3Icon,
  EyeIcon,
  TrashIcon,
  ShieldCheckIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { UserProfile } from './UserProfile';
import { SidebarItemModal } from '../modals/SidebarItemModal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import PSCLogo from '@/assets/PSCLogo';

interface SidebarProps {
  selectedItem: string; // This should be the ID of the selected item
  onItemSelect: (item: MenuItem) => void;
  menuItems: MenuItem[];
  onMenuItemsChange: (items: MenuItem[]) => void;
  isLoading?: boolean;
  isEditModeAllowed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedItem,
  onItemSelect,
  menuItems,
  onMenuItemsChange,
  isLoading = false,
  isEditModeAllowed = false,
}) => {
  const [search, setSearch] = useState<string>('');
  const [sidebarModal, setSidebarModal] = useState<SidebarModalState>({
    isOpen: false,
    mode: 'add',
  });
  const [editMode, setEditMode] = useState(false);
  const [tempItems, setTempItems] = useState<MenuItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  const { userInfo, userInfoLoading, formatTime } = useUserInfo();

  useEffect(() => {
    setTempItems([...menuItems]);
  }, [menuItems]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Exit edit mode when collapsing to avoid UI conflicts
    if (!isCollapsed && editMode) {
      setEditMode(false);
    }
  };

  const handleAddItem = () => {
    setSidebarModal({
      isOpen: true,
      mode: 'add',
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setSidebarModal({
      isOpen: true,
      mode: 'edit',
      item,
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setIsSaving(true);
      const itemToDelete = menuItems.find((item) => item.id === itemId);
      if (itemToDelete) {
        await sapODataService.deleteMenuItem(itemToDelete);
        onMenuItemsChange(menuItems.filter((item) => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUrl = async (item: MenuItem) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const standaloneUrl = `${baseUrl}/?&mode=standalone&appId=${item.id}`;

      await navigator.clipboard.writeText(standaloneUrl);

      // Show feedback that URL was copied
      setCopiedItemId(item.id);
      setTimeout(() => {
        setCopiedItemId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const standaloneUrl = `${baseUrl}/?&mode=standalone&appId=${item.id}`;
        textArea.value = standaloneUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        setCopiedItemId(item.id);
        setTimeout(() => {
          setCopiedItemId(null);
        }, 2000);
      } catch (fallbackError) {
        alert('Failed to copy URL to clipboard');
      }
    }
  };

  const handleSaveItem = async (item: MenuItem) => {
    try {
      setIsSaving(true);

      if (sidebarModal.mode === 'add') {
        const newItem = {
          ...item,
          id: '',
          order: menuItems.length,
          isNew: true,
        };

        const savedItem = await sapODataService.saveMenuItem(newItem, false);
        console.log(savedItem, 'saveditem', menuItems);
        onMenuItemsChange([...menuItems, savedItem]);
      } else {
        const updatedItem = {
          ...item,
          hasChanges: true,
          isNew: false,
        };

        const savedItem = await sapODataService.saveMenuItem(updatedItem, true);
        onMenuItemsChange(menuItems.map((i) => (i.id === item.id ? savedItem : i)));
      }

      setSidebarModal({ ...sidebarModal, isOpen: false });
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditMode = async () => {
    if (editMode) {
      try {
        setIsSaving(true);
        const itemsWithChanges = tempItems.map((item, index) => ({
          ...item,
          order: index,
          hasChanges: item.order !== index || item.hasChanges,
        }));

        const updatedItems = await sapODataService.batchUpdateMenuItems(itemsWithChanges);
        onMenuItemsChange(updatedItems);
      } catch (error) {
        console.error('Error saving changes:', error);
        alert('Failed to save changes. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
    setEditMode(!editMode);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tempItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
      hasChanges: true,
    }));

    setTempItems(updatedItems);
  };

  const toggleItemVisibility = (itemId: string) => {
    setTempItems(
      tempItems.map((item) =>
        item.id === itemId ? { ...item, visible: !item.visible, hasChanges: true } : item
      )
    );
  };

  const filteredItems = editMode
    ? tempItems.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    : tempItems
        .filter((item) => item.visible && !item.deleted)
        .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  // Get first letter or icon for collapsed state
  const getItemIcon = (item: MenuItem) => {
    // You can customize this based on your MenuItem type structure
    return item.name.charAt(0).toUpperCase();
  };

  return (
    <div
      className={`flex h-screen flex-col bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64 min-w-[16rem]'
      }`}
    >
      {/* Header with Toggle Button */}
      <div className="flex flex-row items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-2 text-white transition-colors hover:bg-[#ffffff20]"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {!isCollapsed && (
          <div className="flex flex-row items-center space-x-2">
            <PSCLogo />
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold">P&SC</h1>
              <h1 className="text-lg font-semibold">Intelligence Centre</h1>
            </div>
          </div>
        )}
      </div>
      {/* Search and Edit Controls - Hidden when collapsed */}
      {!isCollapsed && (
        <div className="mt-4 flex items-center justify-between">
          <div className="relative mr-2 flex-1">
            <MagnifyingGlassIcon className="absolute top-3 left-3 h-5 w-5 text-gray-300" />
            <input
              type="text"
              placeholder="Search Menu"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md bg-[#ffffff20] p-2 pl-10 text-white placeholder-gray-300 outline-none"
              disabled={isSaving}
            />
          </div>
          {isEditModeAllowed && (
            <button
              onClick={toggleEditMode}
              disabled={isSaving || isLoading}
              className={`rounded-md p-2 ${
                editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors disabled:cursor-not-allowed disabled:opacity-50`}
              title={editMode ? 'Save Changes' : 'Edit Menu'}
            >
              {isSaving ? (
                <LoadingSpinner size="sm" />
              ) : editMode ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                <PencilIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      )}
      {/* Add Item Button - Hidden when collapsed */}
      {editMode && !isCollapsed && (
        <div className="mt-2 flex justify-end">
          <Button
            onClick={handleAddItem}
            disabled={isSaving}
            size="sm"
            className="flex items-center space-x-1"
          >
            <PlusIcon className="h-3 w-3" />
            <span>Add Item</span>
          </Button>
        </div>
      )}
      {/* Navigation Menu */}

      <nav className="mt-2 flex-grow overflow-hidden">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <DragDropContext onDragEnd={editMode && !isCollapsed ? onDragEnd : () => {}}>
            <Droppable droppableId="sidebarItems">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                  {filteredItems.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                      isDragDisabled={!editMode || isSaving || isCollapsed}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group relative flex cursor-pointer items-center rounded px-3 py-2 transition-colors ${
                            selectedItem === item.id
                              ? 'bg-white text-black'
                              : 'text-white hover:bg-[#ffffff30]'
                          } ${isSaving ? 'opacity-50' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                          onClick={() => !editMode && !isSaving && onItemSelect(item)}
                          title={isCollapsed ? item.name : ''}
                        >
                          {editMode && !isCollapsed && (
                            <div
                              {...provided.dragHandleProps}
                              className="mr-2 text-gray-300 hover:text-white"
                            >
                              <Bars3Icon className="h-4 w-4" />
                            </div>
                          )}

                          {/* Icon or first letter for collapsed state */}
                          {isCollapsed ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#ffffff20] text-sm font-semibold">
                              {getItemIcon(item)}
                            </div>
                          ) : (
                            <span className="flex-1">{item.name}</span>
                          )}

                          {/* Copy URL button - only show in display mode and when not collapsed */}
                          {!editMode && !isCollapsed && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyUrl(item);
                              }}
                              disabled={isSaving}
                              className={`mr-2 rounded p-1 transition-colors disabled:opacity-50 ${
                                copiedItemId === item.id
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : selectedItem === item.id
                                    ? 'bg-gray-600 hover:bg-gray-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                              title={copiedItemId === item.id ? 'URL Copied!' : 'Copy URL'}
                            >
                              {copiedItemId === item.id ? (
                                <CheckIcon className="h-3 w-3 text-white" />
                              ) : (
                                <LinkIcon className="h-3 w-3 text-white" />
                              )}
                            </button>
                          )}

                          {/* {!isCollapsed && item.roles && item.roles.length > 0 && (
                            <ShieldCheckIcon className="mr-1 h-4 w-4 text-blue-400" />
                          )} */}

                          {editMode && !isCollapsed && (
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItemVisibility(item.id);
                                }}
                                disabled={isSaving}
                                className={`rounded p-1 ${
                                  !item.visible
                                    ? 'bg-gray-600 hover:bg-gray-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                } transition-colors disabled:opacity-50`}
                                title={!item.visible ? 'Show' : 'Hide'}
                              >
                                <EyeIcon className="h-3 w-3 text-white" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditItem(item);
                                }}
                                disabled={isSaving}
                                className="rounded bg-yellow-600 p-1 transition-colors hover:bg-yellow-700 disabled:opacity-50"
                                title="Edit"
                              >
                                <PencilIcon className="h-3 w-3 text-white" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(item.id);
                                }}
                                disabled={isSaving}
                                className="rounded bg-red-600 p-1 transition-colors hover:bg-red-700 disabled:opacity-50"
                                title="Delete"
                              >
                                <TrashIcon className="h-3 w-3 text-white" />
                              </button>
                            </div>
                          )}

                          {/* Tooltip for collapsed state */}
                          {isCollapsed && (
                            <div className="absolute top-1/2 left-full z-50 ml-2 hidden -translate-y-1/2 rounded bg-gray-800 px-2 py-1 text-sm whitespace-nowrap text-white shadow-lg group-hover:block">
                              {item.name}
                              {item.roles && item.roles.length > 0 && (
                                <ShieldCheckIcon className="ml-1 inline h-3 w-3 text-blue-400" />
                              )}
                            </div>
                          )}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </nav>
      {/* User Profile - Hidden when collapsed */}
      {!isCollapsed && (
        <UserProfile
          userInfo={userInfo}
          userInfoLoading={userInfoLoading}
          formatTime={formatTime}
        />
      )}
      {/* Sidebar Item Modal */}
      <SidebarItemModal
        modal={sidebarModal}
        onClose={() => setSidebarModal({ ...sidebarModal, isOpen: false })}
        onSave={handleSaveItem}
        isSaving={isSaving}
      />
    </div>
  );
};
