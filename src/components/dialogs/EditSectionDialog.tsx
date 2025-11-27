import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, XCircle } from 'lucide-react';
import { Section } from '@/services/sap/client';

interface EditSectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (section: Section) => void;
  section: Section | null;
}

export const EditSectionDialog: React.FC<EditSectionDialogProps> = ({
  open,
  onClose,
  onSave,
  section,
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

  const [editingRoleKey, setEditingRoleKey] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<{ index: number; name: string; roleId: string } | null>(null);

  useEffect(() => {
      if (section) {
    console.log('section', section);
      // Ensure roles are properly formatted
      const formattedRoles = (section.roles || []).map((role: any) => {
        // If role is already an object with proper structure, keep it
        if (typeof role === 'object' && role.Name !== undefined) {
          return {
            RoleId: role.RoleId || '',
            Id: role.Id || section.id || '',
            Name: role.Name || '',
            Description: role.Description || '',
            Type: role.Type || 'Custom',
            DelFlag: role.DelFlag || '',
          };
        }
        // If role is a string, convert it to object
        if (typeof role === 'string') {
          return {
            RoleId: '',
            Id: section.id || '',
            Name: role,
            Description: '',
            Type: 'Custom',
            DelFlag: '',
          };
        }
        return role;
      });

      setFormData({
        name: section.name,
        description: section.description,
        type: section.type,
        visible: section.visible,
        roles: formattedRoles,
      });
    }
  }, [section]);

  const handleAddRole = () => {
    if (newRole.name.trim()) {
      const role = {
        RoleId: '', // Will be assigned by backend for new roles
        Id: section?.id || '',
        Name: newRole.name.trim(),
        Description: newRole.description.trim(),
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

  const handleRemoveRoleClick = (index: number) => {
    const role = formData.roles[index];
    setDeleteConfirmRole({ index, name: role.Name, roleId: role.RoleId || '' });
  };

  const confirmRemoveRole = () => {
    if (!deleteConfirmRole) return;
    
    const { index } = deleteConfirmRole;
    const role = formData.roles[index];
    
    // If role has a RoleId (exists in database), mark it as deleted
    if (role.RoleId) {
      const updatedRoles = formData.roles.map((r, i) => 
        i === index ? { ...r, DelFlag: 'X' } : r
      );
      setFormData({
        ...formData,
        roles: updatedRoles,
      });
    } else {
      // If role doesn't have a RoleId (newly added), remove it completely
      const updatedRoles = formData.roles.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        roles: updatedRoles,
      });
    }
    setDeleteConfirmRole(null);
  };

  const cancelRemoveRole = () => {
    setDeleteConfirmRole(null);
  };

  const getRoleKey = (role: any, index: number): string => {
    // Use RoleId if available, otherwise use Name + index as fallback
    return role.RoleId ? `role-${role.RoleId}` : `role-${role.Name}-${index}`;
  };

  const handleStartEditRole = (roleKey: string) => {
    const roleIndex = formData.roles.findIndex((role, index) => getRoleKey(role, index) === roleKey);
    if (roleIndex !== -1) {
      setEditingRoleKey(roleKey);
      setEditingRole({ ...formData.roles[roleIndex] });
    }
  };

  const handleSaveEditRole = () => {
    if (editingRoleKey !== null && editingRole) {
      const roleIndex = formData.roles.findIndex((role, index) => getRoleKey(role, index) === editingRoleKey);
      if (roleIndex !== -1) {
        const updatedRoles = formData.roles.map((role, index) =>
          index === roleIndex ? editingRole : role
        );
        setFormData({
          ...formData,
          roles: updatedRoles,
        });
      }
      setEditingRoleKey(null);
      setEditingRole(null);
    }
  };

  const handleCancelEditRole = () => {
    setEditingRoleKey(null);
    setEditingRole(null);
  };

  const handleSave = () => {
    if (!section) return;

    // Filter out roles that are marked for deletion but keep them for backend processing
    const updatedSection: Section = {
      ...section,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      visible: formData.visible,
      roles: formData.roles, // Include all roles (with DelFlag) for backend processing
      hasChanges: true,
    };

    onSave(updatedSection);
    onClose();
  };

  const handleCancel = () => {
    if (section) {
      setFormData({
        name: section.name,
        description: section.description,
        type: section.type,
        visible: section.visible,
        roles: section.roles || [],
      });
    }
    setShowAddRole(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Edit Section</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic Section Information */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Section Name*</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter section name"
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

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Type*</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
            >
              <option value="SCM Report">SCM Report</option>
              <option value="Dashboard">Dashboard</option>
              <option value="Analytics">Analytics</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">Visible</label>
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

          {/* Roles Management */}
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

            {/* Role List */}
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {formData.roles
                .map((role, index) => ({ role, index }))
                .filter(({ role }) => role.DelFlag !== 'X') // Hide deleted roles from display
                .map(({ role, index: actualIndex }) => {
                  const roleKey = getRoleKey(role, actualIndex);
                  const isEditing = editingRoleKey === roleKey;

                  return (
                    <div
                      key={role.RoleId || role.Name || actualIndex}
                      className="flex items-center justify-between rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3"
                    >
                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editingRole?.Name || ''}
                            onChange={(e) =>
                              setEditingRole({ ...editingRole, Name: e.target.value })
                            }
                            className="w-full rounded border border-[#3a5a8b] bg-[#1a3a6b] p-2 text-white outline-none focus:border-blue-500"
                            placeholder="Role Name"
                          />
                          <input
                            type="text"
                            value={editingRole?.Description || ''}
                            onChange={(e) =>
                              setEditingRole({ ...editingRole, Description: e.target.value })
                            }
                            className="w-full rounded border border-[#3a5a8b] bg-[#1a3a6b] p-2 text-white outline-none focus:border-blue-500"
                            placeholder="Role Description"
                          />
                          <select
                            value={editingRole?.Type || 'Custom'}
                            onChange={(e) =>
                              setEditingRole({ ...editingRole, Type: e.target.value })
                            }
                            className="w-full rounded border border-[#3a5a8b] bg-[#1a3a6b] p-2 text-white outline-none focus:border-blue-500"
                          >
                            <option value="Custom">Custom</option>
                            <option value="System">System</option>
                          </select>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEditRole}
                              className="flex items-center space-x-1 rounded bg-blue-600 px-2 py-1 text-sm text-white transition-colors hover:bg-blue-700"
                            >
                              <Save className="h-3 w-3" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={handleCancelEditRole}
                              className="flex items-center space-x-1 rounded bg-gray-600 px-2 py-1 text-sm text-white transition-colors hover:bg-gray-700"
                            >
                              <XCircle className="h-3 w-3" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-white">{role.Name}</div>
                              {role.RoleId && (
                                <span className="rounded bg-green-600 px-2 py-0.5 text-xs text-white">
                                  Existing
                                </span>
                              )}
                            </div>
                            {role.Description && (
                              <div className="mt-1 text-sm text-gray-400">{role.Description}</div>
                            )}
                            <div className="mt-1 text-xs text-gray-500">{role.Type}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleStartEditRole(roleKey)}
                              className="text-blue-400 transition-colors hover:text-blue-300"
                              title="Edit role"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveRoleClick(actualIndex)}
                              className="text-red-400 transition-colors hover:text-red-300"
                              title="Remove role"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              {formData.roles.filter((role) => role.DelFlag !== 'X').length === 0 && (
                <div className="rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-center text-sm text-gray-400">
                  No roles assigned. Click "+ Add Role" to add roles.
                </div>
              )}
            </div>

            {/* Add Role Form */}
            {showAddRole && (
              <div className="mt-4 rounded border border-[#3a5a8b] bg-[#2a4a7b] p-4">
                <h4 className="mb-3 font-medium text-white">Add New Role</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Role Name *"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newRole.name.trim()) {
                        handleAddRole();
                      }
                    }}
                    className="w-full rounded border border-[#3a5a8b] bg-[#1a3a6b] p-2 text-white outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Role Description (Optional)"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newRole.name.trim()) {
                        handleAddRole();
                      }
                    }}
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
                      disabled={!newRole.name.trim()}
                      className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-500"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddRole(false);
                        setNewRole({ name: '', description: '', type: 'Custom' });
                      }}
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
            Update Section
          </button>
        </div>
      </div>

      {/* Delete Role Confirmation Dialog */}
      {deleteConfirmRole && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-6 shadow-xl">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/20">
                <X className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Confirm Role Deletion</h3>
            </div>

            <div className="mb-4 rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-3">
              <p className="text-sm text-yellow-200">
                {deleteConfirmRole.roleId
                  ? 'This role is already saved. It will be marked as deleted and removed from the section authorization.'
                  : 'This role has not been saved yet. It will be permanently removed.'}
              </p>
            </div>

            <p className="mb-6 text-sm text-gray-300">
              Are you sure you want to remove the role <strong className="text-white">{deleteConfirmRole.name}</strong>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelRemoveRole}
                className="rounded bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveRole}
                className="rounded bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
