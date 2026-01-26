import React from 'react';
import { X, Info, FileText, Database, FileJson, Globe, Link2, ExternalLink } from 'lucide-react';
import { TargetReportConfig } from '../../types/dashboard';
import { sapODataService } from '@/services/sapODataService';

interface WidgetDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    widget: any;
    targetReport?: TargetReportConfig;
    description?: string;
}

export const WidgetDetailsDialog: React.FC<WidgetDetailsDialogProps> = ({
    open,
    onClose,
    widget,
    targetReport,
    description,
}) => {
    const handleOpenReport = async (targetReport: TargetReportConfig): Promise<void> => {
        if (!targetReport?.technicalId) {
            return;
        }

        let reportUrl = '';

        try {
            switch (targetReport.type) {
                case 'Bex Query':
                    const bexUrl = await sapODataService.getServiceUrl('BexQuery');
                    reportUrl = bexUrl ? `${bexUrl}${targetReport.technicalId}` : '';
                    break;
                case 'Lumira':
                    const lumiraUrl = await sapODataService.getServiceUrl('Lumira');
                    reportUrl = lumiraUrl ? `${lumiraUrl}${targetReport.technicalId}` : '';
                    break;
                case 'WAD Template':
                    const wadUrl = await sapODataService.getServiceUrl('WADTemplate');
                    reportUrl = wadUrl ? `${wadUrl}${targetReport.technicalId}` : '';
                    break;
                case 'Web Link':
                    reportUrl = targetReport.technicalId;
                    break;
                default:
                    alert('Unknown report type.');
                    return;
            }

            if (!reportUrl && targetReport.type !== 'Web Link') {
                alert('Unable to retrieve service URL for this report type.');
                return;
            }

            window.open(reportUrl, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Error opening report:', error);
            alert('Error opening report. Please try again.');
        }
    };

    const getReportTypeIcon = (type: string) => {
        const iconClass = "h-5 w-5";
        switch (type) {
            case 'Bex Query':
                return <Database className={iconClass} style={{ color: '#4CAF50' }} />;
            case 'Lumira':
                return <FileText className={iconClass} style={{ color: '#2196F3' }} />;
            case 'WAD Template':
                return <FileJson className={iconClass} style={{ color: '#FF9800' }} />;
            case 'Web Link':
                return <Link2 className={iconClass} style={{ color: '#9C27B0' }} />;
            default:
                return <Info className={iconClass} style={{ color: '#757575' }} />;
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]/50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#2a4a7b] bg-[#1a3a6b] p-6 shadow-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between border-b border-[#2a4a7b] pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2a4a7b]">
                            <Info className="h-5 w-5 text-[#4CAF50]" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Widget Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 transition-colors hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* Widget Information */}
                    {description && (
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <Info className="h-5 w-5 text-[#2196F3]" />
                                <h3 className="text-lg font-medium text-white">Widget Information</h3>
                            </div>
                            <div className="rounded-lg border border-[#3a5a8b] bg-[#2a4a7b] p-4">
                                <p className="text-sm text-gray-300 mb-2 font-medium">Description</p>
                                <p className="text-white leading-relaxed">{description}</p>
                            </div>
                        </div>
                    )}

                    {/* Detailed Report Configuration */}
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[#4CAF50]" />
                            <h3 className="text-lg font-medium text-white">Detailed Report Configuration</h3>
                        </div>

                        {targetReport && targetReport.technicalId ? (
                            <div className="space-y-4 rounded-lg border border-[#3a5a8b] bg-[#2a4a7b] p-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="flex items-center gap-3">
                                        {getReportTypeIcon(targetReport.type)}
                                        <div>
                                            <p className="text-sm text-gray-300 mb-1">Type</p>
                                            <p className="text-white font-medium">{targetReport.type}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-300 mb-1">Technical ID</p>
                                        <div className="rounded border border-[#4a6a9b] bg-[#3a5a8b] p-2">
                                            <code className="text-sm text-white font-mono break-all">
                                                {targetReport.technicalId}
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                {targetReport.name && (
                                    <div>
                                        <p className="text-sm text-gray-300 mb-1">Report Name</p>
                                        <p className="text-white font-medium">{targetReport.name}</p>
                                    </div>
                                )}

                                {targetReport.description && (
                                    <div>
                                        <p className="text-sm text-gray-300 mb-2">Report Description</p>
                                        <div className="rounded border border-[#4a6a9b] bg-[#3a5a8b] p-3">
                                            <p className="text-white leading-relaxed">{targetReport.description}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 flex justify-end">
                                    <button
                                        onClick={() => targetReport && handleOpenReport(targetReport)}
                                        className="flex items-center gap-2 rounded-lg border border-[#2196F3] bg-transparent px-4 py-2 text-[#2196F3] transition-all hover:bg-[#2196F3] hover:text-white"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>Open Report</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-[#3a5a8b] bg-[#2a4a7b] p-4 text-center">
                                <p className="text-sm text-red-300 italic mb-2">
                                    No Detailed Report configured for this widget.
                                </p>
                                <p className="text-sm text-gray-300">
                                    Configure a Detailed Report in the mapping screen to enable the "Open Report" functionality.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end border-t border-[#2a4a7b] pt-4">
                    <button
                        onClick={onClose}
                        className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
