import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AnnouncementProps {
  title: string;
  description: string;
}

export const Announcement: React.FC<AnnouncementProps> = ({
  title = 'Welcome to SCAI Dashboard',
  description = 'Stay updated with the latest announcements and important information.',
}) => {
  return (
    <section className="relative mb-8 flex w-full flex-[0_0_auto] flex-col items-center gap-[27px]">
      <Card className="w-full rounded-xl border border-solid border-[#00a3e0] bg-gradient-to-b from-[#1e3a71] via-[#0080bd] to-[#0d366f] shadow-[3px_8px_30px_1px_#a8afb84c]">
        <CardContent className="p-[13px]">
          <div className="relative flex min-h-[120px] w-full items-center gap-6 px-6 py-4">
            <div className="flex-1">
              {/* Header with icon and title */}
              <header className="relative mb-4 flex w-full items-center">
                <div className="flex h-[23px] w-[23px] items-center justify-center rounded bg-[#83bd01]">
                  <div className="h-3 w-3 rounded-sm bg-white"></div>
                </div>
                <h2 className="ml-[11px] text-xl leading-6 font-bold tracking-[-0.20px] text-[#83bd01]">
                  {title}
                </h2>
                <div className="ml-[11px] h-px flex-grow bg-gradient-to-r from-[#83bd01] to-transparent"></div>
              </header>

              {/* Description content */}
              <div className="pl-[34px]">
                <p className="text-base leading-relaxed text-[#ffffff] opacity-90">{description}</p>
              </div>

              {/* Optional timestamp or additional info */}
              <div className="mt-4 pl-[34px]">
                <div className="text-sm leading-[24px] font-normal tracking-[-0.14px] text-[#dadce2] opacity-70">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Optional decorative element */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#83bd01]/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#83bd01]">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Announcement;
