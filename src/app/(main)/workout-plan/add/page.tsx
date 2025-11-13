'use client';

import { addWorkoutPlan } from '@/actions/workout/add-workout-plan';
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
import { addWorkoutPlanSchema } from '@/lib/schemas/add-workout-plan-schema';
import { zodResolver } from '@hookform/resolvers/zod';
// import { typedZodResolver } from '@/lib/typed-zod-resolver';
import { Loader, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type AddWorkoutPlanValues = z.infer<typeof addWorkoutPlanSchema>;

export default function AddWorkoutPlanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddWorkoutPlanValues>({
    resolver: zodResolver(addWorkoutPlanSchema),
    // resolver: typedZodResolver(addWorkoutPlanSchema),
    defaultValues: {
      title: '',
      exercises: [{ name: '', totalSets: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  const onSubmit = async (data: AddWorkoutPlanValues) => {
    setIsLoading(true);

    try {
      const result = await addWorkoutPlan(data);

      if (result?.success) {
        toast.success('Workout plan created successfully!');

        router.push('/workout-plan');
      } else {
        toast.error(result?.message || 'Failed to add workout plan.');
      }
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl'>
      <h2 className='text-2xl font-semibold'>Add Workout Plan</h2>
      <p className='mt-1 text-sm text-[#A9A9A9]'>
        Create a new workout plan with multiple exercises.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='mt-6 space-y-6'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workout Title</FormLabel>
                <FormControl>
                  <Input placeholder='e.g. Push Day' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-semibold text-lg'>Exercises</h3>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => append({ name: '', totalSets: 1 })}
              >
                <Plus className='h-4 w-4 mr-1' />
                Add Exercise
              </Button>
            </div>

            <div className='space-y-4'>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className='flex items-start gap-3 border rounded-lg p-4 bg-white'
                >
                  <FormField
                    control={form.control}
                    name={`exercises.${index}.name`}
                    render={({ field }) => (
                      <FormItem className='w-full'>
                        <FormLabel>Exercise Name</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g. Bench Press' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`exercises.${index}.totalSets`}
                    render={({ field }) => (
                      <FormItem className='w-full'>
                        <FormLabel>Total Sets</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='e.g. 4'
                            {...field}
                            value={field.value ?? ''}
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type='button'
                    variant='destructive'
                    size='icon'
                    className='mt-5.5'
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button type='submit' disabled={isLoading} className='w-full'>
            {isLoading ? (
              <Loader className='animate-spin' />
            ) : (
              'Save Workout Plan'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
