//Header.tsx
'use client';
import { Search, Clock, TrendingUp, Loader2, X } from 'lucide-react';
import SCMLogo from '@/components/icons/SCMLogo';
import { Button } from 'primereact/button';
import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { UIConfiguration } from '../types/configuration';

export interface SearchResult {
    metadata: {
        TabId: string;
        TabDescription: string;
        SectionId: string;
        SectionName: string;
        SectionDescription: string;
        WidgetId: string;
        WidgetType: string;
        TechnicalName: string;
        WidgetDescription: string;
    };
    match_text: string;
    score: number;
    level?: string;
    ai_title?: string;
    ai_summary?: string;
}

interface SearchResponse {
    job_id: string;
    results: SearchResult[];
}

interface HeaderProps {
    configuration?: UIConfiguration;
    tabId: any;
    onSearchSelect?: (result: SearchResult | null) => void;
}

const Header: React.FC<HeaderProps> = ({ configuration, tabId, onSearchSelect }) => {
    const [visible, setVisible] = useState(false);
    const [sectionName, setSectionName] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>(null);
    const summaryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const latestJobIdRef = useRef<string | null>(null);
    const latestQueryRef = useRef('');
    const searchAbortRef = useRef<AbortController | null>(null);
    const [announcementIndex, setAnnouncementIndex] = useState(0);
    const [announcementPaused, setAnnouncementPaused] = useState(false);

    const searchConfig = configuration?.search || {
        enabled: true,
        placeholder: 'Search My Contract, Spend, Notification, Localization, KPI',
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
    const getLogoSrc = () => {
        if (brandingConfig.useLogoBase64 && brandingConfig.logoBase64) {
            return brandingConfig.logoBase64;
        }
        return brandingConfig.logoUrl;
    };

    const logoSrc = getLogoSrc();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (summaryTimeoutRef.current) clearTimeout(summaryTimeoutRef.current);
            if (searchAbortRef.current) {
                searchAbortRef.current.abort();
                searchAbortRef.current = null;
            }
        };
    }, []);

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

    const mergeSummaryResults = (summaryResults: SearchResult[]) => {
        setSearchResults((prevResults) => {
            if (!prevResults.length) return prevResults;

            const summaryMap = new Map<string, SearchResult>();
            const relevantSummaries = summaryResults.filter(
                (item) => item.metadata?.TabId === tabId
            );

            relevantSummaries.forEach((item, index) => {
                const key = item.metadata?.WidgetId || `${item.metadata?.TabId}-${index}`;
                summaryMap.set(key, item);
            });

            return prevResults.map((result, index) => {
                const key = result.metadata?.WidgetId || `${result.metadata?.TabId}-${index}`;
                const summary = summaryMap.get(key);
                if (!summary) return result;
                return {
                    ...result,
                    ai_title: summary.ai_title ?? result.ai_title,
                    ai_summary: summary.ai_summary ?? result.ai_summary,
                    level: summary.level ?? result.level,
                };
            });
        });
    };

    const scheduleSummaryFetch = (jobId: string) => {
        if (!jobId) return;
        if (summaryTimeoutRef.current) clearTimeout(summaryTimeoutRef.current);
        latestJobIdRef.current = jobId;
        summaryTimeoutRef.current = setTimeout(() => {
            fetchSummary(jobId);
        }, 350);
    };

    const fetchSummary = async (jobId: string) => {
        if (!jobId) return;
        setIsSummaryLoading(true);
        try {
            const res = await fetch(
                'https://scic-search.cml.apps.cdp-ds-test.aramco.com/api/search/summary',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ job_id: jobId }),
                }
            );
            const summaryResponse: SearchResponse = await res.json();
            if (summaryResponse?.job_id !== latestJobIdRef.current) return;
            mergeSummaryResults(summaryResponse.results || []);
        } catch (error) {
            console.error('Summary fetch error:', error);
        } finally {
            setIsSummaryLoading(false);
        }
    };

    const performSearch = async (query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery || trimmedQuery.length < 2 || !searchConfig.enabled) {
            if (searchAbortRef.current) {
                searchAbortRef.current.abort();
                searchAbortRef.current = null;
            }
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        if (searchAbortRef.current) {
            searchAbortRef.current.abort();
        }

        const controller = new AbortController();
        searchAbortRef.current = controller;

        setIsSearching(true);
        try {
            const res = await fetch('https://scic-search.cml.apps.cdp-ds-test.aramco.com/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: trimmedQuery,
                    tab_id: tabId,
                    top_k: 5,
                }),
                signal: controller.signal,
            });
            const response = await res.json();

            if (latestQueryRef.current.trim() !== trimmedQuery) {
                return;
            }

            const filterByTabId = (results: any[], tabId: string) => {
                return results.filter((item) => item.metadata?.TabId === tabId);
            };

            const filteredResults = filterByTabId(response.results || [], tabId);
            setSearchResults(filteredResults || []);
            setShowDropdown(true);
            setSelectedIndex(-1);
            if (response.job_id) {
                scheduleSummaryFetch(response.job_id);
            }
        } catch (error) {
            if ((error as Error).name === 'AbortError') return;
            console.error('Search error:', error);
            setSearchResults([]);
            setShowDropdown(false);
        } finally {
            if (searchAbortRef.current === controller) {
                searchAbortRef.current = null;
            }
            setIsSearching(false);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        latestQueryRef.current = value;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (summaryTimeoutRef.current) clearTimeout(summaryTimeoutRef.current);
        latestJobIdRef.current = null;
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
        setSearchQuery(result.ai_title ?? '');
        setShowDropdown(false);
        setSelectedIndex(-1);
        if (onSearchSelect) onSearchSelect(result);
    };

    const clearSearch = () => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
        if (summaryTimeoutRef.current) {
            clearTimeout(summaryTimeoutRef.current);
            summaryTimeoutRef.current = null;
        }
        if (searchAbortRef.current) {
            searchAbortRef.current.abort();
            searchAbortRef.current = null;
        }
        latestJobIdRef.current = null;
        latestQueryRef.current = '';
        setIsSummaryLoading(false);
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

    const getWidgetIcon = (widgetType: string) => {
        if (!widgetType) {
            return <Clock className="h-4 w-4 text-gray-500" />;
        }
        switch (widgetType.toLowerCase()) {
            case 'dashboard':
                return <TrendingUp className="h-4 w-4 text-blue-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getResultTitle = (result: SearchResult) => {
        return (
            result.metadata.WidgetDescription?.trim() ||
            result.metadata.SectionName?.trim() ||
            result.metadata.SectionDescription?.trim() ||
            result.ai_title ||
            'Widget'
        );
    };

    const getResultTab = (result: SearchResult) => {
        return result.metadata.TabDescription?.trim() || result.metadata.TabId || 'Tab';
    };

    const getResultSection = (result: SearchResult) => {
        return result.metadata.SectionDescription?.trim() || result.metadata.SectionName || '';
    };

    const formatAISummary = (summary?: string) => {
        if (!summary) return null;
        return summary.split('\n').map((line, index) => (
            <div key={index} className="text-sm text-gray-600">
                {line}
            </div>
        ));
    };

    const renderResultSummary = (result: SearchResult) => {
        if (isSummaryLoading && !result.ai_summary) {
            return (
                <div className="space-y-2">
                    {[0, 1, 2].map((line) => (
                        <div
                            key={line}
                            className="h-2.5 w-full animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                        />
                    ))}
                </div>
            );
        }

        if (result.ai_summary) {
            return formatAISummary(result.ai_summary);
        }

        return <div className="text-xs italic text-gray-400">Summary will appear shortly</div>;
    };

    return (
        <nav
            className={`relative mx-4 mt-4 mb-6 flex h-[73px] w-[calc(100%-2rem)] items-center justify-between rounded-lg px-6 py-4`}
            style={{
                backgroundImage: announcementConfig?.enabled
                    ? `url('${process.env.NEXT_PUBLIC_BSP_NAME}/background/announcement-bg.png')`
                    : `linear-gradient(to right, #00214E, ${brandingConfig.primaryColor})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
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
                                <h3 className="mb-1 text-base leading-tight font-semibold text-[#00A3E0]">
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
                                className="h-[41px] w-full rounded-xl border-0 bg-white/95 px-4 pr-10 pl-12 text-gray-800 placeholder-gray-500 shadow-sm backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                            />
                            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 transform items-center gap-2">
                                {isSearching && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="rounded-full bg-gray-200/80 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Dropdown */}
                        {showDropdown && (
                            <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5">
                                {searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
                                    <div className="p-4 text-center text-gray-500">
                                        No results found for "{searchQuery}"
                                    </div>
                                )}
                                {searchResults.map((result, index) => (
                                    <div
                                        key={`${result.metadata.WidgetId}-${index}`}
                                        className={`cursor-pointer p-4 transition-all last:border-b-0 ${selectedIndex === index
                                            ? 'bg-blue-50/50'
                                            : 'hover:bg-gray-50/60'
                                            }`}
                                        onClick={() => handleResultSelect(result)}
                                    >
                                        <div className="relative flex items-start gap-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-white via-white to-blue-50/40 p-4 shadow-sm">
                                            <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                                {getWidgetIcon(result.metadata.WidgetType)}
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                                                        {getResultTab(result)}
                                                    </span>
                                                    {result.metadata.SectionName && (
                                                        <span className="text-xs font-medium text-gray-500">
                                                            {result.metadata.SectionName}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    {getResultTitle(result)}
                                                </h3>
                                                {getResultSection(result) && (
                                                    <p className="text-sm text-gray-600">{getResultSection(result)}</p>
                                                )}
                                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                                                    {renderResultSummary(result)}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                    {result.metadata.WidgetType && (
                                                        <span className="rounded-full bg-white px-3 py-1 font-medium text-gray-600 shadow-sm">
                                                            {result.metadata.WidgetType}
                                                        </span>
                                                    )}
                                                    {result.metadata.TechnicalName && (
                                                        <span className="rounded-full bg-white px-3 py-1 font-mono text-[11px] text-gray-500 shadow-sm">
                                                            {result.metadata.TechnicalName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {searchResults.length > 0 && (
                                    <div className="bg-gray-50 p-3 text-center text-xs text-gray-500">
                                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                                        {selectedIndex >= 0 && (
                                            <span className="ml-2">• Use ↑↓ to navigate, Enter to select</span>
                                        )}
                                        {isSummaryLoading && (
                                            <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                <span>Generating summaries…</span>
                                            </div>
                                        )}
                                    </div>
                                )}
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
