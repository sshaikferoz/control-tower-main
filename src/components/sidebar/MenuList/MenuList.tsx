import React from 'react';
import MenuItem from './MenuItem';
import { MenuItem as MenuItemType } from '../types';

interface MenuListProps {
  filteredItems: MenuItemType[];
  selectedItem: string;
  isEditing: boolean;
  draggedIndex: number | null;
  isDragging: boolean;
  itemRefs: React.MutableRefObject<{ [key: number]: HTMLLIElement | null }>;
  setSelectedItem: (name: string) => void;
  handleEditClick: (item: MenuItemType) => void;
  handleToggleHidden: (id: string) => void;
  handleDeleteItem: (id: string) => void;
  handleDragStart: (e: React.DragEvent<HTMLLIElement>, index: number) => void;
  handleDragOver: (e: React.DragEvent<HTMLLIElement>) => void;
  handleDragEnter: (e: React.DragEvent<HTMLLIElement>, index: number) => void;
  handleDragEnd: () => void;
}

const MenuList: React.FC<MenuListProps> = ({
  filteredItems,
  selectedItem,
  isEditing,
  draggedIndex,
  isDragging,
  itemRefs,
  setSelectedItem,
  handleEditClick,
  handleToggleHidden,
  handleDeleteItem,
  handleDragStart,
  handleDragOver,
  handleDragEnter,
  handleDragEnd,
}) => {
  return (
    <nav className="mt-6 flex-grow overflow-y-auto">
      <ul className="space-y-2">
        {filteredItems.map((item, index) => (
          <MenuItem
            key={item.id}
            item={item}
            index={index}
            selectedItem={selectedItem}
            isEditing={isEditing}
            isDragging={isDragging}
            draggedIndex={draggedIndex}
            itemRef={(el) => (itemRefs.current[index] = el)}
            onSelect={setSelectedItem}
            onEditClick={handleEditClick}
            onToggleHidden={handleToggleHidden}
            onDeleteItem={handleDeleteItem}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
          />
        ))}
      </ul>
    </nav>
  );
};

export default MenuList;
