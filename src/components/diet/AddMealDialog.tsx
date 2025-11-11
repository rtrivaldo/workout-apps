'use client';

import { addMealAction } from '@/actions/diet/diet.actions';
import { mealTypeOptions, addMealSchema } from '@/lib/schemas/diet';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

type FoodOption = {
  id: number;
  name: string;
  serving: string;
  calories: number;
};

type AddMealFormValues = z.infer<typeof addMealSchema>;

export default function AddMealDialog({ foods }: { foods: FoodOption[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AddMealFormValues>({
    resolver: zodResolver(addMealSchema),
    defaultValues: {
      mealType: 'BREAKFAST',
      items: [{ foodId: foods[0]?.id ?? 0, portion: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const handleSubmit = (values: AddMealFormValues) => {
    startTransition(async () => {
      const result = await addMealAction(values);
      if (result.success) {
        toast.success(result.message);
        form.reset({
          mealType: 'BREAKFAST',
          items: [{ foodId: foods[0]?.id ?? 0, portion: 1 }],
        });
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
        <Button disabled={!isFoodAvailable}>
          <Plus className='mr-2 h-4 w-4' />
          Add Meal
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Add Meal</DialogTitle>
          <DialogDescription>
            Log your meal by selecting foods from your library.
          </DialogDescription>
        </DialogHeader>

        {!isFoodAvailable ? (
          <div className='text-sm text-red-500'>
            No foods available. Please add food to your library first.
          </div>
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
                      <select
                        className='w-full border rounded-md px-3 py-2 bg-white'
                        {...field}
                      >
                        {mealTypeOptions.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
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
                    onClick={() => append({ foodId: foods[0].id, portion: 1 })}
                  >
                    <Plus className='mr-1 h-4 w-4' /> Add
                  </Button>
                </div>

                {fields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className='grid grid-cols-1 md:grid-cols-[1.5fr_1fr_auto] gap-3 items-end border rounded-lg p-3'
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.foodId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Food</FormLabel>
                          <FormControl>
                            <select
                              className='w-full border rounded-md px-3 py-2 bg-white'
                              value={field.value}
                              onChange={event => field.onChange(Number(event.target.value))}
                            >
                              {foods.map(food => (
                                <option key={food.id} value={food.id}>
                                  {food.name} ({food.calories} kcal)
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.portion`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portion</FormLabel>
                          <FormControl>
                            <Input type='number' step='0.25' min='0.25' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='text-red-500'
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>

              <Button type='submit' className='w-full' disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Meal'}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
