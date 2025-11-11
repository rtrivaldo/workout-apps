import { requireCompleteProfile } from '@/actions/auth/profile';
import DietService from '@/actions/diet/DietService';
import DietGoalForm from '@/components/diet/DietGoalForm';
import BackNavigationButton from '@/components/BackNavigationButton';

const dietService = new DietService();

export default async function DietSettingsPage() {
  const user = await requireCompleteProfile();

  const todayLog = await dietService.getDailyLog(user.id);

  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl space-y-6'>
      <div>
        <BackNavigationButton className='mb-1' fallbackHref='/diet-plan' label='Back to Diet Plan' />
        <h2 className='text-2xl font-semibold'>Diet Settings</h2>
        <p className='text-sm text-[#A9A9A9]'>
          Adjust your calorie target and fitness goal.
        </p>
      </div>

      <div className='bg-white rounded-xl p-6 max-w-xl'>
        <DietGoalForm
          defaultValues={{
            targetWeight: user.targetWeight ?? undefined,
            manualCalorieTarget: todayLog.manualCalorieTarget ?? undefined,
            fitnessGoal: user.fitnessGoal,
          }}
        />
      </div>
    </div>
  );
}
