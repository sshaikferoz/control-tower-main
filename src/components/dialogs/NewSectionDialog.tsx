import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Section } from '@/services/sapODataService';

interface NewSectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (section: Partial<Section>) => void;
  tabId: string;
}

export const NewSectionDialog: React.FC<NewSectionDialogProps> = ({
  open,
  onClose,
  onSave,
  tabId,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'SCM Report',
    visible: true,
    roles: [] as any[],
  });

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    type: 'Custom',
  });

  const [showAddRole, setShowAddRole] = useState(false);

  const handleAddRole = () => {
    if (newRole.name.trim()) {
      const role = {
        RoleId: '',
        Id: '',
        Name: newRole.name,
        Description: newRole.description,
        Type: newRole.type,
        DelFlag: '',
      };

      setFormData({
        ...formData,
        roles: [...formData.roles, role],
      });

      setNewRole({
        name: '',
        description: '',
        type: 'Custom',
      });
      setShowAddRole(false);
    }
  };

  const handleRemoveRole = (index: number) => {
    const updatedRoles = formData.roles.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      roles: updatedRoles,
    });
  };

  const handleSave = () => {
    const newSection: Partial<Section> = {
      tabId,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      visible: formData.visible,
      roles: formData.roles,
      order: 0,
      deleted: false,
      widgets: [],
      isNew: true,
      hasChanges: true,
      expanded: true,
    };

    onSave(newSection);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'SCM Report',
      visible: true,
      roles: [],
    });
    setShowAddRole(false);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Create New Section</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Section Name*</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter section name"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">Expanded by Default</label>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.visible}
                onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>

          {/* Role Management Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">Roles</label>
              <button
                onClick={() => setShowAddRole(true)}
                className="rounded bg-green-600 px-3 py-1 text-sm text-white transition-colors hover:bg-green-700"
              >
                + Add Role
              </button>
            </div>

            <div className="max-h-40 space-y-2 overflow-y-auto">
              {formData.roles.map((role, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3"
                >
                  <div>
                    <div className="font-medium text-white">{role.Name}</div>
                    <div className="text-sm text-gray-400">{role.Description}</div>
                    <div className="text-xs text-gray-500">{role.Type}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveRole(index)}
                    className="text-red-400 transition-colors hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {showAddRole && (
              <div className="mt-4 rounded border border-[#3a5a8b] bg-[#2a4a7b] p-4">
                <h4 className="mb-3 font-medium text-white">Add New Role</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Role Name"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="w-full rounded border border-[#3a5a8b] bg-[#1a3a6b] p-2 text-white outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Role Description"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    className="w-full rounded border border-[#3a5a8b] bg-[#1a3a6b] p-2 text-white outline-none focus:border-blue-500"
                  />
                  <select
                    value={newRole.type}
                    onChange={(e) => setNewRole({ ...newRole, type: e.target.value })}
                    className="w-full rounded border border-[#3a5a8b] bg-[#1a3a6b] p-2 text-white outline-none focus:border-blue-500"
                  >
                    <option value="Custom">Custom</option>
                    <option value="System">System</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddRole}
                      className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddRole(false)}
                      className="rounded bg-gray-600 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-500"
            disabled={!formData.name.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
