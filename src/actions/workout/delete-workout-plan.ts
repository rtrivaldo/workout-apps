'use server';

import prisma from '@/lib/prisma';
import getUserData from '../auth/profile';

export async function deleteWorkoutPlan(id: number) {
  try {
    const user = await getUserData();

    if (!user) {
      return { success: false, status: 401, message: 'Unauthorized' };
    }

    const existingPlan = await prisma.workoutPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return { success: false, status: 404, message: 'Workout plan not found' };
    }

    if (existingPlan.userId !== user.id) {
      return {
        success: false,
        status: 403,
        message: 'You are not allowed to delete this plan',
      };
    }

    await prisma.exercise.deleteMany({
      where: { workoutPlanId: id },
    });

    await prisma.workoutPlan.delete({
      where: { id },
    });

    return {
      success: true,
      status: 200,
      message: 'Workout plan deleted successfully',
    };
  } catch (error: unknown) {
    console.error('Delete Workout Plan Error:', error);
    return { success: false, status: 500, message: 'Internal server error' };
  }
}
