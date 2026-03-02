import React, { useState } from 'react';
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
    const [imgError, setImgError] = useState(false);
    const showAvatar = userInfo?.networkId && !imgError;
    const initials = userInfo?.userFullName
        ? userInfo.userFullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
        : 'U';

    return (
        <div
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-3"
            style={{ background: 'rgba(255,255,255,0.15)' }}
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/25">
                {userInfoLoading ? (
                    <LoadingSpinner size="sm" className="!text-white" />
                ) : showAvatar ? (
                    <img
                        src={`https://dp4.aramco.com.sa/newdesign/employeePic?networkId=${userInfo.networkId}`}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span className="text-sm font-semibold text-white">
                        {initials}
                    </span>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--sidebar-text)]">
                    {userInfo?.userFullName || 'Loading...'}
                </p>
                <p className="text-xs text-[var(--sidebar-text)] opacity-80 break-words">
                    {userInfo?.lastAccessDate && userInfo?.lastAccessTime
                        ? `Last login: ${userInfo.lastAccessDate} ${formatTime(userInfo.lastAccessTime)}`
                        : 'Last login: N/A'}
                </p>
            </div>
        </div>
    );
};
