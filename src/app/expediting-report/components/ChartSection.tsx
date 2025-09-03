'use client';
import React from 'react';
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
} from 'recharts';

const chartData = [
  { month: 'Jan 24', project: 90, operations: 85 },
  { month: 'Feb 24', project: 85, operations: 80 },
  { month: 'Mar 24', project: 95, operations: 88 },
  { month: 'Apr 24', project: 88, operations: 92 },
  { month: 'May 24', project: 92, operations: 85 },
  { month: 'Jun 24', project: 87, operations: 89 },
  { month: 'Jul 24', project: 93, operations: 86 },
  { month: 'Aug 24', project: 89, operations: 90 },
  { month: 'Sep 24', project: 91, operations: 87 },
  { month: 'Oct 24', project: 86, operations: 83 },
  { month: 'Nov 24', project: 88, operations: 85 },
  { month: 'Dec 24', project: 94, operations: 91 },
];

const ChartSection = () => {
  return (
    <ResponsiveContainer width="70%" height="90%">
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={[60, 100]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="project"
          name="Project Procurement"
          stroke="#83bd01"
          strokeWidth={2}
          dot={{ r: 4, fill: '#83bd01', stroke: 'white', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="operations"
          name="Operations Procurement"
          stroke="#926fa0"
          strokeWidth={2}
          dot={{ r: 4, fill: '#926fa0', stroke: 'white', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ChartSection;
