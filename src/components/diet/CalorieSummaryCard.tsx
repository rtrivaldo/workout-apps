import { DailyLog, Food, Meal, MealFood } from '@prisma/client';

type DailyLogWithMeals = DailyLog & {
  meals: (Meal & {
    mealFoods: (MealFood & { food: Food })[];
  })[];
};

export default function CalorieSummaryCard({
  log,
}: {
  log: DailyLogWithMeals;
}) {
  const target =
    log.manualCalorieTarget ?? log.dailyNeedCalories ?? null;
  const remaining = target ? target - log.caloriesIn : null;
  const status =
    remaining !== null
      ? remaining > 0
        ? 'Calorie Deficit'
        : 'Calorie Surplus'
      : 'No target set';

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <div className='bg-white rounded-xl p-4 flex flex-col space-y-2'>
        <p className='text-sm text-neutral-500'>Calories In</p>
        <p className='text-3xl font-semibold'>{log.caloriesIn.toFixed(0)} kcal</p>
        <p className='text-xs text-neutral-500'>
          Updated {new Date(log.updatedAt).toLocaleTimeString()}
        </p>
      </div>

      <div className='bg-white rounded-xl p-4 flex flex-col space-y-2'>
        <p className='text-sm text-neutral-500'>Target</p>
        <p className='text-3xl font-semibold'>
          {target ? `${target.toFixed(0)} kcal` : 'Not set'}
        </p>
        {remaining !== null && (
          <p className='text-sm text-neutral-600'>
            Remaining:{' '}
            <span className={remaining < 0 ? 'text-red-500' : 'text-green-600'}>
              {Math.abs(remaining).toFixed(0)} kcal
            </span>
          </p>
        )}
      </div>

      <div className='bg-white rounded-xl p-4 flex flex-col space-y-2'>
        <p className='text-sm text-neutral-500'>Status</p>
        <p className='text-xl font-semibold'>{status}</p>
        <div className='text-xs text-neutral-500 space-y-1'>
          <p>
            Current weight:{' '}
            {log.currentWeight ? `${log.currentWeight.toFixed(1)} kg` : '—'}
          </p>
          <p>
            Target weight:{' '}
            {log.targetWeight ? `${log.targetWeight.toFixed(1)} kg` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
