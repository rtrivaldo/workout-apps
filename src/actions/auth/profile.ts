'use server';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/schemas/update-profile-schema';
import { redirect } from 'next/navigation';

export default async function getUserData() {
  const session = await getSession();

  if (!session?.id) {
    redirect('/login');
  }

  const res = await prisma.user.findUnique({
    where: {
      id: Number(session.id),
    },
  });

  return res;
}

export async function updateUserData(formData: FormData, userId: number) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = updateProfileSchema.safeParse(rawData);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const {
      name,
      age,
      gender,
      bodyWeight,
      height,
      fitnessGoal,
      activityLevel,
    } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!existingUser) {
      return {
        success: false,
        status: 409,
        message: 'Account does not exist',
      };
    }

    console.log(gender, activityLevel);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        age,
        gender: gender || null,
        bodyWeight,
        height,
        fitnessGoal,
        activityLevel: activityLevel || null,
      },
    });

    console.log(user);

    return { success: true, status: 201, message: 'Update successful' };
  } catch (error) {
    console.error(error);
    return { success: false, status: 500, message: 'Internal server error' };
  }
}
