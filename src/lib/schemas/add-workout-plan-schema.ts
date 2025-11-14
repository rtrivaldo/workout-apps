import z from 'zod';

export const addWorkoutPlanSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' }),
  exercises: z
    .array(
      z.object({
        name: z.string().min(3, {
          message: 'Exercise name must be at least 3 characters long',
        }),
        totalSets: z.coerce
          .number({ message: 'Total sets must be a number' })
          .min(1, { message: 'Total sets must be at least 1' }),
      })
    )
    .min(1, { message: 'At least one exercise is required' }),
});
