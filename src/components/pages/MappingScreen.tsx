import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export const MappingScreen: React.FC = () => (
  <div className="min-h-screen flex-1 bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b] p-8">
    <div className="mx-auto max-w-4xl">
      <div className="rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-8">
        <div className="text-center">
          <ChartBarIcon className="mx-auto mb-4 h-16 w-16 text-blue-400" />
          <h1 className="mb-2 text-3xl font-bold text-white">Dashboard Builder</h1>
          <p className="text-lg text-gray-300">Create and customize your dashboard widgets</p>
        </div>
      </div>
    </div>
  </div>
);
