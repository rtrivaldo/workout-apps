'use client';

import { logWeightAction } from '@/actions/diet/diet.actions';
import { logWeightSchema } from '@/lib/schemas/diet';
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

type LogWeightValues = z.infer<typeof logWeightSchema>;

export default function LogWeightForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<LogWeightValues>({
    resolver: zodResolver(logWeightSchema),
    defaultValues: {
      weight: undefined,
    },
  });

  const handleSubmit = (values: LogWeightValues) => {
    startTransition(async () => {
      const result = await logWeightAction(values);
      if (result.success) {
        toast.success(result.message);
        form.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-3'>
        <FormField
          control={form.control}
          name='weight'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Weight (kg)</FormLabel>
              <FormControl>
                <Input type='number' min='20' max='400' step='0.1' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='date'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isPending} className='w-full'>
          {isPending ? 'Saving...' : 'Log Weight'}
        </Button>
      </form>
    </Form>
  );
}
