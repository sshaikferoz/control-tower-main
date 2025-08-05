import React, { useState } from 'react';
import { Role } from '../../types';
import { UserGroupIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
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

  const addRole = () => {
    if (!newRole.Name.trim()) return;

    const roleToAdd = {
      ...newRole,
      RoleId: Date.now().toString(),
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

  const removeRole = (roleId: string) => {
    onRolesChange(roles.filter((role) => role.RoleId !== roleId));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <UserGroupIcon className="h-5 w-5 text-gray-300" />
        <label className="text-sm font-medium text-gray-300">Roles</label>
      </div>

      {/* Existing roles */}
      <div className="max-h-32 space-y-2 overflow-y-auto">
        {roles.map((role, index) => (
          <div
            key={role.RoleId || index}
            className="flex items-center justify-between rounded bg-[#3a5a8b] p-2"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{role.Name}</p>
              {role.Description && <p className="text-xs text-gray-300">{role.Description}</p>}
            </div>
            <button
              onClick={() => removeRole(role.RoleId)}
              className="ml-2 text-red-400 hover:text-red-300"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
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
    </div>
  );
};
