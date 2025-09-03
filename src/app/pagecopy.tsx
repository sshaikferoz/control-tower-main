// 'use client';
// import { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   AcademicCapIcon,
//   AdjustmentsHorizontalIcon,
//   AdjustmentsVerticalIcon,
//   ArchiveBoxIcon,
//   ArrowDownCircleIcon,
//   ArrowDownTrayIcon,
//   ArrowLeftCircleIcon,
//   ArrowPathIcon,
//   ArrowRightCircleIcon,
//   ArrowUpCircleIcon,
//   AtSymbolIcon,
//   BackspaceIcon,
//   BanknotesIcon,
//   Bars3Icon,
//   BellIcon,
//   BookmarkIcon,
//   BriefcaseIcon,
//   BugAntIcon,
//   MagnifyingGlassIcon,
//   PencilIcon,
//   BuildingOfficeIcon,
//   CheckIcon,
//   PlusIcon,
//   TrashIcon,
//   XMarkIcon,
//   CalendarIcon,
//   CameraIcon,
//   ChartBarIcon,
//   ChatBubbleBottomCenterTextIcon,
//   CheckBadgeIcon,
//   ChevronDoubleRightIcon,
//   ClipboardDocumentListIcon,
//   CloudIcon,
//   CodeBracketIcon,
//   Cog6ToothIcon,
//   CommandLineIcon,
//   ComputerDesktopIcon,
//   CpuChipIcon,
//   CreditCardIcon,
//   CubeIcon,
//   CurrencyDollarIcon,
//   DevicePhoneMobileIcon,
//   DocumentDuplicateIcon,
//   DocumentTextIcon,
//   EnvelopeIcon,
//   EyeIcon,
//   FilmIcon,
//   FingerPrintIcon,
//   FireIcon,
//   FolderIcon,
//   GlobeAltIcon,
//   HandThumbUpIcon,
//   HeartIcon,
//   HomeIcon,
//   IdentificationIcon,
//   InboxIcon,
//   KeyIcon,
//   ExclamationTriangleIcon,
//   UserGroupIcon,
//   ShieldCheckIcon,
// } from '@heroicons/react/24/outline';

// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// // Import the SAP OData service
// import { sapODataService, MenuItem, Role } from '../services/sapODataService';
// import Home from './home/page';
// import PSCLogo from '@/assets/PSCLogo';

// // Admin Role Check Interface
// export interface AdminRoleCheckResponse {
//   UserName: string;
//   IsAdmin: string;
// }

// // URL Parameters Hook
// const useURLParams = () => {
//   const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       setUrlParams(new URLSearchParams(window.location.search));
//     }
//   }, []);

  

//   return urlParams;
// };

// // Simple MappingScreen placeholder
// const MappingScreen = () => (
//   <div className="min-h-screen flex-1 bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b] p-8">
//     <div className="mx-auto max-w-4xl">
//       <div className="rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-8">
//         <div className="text-center">
//           <ChartBarIcon className="mx-auto mb-4 h-16 w-16 text-blue-400" />
//           <h1 className="mb-2 text-3xl font-bold text-white">Dashboard Builder</h1>
//           <p className="text-lg text-gray-300">Create and customize your dashboard widgets</p>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // Report data structure
// interface Report {
//   id: string;
//   title: string;
//   icon: React.ReactNode;
//   category: string;
// }
// interface UserInfo {
//   user_id: string;
//   session_id: string;
//   userFullName?: string;
//   networkId?: string;
//   lastAccessDate?: string;
//   lastAccessTime?: string;
// }

// // Icon options for reports
// const iconOptions = [
//   {
//     name: 'AcademicCap',
//     icon: <AcademicCapIcon className="h-5 w-5" />,
//     component: AcademicCapIcon,
//   },
//   {
//     name: 'DocumentText',
//     icon: <DocumentTextIcon className="h-5 w-5" />,
//     component: DocumentTextIcon,
//   },
//   {
//     name: 'Clipboard',
//     icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
//     component: ClipboardDocumentListIcon,
//   },
//   {
//     name: 'Cube',
//     icon: <CubeIcon className="h-5 w-5" />,
//     component: CubeIcon,
//   },
//   {
//     name: 'ChartBar',
//     icon: <ChartBarIcon className="h-5 w-5" />,
//     component: ChartBarIcon,
//   },
// ];

// // Initial report data
// const initialReportData: Record<string, Report[]> = {
//   'B2B Reports': [
//     {
//       id: '1',
//       title: 'B2B PO by Sourcing Report',
//       icon: <DocumentTextIcon className="h-5 w-5" />,
//       category: 'B2B Reports',
//     },
//     {
//       id: '2',
//       title: 'Non Active Item Report',
//       icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
//       category: 'B2B Reports',
//     },
//   ],
//   'Inventory & Materials': [
//     {
//       id: '10',
//       title: 'Listing of manufacturers',
//       icon: <CubeIcon className="h-5 w-5" />,
//       category: 'Inventory & Materials',
//     },
//     {
//       id: '11',
//       title: 'Inventory',
//       icon: <CubeIcon className="h-5 w-5" />,
//       category: 'Inventory & Materials',
//     },
//   ],
//   'Process & Orders': [
//     {
//       id: '20',
//       title: 'In process requisition details',
//       icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
//       category: 'Process & Orders',
//     },
//   ],
// };

// // Application state type
// type AppView = 'dashboard' | 'mapping' | 'b2b-reports' | 'generic';

// interface AppState {
//   view: AppView;
//   selectedMenuItem: string;
//   mappingParams?: {
//     sectionName: string;
//     expanded: string;
//   };
// }

// // Modal states
// interface ModalState {
//   isOpen: boolean;
//   mode: 'add' | 'edit' | 'delete' | 'view';
//   report?: Report;
//   category?: string;
// }

// // Sidebar item modal state
// interface SidebarModalState {
//   isOpen: boolean;
//   mode: 'add' | 'edit';
//   item?: MenuItem;
// }

// // Role Management Component
// const RoleManagement: React.FC<{
//   roles: Role[];
//   onRolesChange: (roles: Role[]) => void;
// }> = ({ roles, onRolesChange }) => {
//   const [newRole, setNewRole] = useState<Role>({
//     RoleId: '',
//     Id: '',
//     Name: '',
//     Description: '',
//     Type: 'Tab',
//     DelFlag: '',
//   });

//   const addRole = () => {
//     if (!newRole.Name.trim()) return;

