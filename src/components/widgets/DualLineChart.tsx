import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DualLineChartProps {
  data: {
    name: string;
    line1: number;
    line2: number;
  }[];
  title: string;
  series: {
    name: string;
    dataKey: string;
    color: string;
  }[];
}

const DualLineChart = ({ data, title, series }: DualLineChartProps) => {
  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
        <div className="flex justify-between">
          <div className="flex items-start gap-[5px]">
            <div className="[font-family:'Ghawar-Hefty',Helvetica] text-base font-normal text-[#ffffff]">
              {title}
            </div>
          </div>
          <div className="flex items-center gap-5">
            {series.map((item, index) => (
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

        <div className="mt-4 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff' }} axisLine={{ stroke: '#ffffff50' }} />
              <YAxis tick={{ fill: '#ffffff' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E3A71',
                  border: '1px solid #00a3e0',
                  borderRadius: '8px',
                  color: '#ffffff',
                }}
              />
              {series.map((item, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={item.dataKey}
                  stroke={item.color}
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fill: item.color,
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: item.color,
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DualLineChart;
