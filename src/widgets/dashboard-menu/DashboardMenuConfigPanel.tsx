'use client';

import React, { useRef, useState } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { DashboardMenuWidgetConfig, DashboardMenuItemConfig, DashboardMenuIconType, DashboardMenuDisplayMode, DASHBOARD_MENU_ICONS } from './DashboardMenuConfig.types';
import { TargetReportConfig } from '@/helpers/types';

interface DashboardMenuConfigPanelProps {
    value: DashboardMenuWidgetConfig;
    onChange: (config: DashboardMenuWidgetConfig) => void;
}

const REPORT_TYPE_OPTIONS: TargetReportConfig['type'][] = [
    'Bex Query',
    'Lumira',
    'WAD Template',
    'Web Link',
];

const defaultConfig: DashboardMenuWidgetConfig = {
    items: [],
    displayMode: 'multiple',
    layout: 'list',
};

const DISPLAY_MODE_OPTIONS: { value: DashboardMenuDisplayMode; label: string }[] = [
    { value: 'multiple', label: 'Multiple' },
    { value: 'single', label: 'Single' },
];

/** Icon options: Default (report) + all icons from public/icons */
const ICON_PICKER_OPTIONS: { value: DashboardMenuIconType | ''; label: string; src?: string }[] = [
    { value: '', label: 'Default' },
    ...DASHBOARD_MENU_ICONS.map((icon) => ({
        value: icon.id as DashboardMenuIconType,
        label: icon.label,
        src: `/icons/${icon.id}`,
    })),
];

interface CollapsibleSectionProps {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    defaultOpen = true,
    children,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
            >
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                {isOpen ? (
                    <ChevronUpIcon className="h-5 w-5 text-white/70" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5 text-white/70" />
                )}
            </button>
            {isOpen && <div className="border-t border-white/10 px-4 py-3">{children}</div>}
        </div>
    );
};

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const LabeledInput: React.FC<LabeledInputProps> = ({ label, id, className, ...rest }) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <div className="mb-3 flex flex-col gap-1">
            <label
                htmlFor={inputId}
                className="mb-1 block text-xs font-medium text-white/70"
            >
                {label}
            </label>
            <input
                id={inputId}
                {...rest}
                className={
                    className ||
                    'w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20'
                }
            />
        </div>
    );
};

interface LabeledSelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
}

