'use server';

import prisma from '@/lib/prisma';
import { addWorkoutSchema } from '@/lib/schemas/add-workout-schema';
import getUserData from '../auth/profile';
import { getCurrentDateTimeLocal } from '@/lib/utils';

export async function addWorkout(data: {
  title: string;
  startTime: String;
  endTime?: String;
  exercises: {
    name: string;
    order: number;
    sets: { reps: number; weight: number; order: number }[];
  }[];
}) {
  try {
    const parsed = addWorkoutSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, status: 400, message: parsed.error };
    }

    const { title, startTime, endTime, exercises } = parsed.data;

    const user = await getUserData();

    if (!user) {
      return { success: false, status: 401, message: 'Unauthorized' };
    }

    await prisma.workout.create({
      data: {
        userId: user.id,
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime || getCurrentDateTimeLocal()),
        exercises: {
          create: exercises.map(exercise => ({
            name: exercise.name,
            order: exercise.order,
            sets: {
              create: exercise.sets.map(set => ({
                reps: set.reps,
                weight: set.weight,
                order: set.order,
              })),
            },
          })),
        },
      },
    });

    return {
      success: true,
      status: 200,
      message: 'Workout plan created successfully',
    };
  } catch (error) {
    console.error(error);
    return { success: false, status: 500, message: 'Internal server error' };
  }
}
