import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { IconButton, Tooltip } from '@mui/material';
import { DragIndicator } from '@mui/icons-material';
import { MenuItemProps } from '../types';

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  index,
  selectedItem,
  isEditing,
  itemRef,
  onSelect,
  onEditClick,
  onToggleHidden,
  onDeleteItem,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragEnd,
}) => {
  return (
    <li
      ref={itemRef}
      draggable={isEditing}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      className={`rounded px-4 py-2 ${item.hidden && isEditing ? 'opacity-50' : ''} ${selectedItem === item.name ? 'bg-white text-black' : 'text-white hover:bg-[#ffffff30]'} ${isEditing ? 'border border-dashed border-gray-400' : ''} group flex items-center justify-between`}
      data-index={index}
    >
      <div className="flex flex-1 items-center">
        {isEditing && (
          <div className="mr-2 cursor-grab">
            <DragIndicator fontSize="small" />
          </div>
        )}
        <span className="flex-1" onClick={() => !isEditing && onSelect(item.name)}>
          {item.name}
        </span>
      </div>

      {isEditing && (
        <div className="flex space-x-1">
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => onEditClick(item)}
              className="text-gray-300 hover:text-white"
            >
              <PencilIcon className="h-4 w-4 text-white" />
            </IconButton>
          </Tooltip>
          <Tooltip title={item.hidden ? 'Show' : 'Hide'}>
            <IconButton
              size="small"
              onClick={() => onToggleHidden(item.id)}
              className="text-gray-300 hover:text-white"
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
              onClick={() => onDeleteItem(item.id)}
              className="text-gray-300 hover:text-white"
            >
              <TrashIcon className="h-4 w-4 text-white" />
            </IconButton>
          </Tooltip>
        </div>
      )}
    </li>
  );
};

export default MenuItem;
