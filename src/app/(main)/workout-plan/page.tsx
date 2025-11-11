import { getWorkoutPlans } from '@/actions/workout/get-workout-plans';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function WorkoutPlanPage() {
  const plans = await getWorkoutPlans();

  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-semibold'>Your Workout Plan</h2>
          <p className='mt-1 text-sm text-[#A9A9A9]'>
            Here you can set up and manage your workout plans.
          </p>
        </div>

        <Button asChild variant='default'>
          <Link href='/workout-plan/add'>
            <Plus /> Add New Plan
          </Link>
        </Button>
      </div>

      <div className='mt-10'>
        {plans.data && plans.data.length === 0 && (
          <div className='text-center text-[#A9A9A9]'>
            <p>No workout plans found.</p>
            <p>Click "Add New Plan" to get started.</p>
          </div>
        )}

        {plans.data && plans.data.length > 0 && (
          <div className='space-y-2'>
            {plans.data.map(plan => (
              <Link
                key={plan.id}
                href={`/workout-plan/${plan.id}`}
                className='block p-4 bg-white rounded-lg'
              >
                {plan.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
