import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataItem {
  date: string;
  Actual: number;
  unit: string;
}

interface MetricData {
  metric_value: string;
  metric_variance: string;
  metric_label: string;
}

interface ChartProps {
  data: {
    chart_data: ChartDataItem[];
    chart_yaxis: string;
    // metric_data: MetricData;
    widget_name: string;
  };
}

const SingleLineChart = ({ data }: ChartProps) => {
  const highlightIndex = data?.chart_data?.length - 2;
  const highlightData = data?.chart_data?.[highlightIndex];

  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
        <div className="flex justify-between">
          <h3 className="flex items-center text-lg font-semibold">{data?.widget_name}</h3>
          {/* <p className="font-bold text-green-400">
            {data?.metric_data?.metric_value}
            <span className="text-sm">{data?.metric_data?.metric_variance}</span>
          </p> */}
        </div>
        <div className="flex items-center justify-center rounded pt-8">
          <ChartContainer
            config={{
              [data?.chart_yaxis]: {
                label: data?.chart_yaxis,
                color: 'var(--primary1)',
              },
            }}
            className="h-[140px] w-full"
          >
            {/* <ResponsiveContainer width="100%" height="100%"> */}
            <LineChart
              accessibilityLayer
              margin={{ left: 10, right: 0, top: 10 }}
              data={data?.chart_data}
            >
              <YAxis
                orientation="right"
                tick={{ fill: 'white' }}
                tickLine={false}
                axisLine={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: 'white' }}
                tickLine={false}
                axisLine={true}
                tickMargin={8}
              />

              {highlightData && (
                <>
                  <ReferenceArea
                    x1={highlightData?.date}
                    x2={highlightData?.date}
                    strokeOpacity={0.1}
                    fill={'var(--secondary1)'}
                    fillOpacity={0.2}
                  />
                  <ReferenceLine
                    x={highlightData?.date}
                    stroke={'var(--secondary1)'}
                    strokeDasharray="10 10"
                  />
                </>
              )}

              <Line
                dataKey={data?.chart_yaxis}
                type="linear"
                fill={'var(--primary1)'}
                stroke={'var(--primary1)'}
                strokeWidth={2}
                dot={{
                  r: 6,
                  fill: 'var(--secondary1)',
                  stroke: 'white',
                  strokeWidth: 4,
                }}
                activeDot={{
                  fill: 'var(--secondary1)',
                  stroke: 'var(--secondary1)',
                  strokeWidth: 4,
                  r: 6,
                }}
              />

              <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} />
            </LineChart>
            {/* </ResponsiveContainer> */}
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default SingleLineChart;
