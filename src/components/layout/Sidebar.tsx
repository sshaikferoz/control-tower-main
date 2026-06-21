import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MenuItem, SidebarModalState } from '../../types';
import { useUserInfo } from '../../hooks/auth/useUserInfo';
import { sapODataService } from '../../services/sapODataService';
import {
    MagnifyingGlassIcon,
    PencilIcon,
    CheckIcon,
    ArrowPathIcon,
    PlusIcon,
    Bars3Icon,
    EyeIcon,
    EyeSlashIcon,
    TrashIcon,
    ShieldCheckIcon,
    LinkIcon,
    QuestionMarkCircleIcon,
    Cog6ToothIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { UserProfile } from './UserProfile';
import { ThemeSettingsButton } from './ThemeSettingsButton';
import { SidebarItemModal } from '../modals/SidebarItemModal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { LoadingScreen } from '../ui/LoadingScreen';
import { Button } from '../ui/Button';
import PSCLogo from '@/assets/PSCLogo';
import Markdown from 'markdown-to-jsx';

interface SidebarProps {
    selectedItem: string; // This should be the ID of the selected item
    onItemSelect: (item: MenuItem) => void;
    menuItems: MenuItem[];
    onMenuItemsChange: (items: MenuItem[]) => void;
    isLoading?: boolean;
    isEditModeAllowed?: boolean;
    /** Passed from Dashboard to avoid duplicate admin check API calls */
    isAdmin?: boolean;
}

interface HelpConfig {
    text: string;
    _metadata?: {
        configName?: string;
    };
}

const DEFAULT_HELP_CONFIG: HelpConfig = {
    text: 'Need assistance? Contact support or open the user guide.',
};

const stripHtmlTags = (input: string): string => {
    if (!input) return '';
    return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

export const Sidebar: React.FC<SidebarProps> = ({
    selectedItem,
    onItemSelect,
    menuItems,
    onMenuItemsChange,
    isLoading = false,
    isEditModeAllowed = false,
    isAdmin: isAdminProp = false,
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
    const [copiedTabLinkId, setCopiedTabLinkId] = useState<string | null>(null);
    const [showHelpPanel, setShowHelpPanel] = useState(false);
    const [showHelpConfigModal, setShowHelpConfigModal] = useState(false);
    const [helpConfig, setHelpConfig] = useState<HelpConfig>(DEFAULT_HELP_CONFIG);
    const [helpFormData, setHelpFormData] = useState<HelpConfig>(DEFAULT_HELP_CONFIG);
    const [helpConfigLoading, setHelpConfigLoading] = useState(true);
    const [helpConfigSaving, setHelpConfigSaving] = useState(false);
    const [helpConfigStatus, setHelpConfigStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(
        null
    );
    const helpPanelRef = useRef<HTMLDivElement | null>(null);

    const { userInfo, userInfoLoading, formatTime } = useUserInfo();
    const isAdmin = isAdminProp;
    useEffect(() => {
        setTempItems([...menuItems]);
    }, [menuItems]);

    useEffect(() => {
        const fetchHelpConfig = async () => {
            try {
                setHelpConfigLoading(true);
                const remoteConfig = await sapODataService.fetchUIConfig('help');
                if (remoteConfig) {
                    const markdownText =
                        typeof remoteConfig.text === 'string'
                            ? remoteConfig.text
                            : typeof remoteConfig.textHtml === 'string'
                                ? stripHtmlTags(remoteConfig.textHtml)
                                : DEFAULT_HELP_CONFIG.text;
                    const normalized: HelpConfig = {
                        text: markdownText,
                        _metadata: {
                            configName: remoteConfig?._metadata?.configName,
                        },
                    };
                    setHelpConfig(normalized);
                    setHelpFormData(normalized);
                    return;
                } else {
                    setHelpConfig(DEFAULT_HELP_CONFIG);
                    setHelpFormData(DEFAULT_HELP_CONFIG);
                }
            } catch (error) {
                console.error('Failed to load help configuration:', error);
                setHelpConfig(DEFAULT_HELP_CONFIG);
                setHelpFormData(DEFAULT_HELP_CONFIG);
            } finally {
                setHelpConfigLoading(false);
            }
        };

        fetchHelpConfig();
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!showHelpPanel) return;
            if (helpPanelRef.current && !helpPanelRef.current.contains(event.target as Node)) {
                setShowHelpPanel(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [showHelpPanel]);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        // Exit edit mode when collapsing to avoid UI conflicts
        if (!isCollapsed && editMode) {
            setEditMode(false);
        }
        if (!isCollapsed) {
            setShowHelpPanel(false);
        }
    };

    const handleOpenHelpConfig = () => {
        if (!isAdmin || !isEditModeAllowed) return;
        setHelpFormData(helpConfig);
        setHelpConfigStatus(null);
        setShowHelpConfigModal(true);
    };

    const handleSaveHelpConfig = async () => {
        try {
            setHelpConfigSaving(true);
            setHelpConfigStatus(null);
            const payload = {
                text: helpFormData.text.trim() || DEFAULT_HELP_CONFIG.text,
            };
            const saved = await sapODataService.saveUIConfig(
                'help',
                payload,
                helpConfig._metadata?.configName
            );
            const updated: HelpConfig = {
                text: typeof saved.text === 'string' ? saved.text : payload.text,
                _metadata: {
                    configName: saved?._metadata?.configName,
                },
            };
            setHelpConfig(updated);
            setHelpFormData(updated);
            setHelpConfigStatus({ type: 'success', text: 'Help information saved successfully.' });
            setTimeout(() => {
                setShowHelpConfigModal(false);
                setHelpConfigStatus(null);
            }, 800);
        } catch (error) {
            console.error('Failed to save help configuration:', error);
            setHelpConfigStatus({ type: 'error', text: 'Unable to save help information. Please try again.' });
        } finally {
            setHelpConfigSaving(false);
        }
    };

    const handleAddItem = () => {
        setSidebarModal({
            isOpen: true,
            mode: 'add',
            item: undefined, // Explicitly clear any previous item
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

    const handleCopyTabLink = async (item: MenuItem) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
            const tabUrl = `${baseUrl}/?view=edit&tabId=${item.id}`;
            await navigator.clipboard.writeText(tabUrl);
            setCopiedTabLinkId(item.id);
            setTimeout(() => setCopiedTabLinkId(null), 2000);
        } catch {
            try {
                const textArea = document.createElement('textarea');
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
                textArea.value = `${baseUrl}/?view=edit&tabId=${item.id}`;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopiedTabLinkId(item.id);
                setTimeout(() => setCopiedTabLinkId(null), 2000);
            } catch {
                alert('Failed to copy URL to clipboard');
            }
        }
    };

    const handleSaveItem = async (item: MenuItem) => {
        try {
            setIsSaving(true);

            if (sidebarModal.mode === 'add') {
                // Calculate max sort_order and increment by 1
                const maxOrder = menuItems.length > 0
                    ? Math.max(...menuItems.map(i => i.order || 0))
                    : -1;
                const newOrder = maxOrder + 1;

                const newItem = {
                    ...item,
                    id: '',
                    appid: item.appid || '',
                    order: newOrder,
                    isNew: true,
                };

                const savedItem = await sapODataService.saveMenuItem(newItem, false);
                // Update the menu items list
                const updatedItems = [...menuItems, savedItem];
                onMenuItemsChange(updatedItems);
            } else {
                const updatedItem = {
                    ...item,
                    appid: item.appid || '',
                    hasChanges: true,
                    isNew: false,
                };

                const savedItem = await sapODataService.saveMenuItem(updatedItem, true);
                onMenuItemsChange(menuItems.map((i) => (i.id === item.id ? savedItem : i)));
            }

            // Reset modal state to clear form for next add
            setSidebarModal({
                isOpen: false,
                mode: 'add',
            });
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
                const hasOrderChange =
                    tempItems.length === menuItems.length &&
                    tempItems.some(
                        (item, index) =>
                            menuItems[index]?.id !== item.id
                    );
                const itemsForSave = hasOrderChange
                    ? tempItems.map((item, index) => ({
                        ...item,
                        order: index,
                    }))
                    : tempItems;
                if (hasOrderChange) {
                    const sortOrderPayload = itemsForSave
                        .map((item, index) =>
                            item.isNew
                                ? null
                                : { Id: item.id, SortOrd: index.toString() }
                        )
                        .filter(
                            (x): x is { Id: string; SortOrd: string } =>
                                x !== null
                        );
                    if (sortOrderPayload.length > 0) {
                        await sapODataService.updateMenuItemsSortOrder(
                            sortOrderPayload
                        );
                    }
                }

                const itemsWithOtherChanges = itemsForSave.filter(
                    (item) =>
                        item.isNew ||
                        (item.hasChanges &&
                            (() => {
                                const orig = menuItems.find(
                                    (m) => m.id === item.id
                                );
                                return (
                                    !orig ||
                                    orig.visible !== item.visible ||
                                    orig.name !== item.name ||
                                    orig.description !== item.description
                                );
                            })())
                );
                for (const item of itemsWithOtherChanges) {
                    await sapODataService.saveMenuItem(item, !item.isNew);
                }

                const freshItems = await sapODataService.fetchMenuItems();
                onMenuItemsChange(freshItems);
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
        if (result.source.index === result.destination.index) return;

        const sourceItemId = filteredItems[result.source.index]?.id;
        const destinationItemId = filteredItems[result.destination.index]?.id;
        if (!sourceItemId || !destinationItemId) return;

        const items = Array.from(tempItems);
        const sourceIndexInAll = items.findIndex((item) => item.id === sourceItemId);
        const destinationIndexInAll = items.findIndex((item) => item.id === destinationItemId);
        if (sourceIndexInAll < 0 || destinationIndexInAll < 0) return;

        const [reorderedItem] = items.splice(sourceIndexInAll, 1);
        items.splice(destinationIndexInAll, 0, reorderedItem);

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

    // Filter out deleted/unsorted items and keep sidebar aligned with persisted sort order.
    // In non‑edit mode, hide items that are marked as not visible so they cannot be selected.
    const filteredItems = tempItems
        .filter((item) => !item.deleted)
        .filter((item) => Number.isFinite(Number(item.order)))
        .sort((a, b) => Number(a.order) - Number(b.order))
        .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
        .filter((item) => (editMode ? true : item.visible !== false));

    // Get first letter or icon for collapsed state
    const getItemIcon = (item: MenuItem) => {
        // You can customize this based on your MenuItem type structure
        return item.name.charAt(0).toUpperCase();
    };

    return (
        <div
            className={`flex h-screen flex-col p-4 text-white ease-in-out ${isCollapsed ? 'w-16' : 'w-64 min-w-[16rem]'
                }`}
            style={{ background: 'var(--sidebar-bg)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
        >
            {/* Header with Toggle Button */}
            {isCollapsed ? (
                <div className="mb-2 flex flex-col">
                    <div className="flex justify-center">
                        <PSCLogo />
                    </div>
                    <div className="mt-2 flex w-full justify-end">
                        <button
                            onClick={toggleSidebar}
                            className="rounded-md p-2 text-white transition-colors hover:bg-[#ffffff20]"
                            title="Expand Sidebar"
                        >
                            <Bars3Icon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center space-x-2">
                        <PSCLogo />
                        <div className="flex flex-col">
                            <h1 className="text-xs leading-tight font-semibold">P&SC Intelligence Centre</h1>
                        </div>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="rounded-md p-2 text-white transition-colors hover:bg-[#ffffff20]"
                        title="Collapse Sidebar"
                    >
                        <Bars3Icon className="h-5 w-5" />
                    </button>
                </div>
            )}
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
                            className="w-full rounded-md p-2 pl-10 text-[var(--sidebar-text)] outline-none"
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: '1px solid var(--sidebar-search-border)',
                            }}
                            disabled={isSaving}
                        />
                    </div>
                    {isEditModeAllowed && (
                        <button
                            onClick={toggleEditMode}
                            disabled={isSaving || isLoading}
                            className={`rounded-md p-2 ${editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                                } transition-colors disabled:cursor-not-allowed disabled:opacity-50`}
                            title={editMode ? 'Save Changes' : 'Edit Menu'}
                        >
                            {isSaving ? (
                                <LoadingScreen />
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
                        <LoadingScreen />
                    </div>
                ) : (
                    <DragDropContext onDragEnd={editMode && !isCollapsed ? onDragEnd : () => { }}>
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
                                                    className={`group relative flex cursor-pointer items-center rounded px-3 py-2 transition-colors ${selectedItem === item.id
                                                        ? 'text-[var(--sidebar-text-active)]'
                                                        : 'text-[var(--sidebar-text)] hover:bg-[#ffffff30]'
                                                        } ${isSaving ? 'opacity-50' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                                                    style={{
                                                        ...(selectedItem === item.id
                                                            ? {
                                                                background: 'var(--sidebar-active-bg)',
                                                                boxShadow: '0px 4px 4px rgba(69, 84, 110, 0.1)',
                                                            }
                                                            : {}),
                                                        ...(provided.draggableProps.style || {}),
                                                    }}
                                                    onClick={() => !isSaving && onItemSelect(item)}
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
                                                        <span className="flex flex-1 items-center gap-2">
                                                            {item.name}
                                                            {isEditModeAllowed && !item.visible && (
                                                                <EyeSlashIcon
                                                                    className="h-4 w-4 shrink-0 text-amber-400"
                                                                    title="Hidden"
                                                                />
                                                            )}
                                                        </span>
                                                    )}

                                                    {/* Copy URL button - only show in display mode and when not collapsed */}
                                                    {/* {!editMode && !isCollapsed && (
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
                          )} */}

                                                    {/* {!isCollapsed && item.roles && item.roles.length > 0 && (
                            <ShieldCheckIcon className="mr-1 h-4 w-4 text-blue-400" />
                          )} */}

                                                    {editMode && !isCollapsed && (
                                                        <div className="flex space-x-1">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCopyTabLink(item);
                                                                }}
                                                                disabled={isSaving}
                                                                className={`rounded p-1 ${copiedTabLinkId === item.id
                                                                    ? 'bg-green-600 hover:bg-green-700'
                                                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                                                    } transition-colors disabled:opacity-50`}
                                                                title={copiedTabLinkId === item.id ? 'Link Copied!' : 'Copy Direct Link'}
                                                            >
                                                                {copiedTabLinkId === item.id ? (
                                                                    <CheckIcon className="h-3 w-3 text-white" />
                                                                ) : (
                                                                    <LinkIcon className="h-3 w-3 text-white" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleItemVisibility(item.id);
                                                                }}
                                                                disabled={isSaving}
                                                                className={`rounded p-1 ${!item.visible
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
            {/* User Profile & Theme Toggle - Hidden when collapsed */}
            {!isCollapsed && (
                <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4">
                    <UserProfile
                        userInfo={userInfo}
                        userInfoLoading={userInfoLoading}
                        formatTime={formatTime}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--sidebar-text)] opacity-80">Theme</span>
                        <ThemeSettingsButton />
                    </div>
                    <div className="relative w-full" ref={helpPanelRef}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[var(--sidebar-text)] opacity-80">Help</span>
                            <div className="flex items-center gap-1">
                                {isAdmin && isEditModeAllowed && (
                                    <button
                                        type="button"
                                        onClick={handleOpenHelpConfig}
                                        className="rounded-md p-1.5 text-[var(--sidebar-text)] opacity-90 transition-colors hover:bg-white/15"
                                        aria-label="Configure help information"
                                        title="Configure help information"
                                    >
                                        <Cog6ToothIcon className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowHelpPanel((prev) => !prev)}
                                    className="rounded-full p-1 transition-colors hover:bg-white/15"
                                    aria-label="Open help information"
                                    title="Help"
                                >
                                    <QuestionMarkCircleIcon className="h-5 w-5 text-[var(--sidebar-text)]" />
                                </button>
                            </div>
                        </div>
                        {showHelpPanel && (
                            <div className="absolute right-0 bottom-full left-0 z-40 mb-2 rounded-xl border border-white/20 bg-[#0c3267]/95 p-3 text-xs text-white shadow-2xl backdrop-blur-md">
                                <p className="mb-2 text-[11px] font-semibold tracking-wide text-white/80 uppercase">
                                    Help & Support
                                </p>
                                <div
                                    className="prose prose-invert max-w-none text-white/95 [&_a]:font-medium [&_a]:text-[#8FE7FF] [&_a]:underline [&_li]:my-1 [&_ol]:my-1 [&_p]:my-1 [&_ul]:my-1"
                                >
                                    <Markdown
                                        options={{
                                            forceBlock: true,
                                            overrides: {
                                                a: {
                                                    props: {
                                                        target: '_blank',
                                                        rel: 'noopener noreferrer',
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {helpConfig.text || DEFAULT_HELP_CONFIG.text}
                                    </Markdown>
                                </div>
                                {helpConfigLoading && <p className="mt-2 text-white/75">Loading help content...</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {showHelpConfigModal && isAdmin && isEditModeAllowed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        className="w-full max-w-md rounded-xl border border-white/20 p-4 shadow-2xl"
                        style={{ background: 'var(--sidebar-bg)', color: 'var(--sidebar-text)' }}
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-base font-semibold">Configure Help Information</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowHelpConfigModal(false);
                                    setHelpConfigStatus(null);
                                }}
                                className="rounded p-1 hover:bg-white/15"
                                aria-label="Close help configuration"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-xs opacity-90">Help Text (Markdown)</label>
                                <textarea
                                    value={helpFormData.text}
                                    onChange={(e) =>
                                        setHelpFormData((prev) => ({ ...prev, text: e.target.value || '' }))
                                    }
                                    placeholder={
                                        '- To get the required authorization role, [Click here](https://example.com)\n- For support, please contact [Procurement & Supply Chain Control Tower](mailto:support@example.com)'
                                    }
                                    className="mt-1 w-full rounded border border-white/30 bg-[#0f2f5a] p-2 text-xs text-white outline-none focus:border-blue-400"
                                    rows={10}
                                />
                            </div>
                            <div>
                                <p className="text-[11px] opacity-75">
                                    Paste Markdown here. Links format: [label](https://example.com) or [email](mailto:support@example.com).
                                </p>
                            </div>
                            {helpConfigStatus && (
                                <div
                                    className={`rounded border px-2 py-1 text-xs ${helpConfigStatus.type === 'success'
                                        ? 'border-green-500/40 bg-green-500/15 text-green-100'
                                        : 'border-red-500/40 bg-red-500/15 text-red-100'
                                        }`}
                                >
                                    {helpConfigStatus.text}
                                </div>
                            )}
                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setHelpFormData(helpConfig);
                                        setShowHelpConfigModal(false);
                                        setHelpConfigStatus(null);
                                    }}
                                    className="rounded bg-gray-600 px-3 py-1.5 text-xs text-white hover:bg-gray-700"
                                    disabled={helpConfigSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveHelpConfig}
                                    className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                                    disabled={helpConfigSaving}
                                >
                                    {helpConfigSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Sidebar Item Modal */}
            <SidebarItemModal
                modal={sidebarModal}
                menuItems={menuItems}
                onClose={() => setSidebarModal({ isOpen: false, mode: 'add', item: undefined })}
                onSave={handleSaveItem}
                isSaving={isSaving}
            />
        </div>
    );
};
