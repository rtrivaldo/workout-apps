import getUserData from '@/actions/auth/profile';
import ProgressService from '@/actions/diet/ProgressService';
import LogWeightForm from '@/components/diet/LogWeightForm';
import ProgressChart from '@/components/diet/ProgressChart';
import BackNavigationButton from '@/components/BackNavigationButton';

const progressService = new ProgressService();

export default async function DietProgressPage() {
  const user = await getUserData();
  if (!user) return null;

  const [weightLogs, calorieTrend] = await Promise.all([
    progressService.getWeightProgress(user.id, 14),
    progressService.getCalorieTrend(user.id, 14),
  ]);
  const latestWeight = weightLogs.at(-1);

  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl space-y-6'>
      <div className='flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
        <div>
          <BackNavigationButton className='mb-1' fallbackHref='/diet-plan' label='Back to Diet Plan' />
          <h2 className='text-2xl font-semibold'>Progress</h2>
          <p className='text-sm text-[#A9A9A9]'>
            Monitor changes in your weight and calorie intake.
          </p>
        </div>
        <div className='bg-white rounded-xl p-4 min-w-[220px]'>
          <p className='text-xs uppercase text-neutral-500'>Latest Weight</p>
          <p className='text-3xl font-semibold mt-1'>
            {latestWeight ? `${latestWeight.weight} kg` : 'No data'}
          </p>
          <p className='text-xs text-neutral-500'>
            {latestWeight
              ? new Date(latestWeight.loggedAt).toLocaleDateString()
              : 'Log your first weight to start tracking'}
          </p>
        </div>
      </div>

      <ProgressChart weightLogs={weightLogs} dailyLogs={calorieTrend} />

      <div className='bg-white rounded-xl p-4'>
        <h3 className='font-semibold mb-2'>Log Weight</h3>
        <LogWeightForm />
      </div>
    </div>
  );
}
