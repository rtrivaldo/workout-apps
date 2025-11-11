'use client';

import { logout } from '@/actions/auth/logout';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useRouter } from 'next/navigation';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';

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
      <Link href='/' className='text-3xl md:text-4xl font-black'>
        FitTrack
      </Link>

      <div className='flex items-center space-x-2 md:space-x-4'>
        <Avatar asChild className='size-10 md:size-12'>
          <Link href='/profile'>
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Link>
        </Avatar>

        <div className='flex flex-col'>
          <span className='text-sm md:text-base text-neutral-600 font-medium'>
            {name}
          </span>
          <span
            onClick={handleLogout}
            className='text-sm md:text-base text-red-700 cursor-pointer'
          >
            Logout
          </span>
        </div>
      </div>
    </div>
  );
}
