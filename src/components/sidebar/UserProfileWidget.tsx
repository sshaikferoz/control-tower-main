import React from 'react';
import Image from 'next/image';
import { UserProfileWidgetProps } from './types';

const UserProfileWidget: React.FC<UserProfileWidgetProps> = ({
  username,
  lastLogin,
  imagePath,
}) => {
  return (
    <div className="mt-4 flex items-center space-x-3 rounded bg-[#ffffff20] p-2">
      <img src={imagePath} alt="User" className="rounded-full" />
      <div>
        <p className="text-sm font-medium">{username}</p>
        <p className="text-xs text-gray-300">Last Login: {lastLogin}</p>
      </div>
    </div>
  );
};

export default UserProfileWidget;
