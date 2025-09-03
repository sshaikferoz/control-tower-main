import React from 'react';
import PSCLogo from '@/assets/PSCLogo';

const SidebarHeader: React.FC = () => {
  return (
    <div className="flex flex-row items-center space-x-2">
      <PSCLogo />
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold">P&SC</h1>
        <h1 className="text-lg font-semibold">Intelligence Centre</h1>
      </div>
    </div>
  );
};

export default SidebarHeader;
