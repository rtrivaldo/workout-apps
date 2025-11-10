import getUserData from '@/actions/auth/profile';
import DashboardMenuCard from '@/components/DashboardMenuCard';

export default async function Home() {
  const user = await getUserData();
  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl'>
      <h2 className='text-xl font-semibold'>
        Hi, {user?.name}! Welcome to FitTrack Dashboard
      </h2>

      <div className='mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        <DashboardMenuCard
          title='Workout Plan'
          description='Set up and manage your training plan.'
          imageSrc='/images/workout-plan.png'
          pageUrl='/workout-plan'
          className='bg-[#EBF8FD]'
        />

        <DashboardMenuCard
          title='Workout'
          description='Start and track your workouts.'
          imageSrc='/images/workout.png'
          className='bg-[#FFF4F3]'
        />

        <DashboardMenuCard
          title='Diet Plan'
          description='Manage your food intake and diet plan.'
          imageSrc='/images/diet-plan.png'
          className='bg-[#E1F4E2]'
        />

        <DashboardMenuCard
          title='Progress'
          description='Record and monitor your health progress.'
          imageSrc='/images/progress.png'
          className='bg-[#FDF0FF]'
        />

        <DashboardMenuCard
          title='Calorie'
          description='View your summary and calorie count.'
          imageSrc='/images/calorie.png'
          className='bg-[#FFF5DF]'
        />
      </div>
    </div>
  );
}
