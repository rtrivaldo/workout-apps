"use client";

import { addFoodAction } from '@/actions/diet/diet.actions';
import { addFoodSchema } from '@/lib/schemas/diet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

type AddFoodValues = z.infer<typeof addFoodSchema>;

export default function FoodAddButton({
  triggerLabel = 'Add Food',
}: {
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AddFoodValues>({
    resolver: zodResolver(addFoodSchema),
    defaultValues: {
      name: '',
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      serving: '1 serving',
    },
  });

  const handleSubmit = (values: AddFoodValues) => {
    startTransition(async () => {
      const result = await addFoodAction(values);
      if (result.success) {
        toast.success(result.message);
        form.reset({
          name: '',
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          serving: '1 serving',
        });
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant='outline'>{triggerLabel}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Food</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-3'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-1'>
                      Name
                      <FieldHint message="Food names don't have to be unique. Use serving to describe variants." />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Food name' {...field} />
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
                      <FormLabel className='flex items-center gap-1'>
                        Calories
                        <FieldHint message='Total kcal per serving.' />
                      </FormLabel>
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
                      <FormLabel className='flex items-center gap-1'>
                        Serving
                        <FieldHint message='Describe the portion, e.g., 100g or 1 slice.' />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. 100g' {...field} />
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
                        <FormLabel className='flex items-center gap-1 capitalize'>
                          {key}
                          <FieldHint message={`Amount of ${key} in grams per serving.`} />
                        </FormLabel>
                        <FormControl>
                          <Input type='number' min='0' step='0.5' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <Button type='submit' className='w-full' disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Food'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

function FieldHint({ message }: { message: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className='h-4 w-4 text-neutral-400 cursor-pointer' />
      </TooltipTrigger>
      <TooltipContent className='w-60 text-xs text-white bg-neutral-900'>
        {message}
      </TooltipContent>
    </Tooltip>
  );
}
