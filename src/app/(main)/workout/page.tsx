'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addWorkoutSchema } from '@/lib/schemas/add-workout-schema';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { getCurrentDateTimeLocal } from '@/lib/utils';
import { addWorkout } from '@/actions/workout/add-workout';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type AddWorkoutValues = z.infer<typeof addWorkoutSchema>;

type SetForm = {
  reps: number;
  weight: number;
  order: number;
};

type ExerciseFormData = {
  name: string;
  order: number;
  sets: SetForm[];
};

export default function AddWorkoutPage() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const form = useForm<AddWorkoutValues>({
    resolver: zodResolver(addWorkoutSchema),
    defaultValues: {
      title: '',
      startTime: getCurrentDateTimeLocal(),
      endTime: '',
      exercises: [
        {
          name: '',
          order: 1,
          sets: [{ reps: 0, weight: 0, order: 1 }],
        },
      ],
    },
  });

  const {
    fields: exerciseFields,
    append: appendExercise,
    remove: removeExercise,
  } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  const onSubmit = async (data: AddWorkoutValues) => {
    setIsLoading(true);

    const payload = {
      ...data,
      startTime: new Date(data.startTime).toISOString(),
      endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
      exercises: data.exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({
          ...set,
          reps: Number(set.reps),
          weight: Number(set.weight),
        })),
      })),
    };

    const res = await addWorkout(payload);

    console.log(res);

    if (res?.success) {
      toast.success('Workout added successfully!');

      router.push('/');
    } else {
      toast.error('Failed to add workout plan.');
    }

    setIsLoading(false);
  };

  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl'>
      <h2 className='text-2xl font-semibold'>Workout</h2>
      <p className='mt-1 text-sm text-[#A9A9A9]'>
        Create and record your current workout progress.
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

          <FormField
            control={form.control}
            name='startTime'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type='datetime-local' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='endTime'
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type='datetime-local' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Exercises */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-semibold text-lg'>Exercises</h3>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  appendExercise({
                    name: '',
                    order: exerciseFields.length + 1,
                    sets: [{ reps: 0, weight: 0, order: 1 }],
                  })
                }
              >
                <Plus className='h-4 w-4 mr-1' />
                Add Exercise
              </Button>
            </div>

            <div className='space-y-4'>
              {exerciseFields.map((exercise, exerciseIndex) => (
                <ExerciseForm
                  key={exercise.id}
                  exerciseIndex={exerciseIndex}
                  removeExercise={removeExercise}
                  control={form.control}
                  form={form}
                />
              ))}
            </div>
          </div>

          <Button type='submit' disabled={isLoading} className='w-full'>
            {isLoading ? 'Saving...' : 'Save Workout Plan'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

interface ExerciseFormProps {
  exerciseIndex: number;
  removeExercise: (index: number) => void;
  control: any;
  form: any;
}

function ExerciseForm({
  exerciseIndex,
  removeExercise,
  control,
  form,
}: ExerciseFormProps) {
  const {
    fields: setFields,
    append: appendSet,
    remove: removeSet,
  } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets` as const,
  });

  return (
    <div className='p-4 border rounded-lg bg-white space-y-4'>
      <div className='flex items-start justify-between gap-2'>
        <FormField
          control={control}
          name={`exercises.${exerciseIndex}.order` as const}
          render={({ field }) => (
            <FormItem className='mt-5.5 w-10'>
              <FormControl>
                <Input
                  type='text'
                  disabled
                  {...field}
                  className='text-center'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`exercises.${exerciseIndex}.name` as const}
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

        <Button
          type='button'
          variant='destructive'
          size='icon'
          className='ml-2 mt-5.5'
          onClick={() => {
            removeExercise(exerciseIndex);

            // ✅ Reorder exercises and nested sets
            const updatedExercises = form
              .getValues('exercises')
              .map((ex: ExerciseFormData, i: number) => ({
                ...ex,
                order: i + 1,
                sets: ex.sets.map((set: SetForm, j: number) => ({
                  ...set,
                  order: j + 1,
                })),
              }));

            form.setValue('exercises', updatedExercises);
          }}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      {/* Sets */}
      <div className='space-y-2'>
        <div className='flex justify-between items-center'>
          <h4 className='font-medium'>Sets</h4>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() =>
              appendSet({ reps: 0, weight: 0, order: setFields.length + 1 })
            }
          >
            <Plus className='h-4 w-4 mr-1' /> Add Set
          </Button>
        </div>

        {setFields.map((set, setIndex) => (
          <div key={set.id} className='flex gap-2 items-start'>
            <FormField
              control={control}
              name={
                `exercises.${exerciseIndex}.sets.${setIndex}.order` as const
              }
              render={({ field }) => (
                <FormItem className='mt-5.5 w-20'>
                  <FormControl>
                    <Input
                      type='text'
                      disabled
                      {...field}
                      className='text-center'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`exercises.${exerciseIndex}.sets.${setIndex}.reps` as const}
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Reps</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={
                `exercises.${exerciseIndex}.sets.${setIndex}.weight` as const
              }
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      step={0.1}
                      {...field}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(Number(e.target.value))}
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
              disabled={setFields.length === 1}
              onClick={() => {
                removeSet(setIndex);
                const updatedSets = form
                  .getValues(`exercises.${exerciseIndex}.sets`)
                  .map(
                    (
                      set: { reps: number; weight: number; order: number },
                      i: number
                    ) => ({
                      ...set,
                      order: i + 1,
                    })
                  );
                form.setValue(`exercises.${exerciseIndex}.sets`, updatedSets);
              }}
              className='mt-5.5'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