const LabeledSelect: React.FC<LabeledSelectProps> = ({
    label,
    id,
    className,
    options,
    ...rest
}) => {
    const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <div className="mb-3 flex flex-col gap-1">
            <label
                htmlFor={selectId}
                className="mb-1 block text-xs font-medium text-white/70"
            >
                {label}
            </label>
            <div className="relative">
                <select
                    id={selectId}
                    {...rest}
                    className={
                        className ||
                        'w-full appearance-none rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20'
                    }
                >
                    {options.map((opt) => (
                        <option
                            key={opt.value}
                            value={opt.value}
                            className="bg-gray-900 text-white"
                        >
                            {opt.label}
                        </option>
                    ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white/50">
                    ▼
                </span>
            </div>
        </div>
    );
};

interface IconSelectOption {
    value: DashboardMenuIconType | '';
    label: string;
    src?: string;
}

interface IconSelectProps {
    label: string;
    value: DashboardMenuIconType | '';
    options: IconSelectOption[];
    onChange: (value: DashboardMenuIconType | undefined) => void;
    id?: string;
}

const IconSelect: React.FC<IconSelectProps> = ({
    label,
    value,
    options,
    onChange,
    id,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const selected = options.find((o) => (o.value || '') === (value || '')) || options[0];

    return (
        <div ref={containerRef} className="relative mb-3">
            <span className="mb-1 block text-xs font-medium text-white/70">{label}</span>
            <button
                type="button"
                id={id}
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            >
                {selected.src ? (
                    <img
                        src={selected.src}
                        alt=""
                        className="h-5 w-5 flex-shrink-0 object-contain brightness-0 invert"
                    />
                ) : (
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[10px] font-medium text-white/60">
                        —
                    </span>
                )}
                <span className="min-w-0 flex-1 truncate">{selected.label}</span>
                <ChevronDownIcon
                    className={`h-4 w-4 flex-shrink-0 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-lg border border-white/20 bg-gray-900 py-1 shadow-lg">
                    {options.map((opt) => {
                        const isSelected = (opt.value || '') === (value || '');
                        return (
                            <button
                                key={opt.value || 'default'}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value || undefined);
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/10 ${
                                    isSelected ? 'bg-cyan-400/20 text-cyan-200' : ''
                                }`}
                            >
                                {opt.src ? (
                                    <img
                                        src={opt.src}
                                        alt=""
                                        className="h-5 w-5 flex-shrink-0 object-contain brightness-0 invert"
                                    />
                                ) : (
                                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[10px] font-medium text-white/60">
                                        —
                                    </span>
                                )}
                                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const DashboardMenuConfigPanel: React.FC<DashboardMenuConfigPanelProps> = ({
    value,
    onChange,
}) => {
    const config: DashboardMenuWidgetConfig = {
        ...defaultConfig,
        ...value,
        items: value?.items || [],
    };

    const handleChange = (newConfig: Partial<DashboardMenuWidgetConfig>) => {
        onChange({
            ...config,
            ...newConfig,
        });
    };

    const handleItemChange = (
        index: number,
        updater: (item: DashboardMenuItemConfig) => DashboardMenuItemConfig
    ) => {
        const items = [...config.items];
        items[index] = updater(items[index]);
        handleChange({ items });
    };

    const handleAddItem = () => {
        const newItem: DashboardMenuItemConfig = {
            id: `menu-item-${Date.now()}`,
            targetReport: {
                type: 'Bex Query',
                technicalId: '',
                name: '',
                description: '',
                showInfo: true,
            },
            iconType: 'report',
        };
        handleChange({ items: [...config.items, newItem] });
    };

    const handleRemoveItem = (index: number) => {
        const items = [...config.items];
        items.splice(index, 1);
        handleChange({ items });
    };

    return (
        <div className="space-y-4 text-white">
            <CollapsibleSection title="Display" defaultOpen>
                <LabeledSelect
                    label="Single / Multiple"
                    value={config.displayMode ?? 'multiple'}
                    onChange={(e) =>
                        handleChange({
                            displayMode: e.target.value as DashboardMenuDisplayMode,
                        })
                    }
                    options={DISPLAY_MODE_OPTIONS}
                />
                <p className="text-xs text-white/50">
                    Single: one card with large logo, title and description. Multiple: list of
                    menu items (default).
                </p>
            </CollapsibleSection>
            <CollapsibleSection title="Menu Items" defaultOpen>
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs text-white/60">
                        Add one or more menu entries. Each entry opens a configured report
                        in a new page.
                    </p>
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-1 rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-2.5 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-400/20 hover:border-cyan-300"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Item
                    </button>
                </div>

                {config.items.length === 0 && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                        <p className="text-xs text-white/60">
                            No menu items configured. Click &quot;Add Item&quot; to add your first
                            report link.
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    {config.items.map((item, index) => {
                        const target = item.targetReport;
                        return (
                            <div
                                key={item.id}
                                className="rounded-lg border border-white/15 bg-white/5 p-3"
                            >
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <LabeledInput
                                            label="Report Name"
                                            value={target.name || ''}
                                            placeholder="Display name shown in the menu"
                                            onChange={(e) =>
                                                handleItemChange(index, (prev) => ({
                                                    ...prev,
                                                    targetReport: {
                                                        ...prev.targetReport,
                                                        name: e.target.value,
                                                    },
                                                }))
                                            }
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="ml-2 mt-5 rounded-lg p-1.5 text-white/70 transition-colors hover:bg-red-500/20 hover:text-red-400"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <IconSelect
                                        label="Icon"
                                        value={item.iconType || ''}
                                        options={ICON_PICKER_OPTIONS}
                                        onChange={(iconType) =>
                                            handleItemChange(index, (prev) => ({
                                                ...prev,
                                                iconType: iconType as DashboardMenuIconType | undefined,
                                            }))
                                        }
                                        id={`menu-item-icon-${index}`}
                                    />

                                    <LabeledSelect
                                        label="Report Type"
                                        value={target.type}
                                        onChange={(e) =>
                                            handleItemChange(index, (prev) => ({
                                                ...prev,
                                                targetReport: {
                                                    ...prev.targetReport,
                                                    type: e.target.value as TargetReportConfig['type'],
                                                },
                                            }))
                                        }
                                        options={REPORT_TYPE_OPTIONS.map((t) => ({
                                            value: t,
                                            label: t,
                                        }))}
                                    />

                                    <LabeledInput
                                        label={
                                            target.type === 'Web Link'
                                                ? 'URL'
                                                : 'Technical ID'
                                        }
                                        value={target.technicalId || ''}
                                        placeholder={
                                            target.type === 'Web Link'
                                                ? 'https://...'
                                                : 'Enter technical report ID'
                                        }
                                        onChange={(e) =>
                                            handleItemChange(index, (prev) => ({
                                                ...prev,
                                                targetReport: {
                                                    ...prev.targetReport,
                                                    technicalId: e.target.value,
                                                },
                                            }))
                                        }
                                    />

                                    <div className="mb-2">
                                        <label className="mb-1 block text-xs font-medium text-white/70">
                                            Report Description
                                        </label>
                                        <textarea
                                            value={target.description || ''}
                                            placeholder="Short description for tooltips or details"
                                            onChange={(e) =>
                                                handleItemChange(index, (prev) => ({
                                                    ...prev,
                                                    targetReport: {
                                                        ...prev.targetReport,
                                                        description: e.target.value,
                                                    },
                                                }))
                                            }
                                            rows={2}
                                            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CollapsibleSection>
        </div>
    );
};