//     const roleToAdd = {
//       ...newRole,
//       RoleId: Date.now().toString(),
//       Id: Date.now().toString(),
//     };

//     onRolesChange([...roles, roleToAdd]);
//     setNewRole({
//       RoleId: '',
//       Id: '',
//       Name: '',
//       Description: '',
//       Type: 'Tab',
//       DelFlag: '',
//     });
//   };

//   const removeRole = (roleId: string) => {
//     onRolesChange(roles.filter((role) => role.RoleId !== roleId));
//   };

//   return (
//     <div className="space-y-3">
//       <div className="flex items-center space-x-2">
//         <UserGroupIcon className="h-5 w-5 text-gray-300" />
//         <label className="text-sm font-medium text-gray-300">Roles</label>
//       </div>

//       {/* Existing roles */}
//       <div className="max-h-32 space-y-2 overflow-y-auto">
//         {roles.map((role, index) => (
//           <div
//             key={role.RoleId || index}
//             className="flex items-center justify-between rounded bg-[#3a5a8b] p-2"
//           >
//             <div className="flex-1">
//               <p className="text-sm font-medium text-white">{role.Name}</p>
//               {role.Description && <p className="text-xs text-gray-300">{role.Description}</p>}
//             </div>
//             <button
//               onClick={() => removeRole(role.RoleId)}
//               className="ml-2 text-red-400 hover:text-red-300"
//             >
//               <XMarkIcon className="h-4 w-4" />
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Add new role */}
//       <div className="space-y-2 border-t border-[#3a5a8b] pt-3">
//         <input
//           type="text"
//           value={newRole.Name}
//           onChange={(e) => setNewRole({ ...newRole, Name: e.target.value })}
//           placeholder="Role name"
//           className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-2 text-sm text-white outline-none focus:border-blue-500"
//         />
//         <input
//           type="text"
//           value={newRole.Description}
//           onChange={(e) => setNewRole({ ...newRole, Description: e.target.value })}
//           placeholder="Role description"
//           className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-2 text-sm text-white outline-none focus:border-blue-500"
//         />
//         <button
//           onClick={addRole}
//           disabled={!newRole.Name.trim()}
//           className="flex w-full items-center justify-center space-x-1 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-500"
//         >
//           <PlusIcon className="h-4 w-4" />
//           <span>Add Role</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// // Add/Edit Report Modal Component
// const ReportModal: React.FC<{
//   modal: ModalState;
//   onClose: () => void;
//   onSave: (report: Report) => void;
//   onDelete?: (reportId: string) => void;
// }> = ({ modal, onClose, onSave, onDelete }) => {
//   const [title, setTitle] = useState(modal.report?.title || '');
//   const [selectedIcon, setSelectedIcon] = useState(0);
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     if (modal.report) {
//       setTitle(modal.report.title);
//       const iconIndex = iconOptions.findIndex(
//         (option) => option.name === (modal.report?.icon as any)?.type?.name || 'DocumentText'
//       );
//       setSelectedIcon(iconIndex >= 0 ? iconIndex : 0);
//     } else {
//       setTitle('');
//       setSelectedIcon(0);
//     }
//     setIsSaving(false);
//   }, [modal.report, modal.isOpen]);

//   const handleSave = useCallback(async () => {
//     if (!title.trim() || isSaving) return;

//     setIsSaving(true);

//     try {
//       const IconComponent = iconOptions[selectedIcon].component;
//       const newReport: Report = {
//         id: modal.report?.id || Date.now().toString(),
//         title: title.trim(),
//         icon: <IconComponent className="h-5 w-5" />,
//         category: modal.category || modal.report?.category || 'B2B Reports',
//       };

//       onSave(newReport);
//       onClose();
//     } catch (error) {
//       console.error('Error saving report:', error);
//     } finally {
//       setIsSaving(false);
//     }
//   }, [title, selectedIcon, modal, onSave, onClose, isSaving]);

//   const handleDelete = useCallback(() => {
//     if (modal.report && onDelete) {
//       onDelete(modal.report.id);
//       onClose();
//     }
//   }, [modal.report, onDelete, onClose]);

//   if (!modal.isOpen) return null;

//   return (
//     <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]/10">
//       <div className="w-full max-w-md rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-6">
//         <div className="mb-4 flex items-center justify-between">
//           <h2 className="text-xl font-semibold text-white">
//             {modal.mode === 'add' && 'Add New Report'}
//             {modal.mode === 'edit' && 'Edit Report'}
//             {modal.mode === 'delete' && 'Delete Report'}
//             {modal.mode === 'view' && 'View Report'}
//           </h2>
//           <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white">
//             <XMarkIcon className="h-6 w-6" />
//           </button>
//         </div>

//         {modal.mode === 'delete' ? (
//           <div>
//             <div className="mb-4 flex items-center space-x-3">
//               <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
//               <div>
//                 <p className="font-medium text-white">Are you sure?</p>
//                 <p className="text-sm text-gray-300">
//                   This will permanently delete "{modal.report?.title}".
//                 </p>
//               </div>
//             </div>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={onClose}
//                 className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ) : modal.mode === 'view' ? (
//           <div>
//             <div className="mb-4">
//               <label className="mb-2 block text-sm font-medium text-gray-300">Report Title</label>
//               <div className="rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white">
//                 {modal.report?.title}
//               </div>
//             </div>
//             <div className="mb-6">
//               <label className="mb-2 block text-sm font-medium text-gray-300">Category</label>
//               <div className="rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white">
//                 {modal.report?.category}
//               </div>
//             </div>
//             <div className="flex justify-end">
//               <button
//                 onClick={onClose}
//                 className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div>
//             <div className="mb-4">
//               <label className="mb-2 block text-sm font-medium text-gray-300">Report Title</label>
//               <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
//                 placeholder="Enter report title"
//                 disabled={isSaving}
//               />
//             </div>

//             <div className="mb-6 max-h-40 overflow-auto">
//               <label className="mb-2 block text-sm font-medium text-gray-300">Icon</label>
//               <div className="grid grid-cols-4 gap-2">
//                 {iconOptions.map((option, index) => (
//                   <button
//                     key={index}
//                     type="button"
//                     onClick={() => !isSaving && setSelectedIcon(index)}
//                     disabled={isSaving}
//                     className={`rounded border p-3 transition-colors ${
//                       selectedIcon === index
//                         ? 'border-blue-500 bg-blue-600'
//                         : 'border-[#3a5a8b] bg-[#2a4a7b] hover:bg-[#3a5a8b]'
//                     } ${isSaving ? 'cursor-not-allowed opacity-50' : ''}`}
//                   >
//                     {option.icon}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="flex justify-end space-x-3">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={isSaving}
//                 className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={handleSave}
//                 disabled={!title.trim() || isSaving}
//                 className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-500"
//               >
//                 {isSaving ? 'Saving...' : modal.mode === 'add' ? 'Add Report' : 'Save Changes'}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Sidebar Item Modal Component
// const SidebarItemModal: React.FC<{
//   modal: SidebarModalState;
//   onClose: () => void;
//   onSave: (item: MenuItem) => void;
//   isSaving?: boolean;
// }> = ({ modal, onClose, onSave, isSaving = false }) => {
//   const [item, setItem] = useState<MenuItem>({
//     id: '', // Always start with empty ID
//     name: '',
//     description: '',
//     visible: true,
//     order: 0,
//     type: 'Section',
//     deleted: false,
//     roles: [],
//     isNew: true,
//   });

//   useEffect(() => {
//     if (modal.item) {
//       setItem(modal.item);
//     } else {
//       setItem({
//         id: '', // Empty ID for new items
//         name: '',
//         description: '',
//         visible: true,
//         order: 0,
//         type: 'Section',
//         deleted: false,
//         roles: [],
//         isNew: true,
//       });
//     }
//   }, [modal.item]);

//   const handleSave = () => {
//     console.log("save from page")
//     if (!item.name.trim() || isSaving) return;
//     console.log('Saving item with ID:', item.id, 'Name:', item.name);
//     onSave(item);
//   };

//   const handleRolesChange = (roles: Role[]) => {
//     setItem({ ...item, roles });
//   };

//   if (!modal.isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]/10">
//       <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-6">
//         <div className="mb-4 flex items-center justify-between">
//           <h2 className="text-xl font-semibold text-white">
//             {modal.mode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 transition-colors hover:text-white"
//             disabled={isSaving}
//           >
//             <XMarkIcon className="h-6 w-6" />
//           </button>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="mb-2 block text-sm font-medium text-gray-300">Title*</label>
//             <input
//               type="text"
//               value={item.name}
//               onChange={(e) => setItem({ ...item, name: e.target.value })}
//               className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
//               placeholder="Enter menu item title"
//               disabled={isSaving}
//             />
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
//             <textarea
//               value={item.description}
//               onChange={(e) => setItem({ ...item, description: e.target.value })}
//               className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
//               placeholder="Enter description"
//               rows={3}
//               disabled={isSaving}
//             />
//           </div>

//           <div className="flex items-center justify-between">
//             <label className="block text-sm font-medium text-gray-300">Visible</label>
//             <label className="relative inline-flex cursor-pointer items-center">
//               <input
//                 type="checkbox"
//                 checked={item.visible}
//                 onChange={(e) => setItem({ ...item, visible: e.target.checked })}
//                 className="peer sr-only"
//                 disabled={isSaving}
//               />
//               <div className="peer h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
//             </label>
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-medium text-gray-300">Type*</label>
//             <select
//               value={item.type}
//               onChange={(e) => setItem({ ...item, type: e.target.value })}
//               className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
//               disabled={isSaving}
//             >
//               <option value="Section">Widget Section</option>
//               <option value="Dashboard">Dashboard / Reports Menu</option>
//             </select>
//           </div>

//           <RoleManagement roles={item.roles} onRolesChange={handleRolesChange} />
//         </div>

//         <div className="mt-6 flex justify-end space-x-3">
//           <button
//             onClick={onClose}
//             disabled={isSaving}
//             className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSave}
//             disabled={!item.name.trim() || isSaving}
//             className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-500"
//           >
//             {isSaving ? 'Saving...' : modal.mode === 'add' ? 'Add Item' : 'Save Changes'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Sidebar Component
// const Sidebar: React.FC<{
//   selectedItem: string;
//   onItemSelect: (item: string) => void;
//   menuItems: MenuItem[];
//   onMenuItemsChange: (items: MenuItem[]) => void;
//   isLoading?: boolean;
//   isEditModeAllowed?: boolean;
// }> = ({
//   selectedItem,
//   onItemSelect,
//   menuItems,
//   onMenuItemsChange,
//   isLoading = false,
//   isEditModeAllowed = false,
// }) => {
//   const [search, setSearch] = useState<string>('');
//   const [sidebarModal, setSidebarModal] = useState<SidebarModalState>({
//     isOpen: false,
//     mode: 'add',
//   });
//   const [editMode, setEditMode] = useState(false);
//   const [tempItems, setTempItems] = useState<MenuItem[]>([]);
//   const [isSaving, setIsSaving] = useState(false);
//   const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
//   const [userInfoLoading, setUserInfoLoading] = useState<boolean>(true);
//   useEffect(() => {
//     const fetchUserInfo = async () => {
//       try {
//         setUserInfoLoading(true);
//         const baseUrl =
//           process.env.NODE_ENV === 'development'
//             ? 'https://ctapitester-a4mel9cxg6.dispatcher.sa1.hana.ondemand.com/sap/opu/odata/sap/ZBW_CT_SCIC_SRV'
//             : '/sap/opu/odata/sap/ZBW_CT_SCIC_SRV';
//         const response = await fetch(`${baseUrl}/LogUserSet('')?$format=json`, {
//           method: 'GET',
//           headers: {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`SAP API responded with status: ${response.status}`);
//         }

//         const data = await response.json();

//         if (data && data.d && data.d.UserName) {
//           const user_id = data.d.UserName; // "SHAIFH0D"
//           const userFullName = data.d.UserFullName; // "Feroz Shaik"
//           const lastAccessDate = data.d.LastAccessDate; // "07/09/2025"
//           const lastAccessTime = data.d.LastAccessTime; // "PT14H16M56S"
//           const session_id = Math.random().toString(36).substring(2, 7);

//           console.log('User info retrieved from SAP:', {
//             user_id,
//             userFullName,
//             lastAccessDate,
//             lastAccessTime,
//             session_id,
//           });

//           setUserInfo({
//             user_id,
//             userFullName,
//             networkId: user_id, // Using UserName as networkId for profile image
//             session_id,
//             lastAccessDate,
//             lastAccessTime,
//           });
//         } else {
//           console.warn('Unexpected SAP API response format:', data);
//           // Fallback
//           setUserInfo({
//             user_id: `user_${Date.now()}`,
//             userFullName: 'User',
//             networkId: 'GUEST',
//             session_id: `session_${Date.now()}`,
//             lastAccessDate: new Date().toLocaleDateString(),
//             lastAccessTime: new Date().toLocaleTimeString(),
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching user info from SAP:', error);
//         // Fallback
//         setUserInfo({
//           user_id: `user_${Date.now()}`,
//           userFullName: 'User',
//           networkId: 'GUEST',
//           session_id: `session_${Date.now()}`,
//           lastAccessDate: new Date().toLocaleDateString(),
//           lastAccessTime: new Date().toLocaleTimeString(),
//         });
//       } finally {
//         setUserInfoLoading(false);
//       }
//     };

//     fetchUserInfo();
//   }, []);

//   useEffect(() => {
//     setTempItems([...menuItems]);
//   }, [menuItems]);

//     useEffect(() => {
//       console.log(menuItems,"MENUUITEMS")
//   });

//   const handleAddItem = () => {
//     setSidebarModal({
//       isOpen: true,
//       mode: 'add',
//     });
//   };

//   const handleEditItem = (item: MenuItem) => {
//     setSidebarModal({
//       isOpen: true,
//       mode: 'edit',
//       item,
//     });
//   };

//   const handleDeleteItem = async (itemId: string) => {
//     try {
//       setIsSaving(true);
//       const itemToDelete = menuItems.find((item) => item.id === itemId);
//       if (itemToDelete) {
//         await sapODataService.deleteMenuItem(itemToDelete);
//         onMenuItemsChange(menuItems.filter((item) => item.id !== itemId));
//       }
//     } catch (error) {
//       console.error('Error deleting menu item:', error);
//       alert('Failed to delete menu item. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleSaveItem = async (item: MenuItem) => {
//     try {
//       setIsSaving(true);

//       if (sidebarModal.mode === 'add') {
//         // Create new item with empty ID - server will generate it
//         const newItem = {
//           ...item,
//           id: '', // Empty - will be generated by server
//           order: menuItems.length,
//           isNew: true,
//         };

//         console.log('Creating new menu item:', newItem);
//         const savedItem = await sapODataService.saveMenuItem(newItem, false);
//         console.log('Saved menu item with generated ID:', savedItem);

//         onMenuItemsChange([...menuItems, savedItem]);
//       } else {
//         // Update existing item
//         const updatedItem = {
//           ...item,
//           hasChanges: true,
//           isNew: false,
//         };

//         console.log('Updating existing menu item:', updatedItem);
//         const savedItem = await sapODataService.saveMenuItem(updatedItem, true);
//         console.log('Updated menu item:', savedItem);

//         onMenuItemsChange(menuItems.map((i) => (i.id === item.id ? savedItem : i)));
//       }

//       setSidebarModal({ ...sidebarModal, isOpen: false });
//     } catch (error) {
//       console.error('Error saving menu item:', error);
//       alert('Failed to save menu item. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const toggleEditMode = async () => {
//     if (editMode) {
//       // Save changes when exiting edit mode
//       try {
//         setIsSaving(true);
//         const itemsWithChanges = tempItems.map((item, index) => ({
//           ...item,
//           order: index,
//           hasChanges: item.order !== index || item.hasChanges,
//         }));

//         const updatedItems = await sapODataService.batchUpdateMenuItems(itemsWithChanges);
//         onMenuItemsChange(updatedItems);
//       } catch (error) {
//         console.error('Error saving changes:', error);
//         alert('Failed to save changes. Please try again.');
//       } finally {
//         setIsSaving(false);
//       }
//     }
//     setEditMode(!editMode);
//   };

//   const onDragEnd = (result: any) => {
//     if (!result.destination) return;

//     const items = Array.from(tempItems);
//     const [reorderedItem] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, reorderedItem);

//     const updatedItems = items.map((item, index) => ({
//       ...item,
//       order: index,
//       hasChanges: true,
//     }));

//     setTempItems(updatedItems);
//   };

//   const toggleItemVisibility = (itemId: string) => {
//     setTempItems(
//       tempItems.map((item) =>
//         item.id === itemId ? { ...item, visible: !item.visible, hasChanges: true } : item
//       )
//     );
//   };

//   const filteredItems = editMode
//     ? tempItems.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
//     : tempItems
//         .filter((item) => item.visible && !item.deleted)
//         .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
//   // Helper function to format PT14H16M56S to readable 12-hour time
//   const formatTime = (timeString: string): string => {
//     if (!timeString || !timeString.startsWith('PT')) return timeString;

//     try {
//       const matches = timeString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//       if (!matches) return timeString;

//       const hours24 = matches[1] ? parseInt(matches[1]) : 0;
//       const minutes = matches[2] ? parseInt(matches[2]) : 0;
//       const seconds = matches[3] ? parseInt(matches[3]) : 0;

//       // Convert to 12-hour format
//       const period = hours24 >= 12 ? 'PM' : 'AM';
//       const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;

//       return `${hours12.toString().padStart(2, '0')}:${minutes
//         .toString()
//         .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
//     } catch (error) {
//       return timeString;
//     }
//   };
//   return (
//     <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
//       <div className="flex flex-row items-center space-x-2">
//         <PSCLogo />
//         <div className="flex flex-col">
//           <h1 className="text-lg font-semibold">P&SC</h1>
//           <h1 className="text-lg font-semibold">Intelligence Centre</h1>
//         </div>
//       </div>

//       <div className="mt-4 flex items-center justify-between">
//         <div className="relative mr-2 flex-1">
//           <MagnifyingGlassIcon className="absolute top-3 left-3 h-5 w-5 text-gray-300" />
//           <input
//             type="text"
//             placeholder="Search Menu"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full rounded-md bg-[#ffffff20] p-2 pl-10 text-white placeholder-gray-300 outline-none"
//             disabled={isSaving}
//           />
//         </div>
//         {isEditModeAllowed && (
//           <button
//             onClick={toggleEditMode}
//             disabled={isSaving || isLoading}
//             className={`rounded-md p-2 ${
//               editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
//             } transition-colors disabled:cursor-not-allowed disabled:opacity-50`}
//             title={editMode ? 'Save Changes' : 'Edit Menu'}
//           >
//             {isSaving ? (
//               <ArrowPathIcon className="h-5 w-5 animate-spin" />
//             ) : editMode ? (
//               <CheckIcon className="h-5 w-5" />
//             ) : (
//               <PencilIcon className="h-5 w-5" />
//             )}
//           </button>
//         )}
//       </div>

//       {editMode && (
//         <div className="mt-2 flex justify-end">
//           <button
//             onClick={handleAddItem}
//             disabled={isSaving}
//             className="flex items-center space-x-1 rounded bg-blue-600 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             <PlusIcon className="h-3 w-3" />
//             <span>Add Item</span>
//           </button>
//         </div>
//       )}

//       <nav className="mt-2 flex-grow">
//         {isLoading ? (
//           <div className="flex h-32 items-center justify-center">
//             <ArrowPathIcon className="h-8 w-8 animate-spin text-white" />
//           </div>
//         ) : (
//           <DragDropContext onDragEnd={editMode ? onDragEnd : () => {}}>
//             <Droppable droppableId="sidebarItems">
//               {(provided) => (
//                 <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
//                   {filteredItems.map((item, index) => (
//                     <Draggable
//                       key={item.id}
//                       draggableId={item.id}
//                       index={index}
//                       isDragDisabled={!editMode || isSaving}
//                     >
//                       {(provided) => (
//                         <li
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           className={`flex cursor-pointer items-center rounded px-3 py-2 transition-colors ${
//                             selectedItem === item.name
//                               ? 'bg-white text-black'
//                               : 'text-white hover:bg-[#ffffff30]'
//                           } ${isSaving ? 'opacity-50' : ''}`}
//                           onClick={() => !editMode && !isSaving && onItemSelect(item.type)}
//                         >
//                           {editMode && (
//                             <div
//                               {...provided.dragHandleProps}
//                               className="mr-2 text-gray-300 hover:text-white"
//                             >
//                               <Bars3Icon className="h-4 w-4" />
//                             </div>
//                           )}
//                           <span className="flex-1">{item.name}</span>
//                           {item.roles && item.roles.length > 0 && (
//                             <ShieldCheckIcon className="mr-1 h-4 w-4 text-blue-400" />
//                           )}
//                           {editMode && (
//                             <div className="flex space-x-1">
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   toggleItemVisibility(item.id);
//                                 }}
//                                 disabled={isSaving}
//                                 className={`rounded p-1 ${
//                                   !item.visible
//                                     ? 'bg-gray-600 hover:bg-gray-700'
//                                     : 'bg-blue-600 hover:bg-blue-700'
//                                 } transition-colors disabled:opacity-50`}
//                                 title={!item.visible ? 'Show' : 'Hide'}
//                               >
//                                 <EyeIcon className="h-3 w-3 text-white" />
//                               </button>
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleEditItem(item);
//                                 }}
//                                 disabled={isSaving}
//                                 className="rounded bg-yellow-600 p-1 transition-colors hover:bg-yellow-700 disabled:opacity-50"
//                                 title="Edit"
//                               >
//                                 <PencilIcon className="h-3 w-3 text-white" />
//                               </button>
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleDeleteItem(item.id);
//                                 }}
//                                 disabled={isSaving}
//                                 className="rounded bg-red-600 p-1 transition-colors hover:bg-red-700 disabled:opacity-50"
//                                 title="Delete"
//                               >
//                                 <TrashIcon className="h-3 w-3 text-white" />
//                               </button>
//                             </div>
//                           )}
//                         </li>
//                       )}
//                     </Draggable>
//                   ))}
//                   {provided.placeholder}
//                 </ul>
//               )}
//             </Droppable>
//           </DragDropContext>
//         )}
//       </nav>

//       <div className="mt-auto flex items-center space-x-3 rounded bg-[#ffffff20] p-2">
//         {userInfoLoading ? (
//           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400">
//             <ArrowPathIcon className="h-5 w-5 animate-spin text-white" />
//           </div>
//         ) : userInfo?.networkId ? (
//           <img
//             src={`https://dp4.aramco.com.sa/newdesign/employeePic?networkId=${userInfo.networkId}`}
//             alt="Profile"
//             className="h-10 w-10 rounded-full object-cover"
//             onError={(e) => {
//               // Fallback to initials if image fails to load
//               const target = e.currentTarget as HTMLImageElement;
//               target.style.display = 'none';
//               const fallback = target.nextElementSibling as HTMLElement;
//               if (fallback) fallback.style.display = 'flex';
//             }}
//           />
//         ) : null}

//         {/* Fallback initials display */}
//         <div
//           className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400"
//           style={{ display: userInfo?.networkId ? 'none' : 'flex' }}
//         >
//           <span className="text-sm font-semibold text-white">
//             {userInfo?.userFullName
//               ? userInfo.userFullName
//                   .split(' ')
//                   .map((n) => n[0])
//                   .join('')
//                   .substring(0, 2)
//                   .toUpperCase()
//               : 'U'}
//           </span>
//         </div>

//         <div>
//           <p className="text-sm font-medium">{userInfo?.userFullName || 'Loading...'}</p>
//           <p className="text-xs text-gray-300">
//             {userInfo?.lastAccessDate && userInfo?.lastAccessTime
//               ? `Last Login: ${userInfo.lastAccessDate} ${formatTime(userInfo.lastAccessTime)}`
//               : 'Last Login: N/A'}
//           </p>
//         </div>
//       </div>

//       <SidebarItemModal
//         modal={sidebarModal}
//         onClose={() => setSidebarModal({ ...sidebarModal, isOpen: false })}
//         onSave={handleSaveItem}
//         isSaving={isSaving}
//       />
//     </div>
//   );
// };

// // Report Card Component
// const ReportCard: React.FC<{
//   report: Report;
//   onView: (report: Report) => void;
//   onEdit: (report: Report) => void;
//   onDelete: (report: Report) => void;
// }> = ({ report, onView, onEdit, onDelete }) => (
//   <div className="mb-3 rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-3 transition-colors hover:bg-[#2a4a7b]">
//     <div className="flex items-center justify-between">
//       <div className="flex flex-1 items-center space-x-3">
//         <div className="rounded bg-[#3a5a8b] p-2">{report.icon}</div>
//         <span className="flex-1 text-sm leading-tight font-medium text-white">{report.title}</span>
//       </div>
//       <div className="ml-2 flex items-center space-x-2">
//         <button
//           onClick={() => onView(report)}
//           className="p-1 text-gray-300 transition-colors hover:text-white"
//           title="View"
//         >
//           <EyeIcon className="h-4 w-4" />
//         </button>
//         <button
//           onClick={() => onEdit(report)}
//           className="p-1 text-gray-300 transition-colors hover:text-white"
//           title="Edit"
//         >
//           <PencilIcon className="h-4 w-4" />
//         </button>
//         <button
//           onClick={() => onDelete(report)}
//           className="p-1 text-gray-300 transition-colors hover:text-white"
//           title="Delete"
//         >
//           <TrashIcon className="h-4 w-4" />
//         </button>
//       </div>
//     </div>
//   </div>
// );

// // Report Column Component
// const ReportColumn: React.FC<{
//   title: string;
//   reports: Report[];
//   onAddReport: (category: string) => void;
//   onView: (report: Report) => void;
//   onEdit: (report: Report) => void;
//   onDelete: (report: Report) => void;
// }> = ({ title, reports, onAddReport, onView, onEdit, onDelete }) => (
//   <div className="h-full rounded-lg bg-[#0f2a4f] p-4">
//     <div className="mb-4 flex items-center justify-between">
//       <h2 className="text-lg font-semibold text-white">{title}</h2>
//       <button
//         onClick={() => onAddReport(title)}
//         className="flex items-center space-x-1 rounded bg-[#4CAF50] px-3 py-1 text-sm text-white transition-colors hover:bg-[#45a049]"
//       >
//         <PlusIcon className="h-4 w-4" />
//         <span>Add</span>
//       </button>
//     </div>

//     <div className="max-h-[calc(100vh-200px)] space-y-2 overflow-y-auto pr-2">
//       {reports.map((report) => (
//         <ReportCard
//           key={report.id}
//           report={report}
//           onView={onView}
//           onEdit={onEdit}
//           onDelete={onDelete}
//         />
//       ))}
//     </div>
//   </div>
// );

// // B2B Reports Page Component
// const B2BReportsPage: React.FC<{
//   reportData: Record<string, Report[]>;
//   onAddReport: (category: string) => void;
//   onViewReport: (report: Report) => void;
//   onEditReport: (report: Report) => void;
//   onDeleteReport: (report: Report) => void;
// }> = ({ reportData, onAddReport, onViewReport, onEditReport, onDeleteReport }) => (
//   <div className="flex-1 p-6">
//     <div className="mb-6">
//       <h1 className="mb-2 text-3xl font-bold text-white">B2B Reports</h1>
//       <p className="text-gray-300">Manage and view your B2B reporting dashboard</p>
//     </div>

//     <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-6 lg:grid-cols-3">
//       <ReportColumn
//         title="B2B Reports"
//         reports={reportData['B2B Reports'] || []}
//         onAddReport={onAddReport}
//         onView={onViewReport}
//         onEdit={onEditReport}
//         onDelete={onDeleteReport}
//       />

//       <ReportColumn
//         title="Inventory & Materials"
//         reports={reportData['Inventory & Materials'] || []}
//         onAddReport={onAddReport}
//         onView={onViewReport}
//         onEdit={onEditReport}
//         onDelete={onDeleteReport}
//       />

//       <ReportColumn
//         title="Process & Orders"
//         reports={reportData['Process & Orders'] || []}
//         onAddReport={onAddReport}
//         onView={onViewReport}
//         onEdit={onEditReport}
//         onDelete={onDeleteReport}
//       />
//     </div>
//   </div>
// );

// // Generic Page Component for non-My SCM sections
// const GenericPage: React.FC<{
//   sectionName: string;
//   onNavigateToMapping: (sectionName: string) => void;
// }> = ({ sectionName, onNavigateToMapping }) => (
//   <div className="min-h-screen flex-1 bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b] p-8">
//     <div className="mx-auto max-w-4xl">
//       <div className="rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-8">
//         <div className="text-center">
//           <div className="mb-6">
//             <CubeIcon className="mx-auto mb-4 h-16 w-16 text-blue-400" />
//             <h1 className="mb-2 text-3xl font-bold text-white">{sectionName}</h1>
//             <p className="text-lg text-gray-300">Welcome to the {sectionName} module</p>
//           </div>

//           <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//             <div className="rounded-lg border border-[#3a5a8b] bg-[#2a4a7b] p-6">
//               <DocumentTextIcon className="mb-3 h-8 w-8 text-blue-400" />
//               <h3 className="mb-2 font-semibold text-white">Reports</h3>
//               <p className="text-sm text-gray-300">
//                 Generate and view detailed reports for {sectionName.toLowerCase()}
//               </p>
//             </div>

//             <div className="rounded-lg border border-[#3a5a8b] bg-[#2a4a7b] p-6">
//               <ClipboardDocumentListIcon className="mb-3 h-8 w-8 text-green-400" />
//               <h3 className="mb-2 font-semibold text-white">Analytics</h3>
//               <p className="text-sm text-gray-300">
//                 View analytics and insights for {sectionName.toLowerCase()} operations
//               </p>
//             </div>

//             <div
//               className="cursor-pointer rounded-lg border border-[#3a5a8b] bg-[#2a4a7b] p-6 transition-colors hover:bg-[#3a5a8b]"
//               onClick={() => onNavigateToMapping(sectionName)}
//             >
//               <ChartBarIcon className="mb-3 h-8 w-8 text-purple-400" />
//               <h3 className="mb-2 font-semibold text-white">Dashboard Builder</h3>
//               <p className="text-sm text-gray-300">
//                 Create and manage dashboards for {sectionName.toLowerCase()}
//               </p>
//             </div>
//           </div>

//           <div className="mt-8 rounded-lg border border-[#3a5a8b] bg-[#2a4a7b] p-4">
//             <p className="text-sm text-gray-300">
//               This section is under development. More features will be available soon.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // Main Application Component with Admin Role Check and URL Parameter Logic
// const IntegratedApp: React.FC = () => {
//   const [appState, setAppState] = useState<AppState>({
//     view: 'dashboard',
//     selectedMenuItem: 'My SCM',
//   });
//   const [reportData, setReportData] = useState(initialReportData);
//   const [modal, setModal] = useState<ModalState>({
//     isOpen: false,
//     mode: 'add',
//   });
//   const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Add admin-related state
//   const [isAdmin, setIsAdmin] = useState<boolean>(false);
//   const [adminCheckLoading, setAdminCheckLoading] = useState(true);
//   const [adminCheckError, setAdminCheckError] = useState<string | null>(null);

//   // Add URL parameters hook
//   const urlParams = useURLParams();

//   // Check if edit mode is allowed based on admin status and URL parameter
//   const isEditModeAllowed = useMemo(() => {
//     if (!isAdmin) return false;
//     return urlParams?.get('view') === 'edit';
//   }, [isAdmin, urlParams]);

//   // Check admin role on component mount
//   useEffect(() => {
//     const checkAdminStatus = async () => {
//       try {
//         setAdminCheckLoading(true);
//         setAdminCheckError(null);
//         const adminStatus = await sapODataService.checkAdminRole();
//         setIsAdmin(adminStatus);

//         // Set default view based on admin status
//         if (!adminStatus) {
//           // Non-admin users default to mySCAI
//           setAppState((prev) => ({
//             ...prev,
//             selectedMenuItem: 'mySCAI',
//             view: 'dashboard',
//           }));
//         }
//       } catch (error) {
//         console.error('Failed to check admin status:', error);
//         setAdminCheckError('Failed to check admin permissions');
//         setIsAdmin(false); // Default to non-admin on error

//         // Default to mySCAI for safety
//         setAppState((prev) => ({
//           ...prev,
//           selectedMenuItem: 'mySCAI',
//           view: 'dashboard',
//         }));
//       } finally {
//         setAdminCheckLoading(false);
//       }
//     };

//     checkAdminStatus();
//   }, []);

//    useEffect(() => {
//   console.log('menuItems changed:', menuItems);
//   console.log('selectedMenuItem changed:', appState.selectedMenuItem);
//   const selectedMenuItemData = menuItems.find(item => item.name === appState.selectedMenuItem);
//   console.log('selectedMenuItemData:', selectedMenuItemData);
// }, []);

//   // Load menu items from SAP on component mount (only for admin users)
//   useEffect(() => {
//     const loadMenuItems = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);

//         // Only load menu items if user is admin
//         if (!isAdmin) {
//           // For non-admin users, create a minimal menu with just mySCAI
//           const nonAdminItems: MenuItem[] = [
//             {
//               id: 'scaia-default',
//               name: 'mySCAI',
//               description: 'Supply Chain AI Assistant',
//               visible: true,
//               order: 0,
//               type: 'Section',
//               deleted: false,
//               roles: [],
//               isNew: false,
//             },
//           ];
//           setMenuItems(nonAdminItems);
//           return;
//         }

//         // Admin users get full menu items from API
//         const items = await sapODataService.fetchMenuItems();

//         // If no items from API, use default items for admin
//         if (items.length === 0) {
//           const defaultItems: MenuItem[] = [
//             {
//               id: sapODataService.generateGUID(),
//               name: 'My SCM',
//               description: 'Supply Chain Management Dashboard',
//               visible: true,
//               order: 0,
//               type: 'Section',
//               deleted: false,
//               roles: [],
//               isNew: false,
//             },
//             {
//               id: sapODataService.generateGUID(),
//               name: 'mySCAI',
//               description: 'Supply Chain AI Assistant',
//               visible: true,
//               order: 1,
//               type: 'Section',
//               deleted: false,
//               roles: [],
//               isNew: false,
//             },
//             {
//               id: sapODataService.generateGUID(),
//               name: 'B2B Reports',
//               description: 'Manage and view your B2B reporting dashboard',
//               visible: true,
//               order: 2,
//               type: 'Section',
//               deleted: false,
//               roles: [],
//               isNew: false,
//             },
//           ];
//           setMenuItems(defaultItems);
//         } else {
//           setMenuItems(items.sort((a, b) => a.order - b.order));
//         }
//       } catch (error) {
//         console.error('Error loading menu items:', error);
//         setError('Failed to load menu items from server. Using default items.');

//         // Use appropriate default items based on admin status
//         const defaultItems: MenuItem[] = isAdmin
//           ? [
//               {
//                 id: 'default-1',
//                 name: 'My SCM',
//                 description: 'Supply Chain Management Dashboard',
//                 visible: true,
//                 order: 0,
//                 type: 'Section',
//                 deleted: false,
//                 roles: [],
//                 isNew: false,
//               },
//               {
//                 id: 'default-2',
//                 name: 'mySCAI',
//                 description: 'Supply Chain AI Assistant',
//                 visible: true,
//                 order: 1,
//                 type: 'Section',
//                 deleted: false,
//                 roles: [],
//                 isNew: false,
//               },
//               {
//                 id: 'default-3',
//                 name: 'B2B Reports',
//                 description: 'Manage and view your B2B reporting dashboard',
//                 visible: true,
//                 order: 2,
//                 type: 'Section',
//                 deleted: false,
//                 roles: [],
//                 isNew: false,
//               },
//             ]
//           : [
//               {
//                 id: 'scaia-default',
//                 name: 'mySCAI',
//                 description: 'Supply Chain AI Assistant',
//                 visible: true,
//                 order: 0,
//                 type: 'Section',
//                 deleted: false,
//                 roles: [],
//                 isNew: false,
//               },
//             ];
//         setMenuItems(defaultItems);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     // Only load menu items after admin check is complete
//     if (!adminCheckLoading) {
//       loadMenuItems();
//     }
//   }, [isAdmin, adminCheckLoading]);

//   // Handle menu item selection (restrict for non-admin users)
//   const handleMenuItemSelect = (item: string) => {
//     // Non-admin users can only access mySCAI
//     if (!isAdmin && item !== 'Section') {
//       return;
//     }

//     if (item === 'Section') {
//       setAppState({
//         view: 'dashboard',
//         selectedMenuItem: item,
//       });
//     } else if (item === 'Dashboard') {
//       setAppState({
//         view: 'b2b-reports',
//         selectedMenuItem: item,
//       });
//     } else {
//       setAppState({
//         view: 'generic',
//         selectedMenuItem: item,
//       });
//     }
//   };

//   // Handle navigation to mapping screen (admin only with edit permission)
//   const handleNavigateToMapping = (sectionName: string) => {
//     if (!isEditModeAllowed) return; // Prevent access without edit permission

//     setAppState({
//       view: 'mapping',
//       selectedMenuItem: appState.selectedMenuItem,
//       mappingParams: {
//         sectionName,
//         expanded: 'true',
//       },
//     });
//   };

//   // Handle report actions
//   const handleReportView = useCallback((report: Report) => {
//     setModal({
//       isOpen: true,
//       mode: 'view',
//       report,
//     });
//   }, []);

//   const handleReportEdit = useCallback((report: Report) => {
//     setModal({
//       isOpen: true,
//       mode: 'edit',
//       report,
//     });
//   }, []);

//   const handleReportDelete = useCallback((report: Report) => {
//     setModal({
//       isOpen: true,
//       mode: 'delete',
//       report,
//     });
//   }, []);

//   const handleAddReport = useCallback((category: string) => {
//     setModal({
//       isOpen: true,
//       mode: 'add',
//       category,
//     });
//   }, []);

//   // Handle modal save with duplicate prevention
//   const handleModalSave = useCallback(
//     (report: Report) => {
//       setReportData((prev) => {
//         const newData = { ...prev };

//         if (modal.mode === 'add') {
//           const existingReport = newData[report.category]?.find((r) => r.id === report.id);
//           if (existingReport) {
//             return prev;
//           }

//           if (!newData[report.category]) {
//             newData[report.category] = [];
//           }
//           newData[report.category].push(report);
//         } else if (modal.mode === 'edit') {
//           Object.keys(newData).forEach((category) => {
//             const index = newData[category].findIndex((r) => r.id === report.id);
//             if (index !== -1) {
//               newData[category][index] = report;
//             }
//           });
//         }

//         return newData;
//       });
//     },
//     [modal.mode]
//   );

//   // Handle modal delete
//   const handleModalDelete = useCallback((reportId: string) => {
//     setReportData((prev) => {
//       const newData = { ...prev };

//       Object.keys(newData).forEach((category) => {
//         newData[category] = newData[category].filter((r) => r.id !== reportId);
//       });

//       return newData;
//     });
//   }, []);

//   // Close modal
//   const handleModalClose = useCallback(() => {
//     setModal({
//       isOpen: false,
//       mode: 'add',
//     });
//   }, []);

 

//   // Render based on current view
//   const renderContent = () => {
//     console.log("renderer")
//     const selectedMenuItemData = menuItems.find((item) => item.id === appState.selectedMenuItem);
//     console.log(selectedMenuItemData,'menu data')

//     switch (appState.view) {
//       case 'dashboard':
//         return (
//           <Home
//             selectedMenuItemId={selectedMenuItemData?.id}
//             isAdmin={isAdmin}
//             isEditModeAllowed={isEditModeAllowed} // Pass edit permission
//           />
//         );

//       case 'b2b-reports':
//         // Restrict B2B reports to admin only
//         if (!isAdmin) {
//           return (
//             <Home
//               selectedMenuItemId={selectedMenuItemData?.id}
//               isAdmin={isAdmin}
//               isEditModeAllowed={isEditModeAllowed}
//             />
//           );
//         }
//         return (
//           <B2BReportsPage
//             reportData={reportData}
//             onAddReport={handleAddReport}
//             onViewReport={handleReportView}
//             onEditReport={handleReportEdit}
//             onDeleteReport={handleReportDelete}
//           />
//         );

//       case 'generic':
//         // Restrict generic pages to admin only
//         if (!isAdmin) {
//           return (
//             <Home
//               selectedMenuItemId={selectedMenuItemData?.id}
//               isAdmin={isAdmin}
//               isEditModeAllowed={isEditModeAllowed}
//             />
//           );
//         }
//         return (
//           <GenericPage
//             sectionName={appState.selectedMenuItem}
//             onNavigateToMapping={handleNavigateToMapping}
//           />
//         );

//       case 'mapping':
//         // Restrict mapping to admin only with edit permission
//         if (!isEditModeAllowed) {
//           return (
//             <Home
//               selectedMenuItemId={selectedMenuItemData?.id}
//               isAdmin={isAdmin}
//               isEditModeAllowed={isEditModeAllowed}
//             />
//           );
//         }
//         return <MappingScreen />;

//       default:
//         return (
//           <Home
//             selectedMenuItemId={selectedMenuItemData?.id}
//             isAdmin={isAdmin}
//             isEditModeAllowed={isEditModeAllowed}
//           />
//         );
//     }
//   };

//   // Show loading screen while checking admin status
//   if (adminCheckLoading) {
//     console.log("admin render")
//     return (
//       <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]">
//         <div className="rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-8">
//           <div className="text-center">
//             <ArrowPathIcon className="mx-auto mb-4 h-16 w-16 animate-spin text-blue-400" />
//             <h2 className="mb-2 text-xl font-bold text-white">Loading...</h2>
//             <p className="text-gray-300">Checking user permissions...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Show error message if there's an error
//   if (error || adminCheckError) {
//         console.log("error render")

//     return (
//       <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]">
//         <div className="max-w-md rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-8">
//           <div className="text-center">
//             <ExclamationTriangleIcon className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
//             <h2 className="mb-2 text-xl font-bold text-white">Warning</h2>
//             <p className="mb-4 text-gray-300">{error || adminCheckError}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
    
//     <div
//       className="flex h-screen bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]"
//       style={{
//         backgroundImage: `url('${process.env.NEXT_PUBLIC_BSP_NAME}/background/bg.png')`,
//       }}
//     >
//       {/* Show sidebar for admin users (regardless of edit mode) */}
//       {isAdmin && appState.view !== 'mapping' && (
//         <Sidebar
//           selectedItem={appState.selectedMenuItem}
//           onItemSelect={handleMenuItemSelect}
//           menuItems={menuItems}
//           onMenuItemsChange={setMenuItems}
//           isLoading={isLoading}
//           isEditModeAllowed={isEditModeAllowed}
//         />
//       )}

//       {/* Add admin and edit mode indicator in top-right corner */}
//       {/* {process.env.NODE_ENV === "development" && (
//         <div className="absolute top-4 right-4 z-50 space-y-2">
//           <div
//             className={`px-3 py-1 rounded text-xs font-medium ${
//               isAdmin ? "bg-green-600 text-white" : "bg-red-600 text-white"
//             }`}
//           >
//             {isAdmin ? "Admin User" : "Regular User"}
//           </div>
//           {isAdmin && (
//             <div
//               className={`px-3 py-1 rounded text-xs font-medium ${
//                 isEditModeAllowed
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-600 text-white"
//               }`}
//             >
//               {isEditModeAllowed ? "Edit Mode Available" : "View Mode Only"}
//             </div>
//           )}
//         </div>
//       )} */}

//       {renderContent()}

//       {/* Only show report modal for admin users with edit permission */}
//       {isEditModeAllowed && (
//         <ReportModal
//           modal={modal}
//           onClose={handleModalClose}
//           onSave={handleModalSave}
//           onDelete={handleModalDelete}
//         />
//       )}
//     </div>
//   );
// };

// export default IntegratedApp;
