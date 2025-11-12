'use client';

import {
  deleteFoodAction,
  updateFoodAction,
} from '@/actions/diet/diet.actions';
import { updateFoodSchema } from '@/lib/schemas/diet';
import { typedZodResolver } from '@/lib/typed-zod-resolver';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type FoodFormValues = z.infer<typeof updateFoodSchema>;

type FoodItem = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  serving: string;
  createdBy: number | null;
};

export default function FoodRowActions({ food }: { food: FoodItem }) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const form = useForm<FoodFormValues>({
    resolver: typedZodResolver(updateFoodSchema),
    defaultValues: {
      id: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      fat: food.fat,
      carbs: food.carbs,
      serving: food.serving,
    },
  });

  const handleSubmit = (values: FoodFormValues) => {
    startTransition(async () => {
      const result = await updateFoodAction(values);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteFoodAction({ id: food.id });
      if (result.success) {
        toast.success(result.message);
        setDeleteOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const isPersonal = Boolean(food.createdBy);

  return (
    <div className='flex items-center gap-2 justify-end'>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant='outline' size='sm' disabled={!isPersonal}>
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Food</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-3'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-3'>
                <FormField
                  control={form.control}
                  name='calories'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories</FormLabel>
                      <FormControl>
                        <Input type='number' min='0' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='serving'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serving</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-3 gap-3'>
                {(['protein', 'carbs', 'fat'] as const).map(key => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={key}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='capitalize'>{key}</FormLabel>
                        <FormControl>
                          <Input type='number' min='0' step='0.5' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <DialogFooter>
                <Button type='submit' disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <Button
            variant='destructive'
            size='sm'
            disabled={!isPersonal}
          >
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Food</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-neutral-600'>
            This will remove <span className='font-semibold'>{food.name}</span>{' '}
            from your personal library. Meals that already used it will keep their
            calorie snapshot.
          </p>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
