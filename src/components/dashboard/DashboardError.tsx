import React from 'react';
import { ErrorScreen } from '@/components/ui/ErrorScreen';

interface DashboardErrorProps {
    error: string | null;
}

export const DashboardError: React.FC<DashboardErrorProps> = ({ error }) => {
    return (
        <ErrorScreen
            title="Warning"
            message={error || 'An error occurred'}
            onRetry={() => window.location.reload()}
        />
    );
};

