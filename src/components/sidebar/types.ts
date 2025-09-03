// Shared types for the Sidebar components

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  order: number;
  type: string;
  hidden: boolean;
}

export interface ItemRefs {
  [key: number]: HTMLLIElement | null;
}

export interface MenuItemProps {
  item: MenuItem;
  index: number;
  selectedItem: string;
  isEditing: boolean;
  isDragging: boolean;
  draggedIndex: number | null;
  itemRef: (el: HTMLLIElement | null) => void;
  onSelect: (name: string) => void;
  onEditClick: (item: MenuItem) => void;
  onToggleHidden: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLLIElement>, index: number) => void;
  onDragEnd: () => void;
}

export interface AddEditDialogProps {
  open: boolean;
  dialogTitle: string;
  currentItem: MenuItem | null;
  onClose: () => void;
  onSave: () => void;
  setCurrentItem: React.Dispatch<React.SetStateAction<MenuItem | null>>;
}

export interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
}

export interface EditModeControlsProps {
  isEditing: boolean;
  onSaveEdit: () => void;
}

export interface UserProfileWidgetProps {
  username: string;
  lastLogin: string;
  imagePath: string;
}
