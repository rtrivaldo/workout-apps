import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardMenuCard({
  title,
  description,
  imageSrc,
  pageUrl = '#',
  className,
}: {
  title: string;
  description: string;
  imageSrc: string;
  pageUrl?: string;
  className?: string;
}) {
  return (
    <Link href={pageUrl} className={cn(className, 'p-6 rounded-xl')}>
      <Image
        src={imageSrc}
        alt='Workout Plan'
        width={150}
        height={150}
        className='w-24'
      />
      <h3 className='mt-4 text-lg font-medium'>{title}</h3>
      <p className='mt-2 text-neutral-500'>{description}</p>
    </Link>
  );
}
