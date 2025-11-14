import { DailyLog, Food, Meal, MealFood } from '@prisma/client';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowRight } from 'lucide-react';

type DailyLogWithMeals = DailyLog & {
  meals: (Meal & {
    mealFoods: (MealFood & { food: Food | null })[];
  })[];
};

export default function CalorieSummaryCard({
  log,
}: {
  log: DailyLogWithMeals;
}) {
  const recommended =
    log.goalCalorieTarget ?? log.dailyNeedCalories ?? null;
  const target = log.manualCalorieTarget ?? recommended;
  const caloriesOut = log.caloriesOut ?? 0;
  const netCalories =
    log.netCalories ?? log.caloriesIn - caloriesOut;
  const remaining = target ? target - netCalories : null;
  const targetLabel = log.manualCalorieTarget
    ? 'Manual Target'
    : log.goalCalorieTarget
      ? 'Auto Goal Target'
      : 'Baseline Target';
  const netDelta = target ? netCalories - target : null;
  const statusLabel =
    netDelta !== null
      ? netDelta < 0
        ? 'Deficit'
        : netDelta > 0
          ? 'Surplus'
          : 'On Target'
      : 'No Target';
  const statusColor =
    netDelta !== null
      ? netDelta < 0
        ? 'text-green-600 bg-green-100/60'
        : netDelta > 0
          ? 'text-red-600 bg-red-100/60'
          : 'text-neutral-600 bg-neutral-100'
      : 'text-neutral-600 bg-neutral-100';
  const updatedAt = new Date(log.updatedAt).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <TooltipProvider delayDuration={120}>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))]'>
        <div className='bg-white rounded-xl p-4 flex flex-col space-y-3'>
          <div className='flex items-center justify-between'>
            <p className='text-xs uppercase tracking-wide text-neutral-500'>Calories In</p>
            <Tooltip>
              <TooltipTrigger className='text-xs text-neutral-400'>i</TooltipTrigger>
              <TooltipContent>
                Total calories from meals you logged today.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className='text-4xl font-semibold'>{log.caloriesIn.toFixed(0)} kcal</p>
          <p className='text-xs text-neutral-500'>
            Updated {updatedAt} WIB
          </p>
        </div>

        <div className='bg-white rounded-xl p-4 flex flex-col space-y-3'>
          <div className='flex items-center justify-between'>
            <p className='text-xs uppercase tracking-wide text-neutral-500'>Calories Out</p>
            <Tooltip>
              <TooltipTrigger className='text-xs text-neutral-400'>i</TooltipTrigger>
              <TooltipContent>
                Calories burned from your logged workouts.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className='text-4xl font-semibold'>{caloriesOut.toFixed(0)} kcal</p>
          <p className='text-xs text-neutral-500'>
            Synced {updatedAt} WIB
          </p>
        </div>

        <div className='bg-white rounded-xl p-4 flex flex-col space-y-3'>
          <div className='flex items-center justify-between'>
            <p className='text-xs uppercase tracking-wide text-neutral-500'>{targetLabel}</p>
            <div className='flex items-center gap-2'>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
                {statusLabel}
              </span>
              <Tooltip>
                <TooltipTrigger className='text-xs text-neutral-400'>i</TooltipTrigger>
                <TooltipContent>
                  Net calories = calories in - calories out compared to your goal.
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <p className='text-4xl font-semibold'>
            {target ? `${target.toFixed(0)} kcal` : '—'}
          </p>
          <div className='text-xs text-neutral-500 space-y-1'>
            {recommended && (
              <p>Suggested goal: {recommended.toFixed(0)} kcal</p>
            )}
            {target && (
              <p>
                Net today:{' '}
                <span className='font-medium text-neutral-800'>
                  {netCalories.toFixed(0)} kcal
                </span>{' '}
                ({netDelta !== null ? `${netDelta > 0 ? '+' : ''}${netDelta.toFixed(0)} vs goal` : 'set a goal'})
              </p>
            )}
            {remaining !== null && (
              <p>
                Remaining allowance:{' '}
                <span className={remaining < 0 ? 'text-red-500' : 'text-green-600'}>
                  {Math.abs(remaining).toFixed(0)} kcal
                </span>
              </p>
            )}
          </div>
        </div>

        <div className='bg-white rounded-xl p-4 flex flex-col space-y-2'>
          <div className='flex items-center justify-between'>
            <p className='text-xs uppercase tracking-wide text-neutral-500'>Today&apos;s Weight</p>
            <Tooltip>
              <TooltipTrigger className='text-xs text-neutral-400'>i</TooltipTrigger>
              <TooltipContent>
                Latest weight logged for today via Daily Check-in.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className='text-4xl font-semibold'>
            {log.currentWeight ? `${log.currentWeight.toFixed(1)} kg` : '—'}
          </p>
          <p className='text-xs text-neutral-500'>
            Keep your progress accurate by checking in daily.
          </p>
          <Link
            href='/diet-plan/insights'
            className='inline-flex items-center gap-1 text-sm font-semibold text-green-600'
          >
            View full insights
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>
      </div>
    </TooltipProvider>
  );
}
