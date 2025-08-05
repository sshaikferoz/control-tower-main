import React from 'react';

interface AnnouncementWidgetProps {
  title?: string;
  announcement?: string;
}

const AnnouncementWidget = ({ title, announcement }: AnnouncementWidgetProps) => {
  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
        <div className="flex w-full items-center gap-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-white"
          >
            <path d="m3 11 18-5v12L3 14v-3z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
          <h3 className="[font-family:'Ghawar-SmeiBold',Helvetica] text-lg font-bold tracking-[-0.75px] text-white">
            {title}
          </h3>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="[font-family:'Ghawar-Regular',Helvetica] text-base leading-6 font-normal text-white opacity-90">
            {announcement}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementWidget;
