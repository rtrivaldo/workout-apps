import { DailyLog, WeightLog } from '@prisma/client';

type ProgressProps = {
  weightLogs: WeightLog[];
  dailyLogs: DailyLog[];
};

export default function ProgressChart({ weightLogs, dailyLogs }: ProgressProps) {
  const weights = weightLogs.map(log => log.weight);
  const minWeight = Math.min(...weights, 0);
  const maxWeight = Math.max(...weights, 0);
  const weightRange = Math.max(maxWeight - minWeight, 1);

  const calorieMax = Math.max(...dailyLogs.map(log => log.caloriesIn), 1);

  return (
    <div className='grid gap-6 md:grid-cols-2'>
      <div className='bg-white rounded-xl p-4'>
        <h3 className='font-semibold mb-4'>Weight Trend</h3>
        <div className='space-y-3'>
          {weightLogs.map(log => {
            const width =
              ((log.weight - minWeight) / weightRange) * 100 || 10;
            return (
              <div key={log.id}>
                <div className='flex justify-between text-xs text-neutral-500'>
                  <span>{new Date(log.loggedAt).toLocaleDateString()}</span>
                  <span>{log.weight} kg</span>
                </div>
                <div className='bg-neutral-100 h-2 rounded-full mt-1'>
                  <div
                    className='bg-green-500 h-2 rounded-full'
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
          {!weightLogs.length && (
            <p className='text-sm text-neutral-500'>
              No weight logs yet. Add your current weight to start tracking progress.
            </p>
          )}
        </div>
      </div>

      <div className='bg-white rounded-xl p-4'>
        <h3 className='font-semibold mb-4'>Calories Trend</h3>
        <div className='space-y-3'>
          {dailyLogs.map(log => {
            const width = (log.caloriesIn / calorieMax) * 100 || 10;
            return (
              <div key={log.id}>
                <div className='flex justify-between text-xs text-neutral-500'>
                  <span>{new Date(log.date).toLocaleDateString()}</span>
                  <span>{log.caloriesIn.toFixed(0)} kcal</span>
                </div>
                <div className='bg-neutral-100 h-2 rounded-full mt-1'>
                  <div
                    className='bg-blue-500 h-2 rounded-full'
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
          {!dailyLogs.length && (
            <p className='text-sm text-neutral-500'>
              No calorie data yet. Log meals to see your daily summary.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
