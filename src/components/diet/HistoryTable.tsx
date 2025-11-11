import { DailyLog } from '@prisma/client';

export default function HistoryTable({ logs }: { logs: DailyLog[] }) {
  return (
    <div className='bg-white rounded-xl p-4 overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='text-left text-neutral-500'>
            <th className='py-2'>Date</th>
            <th className='py-2'>Calories In</th>
            <th className='py-2'>Calorie Target</th>
            <th className='py-2'>Net</th>
            <th className='py-2'>Weight</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => {
            const target = log.manualCalorieTarget ?? log.dailyNeedCalories;
            const delta =
              target !== null && target !== undefined
                ? log.caloriesIn - target
                : null;

            return (
              <tr key={log.id} className='border-t'>
                <td className='py-2'>
                  {new Date(log.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className='py-2'>{log.caloriesIn.toFixed(0)} kcal</td>
                <td className='py-2'>
                  {target ? `${target.toFixed(0)} kcal` : 'Not set'}
                </td>
                <td className='py-2'>
                  {log.netCalories.toFixed(0)} kcal{' '}
                  {delta !== null && (
                    <span className={delta > 0 ? 'text-red-500' : 'text-green-600'}>
                      ({delta > 0 ? '+' : ''}
                      {delta.toFixed(0)})
                    </span>
                  )}
                </td>
                <td className='py-2'>
                  {log.currentWeight ? `${log.currentWeight} kg` : '—'}
                </td>
              </tr>
            );
          })}
          {!logs.length && (
            <tr>
              <td className='py-4 text-center text-neutral-500' colSpan={5}>
                No history yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
