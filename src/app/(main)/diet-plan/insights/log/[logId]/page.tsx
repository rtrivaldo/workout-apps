import { notFound } from 'next/navigation';
import { requireCompleteProfile } from '@/actions/auth/profile';
import DietService from '@/actions/diet/DietService';
import BackNavigationButton from '@/components/BackNavigationButton';
import {
  determineCalorieStatus,
  getStatusLabel,
  getStatusTone,
  resolveCalorieTarget,
} from '@/lib/diet-insights';
import { cn } from '@/lib/utils';

const dietService = new DietService();
const mealOrder = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

type DetailSearchParams = {
  range?: string;
  start?: string;
  end?: string;
  status?: string;
  page?: string;
};

export default async function DietLogDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ logId: string }>;
  searchParams: Promise<DetailSearchParams>;
}) {
  const [{ logId }, query] = await Promise.all([params, searchParams]);
  // params membawa segment dinamis [logId] supaya kita tahu daily_log mana yang dibuka
  const numericId = Number(logId);
  if (Number.isNaN(numericId)) {
    notFound();
  }

  const user = await requireCompleteProfile();

  let log;
  try {
    log = await dietService.getDailyLogById(user.id, numericId);
  } catch {
    notFound();
  }

  const backSearch = new URLSearchParams();
  // searchParams dipakai hanya untuk mempertahankan filter/paginasi saat kembali ke halaman Insights
  ['range', 'start', 'end', 'status', 'page'].forEach(key => {
    const value = query?.[key as keyof DetailSearchParams];
    if (value) {
      backSearch.set(key, String(value));
    }
  });
  const backHref = backSearch.toString()
    ? `/diet-plan/insights?${backSearch.toString()}`
    : '/diet-plan/insights';

  const logDate = new Date(log.date);
  const status = determineCalorieStatus(log);
  const target = resolveCalorieTarget(log);
  const statusBadge = getStatusTone(status);

  const totalMeals = log.meals.reduce((sum, meal) => {
    const mealTotal = meal.mealFoods.reduce((acc, item) => acc + item.totalCal, 0);
    return sum + mealTotal;
  }, 0);
  const caloriesOutValue = log.caloriesOut ?? 0;
  const netDelta = target ? log.netCalories - target : null;

  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl space-y-6'>
      <div className='space-y-1'>
        <BackNavigationButton
          className='mb-1'
          fallbackHref={backHref}
          label='Back to Insights'
          useHistoryBack
        />
        <h2 className='text-2xl font-semibold'>Daily Log Detail</h2>
        <p className='text-sm text-[#A9A9A9]'>
          {logDate.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className='bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-4'>
        <div className='flex flex-col gap-1 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-xs uppercase tracking-wide text-neutral-500'>Daily Summary</p>
            <h3 className='text-lg font-semibold text-neutral-900'>
              {logDate.toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h3>
          </div>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center justify-center',
              statusBadge
            )}
          >
            {getStatusLabel(status)}
          </span>
        </div>

        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
          <div className='rounded-xl border border-neutral-100 bg-neutral-50 p-4'>
            <p className='text-xs uppercase tracking-wide text-neutral-500'>Calories In</p>
            <p className='text-xl font-semibold text-neutral-900'>{totalMeals.toFixed(0)} kcal</p>
            <p className='text-xs text-neutral-500'>Total from logged meals.</p>
          </div>
          <div className='rounded-xl border border-neutral-100 bg-neutral-50 p-4'>
            <p className='text-xs uppercase tracking-wide text-neutral-500'>Calories Out</p>
            <p className='text-xl font-semibold text-neutral-900'>{caloriesOutValue.toFixed(0)} kcal</p>
            <p className='text-xs text-neutral-500'>Synced from workouts.</p>
          </div>
          <div className='rounded-xl border border-neutral-100 bg-neutral-50 p-4'>
            <p className='text-xs uppercase tracking-wide text-neutral-500'>Net Calories</p>
            <p className='text-xl font-semibold text-neutral-900'>{log.netCalories.toFixed(0)} kcal</p>
            <p className='text-xs text-neutral-500'>
              {netDelta !== null
                ? `${netDelta > 0 ? '+' : ''}${netDelta.toFixed(0)} vs target`
                : 'Set a target to compare'}
            </p>
          </div>
          <div className='rounded-xl border border-neutral-100 bg-neutral-50 p-4'>
            <p className='text-xs uppercase tracking-wide text-neutral-500'>Calorie Target</p>
            <p className='text-xl font-semibold text-neutral-900'>
              {target ? `${target.toFixed(0)} kcal` : 'Not set'}
            </p>
            <p className='text-xs text-neutral-500'>
              {log.manualCalorieTarget ? 'Manual override' : 'Auto from goal'}
            </p>
          </div>
          <div className='rounded-xl border border-neutral-100 bg-neutral-50 p-4'>
            <p className='text-xs uppercase tracking-wide text-neutral-500'>Weight Logged</p>
            <p className='text-xl font-semibold text-neutral-900'>
              {log.currentWeight ? `${log.currentWeight.toFixed(1)} kg` : 'No entry'}
            </p>
            <p className='text-xs text-neutral-500'>Captured via Daily Check-in.</p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden'>
        <div className='p-4 space-y-4'>
          {!log.meals.length && (
            <div className='rounded-lg border border-dashed border-neutral-200 p-6 text-center text-neutral-500'>
              No meals were recorded on this day.
            </div>
          )}

          {mealOrder.map(type => {
            const groupedMeals = log.meals.filter(meal => meal.type === type);
            if (!groupedMeals.length) return null;

            const typeTotal = groupedMeals.reduce(
              (sum, meal) =>
                sum +
                meal.mealFoods.reduce((mealSum, item) => mealSum + item.totalCal, 0),
              0
            );

            return (
              <div key={type} className='rounded-xl border border-neutral-100 shadow-sm'>
                <div className='flex items-center justify-between border-b border-neutral-100 px-4 py-3'>
                  <p className='font-semibold text-neutral-900'>{type}</p>
                  <span className='text-sm text-neutral-500'>{typeTotal.toFixed(0)} kcal</span>
                </div>
                <div className='divide-y divide-neutral-100'>
                  {groupedMeals.map(meal => {
                    const mealLoggedAt = new Date(meal.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const mealTotal = meal.mealFoods.reduce(
                      (mealSum, item) => mealSum + item.totalCal,
                      0
                    );

                    return (
                      <div key={meal.id} className='space-y-2 px-4 py-3'>
                        <div className='flex items-center justify-between text-xs text-neutral-500'>
                          <span>Logged at {mealLoggedAt}</span>
                          <span className='font-medium text-neutral-700'>{mealTotal.toFixed(0)} kcal</span>
                        </div>
                        <div className='space-y-2'>
                          {meal.mealFoods.map(item => {
                            const name = item.food?.name ?? item.foodNameSnapshot;
                            const serving = item.food?.serving ?? item.servingSnapshot;
                            return (
                              <div
                                key={item.id}
                                className='flex flex-col gap-1 text-sm text-neutral-700 md:flex-row md:items-center md:justify-between'
                              >
                                <div>
                                  <p className='font-medium text-neutral-900'>
                                    {name}{' '}
                                    <span className='text-xs text-neutral-500'>
                                      ({item.portion} × {serving})
                                    </span>
                                  </p>
                                  <p className='text-xs text-neutral-500'>
                                    P {item.food?.protein ?? item.proteinSnapshot}g • C{' '}
                                    {item.food?.carbs ?? item.carbsSnapshot}g • F{' '}
                                    {item.food?.fat ?? item.fatSnapshot}g
                                  </p>
                                </div>
                                <p className='font-semibold text-neutral-900'>
                                  {item.totalCal.toFixed(0)} kcal
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
