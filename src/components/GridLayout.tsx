'use client';
import MultiMetrics from '@/components/widgets/MultiMetrics';
import PieMetric from '@/components/widgets/PieMetric';
import SimpleMetric from '@/components/widgets/SimpleMetric';
import SimpleMetricDate from '@/components/widgets/SimpleMetricDate';
import SingleLineChart from '@/components/widgets/SingleLineChart';
import TableMetric from '@/components/widgets/TableMetric';
import { useEffect, useRef } from 'react';

const GridLayout: React.FC = () => {
  const SingleLineChartData = {
    chart_data: [
      { date: '01-01-2024', Actual: 50, unit: '%' },
      { date: '01-02-2024', Actual: 100, unit: '%' },
      { date: '01-03-2024', Actual: 90, unit: '%' },
      { date: '01-04-2024', Actual: 150, unit: '%' },
      { date: '01-05-2024', Actual: 120, unit: '%' },
      { date: '01-06-2024', Actual: 195, unit: '%' },
    ],
    chart_yaxis: 'Actual',
    // metric_data: {
    //   metric_value: '$142',
    //   metric_variance: '+5.40%',
    //   metric_label: 'Received Payments',
    // },
    widget_name: 'Successful Payments',
  };
  const pieData = {
    data: [
      {
        label: 'Flaring Intensity',
        value: 30,
        fill: '#84BD00',
      },
      {
        label: 'SO2 Emissions',
        value: 70,
        fill: '#E1553F',
      },
    ],
    metrics: {
      amount: '$234K',
      percentage: '0.31%',
      label: 'Contracts Under Development',
    },
  };
  const suppliers = [
    { supplier_name: 'Reliable Suppliers', contracts: 7, value: '$52,345' },
    { supplier_name: 'Supply Solutions', contracts: 5, value: '$42,345' },
    { supplier_name: 'Wholesale Supply', contracts: 7, value: '$47,345' },
    { supplier_name: 'Procure Plus', contracts: 5, value: '$32,345' },
    { supplier_name: 'The Supply Co-op', contracts: 7, value: '$22,345' },
  ];

  return (
    <div className="w-full p-4">
      <div className="flex flex-row gap-3">
        <div className="flex flex-col gap-3">
          <SimpleMetric name="Active Contracts" value={45} />
          <SimpleMetricDate name="Open PO Orders" value={18} date="13-08-2024" />
        </div>
        <SingleLineChart data={SingleLineChartData} />
        <div className="flex flex-col gap-3">
          {/* <MultiMetrics/> */}
          <PieMetric data={pieData?.data} metrics={pieData?.metrics} />
        </div>
        {/* <TableMetric totalAmount="$15,223,050" data={suppliers} />; */}
      </div>
    </div>
  );
};

export default GridLayout;
