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
import { Check, ChevronsUpDown, Info, Loader } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from './ui/command';
import { fitnessGoals } from '@/app/types/fitnessGoal';
import { cn } from '@/lib/utils';
import { updateProfileSchema } from '@/lib/schemas/update-profile-schema';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { updateUserData } from '@/actions/auth/profile';
import { ActivityLevel, FitnessGoal, Gender, User } from '@prisma/client';
import { genders } from '@/app/types/gender';
import { activityLevels } from '@/app/types/activityLevel';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export default function UpdateProfileForm({ user }: { user: User }) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [openFitnessGoal, setOpenFitnessGoal] = useState(false);
  const [openGender, setOpenGender] = useState(false);
  const [openActivityLevel, setOpenActivityLevel] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(updateProfileSchema) as any,
    defaultValues: {
      name: user.name || '',
      age: user.age || '',
      gender: user.gender || undefined,
      bodyWeight: user.bodyWeight || '',
      height: user.height || '',
      fitnessGoal: user.fitnessGoal,
      activityLevel: user.activityLevel || undefined,
      targetWeight: user.targetWeight || '',
    },
  });

  const fitnessGoal = form.watch('fitnessGoal');
  const requiresTargetWeight = fitnessGoal !== 'MAINTAIN_WEIGHT';

  const onSubmit = async (data: any) => {
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(key, String(value));
    });

    const result = await updateUserData(formData, user.id);

    if (result.status === 201 && result.success) {
      toast.success(result.message);

      router.refresh();
    } else if (result.status === 409) {
      toast.warning(result.message);
    } else if (result.status === 500) {
      toast.error(result.message);
    }

    setIsLoading(false);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='space-y-6'>
            <div className='grid gap-6 md:grid-cols-2'>
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
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='gender'
                render={({ fieldState }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Popover open={openGender} onOpenChange={setOpenGender}>
                        <PopoverTrigger
                          asChild
                          className={fieldState.error && 'border-red-500'}
                        >
                          <Button
                            variant='outline'
                            role='combobox'
                            aria-expanded={openGender}
                            className='justify-between'
                          >
                            {form.watch('gender')
                              ? genders.find(
                                  g => g.value === form.watch('gender')
                                )?.label
                              : 'Select your gender'}
                            <ChevronsUpDown className='opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='md:w-[250px] p-0'>
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                {genders.map(gender => (
                                  <CommandItem
                                    key={gender.value}
                                    value={gender.value}
                                    onSelect={currentValue => {
                                      form.setValue(
                                        'gender',
                                        currentValue === form.watch('gender')
                                          ? undefined!
                                          : (currentValue as Gender)
                                      );
                                      setOpenGender(false);
                                    }}
                                  >
                                    {gender.label}
                                    <Check
                                      className={cn(
                                        'ml-auto',
                                        form.watch('gender') === gender.value
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

              <FormField
                control={form.control}
                name='activityLevel'
                render={({ fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      <span className='inline-flex items-center gap-1'>
                        Activity Level
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className='h-4 w-4 text-neutral-400' />
                          </TooltipTrigger>
                          <TooltipContent className='text-xs'>
                            Include daily movement plus workouts to pick the
                            closest match.
                          </TooltipContent>
                        </Tooltip>
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Popover
                        open={openActivityLevel}
                        onOpenChange={setOpenActivityLevel}
                      >
                        <PopoverTrigger
                          asChild
                          className={fieldState.error && 'border-red-500'}
                        >
                          <Button
                            variant='outline'
                            role='combobox'
                            aria-expanded={openActivityLevel}
                            className='justify-between'
                          >
                            {form.watch('activityLevel')
                              ? activityLevels.find(
                                level =>
                                  level.value === form.watch('activityLevel')
                              )?.label
                              : 'Choose you activity level'}
                            <ChevronsUpDown className='opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='md:w-[250px] p-0'>
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                {activityLevels.map(level => (
                                  <CommandItem
                                    key={level.value}
                                    value={level.value}
                                    onSelect={currentValue => {
                                      form.setValue(
                                        'activityLevel',
                                        currentValue ===
                                          form.watch('activityLevel')
                                          ? undefined!
                                          : (currentValue as ActivityLevel)
                                      );
                                      setOpenActivityLevel(false);
                                    }}
                                  >
                                    {level.label}
                                    <Check
                                      className={cn(
                                        'ml-auto',
                                        form.watch('activityLevel') ===
                                          level.value
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
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='height'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className='inline-flex items-center gap-1'>
                        Height
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className='h-4 w-4 text-neutral-400' />
                          </TooltipTrigger>
                          <TooltipContent className='text-xs'>
                            Use centimeters (cm).
                          </TooltipContent>
                        </Tooltip>
                      </span>
                    </FormLabel>
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
                name='bodyWeight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className='inline-flex items-center gap-1'>
                        Body Weight
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className='h-4 w-4 text-neutral-400' />
                          </TooltipTrigger>
                          <TooltipContent className='text-xs'>
                            Use kilograms (kg).
                          </TooltipContent>
                        </Tooltip>
                      </span>
                    </FormLabel>
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
            </div>

            <div className='grid gap-6'>
              <FormField
                control={form.control}
                name='fitnessGoal'
                render={({ fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      <span className='inline-flex items-center gap-1'>
                        Fitness Goal
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className='h-4 w-4 text-neutral-400' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-xs text-xs'>
                            Choose lose or gain if you want to specify a target
                            weight. Maintain keeps your goal equal to your
                            current weight.
                          </TooltipContent>
                        </Tooltip>
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Popover
                        open={openFitnessGoal}
                        onOpenChange={setOpenFitnessGoal}
                      >
                        <PopoverTrigger
                          asChild
                          className={fieldState.error && 'border-red-500'}
                        >
                          <Button
                            variant='outline'
                            role='combobox'
                            aria-expanded={openFitnessGoal}
                            className='justify-between'
                          >
                            {form.watch('fitnessGoal')
                              ? fitnessGoals.find(
                                  goal =>
                                    goal.value === form.watch('fitnessGoal')
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
                                        currentValue ===
                                          form.watch('fitnessGoal')
                                          ? undefined!
                                          : (currentValue as FitnessGoal)
                                      );
                                      setOpenFitnessGoal(false);
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

              <div className='space-y-2 rounded-lg border border-dashed border-neutral-200 p-4 text-sm text-neutral-600'>
                <p className='font-medium text-neutral-800'>Target Weight</p>
                {requiresTargetWeight ? (
                  <>
                    <p>
                      {fitnessGoal === 'LOSE_WEIGHT'
                        ? 'Pick a number lower than your current weight (in kilograms) so we can plan a safe calorie deficit.'
                        : 'Pick a number higher than your current weight (in kilograms) to help us plan a surplus.'}
                    </p>
                    <FormField
                      control={form.control}
                      name='targetWeight'
                      render={({ field }) => (
                        <FormItem className='mt-2'>
                          <FormControl>
                            <Input
                              type='number'
                              step='0.1'
                              min='30'
                              max='300'
                              placeholder='Enter target weight'
                              {...field}
                              value={
                                field.value === undefined
                                  ? ''
                                  : String(field.value)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <p>
                    Maintaining goal uses your current weight as the target.
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button type='submit' disabled={isLoading} className='mt-5.5 w-full'>
            {isLoading ? <Loader className='animate-spin' /> : 'Update Profile'}
          </Button>
        </form>
      </Form>
    </TooltipProvider>
  );
}
