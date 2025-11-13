'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type WeightPoint = {
  label: string;
  weight: number | null;
  tooltipDate: string;
};

export default function WeightTrendChart({ data }: { data: WeightPoint[] }) {
  if (!data.length) {
    return (
      <div className='flex h-[260px] items-center justify-center text-sm text-neutral-500 border border-dashed border-neutral-200 rounded-xl'>
        No weight data available for this range yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width='100%' height={260}>
      <LineChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis
          dataKey='label'
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          width={40}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          domain={['dataMin - 1', 'dataMax + 1']}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            borderColor: '#e5e7eb',
            boxShadow: '0 8px 16px rgba(15,23,42,0.08)',
          }}
          formatter={value => {
            if (value === null || value === undefined) return ['-', 'Weight'];
            return [`${Number(value).toFixed(1)} kg`, 'Weight'];
          }}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.tooltipDate ?? ''}
        />
        <Line
          type='monotone'
          dataKey='weight'
          stroke='#16a34a'
          strokeWidth={3}
          dot={{ r: 3, fill: '#16a34a' }}
          connectNulls
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
