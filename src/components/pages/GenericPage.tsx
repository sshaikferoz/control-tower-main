import React from 'react';
import {
  CubeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface GenericPageProps {
  sectionName: string;
  onNavigateToMapping: (sectionName: string) => void;
}

export const GenericPage: React.FC<GenericPageProps> = ({ sectionName, onNavigateToMapping }) => (
  <div
    className="flex h-screen bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]"
    style={{
      backgroundImage: `url('${process.env.NEXT_PUBLIC_BSP_NAME}/background/bg.png')`,
    }}
  >
    {/* <div className="flex-1 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-8">
          <div className="text-center">
            <div className="mb-6">
              <CubeIcon className="mx-auto mb-4 h-16 w-16 text-blue-400" />
              <h1 className="mb-2 text-3xl font-bold text-white">{sectionName}</h1>
              <p className="text-lg text-gray-300">Welcome to the {sectionName} module</p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-[#3a5a8b] bg-[#2a4a7b] p-6">
                <DocumentTextIcon className="mb-3 h-8 w-8 text-blue-400" />
                <h3 className="mb-2 font-semibold text-white">Reports</h3>
                <p className="text-sm text-gray-300">
                  Generate and view detailed reports for {sectionName.toLowerCase()}
                </p>
              </div>

              <div className="rounded-lg border border-[#3a5a8b] bg-[#2a4a7b] p-6">
                <ClipboardDocumentListIcon className="mb-3 h-8 w-8 text-green-400" />
                <h3 className="mb-2 font-semibold text-white">Analytics</h3>
                <p className="text-sm text-gray-300">
                  View analytics and insights for {sectionName.toLowerCase()} operations
                </p>
              </div>

              <div
                className="cursor-pointer rounded-lg border border-[#3a5a8b] bg-[#2a4a7b] p-6 transition-colors hover:bg-[#3a5a8b]"
                onClick={() => onNavigateToMapping(sectionName)}
              >
                <ChartBarIcon className="mb-3 h-8 w-8 text-purple-400" />
                <h3 className="mb-2 font-semibold text-white">Dashboard Builder</h3>
                <p className="text-sm text-gray-300">
                  Create and manage dashboards for {sectionName.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-[#3a5a8b] bg-[#2a4a7b] p-4">
              <p className="text-sm text-gray-300">
                This section is under development. More features will be available soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div> */}
  </div>
);
