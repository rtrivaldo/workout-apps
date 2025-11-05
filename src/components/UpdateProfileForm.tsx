'use client';

import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useState } from 'react';
import { Button } from './ui/button';
import { Check, ChevronsUpDown, Loader } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from './ui/command';
import { fitnessGoals } from '@/app/types/fitnessGoal';
import { cn } from '@/lib/utils';
import { updateProfileSchema } from '@/lib/schemas/update-profile-schema';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { updateUserData } from '@/actions/auth/profile';

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export default function UpdateProfileForm({ userId }: { userId: number }) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: '',
      age: '',
      bodyWeight: '',
      height: '',
      fitnessGoal: '',
    },
  });

  const onSubmit = async (data: UpdateProfileFormValues) => {
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const result = await updateUserData(formData, userId);

    if (result.status === 201 && result.success) {
      toast.success(result.message);

      form.reset();
    } else if (result.status === 409) {
      toast.warning(result.message);
    } else if (result.status === 500) {
      toast.error(result.message);
    }

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid md:grid-cols-2 items-start gap-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter your name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='bodyWeight'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Weight</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter body weight'
                    {...field}
                    value={String(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='age'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter your age'
                    {...field}
                    value={String(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='height'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter your height'
                    {...field}
                    value={String(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='fitnessGoal'
            render={({ fieldState }) => (
              <FormItem>
                <FormLabel>Fitness Goal</FormLabel>
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger
                      asChild
                      className={fieldState.error && 'border-red-500'}
                    >
                      <Button
                        variant='outline'
                        role='combobox'
                        aria-expanded={open}
                        className='justify-between'
                      >
                        {form.watch('fitnessGoal')
                          ? fitnessGoals.find(
                              goal => goal.value === form.watch('fitnessGoal')
                            )?.label
                          : 'Choose you goal'}
                        <ChevronsUpDown className='opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='md:w-[250px] p-0'>
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {fitnessGoals.map(goal => (
                              <CommandItem
                                key={goal.value}
                                value={goal.value}
                                onSelect={currentValue => {
                                  form.setValue(
                                    'fitnessGoal',
                                    currentValue === form.watch('fitnessGoal')
                                      ? ''
                                      : currentValue
                                  );
                                  setOpen(false);
                                }}
                              >
                                {goal.label}
                                <Check
                                  className={cn(
                                    'ml-auto',
                                    form.watch('fitnessGoal') === goal.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' disabled={isLoading} className='mt-5.5 w-full'>
            {isLoading ? <Loader className='animate-spin' /> : 'Update Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
