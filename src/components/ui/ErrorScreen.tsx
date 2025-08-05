import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}) => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]">
    <div className="max-w-md rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-8">
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
        <h2 className="mb-2 text-xl font-bold text-white">{title}</h2>
        <p className="mb-4 text-gray-300">{message}</p>
        {onRetry && <Button onClick={onRetry}>Retry</Button>}
      </div>
    </div>
  </div>
);
