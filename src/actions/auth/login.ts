'use server';

import prisma from '@/lib/prisma';
import { loginSchema } from '@/lib/schemas/login-schema';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import z from 'zod';
import { SignJWT } from 'jose';

export async function login(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = loginSchema.safeParse(rawData);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, status: 404, message: 'Email not found.' };
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, status: 401, message: 'Incorrect password.' };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    const token = await new SignJWT({ id: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, status: 200, message: 'Login successful!' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, status: 400, message: 'Invalid input data.' };
    }
    console.error('Login error:', error);
    return { success: false, status: 500, message: 'Something went wrong.' };
  }
}
