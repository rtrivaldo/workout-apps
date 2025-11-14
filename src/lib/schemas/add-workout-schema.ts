import z from 'zod';

export const addWorkoutSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' }),
  startTime: z.string().min(1, { message: 'Start time is required' }),
  endTime: z.string().optional(),
  exercises: z
    .array(
      z.object({
        name: z.string().min(3, {
          message: 'Exercise name must be at least 3 characters long',
        }),
        order: z
          .number({ message: 'Order must be a number' })
          .min(1, { message: 'Order must be at least 1' }),
        sets: z
          .array(
            z.object({
              reps: z.coerce
                .number({ message: 'Reps must be a number' })
                .min(1, { message: 'Reps must be at least 1' }),
              weight: z.coerce
                .number({ message: 'Weight must be a number' })
                .min(0, { message: 'Weight cannot be negative' }),
              order: z.coerce
                .number({ message: 'Order must be a number' })
                .min(1, { message: 'Order must be at least 1' }),
            })
          )
          .min(1, { message: 'At least one set is required per exercise' }),
      })
    )
    .min(1, { message: 'At least one exercise is required' }),
});
