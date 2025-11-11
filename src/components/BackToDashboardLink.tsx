import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  label?: string;
};

export default function BackToDashboardLink({
  className,
  label = 'Back to Dashboard',
}: Props) {
  return (
    <Link
      href='/'
      className={cn(
        'inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors',
        className
      )}
    >
      <ArrowLeft className='mr-1 h-4 w-4' />
      {label}
    </Link>
  );
}
