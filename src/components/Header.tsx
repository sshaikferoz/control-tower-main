//Header.tsx
'use client';
import { Search, Loader2, X } from 'lucide-react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { DASHBOARD_MENU_ICONS } from '@/widgets/dashboard-menu/DashboardMenuConfig.types';
import Markdown from 'markdown-to-jsx';

const MENU_ICON_IDS: Set<string> = new Set(DASHBOARD_MENU_ICONS.map((i) => i.id));

/** Icon for dashboard menu item search results: DashboardMenu link type (report / dashboard / user) or custom icon from public/icons. */
function MenuItemResultIcon({ type }: { type: 'report' | 'dashboard' | 'user' | string }) {
    const iconClass = 'h-4 w-4 flex-shrink-0 text-blue-600';

    // Custom icon from public/icons (e.g. "dashboard-icon.png") – dark on white for visibility in search dropdown
    if (type && typeof type === 'string' && MENU_ICON_IDS.has(type)) {
        return (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50" aria-hidden>
                <img
                    src={`${process.env.NEXT_PUBLIC_BSP_NAME}/icons/${type}`}
                    alt=""
                    className="h-4 w-4 flex-shrink-0 object-contain brightness-0"
                />
            </span>
        );
    }

    if (type === 'dashboard') {
        return (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50" aria-hidden>
                <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                </svg>
            </span>
        );
    }
    if (type === 'user') {
        return (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50" aria-hidden>
                <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                    <path
                        d="M3.5 12.5C4.2 10.8 5.9 9.75 8 9.75C10.1 9.75 11.8 10.8 12.5 12.5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                </svg>
            </span>
        );
    }
    // default: report
    return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50" aria-hidden>
            <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M5 3.5C5 3.22386 5.22386 3 5.5 3H9.5L11.5 5V12.5C11.5 12.7761 11.2761 13 11 13H5C4.72386 13 4.5 12.7761 4.5 12.5V3.5C4.5 3.22386 4.72386 3 5 3Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M8 7H6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M9.5 9H6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
        </span>
    );
}
import SCMLogo from '@/assets/SCMLogo';
import { Button } from 'primereact/button';
import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { UIConfiguration } from '../types/configuration';
import { TargetReportConfig } from '@/helpers/types';
import { openReport } from '@/utils/openReportUtils';
import { ThemeSettingsButton } from '@/components/layout/ThemeSettingsButton';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchResult {
    metadata: {
        TabId: string;
        TabDescription: string;
        SectionId: string;
        SectionName: string;
        SectionDescription: string;
        WidgetId: string;
        WidgetType: string;
        WidgetTitle: string;
        TechnicalName: string;
        WidgetDescription: string;
    };
    match_text: string;
    score: number;
    level: string;
    ai_title: string;
    ai_summary: string;
    /** When result is a dashboard menu item: icon type (report / dashboard / user) or icon filename from public/icons. */
    menuItemIconType?: 'report' | 'dashboard' | 'user' | string;
    /** When result is a dashboard menu item with a configured report: open this report from search. */
    menuItemTargetReport?: TargetReportConfig;
}

interface SearchResponse {
    results: SearchResult[];
}

interface HeaderProps {
    configuration?: UIConfiguration;
    tabId: any;
    onSearchSelect?: (result: SearchResult | null) => void;
    // Optional callback for client-side fuzzy search over widgets/sections
    onLocalSearch?: (query: string) => SearchResult[];
}

