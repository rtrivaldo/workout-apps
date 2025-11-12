import getUserData from '@/actions/auth/profile';
import UpdateProfileForm from '@/components/UpdateProfileForm';
import { calculateBMI, calculateDailyCalories } from '@/lib/utils';
import { getFriendlyProfileFieldName } from '@/lib/profile';
import BackNavigationButton from '@/components/BackNavigationButton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default async function ProfilePage() {
  const res = await getUserData();

  if (!res) return null;

  const bmi =
    res.bodyWeight && res.height
      ? calculateBMI(res.bodyWeight, res.height)
      : null;
  const calorieNeeds = calculateDailyCalories(
    res.bodyWeight,
    res.height,
    res.age,
    res.gender,
    res.activityLevel
  );
  const goalCalories = res.lastGoalCalories ?? null;

  return (
    <TooltipProvider delayDuration={150}>
      <div className='mt-6 p-8 md:p-10 bg-[#F4F6F6] rounded-2xl space-y-2'>
        <BackNavigationButton fallbackHref='/' label='Back' useHistoryBack />
        <h2 className='text-2xl font-semibold'>Profile</h2>
        <p className='mt-1 text-sm text-[#A9A9A9]'>
          View and edit your profile here
        </p>

        {!res.profileComplete && (
          <div className='mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4'>
            <p className='text-sm font-semibold text-amber-900'>
              Complete your profile to unlock diet & workout insights
            </p>
            <p className='mt-1 text-sm text-amber-800'>
              We still need the following information:
            </p>
            <ul className='mt-2 list-disc pl-5 text-sm text-amber-800'>
              {res.missingProfileFields.map(field => (
                <li key={field}>{getFriendlyProfileFieldName(field)}</li>
              ))}
            </ul>
            <a
              href='#profile-form'
              className='mt-3 inline-flex text-sm font-medium text-amber-900 underline'
            >
              Complete profile
            </a>
          </div>
        )}

        <div className='mt-6 flex flex-col lg:flex-row gap-10'>
          <div className=' lg:w-1/2 xl:w-1/3 mt-6 bg-white rounded-lg flex flex-col justify-center items-center space-y-4 p-10'>
            <p className='text-center flex items-center justify-center gap-1'>
              Body Mass Index (BMI)
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='inline-flex h-4 w-4 items-center justify-center rounded-full border border-neutral-300 text-[10px] text-neutral-500 cursor-help'>
                    i
                  </span>
                </TooltipTrigger>
                <TooltipContent className='max-w-xs text-xs'>
                  BMI is a general indicator and does not account for body composition.
                </TooltipContent>
              </Tooltip>
            </p>
            <p className='font-semibold'>{bmi ?? 'Not calculated yet'}</p>

            <p className='text-center flex items-center justify-center gap-1'>
              Daily Calorie Estimate (TDEE)
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='inline-flex h-4 w-4 items-center justify-center rounded-full border border-neutral-300 text-[10px] text-neutral-500 cursor-help'>
                    i
                  </span>
                </TooltipTrigger>
                <TooltipContent className='max-w-xs text-xs'>
                  Estimated Total Daily Energy Expenditure to maintain your weight at the current activity level.
                </TooltipContent>
              </Tooltip>
            </p>
            <p className='font-semibold text-center'>
              {calorieNeeds
                ? `${calorieNeeds} kcal`
                : 'Please complete your profile to calculate daily calorie needs'}
            </p>
            <p className='pt-4 text-center flex items-center justify-center gap-1'>
              Recommended Goal Calories
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='inline-flex h-4 w-4 items-center justify-center rounded-full border border-neutral-300 text-[10px] text-neutral-500 cursor-help'>
                    i
                  </span>
                </TooltipTrigger>
                <TooltipContent className='max-w-xs text-xs'>
                  Automatically calculated based on your selected goal (lose / gain / maintain).
                </TooltipContent>
              </Tooltip>
            </p>
            <p className='font-semibold text-center'>
              {goalCalories
                ? `${goalCalories} kcal`
                : 'Set your goal to see a recommendation'}
            </p>
          </div>

          <div id='profile-form' className='lg:w-1/2 xl:w-2/3'>
            <h3 className='text-2xl font-semibold mb-4 md:mb-6'>
              Update Profile
            </h3>

            <UpdateProfileForm user={res} />
          </div>
        </div>
      </div >
    </TooltipProvider>
  );
}
