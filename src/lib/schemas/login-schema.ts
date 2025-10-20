import z from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(20, { message: 'Username must be 20 characters or less' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});
