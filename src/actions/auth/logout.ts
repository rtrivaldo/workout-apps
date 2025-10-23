'use server';

import { cookies } from 'next/headers';

export async function logout() {
  try {
    const cookieStore = await cookies();

    cookieStore.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });

    return { success: true, status: 200, message: 'Logged out successfully.' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, status: 500, message: 'Failed to log out.' };
  }
}
