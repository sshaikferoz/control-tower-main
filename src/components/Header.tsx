//Header.tsx
// Updated Header component with search selection callback
'use client';
import { Search, Clock, TrendingUp, Loader2, X } from 'lucide-react';
import SCMLogo from '@/assets/SCMLogo';
import { Button } from 'primereact/button';
import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
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
  onSearchSelect?: (result: SearchResult | null) => void; // New callback prop
}

const Header: React.FC<HeaderProps> = ({ configuration, tabId, onSearchSelect }) => {
  const [visible, setVisible] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Get configuration values with defaults
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

  // Get the appropriate logo source
  const getLogoSrc = () => {
    if (brandingConfig.useLogoBase64 && brandingConfig.logoBase64) {
      return brandingConfig.logoBase64;
    }
    return brandingConfig.logoUrl;
  };

  const logoSrc = getLogoSrc();

  // Close dropdown when clicking outside
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

  // Debounced search function
  const performSearch = async (query: string) => {
    if (!query.trim() || query.length < 2 || !searchConfig.enabled) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://scic-search.cml.apps.cdp-ds-test.aramco.com/api/search?query=${encodeURIComponent(query)}`
      );
      const response = await res.json();

      //   // Hardcoded response for now
      //   const response = {
      //     results: [
      //       {
      //         ai_summary:
      //           'Here is an overview of your active contracts. This includes the total number of active contracts, the most recent contract added, and the oldest contract still in effect.',
      //         ai_title: 'Active Contracts Overview Summary',
      //         level: 'widget',
      //         match_text:
      //           'Hierarchy:\n- Tab: MySCM Dashboard\n  - Section: Procurement Updated\n    - Widget: Active Contracts Desc [one-metric]\n      - Technical Name: ',
      //         metadata: {
      //           SectionDescription: 'Procurement Desc',
      //           SectionId: '00000000000000000000000000000061',
      //           SectionName: 'Procurement Updated',
      //           TabDescription: 'MySCM Dashboard',
      //           TabId: '00000000000000000000000000000064',
      //           TechnicalName: '',
      //           WidgetDescription: 'Active Contracts Desc',
      //           WidgetId: '00000000000000000001757309563871',
      //           WidgetType: 'one-metric',
      //         },
      //         score: 1.6878890991210938,
      //       },
      //       {
      //         ai_summary: 'Here is a summary of the procurement updates. This includes:',
      //         ai_title: 'Overview of Procurement Updates',
      //         level: 'section',
      //         match_text:
      //           'Hierarchy:\n- Tab: MySCM Dashboard\n  - Section: Procurement Updated\n    - Widget:  [two-metrics-piechart]\n      - Technical Name: ',
      //         metadata: {
      //           SectionDescription: 'Procurement Desc',
      //           SectionId: '00000000000000000000000000000005',
      //           SectionName: 'Procurement Updated',
      //           TabDescription: 'MySCM Dashboard',
      //           TabId: '00000000000000000000000000000001',
      //           TechnicalName: '',
      //           WidgetDescription: '',
      //           WidgetId: '00000000000000000001751799016589',
      //           WidgetType: 'two-metrics-piechart',
      //         },
      //         score: 1.6924619674682617,
      //       },
      //       {
      //         ai_summary:
      //           "This search provides an overview of the latest procurement activities on your SCM dashboard. Here's what you might find:",
      //         ai_title: 'Recent Procurement Updates Overview',
      //         level: 'tab',
      //         match_text:
      //           'Hierarchy:\n- Tab: MySCM Dashboard\n  - Section: Procurement Updated\n    - Widget:  [one-metric-date]\n      - Technical Name: ',
      //         metadata: {
      //           SectionDescription: 'Procurement Desc',
      //           SectionId: '00000000000000000000000000000005',
      //           SectionName: 'Procurement Updated',
      //           TabDescription: 'MySCM Dashboard',
      //           TabId: '00000000000000000000000000000001',
      //           TechnicalName: '',
      //           WidgetDescription: '',
      //           WidgetId: '00000000000000000001751799011451',
      //           WidgetType: 'one-metric-date',
      //         },
      //         score: 1.6998200416564941,
      //       },
      //       {
      //         ai_summary:
      //           'This search provides a snapshot of recent procurement activities. Key details include:',
      //         ai_title: 'Overview of Procurement Updates',
      //         level: 'section',
      //         match_text:
      //           'Hierarchy:\n- Tab: MySCM Dashboard\n  - Section: Procurement Updated\n    - Widget:  [one-metric-table]\n      - Technical Name: ',
      //         metadata: {
      //           SectionDescription: 'Procurement Desc',
      //           SectionId: '00000000000000000000000000000005',
      //           SectionName: 'Procurement Updated',
      //           TabDescription: 'MySCM Dashboard',
      //           TabId: '00000000000000000000000000000001',
      //           TechnicalName: '',
      //           WidgetDescription: '',
      //           WidgetId: '00000000000000000001751799133340',
      //           WidgetType: 'one-metric-table',
      //         },
      //         score: 1.7320101261138916,
      //       },
      //       {
      //         ai_summary:
      //           'This search provides an overview of the procurement section of your SCM dashboard. It includes:',
      //         ai_title: 'Procurement Dashboard Overview',
      //         level: 'tab',
      //         match_text:
      //           'Hierarchy:\n- Tab: MySCM Dashboard\n  - Section: Procurement Updated\n    - Widget:  [two-metrics]\n      - Technical Name: ',
      //         metadata: {
      //           SectionDescription: 'Procurement Desc',
      //           SectionId: '00000000000000000000000000000005',
      //           SectionName: 'Procurement Updated',
      //           TabDescription: 'MySCM Dashboard',
      //           TabId: '00000000000000000000000000000001',
      //           TechnicalName: '',
      //           WidgetDescription: '',
      //           WidgetId: '00000000000000000001751799014314',
      //           WidgetType: 'two-metrics',
      //         },
      //         score: 1.7338515520095825,
      //       },
      //     ],
      //   };

      // Filter results by current tabId
      const filterByTabId = (results: any[], tabId: string) => {
        return results.filter((item) => item.metadata?.TabId === tabId);
      };

      const filteredResults = filterByTabId(response.results, tabId);
      console.log('filteredResults', filteredResults);

      setSearchResults(filteredResults || []);
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

  // Handle search input change with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced search
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle keyboard navigation
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

  // Handle result selection - MODIFIED to call parent callback
  const handleResultSelect = (result: SearchResult) => {
    console.log('Selected result:', result);
    setSearchQuery(result.ai_title);
    setShowDropdown(false);
    setSelectedIndex(-1);

    // Call parent callback to handle highlighting
    if (onSearchSelect) {
      onSearchSelect(result);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();

    // Clear highlighting when search is cleared
    if (onSearchSelect) {
      onSearchSelect(null); // Passing null or empty to clear highlights
    }
  };

  const handleCreateSection = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    const encodedSectionName = encodeURIComponent(sectionName.trim());
    window.location.href = `/mapping?sectionName=${encodedSectionName}&expanded=${isExpanded}`;
  };

  // Get widget type icon
  const getWidgetIcon = (widgetType: string) => {
    switch (widgetType.toLowerCase()) {
      case 'dashboard':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format AI summary for display
  const formatAISummary = (summary: string) => {
    return summary.split('\n').map((line, index) => (
      <div key={index} className="text-sm text-gray-600">
        {line}
      </div>
    ));
  };

  return (
    <nav
      className="m-4 flex h-[73px] w-[calc(100%-2rem)] items-center justify-between rounded-lg p-4"
      style={{
        background: `linear-gradient(to right, #00214E, ${brandingConfig.primaryColor})`,
      }}
    >
      <div className="flex items-center space-x-2">
        <div className="relative h-6 w-6">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Logo"
              className="h-6 w-6 object-contain"
              onError={(e) => {
                // Fallback to default logo if custom logo fails to load
                const logoContainer = (e.target as HTMLImageElement).parentElement;
                if (logoContainer) {
                  (e.target as HTMLImageElement).style.display = 'none';
                  // Create and append SCMLogo component fallback
                  const fallbackDiv = document.createElement('div');
                  fallbackDiv.innerHTML =
                    '<div class="h-6 w-6"><svg><!-- SCMLogo SVG content --></svg></div>';
                  logoContainer.appendChild(fallbackDiv);
                }
              }}
            />
          ) : (
            <SCMLogo />
          )}
        </div>
        <span className="text-xl font-semibold text-white">{brandingConfig.appName}</span>
      </div>

      {/* Search Bar - Only render if search is enabled */}
      {searchConfig.enabled && (
        <div className="relative w-[546px]" ref={searchRef}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={searchConfig.placeholder}
              className="h-[41px] w-full rounded-xl border border-white px-4 pr-10 pl-12 transition-all focus:ring-2 focus:ring-blue-300 focus:outline-none"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            />

            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-gray-400" />

            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 transform items-center gap-1">
              {isSearching && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="h-4 w-4 text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
                <div className="p-4 text-center text-gray-500">
                  No results found for "{searchQuery}"
                </div>
              )}

              {searchResults.map((result, index) => (
                <div
                  key={`${result.metadata.WidgetId}-${index}`}
                  className={`cursor-pointer border-b border-gray-100 p-4 transition-colors last:border-b-0 ${
                    selectedIndex === index
                      ? 'border-l-4 border-l-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleResultSelect(result)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      {getWidgetIcon(result.metadata.WidgetType)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="truncate font-semibold text-gray-900">{result.ai_title}</h3>
                        {/* <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {result.metadata.WidgetType}
                        </span> */}
                      </div>

                      <div className="mb-2">{formatAISummary(result.ai_summary)}</div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">{result.metadata.TabDescription}</span>
                        <span>•</span>
                        <span>{result.metadata.SectionName}</span>
                        <span>•</span>
                        <span className="font-mono">{result.metadata.TechnicalName}</span>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        {/* <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-400"></div>
                          <span className="text-xs text-gray-500">
                            Score: {(result.score * 100).toFixed(0)}%
                          </span>
                        </div> */}
                        {/* <span className="text-xs text-gray-400">•</span> */}
                        <span className="text-xs text-gray-500 capitalize">
                          {result.level} level
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {searchResults.length > 0 && (
                <div className="bg-gray-50 p-3 text-center text-xs text-gray-500">
                  {searchResults.length} result
                  {searchResults.length !== 1 ? 's' : ''} found
                  {selectedIndex >= 0 && (
                    <span className="ml-2">• Use ↑↓ to navigate, Enter to select</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Placeholder div to maintain layout when search is disabled */}
      {!searchConfig.enabled && <div className="w-[546px]" />}

      <div>
        {/* Create Section Button (commented out as in original) */}
        {/* <Button
          label="Create Section"
          icon="pi pi-external-link"
          onClick={() => setVisible(true)}
        /> */}
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
              aria-describedby="section-name-help"
              className="w-full"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
            <small id="section-name-help" className="mt-1 block text-gray-500">
              Enter the section name
            </small>
          </div>

          <div className="field-checkbox flex items-center gap-2">
            <Checkbox
              inputId="expanded"
              checked={isExpanded}
              onChange={(e: any) => setIsExpanded(e.checked)}
            />
            <label htmlFor="expanded">Expanded by default</label>
          </div>

          <div className="mt-4">
            <Button
              label="Create Section"
              icon="pi pi-external-link"
              className="w-full"
              onClick={handleCreateSection}
            />
          </div>
        </div>
      </Dialog>
    </nav>
  );
};

export default Header;
