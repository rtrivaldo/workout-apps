'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Dumbbell, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50'></div>

      {/* Decorative elements */}
      <div className='absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl'></div>
      <div className='absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-emerald-200/30 rounded-full blur-3xl'></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='w-full max-w-md relative z-10'
      >
        {/* Login Card */}
        <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50'>
          {/* Logo and Title */}
          <div className='text-center mb-8'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg'
            >
              <Dumbbell className='w-8 h-8 text-white' />
            </motion.div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2'>
              FitTrackr
            </h1>
            <p className='text-sm text-gray-600 italic'>
              "Progress starts with consistency"
            </p>
          </div>

          {/* Login Form */}
          <form className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-gray-700 font-medium'>
                Email Address
              </Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                <Input
                  id='email'
                  type='email'
                  placeholder='your.email@example.com'
                  className='pl-10 h-12 bg-white border-gray-300 focus:border-emerald-500 rounded-xl transition-all duration-200'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password' className='text-gray-700 font-medium'>
                Password
              </Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                <Input
                  id='password'
                  type='password'
                  placeholder='Enter your password'
                  className='pl-10 h-12 bg-white border-gray-300 focus:border-emerald-500 rounded-xl transition-all duration-200'
                />
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <Checkbox id='remember' className='border-gray-300' />
                <label
                  htmlFor='remember'
                  className='text-sm text-gray-600 cursor-pointer'
                >
                  Remember me
                </label>
              </div>
              <Link
                href='/forgot-password'
                className='text-sm text-emerald-600 hover:text-emerald-700 transition-colors duration-200'
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type='submit'
              className='w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg'
            >
              Sign In
            </Button>
          </form>

          {/* Register Link */}
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Don't have an account?{' '}
              <Link
                href='/register'
                className='text-emerald-600 font-semibold hover:text-emerald-700 transition-colors duration-200'
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
