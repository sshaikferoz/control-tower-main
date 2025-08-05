import { DocumentTextIcon, ClipboardDocumentListIcon, CubeIcon } from '@heroicons/react/24/outline';
import { Report } from '../types';

export const initialReportData: Record<string, Report[]> = {
  'B2B Reports': [
    {
      id: '1',
      title: 'B2B PO by Sourcing Report',
      icon: <DocumentTextIcon className="h-5 w-5" />,
      category: 'B2B Reports',
    },
    {
      id: '2',
      title: 'Non Active Item Report',
      icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
      category: 'B2B Reports',
    },
  ],
  'Inventory & Materials': [
    {
      id: '10',
      title: 'Listing of manufacturers',
      icon: <CubeIcon className="h-5 w-5" />,
      category: 'Inventory & Materials',
    },
    {
      id: '11',
      title: 'Inventory',
      icon: <CubeIcon className="h-5 w-5" />,
      category: 'Inventory & Materials',
    },
  ],
  'Process & Orders': [
    {
      id: '20',
      title: 'In process requisition details',
      icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
      category: 'Process & Orders',
    },
  ],
};
