'use server';

import prisma from '@/lib/prisma';
import { addWorkoutPlanSchema } from '@/lib/schemas/add-workout-plan-schema';
import { z } from 'zod';
import getUserData from '../auth/profile';

type AddWorkoutPlanInput = z.infer<typeof addWorkoutPlanSchema>;

export async function addWorkoutPlan(data: AddWorkoutPlanInput) {
  try {
    const validatedData = addWorkoutPlanSchema.parse(data);
    const { title, exercises } = validatedData;

    const user = await getUserData();

    if (!user) {
      return { success: false, status: 401, message: 'Unauthorized' };
    }

    await prisma.workoutPlan.create({
      data: {
        userId: user.id,
        title,
        exercises: {
          create: exercises.map(exercise => ({
            name: exercise.name,
            totalSets: exercise.totalSets,
          })),
        },
      },
      include: {
        exercises: true,
      },
    });

    return {
      success: true,
      status: 200,
      message: 'Workout plan created successfully',
    };
  } catch (error: unknown) {
    console.error(error);
    return { success: false, status: 500, message: 'Internal server error' };
  }
}
