import getUserData from '@/actions/auth/profile';
import { fitnessGoals } from '@/app/types/fitnessGoal';
import UpdateProfileForm from '@/components/UpdateProfileForm';
import { calculateBMI } from '@/lib/utils';

export default async function ProfilePage() {
  const res = await getUserData();

  if (!res) return null;

  const fitnessGoal = fitnessGoals.find(
    goal => goal.value === res?.fitnessGoal
  )?.label;

  return (
    <div className='mt-6 p-8 md:p-10 bg-[#F4F6F6] rounded-2xl'>
      <h2 className='text-2xl font-semibold'>Profile</h2>
      <p className='mt-1 text-sm text-[#A9A9A9]'>
        View and edit your profile here
      </p>

      <div className='mt-6 flex flex-col lg:flex-row gap-10'>
        <div className='lg:w-1/2 xl:w-1/3 md:bg-white rounded-xl p-0 md:p-8'>
          <h3 className='text-2xl font-semibold'>Recent Information</h3>

          <div className='mt-2 md:mt-4 space-y-2'>
            <p>Name: {res.name}</p>
            <p>Age: {res.age}</p>
            <p>Weight: {res.bodyWeight}kg</p>
            <p>Height: {res.height}cm</p>
            <p>Fitness Goal: {fitnessGoal}</p>
          </div>

          <div className='mt-6 bg-white md:bg-[#EBF8FD] rounded-lg flex flex-col justify-center items-center space-y-4 p-10'>
            <p>Body Mass Index (BMI):</p>
            <p className='font-semibold'>
              {calculateBMI(res.bodyWeight, res.height)}
            </p>
            <p>Daily Calorie Needs:</p>
            <p className='font-semibold'>18.8 kkal</p>
          </div>
        </div>

        <div className='lg:w-1/2 xl:w-2/3'>
          <h3 className='text-2xl font-semibold mb-4 md:mb-6'>
            Update Profile
          </h3>

          <UpdateProfileForm userId={res.id} />
        </div>
      </div>
    </div>
  );
}
