import getUserData from '@/actions/auth/profile';
import UpdateProfileForm from '@/components/UpdateProfileForm';
import { calculateBMI, calculateDailyCalories } from '@/lib/utils';
import { getFriendlyProfileFieldName } from '@/lib/profile';

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

  return (
    <div className='mt-6 p-8 md:p-10 bg-[#F4F6F6] rounded-2xl'>
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
          <p>Body Mass Index (BMI):</p>
          <p className='font-semibold'>{bmi ?? '—'}</p>

          <p>Daily Calorie Needs:</p>
          <p className='font-semibold text-center'>
            {calorieNeeds
              ? `${calorieNeeds} kcal`
              : 'Please complete your profile to calculate daily calorie needs'}
          </p>
        </div>

        <div id='profile-form' className='lg:w-1/2 xl:w-2/3'>
          <h3 className='text-2xl font-semibold mb-4 md:mb-6'>
            Update Profile
          </h3>

          <UpdateProfileForm user={res} />
        </div>
      </div>
    </div>
  );
}
