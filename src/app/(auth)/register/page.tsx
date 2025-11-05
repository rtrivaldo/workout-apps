'use client';

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
import { registerSchema } from '@/lib/schemas/register-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { toast } from 'sonner';
import { Check, ChevronsUpDown, Loader } from 'lucide-react';
import { registerUser } from '@/actions/auth/register';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { fitnessGoals } from '@/app/types/fitnessGoal';

type LoginFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      age: '',
      username: '',
      password: '',
      bodyWeight: '',
      height: '',
      fitnessGoal: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const result = await registerUser(formData);

    if (result.status === 201 && result.success) {
      toast.success(result.message);

      form.reset();

      router.push('/login');
    } else if (result.status === 409) {
      toast.warning(result.message);
    } else if (result.status === 500) {
      toast.error(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className='container mx-auto py-10 flex flex-col justify-center items-center min-h-screen'>
      <h1 className='text-5xl font-black'>FitTrack</h1>
      <div className='mt-8 w-full max-w-[600px] md:w-[600px] px-10 py-8 rounded-2xl bg-[#F4F6F6]'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <h2 className='font-semibold text-lg'>Create Account</h2>
              <p className='mt-2 text-[#A9A9A9] leading-tight'>
                Start your fitness journey today
              </p>
            </div>

            <div className='my-4 grid md:grid-cols-2 items-start gap-6'>
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
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter username' {...field} />
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

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter password'
                        type='password'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                disabled={isLoading}
                className='mt-5.5 w-full'
              >
                {isLoading ? <Loader className='animate-spin' /> : 'Sign In'}
              </Button>
            </div>
          </form>
        </Form>

        <p className='mt-6 text-sm text-right'>
          Already have an account?{' '}
          <Link href='/login' className='underline underline-offset-2'>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
