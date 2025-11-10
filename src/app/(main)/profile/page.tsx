import getUserData from '@/actions/auth/profile';
import UpdateProfileForm from '@/components/UpdateProfileForm';
import { calculateBMI, calculateDailyCalories } from '@/lib/utils';

export default async function ProfilePage() {
  const res = await getUserData();

  if (!res) return null;

  return (
    <div className='mt-6 p-8 md:p-10 bg-[#F4F6F6] rounded-2xl'>
      <h2 className='text-2xl font-semibold'>Profile</h2>
      <p className='mt-1 text-sm text-[#A9A9A9]'>
        View and edit your profile here
      </p>

      <div className='mt-6 flex flex-col lg:flex-row gap-10'>
        <div className=' lg:w-1/2 xl:w-1/3 mt-6 bg-white rounded-lg flex flex-col justify-center items-center space-y-4 p-10'>
          <p>Body Mass Index (BMI):</p>
          <p className='font-semibold'>
            {calculateBMI(res.bodyWeight, res.height)}
          </p>

          <p>Daily Calorie Needs:</p>
          <p className='font-semibold text-center'>
            {!res.gender || !res.activityLevel
              ? 'Please complete your profile to calculate daily calorie needs'
              : `${calculateDailyCalories(
                  res.bodyWeight,
                  res.height,
                  res.age,
                  res.gender,
                  res.activityLevel
                )} kcal`}
          </p>
        </div>

        <div className='lg:w-1/2 xl:w-2/3'>
          <h3 className='text-2xl font-semibold mb-4 md:mb-6'>
            Update Profile
          </h3>

          <UpdateProfileForm user={res} />
        </div>
      </div>
    </div>
  );
}
