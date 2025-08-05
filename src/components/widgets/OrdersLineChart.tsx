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

interface OrdersLineChartProps {
  data: {
    name: string;
    value: number;
  }[];
  title: string;
  //   totalValue: string;
}

const OrdersLineChart = ({ data, title }: OrdersLineChartProps) => {
  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
        <div className="flex w-full items-start justify-between">
          <div className="flex flex-col items-start gap-[5px]">
            <h3 className="[font-family:'Ghawar-Hefty',Helvetica] text-base font-normal text-white">
              {title}
            </h3>
          </div>

          {/* <div className="flex flex-col items-center">
            <span className="[font-family:'Ghawar-SmeiBold',Helvetica] text-xl font-bold whitespace-nowrap text-white">
              {totalValue}
            </span>
            <span className="[font-family:'Ghawar-Regular',Helvetica] text-sm font-normal text-white">
              Total Order Value
            </span>
          </div> */}
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
              <Line
                type="monotone"
                dataKey="value"
                stroke="#5899DA"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: '#5899DA',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: '#5899DA',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OrdersLineChart;
