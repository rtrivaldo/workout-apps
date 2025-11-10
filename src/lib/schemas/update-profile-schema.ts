import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must be 50 characters or less' }),
  age: z.coerce
    .number({ message: 'Age must be a number' })
    .int({ message: 'Age must be an integer' })
    .min(13, { message: 'You must be at least 13 years old' })
    .max(100, { message: 'Please enter a valid age' }),
  gender: z.enum(['MALE', 'FEMALE'], {
    error: 'Please select a gender',
  }),
  bodyWeight: z.coerce
    .number({ message: 'Body weight must be a number' })
    .min(30, { message: 'Body weight must be at least 30 kg' })
    .max(300, { message: 'Body weight must be less than 300 kg' }),
  height: z.coerce
    .number({ message: 'Height must be a number' })
    .min(100, { message: 'Height must be at least 100 cm' })
    .max(250, { message: 'Height must be less than 250 cm' }),
  fitnessGoal: z.enum(['LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN_WEIGHT'], {
    error: 'Please select a fitness goal',
  }),
  activityLevel: z.enum(
    ['NOT_VERY_ACTIVE', 'LIGHTLY_ACTIVE', 'ACTIVE', 'VERY_ACTIVE'],
    {
      error: 'Please select an activity level',
    }
  ),
});
