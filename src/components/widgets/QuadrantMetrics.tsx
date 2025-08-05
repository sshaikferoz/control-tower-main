import React from 'react';

interface QuadrantMetricsProps {
  metrics: {
    title: string;
    value: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  }[];
}

const QuadrantMetrics = ({ metrics }: QuadrantMetricsProps) => {
  // Make sure we have exactly 4 metrics for the quadrants
  const validMetrics = metrics?.slice(0, 4);
  while (validMetrics?.length < 4) {
    validMetrics.push({
      title: 'Metric',
      value: '0',
      position: ['top-left', 'top-right', 'bottom-left', 'bottom-right'][
        validMetrics.length
      ] as any,
    });
  }

  return (
    <div className="h-full w-full">
      <div className="relative h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
        {validMetrics?.map((metric, index) => (
          <div
            key={index}
            className={`absolute flex flex-col items-start justify-center gap-4 ${metric.position === 'top-left' ? 'top-[41px] left-14 sm:top-4 sm:left-4 md:top-6 md:left-6' : ''} ${metric.position === 'top-right' ? 'top-[41px] right-14 sm:top-4 sm:right-4 md:top-6 md:right-6' : ''} ${metric.position === 'bottom-left' ? 'bottom-[41px] left-14 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6' : ''} ${metric.position === 'bottom-right' ? 'right-14 bottom-[41px] sm:right-4 sm:bottom-4 md:right-6 md:bottom-6' : ''}`}
          >
            <h3 className="w-[169px] [font-family:'Ghawar-Hefty',Helvetica] text-[17px] font-normal text-white sm:w-auto sm:text-[15px]">
              {metric.title}
            </h3>
            <span className="[font-family:'Ghawar-SmeiBold',Helvetica] text-[28px] leading-8 font-bold whitespace-nowrap text-[#83bd01] sm:text-[24px]">
              {metric.value}
            </span>
          </div>
        ))}

        {/* Divider lines */}
        <div className="absolute top-[7%] left-1/2 h-5/6 w-px bg-white opacity-30"></div>
        <div className="absolute top-1/2 left-[7%] h-px w-5/6 bg-white opacity-30"></div>

        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform">
          <div className="relative h-full w-full rounded-full border border-white bg-[#1E3A71] opacity-70"></div>
        </div>
      </div>
    </div>
  );
};

export default QuadrantMetrics;
