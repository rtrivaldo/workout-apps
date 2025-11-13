'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  label?: string;
  fallbackHref?: string;
  useHistoryBack?: boolean;
};

export default function BackNavigationButton({
  className,
  label = 'Back',
  fallbackHref = '/',
  useHistoryBack = false,
}: Props) {
  const router = useRouter();

  const handleClick = () => {
    if (useHistoryBack && typeof window !== 'undefined') {
      if (window.history.length > 1) {
        router.back();
        return;
      }
    }
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
