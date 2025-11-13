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
import { loginSchema } from '@/lib/schemas/login-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { login } from '@/actions/auth/login';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isView, setIsView] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await login(formData);

    if (result.status === 200 && result.success) {
      toast.success(result.message);

      form.reset();

      router.push('/');
    } else if (result.status === 401) {
      toast.warning(result.message);
    } else {
      toast.error(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className='flex flex-col justify-center items-center min-h-screen container mx-auto'>
      <h1 className='text-5xl font-black'>FitTrack</h1>
      <div className='mt-8 w-full max-w-[400px] md:w-[400px] px-10 py-8 rounded-2xl bg-[#F4F6F6]'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <h2 className='font-semibold text-lg'>Welcome!</h2>
              <p className='mt-2 text-[#A9A9A9] leading-tight'>
                Enter your credentials to access your workout dashboard
              </p>
            </div>

            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder='Username' {...field} />
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
                    <div className='relative'>
                      <Input
                        type={isView ? 'text' : 'password'}
                        placeholder='Password'
                        {...field}
                      />
                      {isView ? (
                        <Eye
                          className='size-4 absolute right-3 top-2.75 z-10 cursor-pointer text-gray-500'
                          onClick={() => {
                            setIsView(!isView), console.log(isView);
                          }}
                        />
                      ) : (
                        <EyeOff
                          className='size-4 absolute right-3 top-2.75 z-10 cursor-pointer text-gray-500'
                          onClick={() => setIsView(!isView)}
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={isLoading} className='w-full'>
              {isLoading ? <Loader className='animate-spin' /> : 'Sign In'}
            </Button>
          </form>
        </Form>

        <p className='mt-6 text-sm text-center'>
          Don't have an account yet?{' '}
          <Link href='/register' className='underline underline-offset-2'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
