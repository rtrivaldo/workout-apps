'use server';

import prisma from '@/lib/prisma';
import getUserData from '../auth/profile';

export async function getWorkouts() {
  try {
    const user = await getUserData();

    if (!user) {
      return { success: false, status: 401, message: 'Unauthorized' };
    }

    const plan = await prisma.workout.findMany({
      where: { userId: user.id },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

    return {
      success: true,
      status: 200,
      message: 'Workout plan fetched successfully',
      data: plan,
    };
  } catch (error) {
    console.error(error);
    return { success: false, status: 500, message: 'Internal server error' };
  }
}
