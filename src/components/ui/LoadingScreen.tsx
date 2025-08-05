import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingScreenProps {
  title?: string;
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title = 'Loading...',
  message = 'Please wait while we load your data.',
}) => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]">
    <div className="rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-8">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="mb-2 text-xl font-bold text-white">{title}</h2>
        <p className="text-gray-300">{message}</p>
      </div>
    </div>
  </div>
);
