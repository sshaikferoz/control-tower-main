import React from 'react';

interface SimpleMetricProps {
  name: string;
  value: number;
}

const SimpleMetric = ({ name, value }: SimpleMetricProps) => {
  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
        <h2 className="text-4xl font-bold">{value}</h2>
        <p>{name}</p>
      </div>
    </div>
  );
};

export default SimpleMetric;
