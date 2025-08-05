import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PieChartWithTotalProps {
  data: {
    name: string;
    value: number;
    fill: string;
  }[];
  title: string;
  totalValue: string;
  subValue: string;
  variance: string;
}

const PieChartWithTotal = ({
  data,
  title,
  totalValue,
  subValue,
  variance,
}: PieChartWithTotalProps) => {
  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
        <div className="flex w-full items-center gap-2.5">
          <h3 className="text-center [font-family:'Ghawar-Hefty',Helvetica] text-base font-normal whitespace-nowrap text-white">
            {title}
          </h3>

          {/* <div className="flex items-center gap-2">
                <div className="flex items-center">
                <div className="flex items-center justify-center rounded-lg">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-white"
                    >
                    <path d="M7 17l9-9" />
                    <path d="M17 17V8" />
                    <path d="M7 8h9" />
                    </svg>
                </div>
                <div className="[font-family:'Ghawar-Regular',Helvetica] text-sm leading-4 font-normal whitespace-nowrap">
                    <span className="tracking-[0.04px] text-white">{variance}</span>
                </div>
                </div>
            </div> */}
        </div>

        <div className="mt-4 flex h-[180px] w-full justify-center">
          <div className="relative flex flex-col items-center">
            <div className="h-[120px] w-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={55}
                    paddingAngle={1}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="absolute top-[40px] w-full text-center">
              <div className="[font-family:'Ghawar-SmeiBold',Helvetica] text-xl font-bold tracking-[-0.75px] whitespace-nowrap text-white">
                {totalValue}
              </div>
            </div>

            {/* <div className="mt-2 flex items-center gap-2.5">
                <div className="text-center [font-family:'Ghawar-Hefty',Helvetica] text-lg font-normal text-white">
                    {subValue}
                </div>
                <div className="flex flex-wrap items-center gap-[4px] rounded-lg">
                    <div className="flex flex-col items-start justify-center rounded-lg">
                    <div className="[font-family:'Inter',Helvetica] text-xs leading-4 font-normal text-white">
                        {variance}
                    </div>
                    </div>
                    <div className="flex items-center justify-center rounded-lg">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-white"
                    >
                        <path d="M7 17l9-9" />
                        <path d="M17 17V8" />
                        <path d="M7 8h9" />
                    </svg>
                    </div>
                </div>
                </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChartWithTotal;
