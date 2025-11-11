import { WorkoutPlan } from '@prisma/client';

export type EnchancedWorkoutPlan = WorkoutPlan & {
  exercises: { name: string; totalSets: number }[];
};
