'use server';

import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/schemas/register-schema';

import bcrypt from 'bcryptjs';

export async function registerUser(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = registerSchema.safeParse(rawData);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { name, age, username, password, bodyWeight, height, fitnessGoal } =
      parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: { username },
    });

    if (existingUser) {
      return {
        success: false,
        status: 409,
        message: 'Username or email already exists',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        age,
        username,
        password: hashedPassword,
        bodyWeight,
        height,
        fitnessGoal,
      },
    });

    return { success: true, status: 201, message: 'Registration successful' };
  } catch (error) {
    console.error(error);
    return { success: false, status: 500, message: 'Internal server error' };
  }
}
