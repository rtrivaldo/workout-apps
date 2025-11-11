'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Ellipsis, Loader } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { EnchancedWorkoutPlan } from '@/app/types/EnchancedWorkoutPlan';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteWorkoutPlan } from '@/actions/workout/delete-workout-plan';
import { useRouter } from 'next/navigation';

export default function WorkoutPlanItem({
  plan,
}: {
  plan: EnchancedWorkoutPlan;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleDeleteWorkoutPlan = async (id: number) => {
    setIsLoading(true);

    const res = await deleteWorkoutPlan(id);

    if (res.status === 200 && res.success) {
      toast.success(res.message);
    } else if (res.status === 401) {
      toast.warning(res.message);
    } else {
      toast.error(res.message);
    }

    setIsLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <div className='flex items-center gap-4'>
      <Link
        href={`/workout-plan/${plan.id}`}
        className='block p-4 bg-white rounded-lg w-full'
      >
        {plan.title}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant='ghost'>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem>
            <Link href={'/workout'}>Start this workout</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/workout-plan/${plan.id}`}>Edit</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workout Plan</DialogTitle>
            <DialogDescription asChild>
              <div className='mt-4 text-sm'>
                <p>
                  Are you sure you want to delete{' '}
                  <span className='font-semibold text-black'>{plan.title}</span>
                  ?{' '}
                </p>

                <p className='mt-2'>
                  This action cannot be undone and will permanently remove this
                  workout plan along with all its exercises.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className='flex justify-end gap-2 mt-6'>
            <Button
              variant='outline'
              onClick={() => setOpen(false)}
              className='rounded-lg'
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={isLoading}
              onClick={() => handleDeleteWorkoutPlan(plan.id)}
              className='rounded-lg w-28'
            >
              {isLoading ? <Loader className='animate-spin' /> : 'Yes, Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
