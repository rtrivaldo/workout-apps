'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import {
  CalorieStatus,
  getStatusLabel,
  getStatusTone,
} from '@/lib/diet-insights';

type CaloriePoint = {
  label: string;
  caloriesIn: number;
  caloriesOut: number;
  netCalories: number;
  tooltipDate: string;
  status: CalorieStatus;
};

function CalorieTooltip(props: TooltipProps<ValueType, NameType>) {
  const { active } = props;
  const payload = (props as any).payload as
    | { payload: CaloriePoint }[]
    | undefined;
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as CaloriePoint | undefined;
  if (!point) return null;

  const badge = getStatusTone(point.status);

  return (
    <div className='rounded-xl border border-neutral-200 bg-white p-3 shadow-lg min-w-[220px] space-y-1'>
      <p className='text-sm font-semibold text-neutral-900'>{point.tooltipDate}</p>
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}>
        {getStatusLabel(point.status)}
      </span>
      <div className='pt-1 text-sm text-neutral-700 space-y-0.5'>
        <p>
          Calories In:{' '}
          <span className='font-semibold text-neutral-900'>
            {point.caloriesIn.toFixed(0)} kcal
          </span>
        </p>
        <p>
          Calories Out:{' '}
          <span className='font-semibold text-neutral-900'>
            {point.caloriesOut.toFixed(0)} kcal
          </span>
        </p>
        <p>
          Net Calories:{' '}
          <span className='font-semibold text-neutral-900'>
            {point.netCalories.toFixed(0)} kcal
          </span>
        </p>
      </div>
    </div>
  );
}

export default function CalorieTrendChart({ data }: { data: CaloriePoint[] }) {
  if (!data.length) {
    return (
      <div className='flex h-[260px] items-center justify-center text-sm text-neutral-500 border border-dashed border-neutral-200 rounded-xl'>
        No calorie logs available for this range yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width='100%' height={260}>
      <BarChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis
          dataKey='label'
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          width={48}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CalorieTooltip />} />
        <Legend verticalAlign='top' align='left' height={32} />
        <Bar
          dataKey='caloriesIn'
          name='Calories In'
          fill='#22c55e'
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey='caloriesOut'
          name='Calories Out'
          fill='#38bdf8'
          radius={[4, 4, 0, 0]}
        />
        <Line
          type='monotone'
          dataKey='netCalories'
          name='Net Calories'
          stroke='#1d4ed8'
          strokeWidth={3}
          dot={{ r: 3, fill: '#1d4ed8' }}
          activeDot={{ r: 5 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
