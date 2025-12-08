//Header.tsx
'use client';
import { Search, Loader2, X } from 'lucide-react';
import SCMLogo from '@/assets/SCMLogo';
import { Button } from 'primereact/button';
import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { UIConfiguration } from '../types/configuration';

interface SearchResult {
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
    level: string;
    ai_title: string;
    ai_summary: string;
}

interface SearchResponse {
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

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>(null);
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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

        setIsSearching(true);
        try {
            const res = await fetch(getSearchEndpoint(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    tab_id: tabId,
                    top_k: 5,
                }),
            });
            const response = await res.json();

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
        setSearchQuery(result.ai_title);
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
                                        key={`${result.metadata.WidgetId}-${index}`}
                                        className={`cursor-pointer border-b border-gray-100 p-4 transition-colors last:border-b-0 ${selectedIndex === index
                                            ? 'border-l-4 border-l-blue-500 bg-blue-50'
                                            : 'hover:bg-gray-50'
                                            }`}
                                        onClick={() => handleResultSelect(result)}
                                    >
                                        <div className="flex flex-col gap-2">
                                            {/* Section Name */}
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {result.metadata.SectionName}
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
                                                    <span className="font-medium">Widget: </span>
                                                    {result.metadata.WidgetDescription}
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
