import React from 'react';

interface SimpleMetricDateProps {
  name: string;
  value: number;
  date: string;
}

const SimpleMetricDate = ({ name, value, date }: SimpleMetricDateProps) => {
  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
        <div className="flex">
          <h2 className="text-4xl font-bold">{value}</h2>
          <span className="m-auto text-[13px]">{date}</span>
        </div>
        <p>{name} </p>
      </div>
    </div>
  );
};

export default SimpleMetricDate;