const Header: React.FC<HeaderProps> = ({ configuration, tabId, onSearchSelect, onLocalSearch }) => {
    const [visible, setVisible] = useState(false);
    const [sectionName, setSectionName] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>(null);
    const [announcementIndex, setAnnouncementIndex] = useState(0);
    const [announcementPaused, setAnnouncementPaused] = useState(false);
    const [showHelpPanel, setShowHelpPanel] = useState(false);
    const helpPanelRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    const searchConfig = configuration?.search || {
        enabled: true,
        placeholder: 'Search My Contract, Spend, Notification, Localization, KPI',
        mode: 'advanced' as const,
    };

    const brandingConfig = configuration?.branding || {
        logoUrl: '',
        logoBase64: '',
        useLogoBase64: false,
        appName: 'mySCAI',
        primaryColor: '#0164B0',
    };

    const announcementConfig = configuration?.announcement || {
        enabled: false,
        items: [],
        autoScroll: true,
        scrollDelay: 5000,
        scrollDirection: 'left' as const,
    };
    const themeConfig = configuration?.theme || {
        enabled: false,
    };
    const helpConfig = configuration?.help || {
        enabled: false,
        text: 'Need assistance? Contact support or open the user guide.',
    };
    const getLogoSrc = () => {
        if (brandingConfig.useLogoBase64 && brandingConfig.logoBase64) {
            return brandingConfig.logoBase64;
        }
        return brandingConfig.logoUrl;
    };

    const logoSrc = getLogoSrc();
    const isLightTheme = theme === 'light';

    // Clear search when tabId changes
    useEffect(() => {
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(false);
        setSelectedIndex(-1);
    }, [tabId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
            if (showHelpPanel && helpPanelRef.current && !helpPanelRef.current.contains(event.target as Node)) {
                setShowHelpPanel(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showHelpPanel]);

    // Auto-scroll effect
    useEffect(() => {
        if (
            !announcementConfig.autoScroll ||
            announcementPaused ||
            !announcementConfig.items ||
            announcementConfig.items.length <= 1
        ) {
            return;
        }

        const interval = setInterval(() => {
            setAnnouncementIndex((prev) => {
                if (announcementConfig.scrollDirection === 'left') {
                    return (prev + 1) % announcementConfig.items.length;
                } else {
                    return prev === 0 ? announcementConfig.items.length - 1 : prev - 1;
                }
            });
        }, announcementConfig.scrollDelay);

        return () => clearInterval(interval);
    }, [announcementConfig, announcementPaused]);

    const getSearchEndpoint = () => {
        // Domain `dvc.aramco.sa` is treated as development (`dvb`)
        const isDvbEnv =
            typeof window !== 'undefined' && window.location.hostname.includes('dvc.aramco.sa');
        return isDvbEnv
            ? 'https://scic-search.cml.apps.cdp-ds-test.aramco.com/api/search'
            : 'https://scic-search.cml.apps.cdp-ds-prod.aramco.com/api/search';
    };

    const performSearch = async (query: string) => {
        if (!query.trim() || query.length < 2 || !searchConfig.enabled) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        // For basic mode, use client-side fuzzy search over widget data if provided.
        if (searchConfig.mode === 'basic') {
            if (onLocalSearch) {
                const localResults = onLocalSearch(query) || [];
                setSearchResults(localResults);
                setShowDropdown(localResults.length > 0);
                setSelectedIndex(-1);
            } else {
                // If no local search is wired, fall back to clearing results
                setSearchResults([]);
                setShowDropdown(false);
            }
            setIsSearching(false);
            return;
        }

        // Advanced (AI) mode - call semantic search API
        setIsSearching(true);
        try {
            const res = await fetch(getSearchEndpoint(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    // Hint to backend which search mode is requested.
                    // Backend may ignore this field if it doesn't support modes.
                    mode: searchConfig.mode || 'advanced',
                    tab_id: tabId,
                    top_k: 5,
                }),
            });
            const response: SearchResponse = await res.json();

            setSearchResults(response.results || []);
            setShowDropdown(true);
            setSelectedIndex(-1);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setShowDropdown(false);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        // Clear selection/highlighting when input is empty
        if (!value.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            setSelectedIndex(-1);
            if (onSearchSelect) onSearchSelect(null);
            return;
        }

        debounceRef.current = setTimeout(() => {
            performSearch(value);
        }, 300);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || searchResults.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleResultSelect(searchResults[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const handleResultSelect = (result: SearchResult) => {
        // Do not modify the user's query on selection; only apply highlighting/side effects
        setShowDropdown(false);
        setSelectedIndex(-1);
        if (onSearchSelect) onSearchSelect(result);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
        if (onSearchSelect) onSearchSelect(null);
    };

    const handleCreateSection = () => {
        const encodedSectionName = encodeURIComponent(sectionName.trim());
        window.location.href = `/mapping?sectionName=${encodedSectionName}&expanded=${isExpanded}`;
    };


    return (
        <nav
            className={`relative mx-4 mt-4 flex h-[73px] w-[calc(100%-2rem)] items-center justify-between rounded-lg px-6 py-4`}
            style={{
                background: announcementConfig?.enabled
                    ? `url('${process.env.NEXT_PUBLIC_BSP_NAME}/background/${isLightTheme ? 'announcement-light.png' : 'announcement-bg.png'}') no-repeat center / cover`
                    : 'var(--sidebar-bg)',
            }}
        >
            {/* Left - Logo and App Name */}
            <div className="flex flex-shrink-0 items-center space-x-3">
                <div className="relative h-7 w-7">
                    {logoSrc ? (
                        <img
                            src={logoSrc}
                            alt="Logo"
                            className="h-7 w-7 object-contain"
                            onError={(e) => {
                                const logoContainer = (e.target as HTMLImageElement).parentElement;
                                if (logoContainer) {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }
                            }}
                        />
                    ) : (
                        <SCMLogo />
                    )}
                </div>
                <span className="text-xl font-semibold whitespace-nowrap text-white">
                    {brandingConfig.appName}
                </span>
            </div>

            {/* Center - Announcement */}
            {/* Center - Announcement Carousel */}
            {announcementConfig.enabled &&
                announcementConfig.items &&
                announcementConfig.items.length > 0 && (
                    <div className="relative flex w-1/3 min-w-[360px] items-center justify-between rounded-md px-6 py-3">
                        {/* Left Section - Icon + Text */}
                        <div className="flex items-center gap-4">
                            {/* Announcement Icon */}
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_BSP_NAME}/background/announcement.png`}
                                    alt="announcement"
                                    className="h-7 w-7 object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.innerHTML = `
                  <svg class="h-6 w-6 text-[#83bd01]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832
                      c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                `;
                                        }
                                    }}
                                />
                            </div>

                            {/* Announcement Text */}
                            <div className="min-w-0 flex-1">
                                <h3 className="mb-1 text-base leading-tight font-semibold text-white">
                                    {announcementConfig.items[announcementIndex]?.title}
                                </h3>
                                <p className="line-clamp-2 text-xs leading-snug text-white/90">
                                    {announcementConfig.items[announcementIndex]?.description}
                                </p>
                            </div>
                        </div>

                        {/* Pagination Dots */}
                        {announcementConfig.items.length > 1 && (
                            <div className="absolute right-4 bottom-2 flex gap-2">
                                {announcementConfig.items.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setAnnouncementIndex(index)}
                                        className={`h-2.5 rounded-full transition-all duration-300 ${index === announcementIndex
                                            ? 'w-6 bg-[#83bd01]'
                                            : 'w-2.5 bg-white/40 hover:bg-white/60'
                                            }`}
                                        aria-label={`Go to announcement ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

            {/* Right - Search and Actions */}
            <div className="flex items-center gap-4">
                {searchConfig.enabled && (
                    <div className="relative w-[350px]" ref={searchRef}>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={searchConfig.placeholder}
                                className="h-[41px] w-full rounded-xl border-0 bg-white/95 px-4 pr-10 pl-12 text-gray-800 !placeholder-gray-500 shadow-sm backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                            />
                            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 transform items-center gap-1">
                                {isSearching && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="h-4 w-4 text-gray-500 transition-colors hover:text-gray-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Dropdown */}
                        {showDropdown && (
                            <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                                {searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
                                    <div className="p-4 text-center text-gray-500">
                                        No results found for "{searchQuery}"
                                    </div>
                                )}
                                {searchResults.map((result, index) => (
                                    <div
                                        key={`${result.metadata.WidgetId}-${result.metadata.SectionId}-${index}`}
                                        className={`cursor-pointer border-b border-gray-100 p-4 transition-colors last:border-b-0 ${selectedIndex === index
                                            ? 'border-l-4 border-l-blue-500 bg-blue-50'
                                            : 'hover:bg-gray-50'
                                            }`}
                                        onClick={() => handleResultSelect(result)}
                                    >
                                        <div className="flex flex-col gap-2">
                                            {/* Section Name + optional menu item icon */}
                                            <div className="flex items-center gap-2">
                                                {result.menuItemIconType && (
                                                    <MenuItemResultIcon type={result.menuItemIconType} />
                                                )}
                                                <h3 className="font-semibold text-gray-900 min-w-0">
                                                    {result.metadata.SectionName} - {result.metadata.WidgetTitle}
                                                </h3>
                                            </div>

                                            {/* AI Summary with fixed height */}
                                            <div className="max-h-32 overflow-y-auto rounded-md bg-gray-50 p-3">
                                                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                                    {result.ai_summary}
                                                </div>
                                            </div>

                                            {/* Widget Description */}
                                            {result.metadata.WidgetDescription && (
                                                <div className="text-xs text-gray-600">
                                                    <span className="font-medium">Description: </span>
                                                    {result.metadata.WidgetDescription}
                                                </div>
                                            )}

                                            {/* Open report link for dashboard menu items */}
                                            {result.menuItemTargetReport?.technicalId && (
                                                <div className="mt-2 flex items-center justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openReport(result.menuItemTargetReport!);
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                                                    >
                                                        Open
                                                        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path
                                                                d="M4 12L12 4M7 4H12V9"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {searchResults.length > 0 && (
                                    <div className="bg-gray-50 p-3 text-center text-xs text-gray-500">
                                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                                        {selectedIndex >= 0 && (
                                            <span className="ml-2">• Use ↑↓ to navigate, Enter to select</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {themeConfig.enabled && <ThemeSettingsButton />}
                {helpConfig.enabled && (
                    <div className="relative" ref={helpPanelRef}>
                        <button
                            type="button"
                            onClick={() => setShowHelpPanel((prev) => !prev)}
                            className="rounded-full p-1.5 text-white transition-colors hover:bg-white/15"
                            aria-label="Open help information"
                            title="Help"
                        >
                            <QuestionMarkCircleIcon className="h-6 w-6" />
                        </button>
                        {showHelpPanel && (
                            <div className="absolute top-full right-0 z-50 mt-2 w-80 rounded-xl border border-white/20 bg-[#0c3267]/95 p-3 text-xs text-white shadow-2xl backdrop-blur-md">
                                <p className="mb-2 text-[11px] font-semibold tracking-wide text-white/80 uppercase">
                                    Help & Support
                                </p>
                                <div className="prose prose-invert max-w-none text-white/95 [&_a]:font-medium [&_a]:text-[#8FE7FF] [&_a]:underline [&_li]:my-1 [&_ol]:my-1 [&_p]:my-1 [&_ul]:my-1">
                                    <Markdown
                                        options={{
                                            forceBlock: true,
                                            overrides: {
                                                a: {
                                                    props: {
                                                        target: '_blank',
                                                        rel: 'noopener noreferrer',
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {helpConfig.text}
                                    </Markdown>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Dialog
                header="Create Section"
                visible={visible}
                style={{ width: '30vw' }}
                onHide={() => setVisible(false)}
            >
                <div className="flex flex-col gap-4">
                    <div className="field">
                        <label htmlFor="section-name" className="mb-2 block">
                            Section Name
                        </label>
                        <InputText
                            id="section-name"
                            className="w-full"
                            value={sectionName}
                            onChange={(e) => setSectionName(e.target.value)}
                        />
                    </div>
                    <div className="field-checkbox flex items-center gap-2">
                        <Checkbox
                            inputId="expanded"
                            checked={isExpanded}
                            onChange={(e: any) => setIsExpanded(e.checked)}
                        />
                        <label htmlFor="expanded">Expanded by default</label>
                    </div>
                    <Button
                        label="Create Section"
                        icon="pi pi-external-link"
                        className="w-full"
                        onClick={handleCreateSection}
                    />
                </div>
            </Dialog>
        </nav>
    );
};

export default Header;
