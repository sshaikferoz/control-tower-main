import React, { useState, useEffect } from 'react';
import { Bell, X, ChevronUp, ChevronDown, Clock, Zap, Gift } from 'lucide-react';

interface AnnouncementWidgetProps {
  title?: string;
  announcement?: string[];
}

const AnnouncementWidget: React.FC<AnnouncementWidgetProps> = ({ title, announcement }) => {
  const widgetTitle = title || "Announcements";

  const announcements = announcement?.length
    ? announcement
    : [
        '🚧 Important Update! System maintenance scheduled for 2 AM.',
        '🔥 Don\'t miss our new feature launch tomorrow!',
        '🎉 Welcome to the all-new dashboard experience!',
        '⚡ Performance improvements are now live!',
        '🎯 New analytics dashboard available in beta.',
      ];

  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(new Set());
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(true);

  const activeAnnouncements = announcements.filter((_, index) => !dismissedAnnouncements.has(index));
  const totalAnnouncements = announcements.length;
  const unreadCount = activeAnnouncements.length;

  useEffect(() => {
    if (!isExpanded || activeAnnouncements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % activeAnnouncements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isExpanded, activeAnnouncements.length]);

  const toggleExpanded = () => {
    setIsAnimating(true);
    setIsExpanded(!isExpanded);
    setHasNewAnnouncements(false);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const dismissCurrent = () => {
    const currentIndex = announcements.findIndex((ann, idx) =>
      !dismissedAnnouncements.has(idx) && activeAnnouncements.indexOf(ann) === currentAnnouncement
    );
    if (currentIndex !== -1) {
      setDismissedAnnouncements(prev => new Set([...prev, currentIndex]));
      if (currentAnnouncement >= activeAnnouncements.length - 1) {
        setCurrentAnnouncement(0);
      }
    }
  };

  const dismissAll = () => {
    setDismissedAnnouncements(new Set(Array.from({ length: totalAnnouncements }, (_, i) => i)));
    setIsExpanded(false);
  };

  const navigateAnnouncement = (direction: 'next' | 'prev') => {
    if (activeAnnouncements.length <= 1) return;
    setCurrentAnnouncement((prev) =>
      direction === 'next'
        ? (prev + 1) % activeAnnouncements.length
        : (prev - 1 + activeAnnouncements.length) % activeAnnouncements.length
    );
  };

  if (!isVisible || unreadCount === 0) return null;

  const getAnnouncementIcon = (announcement: string) => {
    if (announcement.includes('🚧') || announcement.includes('maintenance')) return <Clock className="w-4 h-4" />;
    if (announcement.includes('🔥') || announcement.includes('⚡')) return <Zap className="w-4 h-4" />;
    if (announcement.includes('🎉') || announcement.includes('🎯')) return <Gift className="w-4 h-4" />;
    return <Bell className="w-4 h-4" />;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isExpanded && (
        <div
          onClick={toggleExpanded}
          className="group relative bg-gradient-to-l from-blue-400 to-blue-800 text-white rounded-full p-4 shadow-2xl cursor-pointer hover:shadow-3xl transform hover:scale-105 transition-all duration-300 animate-pulse"
        >
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              {unreadCount}
            </div>
          )}
          {hasNewAnnouncements && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          )}
          <Bell className="w-6 h-6 group-hover:animate-wiggle" />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {unreadCount} new announcement{unreadCount !== 1 ? 's' : ''}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className={`
          w-120 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden
          transform transition-all duration-300 ease-out
          ${isAnimating ? 'scale-95 opacity-90' : 'scale-100 opacity-100'}
        `}>
          <div className="bg-gradient-to-r from-blue-600 to-[#1a3a6b] p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" />
                <h3 className="font-semibold text-lg">{widgetTitle}</h3>
                <div className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                  {`${unreadCount} of ${totalAnnouncements}`}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleExpanded}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  title="Minimize"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  title="Hide all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            {activeAnnouncements.length > 0 ? (
              <>
                <div className="mb-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-700 rounded-xl">
                    <div className="text-blue-400 mt-1">
                      {getAnnouncementIcon(activeAnnouncements[currentAnnouncement])}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-200 text-sm leading-relaxed">
                        {activeAnnouncements[currentAnnouncement]}
                      </p>
                    </div>
                    <button
                      onClick={dismissCurrent}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Dismiss this announcement"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {activeAnnouncements.length > 1 && (
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateAnnouncement('prev')}
                      className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4 rotate-90" />
                      <span className="text-sm">Previous</span>
                    </button>
                    <div className="flex gap-1">
                      {activeAnnouncements.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentAnnouncement(idx)}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            idx === currentAnnouncement
                              ? 'bg-blue-600 w-6'
                              : 'bg-gray-600 hover:bg-blue-400'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => navigateAnnouncement('next')}
                      className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <span className="text-sm">Next</span>
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-600">
                  <button
                    onClick={dismissAll}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Dismiss All
                  </button>
                  <button
                    onClick={toggleExpanded}
                    className="px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    Minimize
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No announcements</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementWidget;
