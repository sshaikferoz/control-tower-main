'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { sapODataService, NewsItem } from '../../services/sapODataService'; // Import the service

// Type definitions
interface Category {
  id: string;
  label: string;
  description: string;
  color: string;
}

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  fullContent: string;
  date: string;
  category: string;
  link: string;
  region:string;
}

export interface NewsFeedResponse {
  result: NewsItem[];
}

interface NewsData {
  [key: string]: NewsArticle[];
}

// Categories with descriptions
const categories: Category[] = [
  {
    id: 'sourcing',
    label: 'Sourcing',
    description: 'Material sourcing news and updates',
    color: 'text-[#83bd01]',
  },
  {
    id: 'disruption',
    label: 'Disruption',
    description: "Global events impacting Saudi Arabia's supply chain negatively",
    color: 'text-[#ff6b6b]',
  },
  {
    id: 'prices',
    label: 'Prices',
    description: "Events impacting Saudi Arabia's raw material costs",
    color: 'text-[#ffd93d]',
  },
  {
    id: 'innovation',
    label: 'Innovation',
    description: 'New technologies and methods',
    color: 'text-[#6bcf7f]',
  }
  // {
  //   id: "travel",
  //   label: "Travel",
  //   description: "Airlines, airports, and aviation news",
  //   color: "text-[#845ef7]",
  // },
  // {
  //   id: "no-impact",
  //   label: "No Impact",
  //   description: "News with minimal impact on Saudi Arabia's supply chain",
  //   color: "text-[#868e96]",
  // },
];

// Helper function to map API response to NewsArticle
const mapNewsItemToArticle = (item: NewsItem): NewsArticle => ({
  id: item.ID,
  title: item.TITLE,
  content: item.BRIEF || item.CONTENT.substring(0, 150) + '...', // Use brief or truncated content
  fullContent: item.CONTENT,
  date: item.DATEPUBLISHED,
  category: item.LABEL.toLowerCase(),
  link: item.LINK,
  region:item.REGION
});

// Helper function to categorize news data
const categorizeNewsData = (newsItems: NewsItem[]): NewsData => {
  const categorized: NewsData = {};

  // Initialize all categories
  categories.forEach((cat) => {
    categorized[cat.id] = [];
  });

  // Categorize news items
  newsItems.forEach((item) => {
    const article = mapNewsItemToArticle(item);
    const categoryKey = article.category;

    // Add to specific category if it exists, otherwise add to 'no-impact'
    if (categorized[categoryKey]) {
      categorized[categoryKey].push(article);
    } else {
      categorized['no-impact'].push(article);
    }
  });

  return categorized;
};

