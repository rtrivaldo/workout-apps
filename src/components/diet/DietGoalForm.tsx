'use client';

import { updateDietGoalAction } from '@/actions/diet/diet.actions';
import { updateDietGoalSchema } from '@/lib/schemas/diet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type DietGoalValues = z.infer<typeof updateDietGoalSchema>;

export default function DietGoalForm({
  defaultValues,
}: {
  defaultValues: Partial<DietGoalValues>;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<DietGoalValues>({
    resolver: zodResolver(updateDietGoalSchema),
    defaultValues: defaultValues,
  });

  const handleSubmit = (values: DietGoalValues) => {
    startTransition(async () => {
      const result = await updateDietGoalAction(values);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='targetWeight'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Weight (kg)</FormLabel>
              <FormControl>
                <Input type='number' step='0.1' min='20' max='400' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='manualCalorieTarget'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Calorie Target</FormLabel>
              <FormControl>
                <Input type='number' min='800' max='6000' step='10' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='fitnessGoal'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fitness Goal</FormLabel>
              <FormControl>
                <select
                  className='w-full border rounded-md px-3 py-2 bg-white'
                  value={field.value ?? 'LOSE_WEIGHT'}
                  onChange={event => field.onChange(event.target.value)}
                >
                  <option value='LOSE_WEIGHT'>Lose Weight</option>
                  <option value='GAIN_WEIGHT'>Gain Weight</option>
                  <option value='MAINTAIN_WEIGHT'>Maintain Weight</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full' disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Goal'}
        </Button>
      </form>
    </Form>
  );
}
