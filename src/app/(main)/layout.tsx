import Navbar from '@/components/Navbar';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className='container py-10'>
      <Navbar name={session.name as string} />
      {children}
    </div>
  );
}
