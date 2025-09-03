import React, { useEffect } from 'react';
import { UserInfo } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface UserProfileProps {
  userInfo: UserInfo | null;
  userInfoLoading: boolean;
  formatTime: (timeString: string) => string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userInfo,
  userInfoLoading,
  formatTime,
}) => {
    useEffect(() => {
    console.log('UserInfo:', userInfo);
  }, [userInfo]);
  return (
    <div className="mt-auto flex items-center space-x-3 rounded bg-[#ffffff20] p-2">
      {userInfoLoading ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400">
          <LoadingSpinner size="sm" className="text-white" />
        </div>
      ) : userInfo?.networkId ? (
        <img
          src={`https://dp4.aramco.com.sa/newdesign/employeePic?networkId=${userInfo.networkId}`}
          alt="Profile"
          className="h-10 w-10 rounded-full object-cover"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}

      {/* Fallback initials display */}
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400"
        style={{ display: userInfo?.networkId ? 'none' : 'flex' }}
      >
        <span className="text-sm font-semibold text-white">
          {userInfo?.userFullName
            ? userInfo.userFullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()
            : 'U'}
        </span>
      </div>

      <div>
        <p className="text-sm font-medium">{userInfo?.userFullName || 'Loading...'}</p>
        <p className="text-xs text-gray-300">
          {userInfo?.lastAccessDate && userInfo?.lastAccessTime
            ? `Last Login: ${userInfo.lastAccessDate} ${formatTime(userInfo.lastAccessTime)}`
            : 'Last Login: N/A'}
        </p>
      </div>
    </div>
  );
};
