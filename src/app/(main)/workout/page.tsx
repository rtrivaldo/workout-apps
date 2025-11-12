import { getWorkoutPlanById } from '@/actions/workout/get-workout-plans';
import AddWorkoutForm from '@/components/AddWorkoutForm';

export default async function AddWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const planId = (await searchParams).plan;

  if (planId) {
    const workoutPlan = await getWorkoutPlanById(Number(planId));

    return <AddWorkoutForm workoutPlan={workoutPlan.data} />;
  } else {
    return <AddWorkoutForm />;
  }
}
