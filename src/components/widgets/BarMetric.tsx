import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
interface BarMetricProps {
  data: {
    name: string;
    value: number;
    fill?: string;
    background?: string;
    opacity?: number;
  }[];
  title: string;
  variance?: string;
}

const BarMetric = ({ data, title, variance = '+0.00%' }: BarMetricProps) => {
  // Ensure the domain is dynamically calculated based on the data
  const maxValue = Math.max(...data.map((item) => item.value)) * 1.2;

  return (
    <div className="h-full w-full max-w-sm">
      <div className="h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
        <div className="p-3">
          <div className="flex h-full w-full flex-col items-center gap-2.5">
            {/* Header */}
            <div className="flex h-8 w-full items-center justify-between px-2">
              <h3 className="font-sans text-base font-normal text-white">{title}</h3>

              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="flex items-center justify-center rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div className="font-sans text-sm leading-4">
                    <span className="tracking-wide text-white">+5.40%</span>
                    <span className="text-gray-500">&nbsp;</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="flex h-48 w-full flex-col items-start">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: 'white', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                  />
                  <YAxis
                    tick={{ fill: 'white', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Bar
                    dataKey="value"
                    fill="#83bd01cc"
                    radius={[0, 0, 0, 0]}
                    label={{
                      position: 'top',
                      fill: 'white',
                      formatter: (value: any) => `${value}`,
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}
                    isAnimationActive={true}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarMetric;
