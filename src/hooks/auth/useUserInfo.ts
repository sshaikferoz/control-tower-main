import { useState, useEffect } from 'react';
import { UserInfo } from '../../types';

export const useUserInfo = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [userInfoLoading, setUserInfoLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                setUserInfoLoading(true);
                const baseUrl =
                    process.env.NODE_ENV === 'development'
                        ? 'https://ctapitester-a4mel9cxg6.dispatcher.sa1.hana.ondemand.com/sap/opu/odata/sap/ZBW_CT_SCIC_SRV'
                        : '/sap/opu/odata/sap/ZBW_CT_SCIC_SRV';

                const response = await fetch(`${baseUrl}/UserProfileSet('')?$format=json`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`SAP API responded with status: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.d && data.d.UserName) {
                    const user_id = data.d.UserName;
                    const userFullName = data.d.UserFullName;
                    const lastAccessDate = data.d.LastAccessDate;
                    const lastAccessTime = data.d.LastAccessTime;
                    const session_id = Math.random().toString(36).substring(2, 7);

                    setUserInfo({
                        user_id,
                        userFullName,
                        networkId: user_id,
                        session_id,
                        lastAccessDate,
                        lastAccessTime,
                    });
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                console.error('Error fetching user info from SAP:', error);
                setUserInfo({
                    user_id: `user_${Date.now()}`,
                    userFullName: 'User',
                    networkId: 'GUEST',
                    session_id: `session_${Date.now()}`,
                    lastAccessDate: new Date().toLocaleDateString(),
                    lastAccessTime: new Date().toLocaleTimeString(),
                });
            } finally {
                setUserInfoLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const formatTime = (timeString: string): string => {
        if (!timeString || !timeString.startsWith('PT')) return timeString;

        try {
            const matches = timeString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (!matches) return timeString;

            const hours24 = matches[1] ? parseInt(matches[1]) : 0;
            const minutes = matches[2] ? parseInt(matches[2]) : 0;
            const seconds = matches[3] ? parseInt(matches[3]) : 0;

            const period = hours24 >= 12 ? 'PM' : 'AM';
            const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;

            return `${hours12.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
        } catch (error) {
            return timeString;
        }
    };

    return { userInfo, userInfoLoading, formatTime };
};
