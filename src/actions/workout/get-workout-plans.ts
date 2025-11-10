'use server';

import prisma from '@/lib/prisma';
import getUserData from '../auth/profile';

export default async function getWorkoutPlans() {
  try {
    const user = await getUserData();

    if (!user) {
      return { success: false, status: 401, message: 'Unauthorized' };
    }

    const plans = await prisma.workoutPlan.findMany({
      where: { userId: user.id },
      include: {
        exercises: true,
      },
    });

    return {
      success: true,
      status: 200,
      message: 'Workout plans fetched successfully',
      data: plans,
    };
  } catch (error) {
    console.error(error);
    return { success: false, status: 500, message: 'Internal server error' };
  }
}
