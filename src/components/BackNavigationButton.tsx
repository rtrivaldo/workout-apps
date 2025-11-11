'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  label?: string;
  fallbackHref?: string;
};

export default function BackNavigationButton({
  className,
  label = 'Back',
  fallbackHref = '/',
}: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(fallbackHref);
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className={cn(
        'inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer',
        className
      )}
    >
      <ArrowLeft className='mr-1 h-4 w-4' />
      {label}
    </button>
  );
}
