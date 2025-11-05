import getUserData from '@/actions/auth/profile';
import Navbar from '@/components/Navbar';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const user = await getUserData();

  if (!session || !user) {
    redirect('/login');
  }

  return (
    <div className='container py-10'>
      <Navbar name={user.name as string} />
      {children}
    </div>
  );
}
