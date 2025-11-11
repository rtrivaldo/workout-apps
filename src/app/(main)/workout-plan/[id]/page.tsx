import { getWorkoutPlanById } from '@/actions/workout/get-workout-plans';
import EditWorkoutPlanForm from '@/components/EditWorkoutPlanForm';
import { notFound } from 'next/navigation';

export default async function EditWorkoutPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await getWorkoutPlanById(parseInt(id));

  if (!res.success || !res.data) return notFound();

  return <EditWorkoutPlanForm workoutPlan={res.data} />;
}