const NewsFeed: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('innovation');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [newsData, setNewsData] = useState<NewsData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch news data on component mount
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const newsItems = await FetchDummyProdData();
        const categorizedData = categorizeNewsData(newsItems);
        setNewsData(categorizedData);
      } catch (err) {
        console.error('Error fetching news data:', err);
        setError('Failed to load news data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  const FetchDummyProdData = async (): Promise<NewsItem[]> => {
    try {
      const response = await fetch(
        'https://news-classifier-production-flask-api.cml.apps.cdp-ds-test.aramco.com/news_classifier',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NewsFeedResponse = await response.json();

      return data.result || [];
    } catch (error) {
      return [];
      // console.error('Error fetching news feed:', error);
      // throw error;
    }
  };

  const currentNews: NewsArticle[] = newsData[activeCategory] || [];
  const maxItemsPerSlide: number = 2;
  const totalSlides: number = Math.ceil(currentNews.length / maxItemsPerSlide);

  // Auto-scroll functionality
  // useEffect(() => {
  //   if (
  //     currentNews.length > maxItemsPerSlide &&
  //     !selectedNews &&
  //     !isHovering &&
  //     !loading
  //   ) {
  //     scrollIntervalRef.current = setInterval(() => {
  //       setCurrentSlide((prev: number) => (prev + 1) % totalSlides);
  //     }, 4000); // Change slide every 4 seconds

  //     return () => {
  //       if (scrollIntervalRef.current) {
  //         clearInterval(scrollIntervalRef.current);
  //       }
  //     };
  //   }
  // }, [currentNews.length, totalSlides, selectedNews, isHovering, loading]);

  // Reset slide when category changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeCategory]);

  const handleNewsClick = (newsItem: NewsArticle): void => {
    setSelectedNews(newsItem);
    // Stop auto-scroll when viewing details
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
  };

  const handleBackToList = (): void => {
    setSelectedNews(null);
  };

  const handlePrevSlide = (): void => {
    setCurrentSlide((prev: number) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNextSlide = (): void => {
    setCurrentSlide((prev: number) => (prev + 1) % totalSlides);
  };

  const getCurrentSlideItems = (): NewsArticle[] => {
    const startIndex: number = currentSlide * maxItemsPerSlide;
    return currentNews.slice(startIndex, startIndex + maxItemsPerSlide);
  };

  // Retry function for error state
  const handleRetry = () => {
    window.location.reload(); // Simple retry by reloading
  };

  const backgroundStyle = {
  backgroundImage: "url('/background/bg.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  opacity: 1,
};


  // Loading state
  if (loading) {
    return (
      <section className="relative flex h-[100vh] w-full flex-[0_0_auto] flex-col items-center gap-[27px] p-20" style={backgroundStyle}>
        <header className="relative flex w-full items-center">
          <div className="flex h-[23px] w-[23px] items-center justify-center rounded bg-[#83bd01]">
            <div className="h-3 w-3 rounded-sm bg-white"></div>
          </div>
          <h2 className="ml-[11px] text-xl leading-4 font-bold tracking-[-0.20px] whitespace-nowrap text-[#ffffff]">
            News Classifier
          </h2>
          <div className="ml-[11px] h-px flex-grow bg-gradient-to-r from-[#83bd01] to-transparent"></div>
        </header>

        <Card className="w-full rounded-xl border border-solid border-[#00a3e0] bg-gradient-to-b from-[#1e3a71] via-[#0080bd] to-[#0d366f] shadow-[3px_8px_30px_1px_#a8afb84c]">
          <CardContent className="p-[13px]">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#83bd01] border-t-transparent"></div>
                <span className="text-white/70">Loading news feed...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="relative flex w-full flex-[0_0_auto] flex-col items-center gap-[27px] p-20"  style={backgroundStyle}>
        {/* <header className="relative flex w-full items-center">
          <div className="flex h-[23px] w-[23px] items-center justify-center rounded bg-[#83bd01]">
            <div className="h-3 w-3 rounded-sm bg-white"></div>
          </div>
          <h2 className="ml-[11px] text-xl leading-4 font-bold tracking-[-0.20px] whitespace-nowrap text-[#ffffff]">
            News Classifier
          </h2>
          <div className="ml-[11px] h-px flex-grow bg-gradient-to-r from-[#83bd01] to-transparent"></div>
        </header> */}

        <Card className="w-full rounded-xl border border-solid border-[#00a3e0] bg-gradient-to-b from-[#1e3a71] via-[#0080bd] to-[#0d366f] shadow-[3px_8px_30px_1px_#a8afb84c]">
          <CardContent className="p-[13px]">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="mb-2 h-12 w-12 text-[#ff6b6b]">⚠️</div>
                <span className="text-lg font-medium text-white">Unable to Load News</span>
                <span className="max-w-md text-white/70">{error}</span>
                <button
                  onClick={handleRetry}
                  className="mt-4 rounded-lg bg-[#83bd01] px-6 py-2 text-white transition-colors duration-200 hover:bg-[#a3d631]"
                >
                  Try Again
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Detail View Component
  if (selectedNews) {
    return (
      <section className="relative flex w-full flex-[0_0_auto] flex-col items-center gap-[27px]  p-20"  style={backgroundStyle}>
        <header className="relative flex w-full items-center">
          <div className="flex h-[23px] w-[23px] items-center justify-center rounded bg-[#83bd01]">
            <div className="h-3 w-3 rounded-sm bg-white"></div>
          </div>

          <h2 className="ml-[11px] text-xl leading-4 font-bold tracking-[-0.20px] whitespace-nowrap text-[#ffffff]">
            News Details
          </h2>

          <div className="ml-[11px] h-px flex-grow bg-gradient-to-r from-[#83bd01] to-transparent"></div>
        </header>

        {/* Back Button */}
        <div className="w-full">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-4 py-2 text-white/70 transition-colors duration-200 hover:text-white"
          >
            <div className="h-4 w-4 rotate-45 transform border-b-2 border-l-2 border-current"></div>
            Back to News Feed
          </button>
        </div>

        <Card
          className="w-full rounded-xl border border-solid border-[#00a3e0] bg-gradient-to-b from-[#1e3a71] via-[#0080bd] to-[#0d366f] shadow-[3px_8px_30px_1px_#a8afb84c]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Article Header */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span
                    className={`rounded-full px-3 py-1 font-medium ${
                      categories.find((c: Category) => c.id === activeCategory)?.color ||
                      'text-[#83bd01]'
                    } border border-current bg-white/10`}
                  >
                    {categories.find((c: Category) => c.id === activeCategory)?.label ||
                      selectedNews.category}
                  </span>
                  <span className="text-white/60">{selectedNews.date} &nbsp;&nbsp; {selectedNews.region}</span>
                </div>

                <h1
                  className={`text-3xl leading-tight font-bold ${
                    categories.find((c: Category) => c.id === activeCategory)?.color ||
                    'text-[#83bd01]'
                  }`}
                >
                  {selectedNews.title}
                </h1>
              </div>

              {/* Article Content */}
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-white/90">{selectedNews.fullContent}</p>
              </div>

              {/* Article Link */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h3 className="mb-3 font-semibold text-white">Source</h3>
                <a
                  href={selectedNews.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#83bd01] transition-colors duration-200 hover:text-[#a3d631]"
                >
                  Read full article
                  <div className="h-4 w-4">
                    <div className="h-3 w-3 rotate-45 transform border-t-2 border-r-2 border-current"></div>
                  </div>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="relative mx-auto flex h-[100vh] w-full flex-[0_0_auto] flex-col items-center gap-[27px]p-20 p-20"  style={backgroundStyle}>
      {/* <header className="relative flex w-full items-center">
        <div className="flex h-[23px] w-[23px] items-center justify-center rounded bg-[#83bd01]">
          <div className="h-3 w-3 rounded-sm bg-white"></div>
        </div>

        <h2 className="ml-[11px] text-xl leading-4 font-bold tracking-[-0.20px] whitespace-nowrap text-[#ffffff]">
          News Classifier
        </h2>

        <div className="ml-[11px] h-px flex-grow bg-gradient-to-r from-[#83bd01] to-transparent"></div>
      </header> */}

      {/* Category Navigation */}
      <div className="w-full">
        <nav className="relative mb-4 flex flex-wrap gap-2">
          {categories.map((category: Category) => (
            <div key={category.id} className="relative">
              <button
                onClick={() => setActiveCategory(category.id)}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? `${category.color} border-current bg-white/10 shadow-lg`
                    : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'
                }`}
              >
                {category.label}
                {newsData[category.id] && newsData[category.id].length > 0 && (
                  <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                    {newsData[category.id].length}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              {hoveredCategory === category.id && (
                <div className="absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 transform rounded-lg border border-white/20 px-3 py-2 text-xs whitespace-nowrap text-white shadow-xl">
                  {category.description}
                  <div className="absolute bottom-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-r-4 border-b-4 border-l-4 border-transparent border-b-black/90"></div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <Card className="w-full rounded-xl border border-solid border-[#00a3e0] bg-gradient-to-b from-[#1e3a71] via-[#0080bd] to-[#0d366f] shadow-[3px_8px_30px_1px_#a8afb84c]">
        <CardContent className="p-[13px]">
          <div className="relative">
            {/* Navigation Arrows */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute top-1/2 left-1 z-10 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20"
                >
                  <div className="h-3 w-3 rotate-45 transform border-b-2 border-l-2 border-current"></div>
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute top-1/2 right-2 z-10 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20"
                >
                  <div className="h-3 w-3 rotate-45 transform border-t-2 border-r-2 border-current"></div>
                </button>
              </>
            )}

            <div className="relative flex min-h-[120px] w-full items-center gap-6 px-11 py-0">
              {currentNews.length > 0 ? (
                <>
                  {getCurrentSlideItems().map((article: NewsArticle, index: number) => (
                    <React.Fragment key={article.id}>
                      <div
                        className="flex-1 cursor-pointer rounded-lg p-2 transition-all duration-200 hover:scale-[1.02] hover:bg-white/5"
                        onClick={() => handleNewsClick(article)}
                      >
                        <div className="text-xl leading-5 font-normal tracking-[-0.40px] text-transparent">
                          <span
                            className={`font-bold ${
                              categories.find((c: Category) => c.id === activeCategory)?.color ||
                              'text-[#83bd01]'
                            } leading-[0.1px] tracking-[-0.08px] hover:underline`}
                          >
                            {article.title}
                            <br />
                          </span>

                          <span className="text-base leading-[30px] tracking-[-0.05px] text-[#ffffff]">
                            {article.content.length > 100
                              ? `${article.content.substring(0, 100)}...`
                              : article.content}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm leading-[30px] font-normal tracking-[-0.28px] whitespace-nowrap text-[#dadce2]">
                            {article.date} &nbsp; &nbsp; {article.region}
                          </div>
                          <div className="text-xs text-white/50 transition-colors hover:text-white/70">
                            Click to read more →
                          </div>
                        </div>
                      </div>

                      {index < getCurrentSlideItems().length - 1 && (
                        <div className="h-[81px] w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Pagination dots */}
                  {totalSlides > 1 && (
                    <div className="relative h-4 w-20 rotate-90">
                      <div className="relative inline-flex items-center gap-2">
                        {Array.from({ length: totalSlides }).map((_, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`transition-all duration-200 ${
                              index === currentSlide
                                ? 'h-4 w-4 rounded-lg bg-[#83bd01]'
                                : 'h-2 w-2 rounded bg-[#ffffff] opacity-50 hover:opacity-75'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 py-8 text-center text-lg text-white/60">
                  No news articles available for this category
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Summary */}
      <div className="text-center text-sm text-white/70">
        Showing <span className="font-bold text-white">{currentNews.length}</span> articles in{' '}
        <span
          className={`font-bold ${
            categories.find((c: Category) => c.id === activeCategory)?.color || 'text-[#83bd01]'
          }`}
        >
          {categories.find((c: Category) => c.id === activeCategory)?.label}
        </span>{' '}
        category
        {totalSlides > 1 && (
          <span className="ml-2">
            • Page {currentSlide + 1} of {totalSlides}
          </span>
        )}
      </div>
    </section>
  );
};

export default NewsFeed;
