import React, { useState, useEffect } from 'react';
import { MenuItem, SidebarModalState } from '../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { RoleManagement } from './RoleManagement';

interface SidebarItemModalProps {
  modal: SidebarModalState;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  isSaving?: boolean;
}

export const SidebarItemModal: React.FC<SidebarItemModalProps> = ({
  modal,
  onClose,
  onSave,
  isSaving = false,
}) => {
  const [item, setItem] = useState<MenuItem>({
    id: '',
    name: '',
    appid: '',
    description: '',
    visible: true,
    order: 0,
    type: 'Section',
    deleted: false,
    roles: [],
    isNew: true,
  });

  useEffect(() => {
    if (modal.item) {
      setItem(modal.item);
    } else {
      setItem({
        id: '',
        name: '',
        appid: '',
        description: '',
        visible: true,
        order: 0,
        type: 'Section',
        deleted: false,
        roles: [],
        isNew: true,
      });
    }
  }, [modal.item]);

  const handleSave = () => {
    if (!item.name.trim() || isSaving) return;
    onSave(item);
  };

  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]/10">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {modal.mode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
            disabled={isSaving}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <Input
            label="Title*"
            value={item.name}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            placeholder="Enter menu item title"
            disabled={isSaving}
          />

          {/* Add the appid field here */}
          <Input
            label="App ID"
            value={item.appid}
            onChange={(e) => setItem({ ...item, appid: e.target.value })}
            placeholder="Enter app identifier"
            disabled={isSaving}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={item.description}
              onChange={(e) => setItem({ ...item, description: e.target.value })}
              className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter description"
              rows={3}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">Visible</label>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={item.visible}
                onChange={(e) => setItem({ ...item, visible: e.target.checked })}
                className="peer sr-only"
                disabled={isSaving}
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Type*</label>
            <select
              value={item.type}
              onChange={(e) => setItem({ ...item, type: e.target.value })}
              className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
              disabled={isSaving}
            >
              <option value="Section">Widget Section</option>
              <option value="Dashboard">Dashboard / Reports Menu</option>
            </select>
          </div>

          <RoleManagement
            roles={item.roles}
            onRolesChange={(roles) => setItem({ ...item, roles })}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!item.name.trim() || isSaving}>
            {isSaving ? 'Saving...' : modal.mode === 'add' ? 'Add Item' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
