'use client';

import { dailyCheckInAction } from '@/actions/diet/diet.actions';
import { dailyCheckInSchema } from '@/lib/schemas/diet';
import { typedZodResolver } from '@/lib/typed-zod-resolver';
import { useEffect, useTransition } from 'react';
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

type DailyCheckInValues = z.infer<typeof dailyCheckInSchema>;

type DailyCheckInFormProps = {
  defaultValues: Partial<DailyCheckInValues>;
  currentWeight?: number;
  recommendedCalories?: number | null;
  onCompleted?: () => void;
};

export default function DailyCheckInForm({
  defaultValues,
  currentWeight,
  recommendedCalories,
  onCompleted,
}: DailyCheckInFormProps) {
  const [isPending, startTransition] = useTransition();
  const recommendedLabel = recommendedCalories
    ? `${recommendedCalories.toFixed(0)} kcal`
    : null;
  const initialGoal = defaultValues.fitnessGoal ?? 'LOSE_WEIGHT';
  const initialWeight = defaultValues.weight ?? currentWeight ?? undefined;
  const initialTargetWeight =
    defaultValues.targetWeight ??
    (initialGoal === 'MAINTAIN_WEIGHT' ? initialWeight : undefined);
  const initialManualTarget = defaultValues.manualCalorieTarget ?? undefined;

  const form = useForm<DailyCheckInValues>({
    resolver: typedZodResolver(dailyCheckInSchema),
    defaultValues: {
      weight: initialWeight,
      targetWeight: initialTargetWeight,
      manualCalorieTarget: initialManualTarget,
      fitnessGoal: initialGoal,
    },
  });
  const fitnessGoal = form.watch('fitnessGoal');
  const weightValue = form.watch('weight');
  const parsedWeight =
    typeof weightValue === 'number'
      ? weightValue
      : weightValue === undefined || weightValue === ''
        ? undefined
        : Number(weightValue);

  useEffect(() => {
    if (fitnessGoal !== 'MAINTAIN_WEIGHT') return;
    if (typeof parsedWeight !== 'number' || Number.isNaN(parsedWeight)) return;
    const currentTarget = form.getValues('targetWeight');
    if (currentTarget !== parsedWeight) {
      form.setValue('targetWeight', parsedWeight, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [fitnessGoal, parsedWeight, form]);

  const handleSubmit = (values: DailyCheckInValues) => {
    startTransition(async () => {
      const result = await dailyCheckInAction(values);
      if (result.success) {
        toast.success(result.message);
        onCompleted?.();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        {recommendedLabel && (
          <div className='rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600'>
            <p className='font-semibold text-neutral-800'>System Recommendation</p>
            <p>
              Today&apos;s recommended intake is {recommendedLabel}. You can override it with a manual
              target below.
            </p>
          </div>
        )}
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
        <FormField
          control={form.control}
          name='weight'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Today&apos;s Weight (kg)</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min='20'
                  max='400'
                  step='0.1'
                  value={field.value ?? ''}
                  onChange={event =>
                    field.onChange(
                      event.target.value === '' ? undefined : Number(event.target.value)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-4 md:grid-cols-2 items-start'>
          <FormField
            control={form.control}
            name='targetWeight'
            render={({ field }) => (
              <FormItem className='flex flex-col h-full'>
                <FormLabel>Target Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='0.1'
                    min='20'
                    max='400'
                    disabled={fitnessGoal === 'MAINTAIN_WEIGHT'}
                    value={field.value ?? ''}
                    onChange={event =>
                      field.onChange(
                        event.target.value === '' ? undefined : Number(event.target.value)
                      )
                    }
                  />
                </FormControl>
                <p className='text-xs text-neutral-500'>
                  {fitnessGoal === 'MAINTAIN_WEIGHT'
                    ? "Maintain goal: target should match today's weight."
                    : fitnessGoal === 'LOSE_WEIGHT'
                      ? "Lose goal: target must be lower than today's weight."
                      : "Gain goal: target must be higher than today's weight."}
                  {currentWeight !== undefined && (
                    <> Current weight: {currentWeight.toFixed(1)} kg.</>
                  )}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='manualCalorieTarget'
            render={({ field }) => (
              <FormItem className='flex flex-col h-full'>
                <FormLabel>Manual Calorie Target</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min='800'
                    max='6000'
                    step='10'
                    value={field.value ?? ''}
                    onChange={event =>
                      field.onChange(
                        event.target.value === '' ? undefined : Number(event.target.value)
                      )
                    }
                  />
                </FormControl>
                <div className='flex items-center justify-between text-xs text-neutral-500'>
                  <span>
                    {recommendedLabel
                      ? `System recommendation: ${recommendedLabel}`
                      : 'No recommendation available'}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type='submit' className='w-full' disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Check-in'}
        </Button>
      </form>
    </Form>
  );
}
