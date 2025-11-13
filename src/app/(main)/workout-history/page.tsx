import { getWorkouts } from '@/actions/workout/get-workout';

export default async function WorkoutHistoryPage() {
  const workouts = await getWorkouts();

  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl'>
      <h2 className='text-2xl font-semibold'>Workout History</h2>
      <p className='mt-1 text-sm text-[#A9A9A9]'>Review your past workouts.</p>

      <div className='mt-6 space-y-2'>
        {workouts.status === 200 &&
          workouts.data &&
          workouts.data.length > 0 &&
          workouts.data.map(workout => (
            <div
              key={workout.id}
              className='p-4 bg-white rounded-lg flex justify-between'
            >
              <div className='flex gap-4 items-start'>
                <div className='text-center bg-accent p-2 rounded'>
                  <p className='text-lg font-semibold'>
                    {workout.startTime.getDate()}
                  </p>
                  <p className='mt-1 text-xs'>
                    {`${workout.startTime.toLocaleString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}`}
                  </p>
                </div>

                <div>
                  <p className='text-lg font-semibold'>{workout.title}</p>
                  <div className='mt-1 text-sm'>
                    {workout.exercises.length > 0 &&
                      workout.exercises.map(ex => (
                        <p>{`${ex.sets.length}x ${ex.name}`}</p>
                      ))}
                  </div>
                </div>
              </div>

              <p className='text-sm text-[#A9A9A9]'>
                {' '}
                {`${Math.round(
                  (new Date(workout.endTime).getTime() -
                    new Date(workout.startTime).getTime()) /
                    60000
                )} min`}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
