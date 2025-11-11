'use server';

import prisma from '@/lib/prisma';
import getUserData from '../auth/profile';

export async function getWorkoutPlans() {
  try {
    const user = await getUserData();

    if (!user) {
      return { success: false, status: 401, message: 'Unauthorized' };
    }

    const plans = await prisma.workoutPlan.findMany({
      where: { userId: user.id },
      include: {
        exercisePlan: true,
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

export async function getWorkoutPlanById(planId: number) {
  try {
    const user = await getUserData();

    if (!user) {
      return { success: false, status: 401, message: 'Unauthorized' };
    }

    const plan = await prisma.workoutPlan.findUnique({
      where: { id: planId, userId: user.id },
      include: {
        exercisePlan: true,
      },
    });

    if (!plan) {
      return { success: false, status: 404, message: 'Workout plan not found' };
    }
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
