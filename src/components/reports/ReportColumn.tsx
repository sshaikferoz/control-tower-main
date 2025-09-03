import React from 'react';
import { Section, Report } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { ReportCard } from './ReportCard';
import { Button } from '../ui/Button';
import { useState, useRef, useEffect } from 'react';

interface ReportColumnProps {
  section: Section;
  onAddReport: () => void;
  onView: (report: Report) => void;
  onEdit: (report: Report) => void;
  onDelete: (report: Report) => void;
  onEditSection: () => void;
  onDeleteSection: () => void;
  onAddReportToSection: (report: Report, sectionId: string) => void;
  onUpdateReport: (report: Report) => void;
  onDeleteReportFromSection: (reportId: string) => void;
}

export const ReportColumn: React.FC<ReportColumnProps> = ({
  section,
  onAddReport,
  onView,
  onEdit,
  onDelete,
  onEditSection,
  onDeleteSection,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleEditSection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    onEditSection();
  };

  const handleDeleteSection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    onDeleteSection();
  };

  return (
    <div className="relative h-full rounded-lg bg-[#0f2a4f] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">{section.name}</h2>
          {section.description && <p className="text-sm text-gray-400">{section.description}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="success"
            size="sm"
            onClick={onAddReport}
            className="flex items-center space-x-1"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add</span>
          </Button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleDropdownToggle}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-[#2a4a7b] hover:text-white"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>

            {showDropdown && (
              <div className="absolute top-8 right-0 z-10 w-48 rounded-md border border-[#3a5a8b] bg-[#1a3a6b] py-1 shadow-lg">
                <button
                  onClick={handleEditSection}
                  className="flex w-full items-center px-3 py-2 text-sm text-white hover:bg-[#2a4a7b]"
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit Section
                </button>
                <button
                  onClick={handleDeleteSection}
                  className="flex w-full items-center px-3 py-2 text-sm text-red-400 hover:bg-[#2a4a7b]"
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete Section
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-[calc(100vh-200px)] space-y-2 overflow-y-auto pr-2">
        {section.reports.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-[#3a5a8b] text-center">
            <div>
              <PlusIcon className="mx-auto h-8 w-8 text-gray-500" />
              <p className="mt-2 text-sm text-gray-400">No reports yet</p>
              <p className="text-xs text-gray-500">Click "Add" to create your first report</p>
            </div>
          </div>
        ) : (
          section.reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
