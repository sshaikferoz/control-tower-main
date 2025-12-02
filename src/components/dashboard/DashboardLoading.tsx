import React from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export const DashboardLoading: React.FC = () => {
    return (
        <LoadingScreen
            title="Loading..."
            message="Checking user permissions and loading configuration..."
        />
    );
};

