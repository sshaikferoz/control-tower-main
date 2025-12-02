import React, { useState, useEffect } from 'react';
import { Section, Report, SectionModalState } from '../../types';
import { ReportColumn } from '../reports/ReportColumn';
import { Button } from '../ui/Button';
import { SectionModal } from '../modals/SectionModal';
import { PlusIcon } from '@heroicons/react/24/outline';

interface B2BReportsPageProps {
  onAddReport: (sectionId: string) => void;
  onViewReport: (report: Report) => void;
  onEditReport: (report: Report) => void;
  onDeleteReport: (report: Report) => void;
}

export const B2BReportsPage: React.FC<B2BReportsPageProps> = ({
  onAddReport,
  onViewReport,
  onEditReport,
  onDeleteReport,
}) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionModal, setSectionModal] = useState<SectionModalState>({
    isOpen: false,
    mode: 'add',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load sections from localStorage or API
  useEffect(() => {
    const loadSections = async () => {
      try {
        // Try to load from localStorage first (for demo purposes)
        const savedSections = localStorage.getItem('b2b-sections');
        if (savedSections) {
          setSections(JSON.parse(savedSections));
        }

        // In a real app, you would load from your API here
        // const response = await fetch('/api/sections');
        // const data = await response.json();
        // setSections(data);
      } catch (error) {
        console.error('Error loading sections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSections();
  }, []);

  // Save sections to localStorage whenever sections change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('b2b-sections', JSON.stringify(sections));
    }
  }, [sections, isLoading]);

  const handleCreateSection = () => {
    setSectionModal({
      isOpen: true,
      mode: 'add',
    });
  };

  const handleEditSection = (section: Section) => {
    setSectionModal({
      isOpen: true,
      mode: 'edit',
      section,
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this section? All reports in this section will be lost.'
      )
    ) {
      setSections((prev) => prev.filter((section) => section.id !== sectionId));
    }
  };

  const handleSaveSection = (sectionData: Omit<Section, 'id' | 'createdAt' | 'reports'>) => {
    if (sectionModal.mode === 'add') {
      const newSection: Section = {
        id: Date.now().toString(),
        name: sectionData.name,
        description: sectionData.description,
        reports: [],
        createdAt: new Date().toISOString(),
      };
      setSections((prev) => [...prev, newSection]);
    } else if (sectionModal.mode === 'edit' && sectionModal.section) {
      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionModal.section!.id
            ? { ...section, name: sectionData.name, description: sectionData.description }
            : section
        )
      );
    }
    setSectionModal({ isOpen: false, mode: 'add' });
  };

  const handleAddReportToSection = (report: Report, sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, reports: [...section.reports, report] } : section
      )
    );
  };

  const handleUpdateReport = (updatedReport: Report) => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        reports: section.reports.map((report) =>
          report.id === updatedReport.id ? updatedReport : report
        ),
      }))
    );
  };

  const handleDeleteReportFromSection = (reportId: string) => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        reports: section.reports.filter((report) => report.id !== reportId),
      }))
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-300">Loading sections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">B2B Reports</h1>
          <p className="text-gray-300">Manage and view your B2B reporting dashboard</p>
        </div>
        <Button
          variant="success"
          onClick={handleCreateSection}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Section</span>
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 rounded-full bg-[#1a3a6b] p-6">
              <PlusIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">No Sections Yet</h3>
            <p className="mb-4 text-gray-300">
              Create your first section to start organizing your reports
            </p>
            <Button
              variant="primary"
              onClick={handleCreateSection}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create First Section</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid h-[calc(100vh-140px)] auto-cols-fr grid-flow-col gap-6 overflow-x-auto">
          {sections.map((section) => (
            <ReportColumn
              key={section.id}
              section={section}
              onAddReport={() => onAddReport(section.id)}
              onView={onViewReport}
              onEdit={onEditReport}
              onDelete={onDeleteReport}
              onEditSection={() => handleEditSection(section)}
              onDeleteSection={() => handleDeleteSection(section.id)}
              onAddReportToSection={handleAddReportToSection}
              onUpdateReport={handleUpdateReport}
              onDeleteReportFromSection={handleDeleteReportFromSection}
            />
          ))}
        </div>
      )}

      <SectionModal
        modal={sectionModal}
        onClose={() => setSectionModal({ isOpen: false, mode: 'add' })}
        onSave={handleSaveSection}
      />
    </div>
  );
};
