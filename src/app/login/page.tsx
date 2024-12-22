'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuthContext();
  const { 
    login: privyLogin, 
    authenticated,
    ready 
  } = usePrivy();
  const router = useRouter();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (authenticated && ready) {
      router.push('/users');
    }
  }, [authenticated, ready, router]);

  const onSubmit = async (data: any) => {
    try {
      await login({ ...data, strategy: 'local' });
      toast.success('Logged in successfully');
      router.push('/users');
    } catch (error) {
      toast.error('Failed to login');
    }
  };

  const handlePrivyLogin = async () => {
    try {
      await privyLogin();
      // The useEffect above will handle redirection once authenticated
    } catch (error) {
      console.error('Privy login error:', error);
      toast.error('Failed to login with Privy');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>

        {/* Privy Login Button */}
        <div>
          <button
            onClick={handlePrivyLogin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Connect with Wallet
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Traditional Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                {...register('email')}
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                {...register('password')}
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in with Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 