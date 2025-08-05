import React from 'react';
import { Report } from '../../types';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ReportCardProps {
  report: Report;
  onView: (report: Report) => void;
  onEdit: (report: Report) => void;
  onDelete: (report: Report) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onView, onEdit, onDelete }) => (
  <div className="mb-3 rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-3 transition-colors hover:bg-[#2a4a7b]">
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-3">
        <div className="rounded bg-[#3a5a8b] p-2">{report.icon}</div>
        <span className="flex-1 text-sm leading-tight font-medium text-white">{report.title}</span>
      </div>
      <div className="ml-2 flex items-center space-x-2">
        <button
          onClick={() => onView(report)}
          className="p-1 text-gray-300 transition-colors hover:text-white"
          title="View"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => onEdit(report)}
          className="p-1 text-gray-300 transition-colors hover:text-white"
          title="Edit"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(report)}
          className="p-1 text-gray-300 transition-colors hover:text-white"
          title="Delete"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);
