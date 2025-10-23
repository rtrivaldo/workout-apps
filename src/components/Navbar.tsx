'use client';

import { logout } from '@/actions/auth/logout';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useRouter } from 'next/navigation';

export default function Navbar({ name }: { name: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await logout();

    if (res.status === 200 && res.success) {
      router.push('/login');
    }
  };

  return (
    <div className='flex justify-between items-center'>
      <h1 className='text-4xl font-black'>FitTrack</h1>

      <div className='flex items-center space-x-4'>
        <Avatar className='size-12'>
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className='flex flex-col'>
          <span className='text-neutral-600 font-medium'>{name}</span>
          <span onClick={handleLogout} className='text-red-700 cursor-pointer'>
            Logout
          </span>
        </div>
      </div>
    </div>
  );
}
