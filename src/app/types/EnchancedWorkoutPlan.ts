import { WorkoutPlan } from '@prisma/client';

export type EnchancedWorkoutPlan = WorkoutPlan & {
  exercisePlan: { name: string; totalSets: number }[];
};
