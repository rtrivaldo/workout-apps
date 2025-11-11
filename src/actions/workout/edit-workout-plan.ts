'use server';

import { z } from 'zod';
import getUserData from '../auth/profile';
import { editWorkoutPlanSchema } from '@/lib/schemas/edit-workout-plan-schema';
import prisma from '@/lib/prisma';

type EditWorkoutPlanInput = z.infer<typeof editWorkoutPlanSchema>;

export async function EditWorkoutPlan(id: number, data: EditWorkoutPlanInput) {
  try {
    const validatedData = editWorkoutPlanSchema.parse(data);
    const { title, exercises } = validatedData;

    const user = await getUserData();

    if (!user) {
      return { success: false, status: 401, message: 'Unauthorized' };
    }

    const existingPlan = await prisma.workoutPlan.findUnique({
      where: { id },
      include: { exercises: true },
    });

    if (!existingPlan || existingPlan.userId !== user.id) {
      return { success: false, status: 404, message: 'Workout plan not found' };
    }

    await prisma.exercise.deleteMany({
      where: { workoutPlanId: id },
    });

    await prisma.workoutPlan.update({
      where: { id },
      data: {
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
      message: 'Workout plan updated successfully',
    };
  } catch (error: unknown) {
    console.error(error);
    return { success: false, status: 500, message: 'Internal server error' };
  }
}
