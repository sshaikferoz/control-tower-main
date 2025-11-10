import React, { useState } from 'react';
import { Role } from '../../types';
import { UserGroupIcon, XMarkIcon, PlusIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface RoleManagementProps {
  roles: Role[];
  onRolesChange: (roles: Role[]) => void;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ roles, onRolesChange }) => {
  const [newRole, setNewRole] = useState<Role>({
    RoleId: '',
    Id: '',
    Name: '',
    Description: '',
    Type: 'Tab',
    DelFlag: '',
  });

  const [editingRoleKey, setEditingRoleKey] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<{ roleId: string; id: string; name: string } | null>(null);

  const getRoleKey = (role: Role, index: number): string => {
    // Use RoleId if available, otherwise use Id or Name + index as fallback
    return role.RoleId ? `role-${role.RoleId}` : role.Id ? `role-${role.Id}` : `role-${role.Name}-${index}`;
  };

  const addRole = () => {
    if (!newRole.Name.trim()) return;

    const roleToAdd = {
      ...newRole,
      RoleId: '',
      Id: Date.now().toString(),
    };

    onRolesChange([...roles, roleToAdd]);
    setNewRole({
      RoleId: '',
      Id: '',
      Name: '',
      Description: '',
      Type: 'Tab',
      DelFlag: '',
    });
  };

  const handleRemoveRoleClick = (roleId: string, id: string, name: string) => {
    setDeleteConfirmRole({ roleId, id, name });
  };

  const confirmRemoveRole = () => {
    if (!deleteConfirmRole) return;
    
    const { roleId, id } = deleteConfirmRole;
    // If role has a RoleId (exists in database), mark it as deleted
    if (roleId) {
      onRolesChange(
        roles.map((role) => (role.RoleId === roleId ? { ...role, DelFlag: 'X' } : role))
      );
    } else {
      // If role doesn't have a RoleId (newly added), remove it completely
      onRolesChange(roles.filter((role) => role.Id !== id));
    }
    setDeleteConfirmRole(null);
  };

  const cancelRemoveRole = () => {
    setDeleteConfirmRole(null);
  };

  const handleStartEditRole = (roleKey: string) => {
    const roleIndex = roles.findIndex((role, index) => getRoleKey(role, index) === roleKey);
    if (roleIndex !== -1) {
      setEditingRoleKey(roleKey);
      setEditingRole({ ...roles[roleIndex] });
    }
  };

  const handleSaveEditRole = () => {
    if (editingRoleKey !== null && editingRole) {
      const roleIndex = roles.findIndex((role, index) => getRoleKey(role, index) === editingRoleKey);
      if (roleIndex !== -1) {
        const updatedRoles = roles.map((role, index) =>
          index === roleIndex ? editingRole : role
        );
        onRolesChange(updatedRoles);
      }
      setEditingRoleKey(null);
      setEditingRole(null);
    }
  };

  const handleCancelEditRole = () => {
    setEditingRoleKey(null);
    setEditingRole(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <UserGroupIcon className="h-5 w-5 text-gray-300" />
        <label className="text-sm font-medium text-gray-300">Roles</label>
      </div>

      {/* Existing roles */}
      <div className="max-h-32 space-y-2 overflow-y-auto">
        {roles
          .map((role, index) => ({ role, index }))
          .filter(({ role }) => role.DelFlag !== 'X') // Hide deleted roles
          .map(({ role, index: actualIndex }) => {
            const roleKey = getRoleKey(role, actualIndex);
            const isEditing = editingRoleKey === roleKey;

            return (
              <div
                key={role.RoleId || role.Id || actualIndex}
                className="flex items-center justify-between rounded bg-[#3a5a8b] p-2"
              >
                {isEditing && editingRole ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editingRole.Name || ''}
                      onChange={(e) =>
                        setEditingRole({ ...editingRole, Name: e.target.value })
                      }
                      className="w-full rounded border border-[#3a5a8b] bg-[#1a3a6b] p-2 text-sm text-white outline-none focus:border-blue-500"
                      placeholder="Role Name"
                    />
                    <input
                      type="text"
                      value={editingRole.Description || ''}
                      onChange={(e) =>
                        setEditingRole({ ...editingRole, Description: e.target.value })
                      }
                      className="w-full rounded border border-[#3a5a8b] bg-[#1a3a6b] p-2 text-sm text-white outline-none focus:border-blue-500"
                      placeholder="Role Description"
                    />
                    <select
                      value={editingRole.Type || 'Tab'}
                      onChange={(e) =>
                        setEditingRole({ ...editingRole, Type: e.target.value })
                      }
                      className="w-full rounded border border-[#3a5a8b] bg-[#1a3a6b] p-2 text-sm text-white outline-none focus:border-blue-500"
                    >
                      <option value="Tab">Tab</option>
                      <option value="Custom">Custom</option>
                      <option value="System">System</option>
                    </select>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEditRole}
                        className="flex items-center space-x-1 rounded bg-blue-600 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-700"
                      >
                        <CheckIcon className="h-3 w-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEditRole}
                        className="flex items-center space-x-1 rounded bg-gray-600 px-2 py-1 text-xs text-white transition-colors hover:bg-gray-700"
                      >
                        <XMarkIcon className="h-3 w-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{role.Name}</p>
                        {role.RoleId && (
                          <span className="rounded bg-green-600 px-1.5 py-0.5 text-xs text-white">
                            Existing
                          </span>
                        )}
                      </div>
                      {role.Description && (
                        <p className="text-xs text-gray-300">{role.Description}</p>
                      )}
                      <p className="text-xs text-gray-400">{role.Type}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleStartEditRole(roleKey)}
                        className="text-blue-400 transition-colors hover:text-blue-300"
                        title="Edit role"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveRoleClick(role.RoleId, role.Id, role.Name)}
                        className="text-red-400 transition-colors hover:text-red-300"
                        title="Remove role"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>

      {/* Add new role */}
      <div className="space-y-2 border-t border-[#3a5a8b] pt-3">
        <Input
          value={newRole.Name}
          onChange={(e) => setNewRole({ ...newRole, Name: e.target.value })}
          placeholder="Role name"
          className="text-sm"
        />
        <Input
          value={newRole.Description}
          onChange={(e) => setNewRole({ ...newRole, Description: e.target.value })}
          placeholder="Role description"
          className="text-sm"
        />
        <Button
          onClick={addRole}
          disabled={!newRole.Name.trim()}
          size="sm"
          className="flex w-full items-center justify-center space-x-1"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Role</span>
        </Button>
      </div>

      {/* Delete Role Confirmation Dialog */}
      {deleteConfirmRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-6 shadow-xl">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/20">
                <XMarkIcon className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Confirm Role Deletion</h3>
            </div>

            <div className="mb-4 rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-3">
              <p className="text-sm text-yellow-200">
                {deleteConfirmRole.roleId
                  ? 'This role is already saved. It will be marked as deleted and removed from the menu item authorization.'
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
