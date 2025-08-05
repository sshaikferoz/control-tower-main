import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

type PieData = {
  label: string;
  value: number;
  fill: string;
};

type MetricProps = {
  amount: string;
  percentage: string;
  label: string;
};
type PieMetricProps = {
  data: PieData[];
  metrics: MetricProps;
};

const CustomLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  outerRadius = 0,
  value = 0,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  value?: number;
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 5; // Position the label outside the pie
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <circle cx={x} cy={y} r={10} fill="#fff" stroke="#ddd" strokeWidth={2} />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={8}
        fontWeight="bold"
      >
        {`${value}%`}
      </text>
    </g>
  );
};

const PieMetric = ({ data, metrics }: PieMetricProps) => {
  return (
    <div className="h-full w-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0] p-4 text-white">
      <div className="flex flex-row gap-3">
        <div className="my-auto flex flex-col gap-3">
          <div className="my-auto flex gap-3">
            <span>{metrics?.amount}</span>
            <span>{metrics?.percentage}</span>
          </div>
          <p>{metrics?.label}</p>
        </div>
        <div>
          <ResponsiveContainer className="w-full" width={150} height={'100%'}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="45%"
                innerRadius={10}
                outerRadius={30}
                fill="#8884d8"
                label={CustomLabel}
              >
                {data?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PieMetric;
