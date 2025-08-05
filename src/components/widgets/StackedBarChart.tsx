import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface StackedBarChartProps {
  data: {
    name: string;
    [key: string]: string | number;
  }[];
  title: string;
  totalValue?: string;
  series: {
    name: string;
    dataKey: string;
    color: string;
  }[];
}

const StackedBarChart = ({
  data = [],
  title = 'Chart',
  totalValue = '',
  series = [],
}: StackedBarChartProps) => {
  // Add default values to prevent null/undefined errors
  const safeData = data || [];
  const safeSeries = series || [];

  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
        <div className="flex justify-between">
          <div className="flex flex-col items-start gap-[5px]">
            <h3 className="[font-family:'Ghawar-Hefty',Helvetica] text-base font-normal text-white">
              {title}
            </h3>
          </div>

          {totalValue && (
            <div className="flex flex-col items-center">
              <span className="[font-family:'Ghawar-SmeiBold',Helvetica] text-xl font-bold whitespace-nowrap text-white">
                {totalValue}
              </span>
              <span className="[font-family:'Ghawar-Regular',Helvetica] text-sm font-normal text-white">
                Total Value
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 h-[150px] w-full">
          {safeSeries.length > 0 && safeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={safeData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 5,
                }}
                barSize={24}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff30" />
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: '#ffffff50' }}
                  tick={{ fill: '#ffffff' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E3A71',
                    border: '1px solid #00a3e0',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
                {safeSeries.map((item, index) => (
                  <Bar key={index} dataKey={item.dataKey} stackId="a" fill={item.color} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-white opacity-70">No data available</p>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-center gap-4">
          {safeSeries.map((item, index) => (
            <div key={index} className="flex items-center gap-[5px]">
              <div
                className="h-[9px] w-[9px] rounded-[4.5px] shadow-[0px_5px_12px_#9c88fb29]"
                style={{ backgroundColor: item.color }}
              />
              <div className="[font-family:'Ghawar-Regular',Helvetica] text-sm font-normal text-[#ffffff]">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StackedBarChart;
