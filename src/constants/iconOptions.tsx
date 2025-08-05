import {
  AcademicCapIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export const iconOptions = [
  {
    name: 'AcademicCap',
    icon: <AcademicCapIcon className="h-5 w-5" />,
    component: AcademicCapIcon,
  },
  {
    name: 'DocumentText',
    icon: <DocumentTextIcon className="h-5 w-5" />,
    component: DocumentTextIcon,
  },
  {
    name: 'Clipboard',
    icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
    component: ClipboardDocumentListIcon,
  },
  {
    name: 'Cube',
    icon: <CubeIcon className="h-5 w-5" />,
    component: CubeIcon,
  },
  {
    name: 'ChartBar',
    icon: <ChartBarIcon className="h-5 w-5" />,
    component: ChartBarIcon,
  },
];
