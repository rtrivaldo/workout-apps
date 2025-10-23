'use client';

import { logout } from '@/actions/auth/logout';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await logout();

    if (res.status === 200 && res.success) {
      router.push('/login');
    }
  };
  return (
    <div className='flex justify-center items-center h-screen'>
      <Button
        onClick={handleLogout}
        className='px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600'
      >
        Logout
      </Button>
    </div>
  );
}
