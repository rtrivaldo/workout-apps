'use client';

import { updateMealAction } from '@/actions/diet/diet.actions';
import { updateMealSchema, mealTypeOptions } from '@/lib/schemas/diet';
import { typedZodResolver } from '@/lib/typed-zod-resolver';
import type { Food, Meal, MealFood } from '@prisma/client';
import { Pencil, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import type { FoodOption } from './AddMealDialog';
import { FoodSelect } from './AddMealDialog';

type MealForEdit = Meal & {
  mealFoods: (MealFood & { food: Food | null })[];
};

type EditMealDialogProps = {
  meal: MealForEdit;
  foods: FoodOption[];
  disabled?: boolean;
};

export default function EditMealDialog({
  meal,
  foods,
  disabled,
}: EditMealDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof updateMealSchema>>({
    resolver: typedZodResolver(updateMealSchema),
    defaultValues: {
      mealId: meal.id,
      mealType: meal.type,
      items: meal.mealFoods.map(item => ({
        foodId: item.foodId ?? foods[0]?.id ?? 0,
        portion: item.portion,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const handleSubmit = (values: z.infer<typeof updateMealSchema>) => {
    startTransition(async () => {
      const result = await updateMealAction(values);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const isFoodAvailable = foods.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='icon' disabled={disabled || !isFoodAvailable}>
          <Pencil className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit Meal</DialogTitle>
        </DialogHeader>

        {!isFoodAvailable ? (
          <div className='text-sm text-red-500'>No foods available to edit this meal.</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='mealType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Type</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <select
                          className='w-full h-11 border rounded-md px-3 pr-10 bg-white appearance-none'
                          {...field}
                        >
                          {mealTypeOptions.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400' />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <p className='font-semibold'>Foods</p>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      append({
                        foodId: foods[0]?.id ?? 0,
                        portion: 1,
                      })
                    }
                  >
                    <Plus className='mr-1 h-4 w-4' /> Add
                  </Button>
                </div>

                {fields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className='grid grid-cols-1 md:grid-cols-[2fr_0.7fr_auto] gap-3 border rounded-lg p-3 items-start'
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.foodId`}
                      render={({ field }) => (
                        <FormItem className='space-y-1'>
                          <FormLabel>Food</FormLabel>
                          <FormControl>
                            <FoodSelect
                              foods={foods}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage className='min-h-[18px]' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.portion`}
                      render={({ field }) => (
                        <FormItem className='space-y-1'>
                          <FormLabel>Portion</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              step='0.25'
                              min='0.25'
                              className='h-11'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='min-h-[18px]' />
                        </FormItem>
                      )}
                    />

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='text-red-500 self-start md:self-end md:mt-6'
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>

              <input type='hidden' {...form.register('mealId')} />

              <Button type='submit' className='w-full' disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
