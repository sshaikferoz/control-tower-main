'use client';
import React from 'react';

const summaryData = [
  { period: '3 Month', value: '1,124,023' },
  { period: '6 Month', value: '12,732,560' },
  { period: '9 Month', value: '10,256,785' },
  { period: '12 Month', value: '18,732,560' },
];

const SummarySection = () => {
  return (
    <div className="m-auto grid h-[40%] grid-flow-col grid-rows-2 text-center text-gray-700">
      {summaryData.map((item, index) => (
        <div key={index} className="m-auto p-4">
          <div className="text-2xl font-semibold text-[#2d3561]">{item.value}</div>
          <div className="mt-1 text-sm text-gray-500">{item.period}</div>
        </div>
      ))}
    </div>
  );
};

export default SummarySection;
