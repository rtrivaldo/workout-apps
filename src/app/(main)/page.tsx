import DashboardMenuCard from '@/components/DashboardMenuCard';

export default function Home() {
  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl'>
      <h2 className='text-xl font-semibold'>
        Hi, Miftah! Welcome to FitTrack Dashboard
      </h2>

      <div className='mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        <DashboardMenuCard
          title='Workout Plan'
          description='Set up and manage your training plan.'
          imageSrc='/images/workout-plan.png'
          className='bg-[#EBF8FD]'
        />

        <DashboardMenuCard
          title='Diet Plan'
          description='Manage your food intake and diet plan.'
          imageSrc='/images/diet-plan.png'
          className='bg-[#E1F4E2]'
        />

        <DashboardMenuCard
          title='Schedule'
          description='View and manage your daily schedule.'
          imageSrc='/images/schedule.png'
          className='bg-[#FFF4F3]'
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
