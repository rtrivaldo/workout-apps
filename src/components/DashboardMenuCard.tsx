import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function DashboardMenuCard({
  title,
  description,
  imageSrc,
  className,
}: {
  title: string;
  description: string;
  imageSrc: string;
  className?: string;
}) {
  return (
    <div className={cn(className, 'p-6 rounded-xl')}>
      <Image
        src={imageSrc}
        alt='Workout Plan'
        width={150}
        height={150}
        className='w-24'
      />
      <h3 className='mt-4 text-lg font-medium'>{title}</h3>
      <p className='mt-2 text-neutral-500'>{description}</p>
    </div>
  );
}
