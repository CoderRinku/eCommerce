'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import Link from 'next/link';
import { Loader2, Lock, Mail } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please fill in all credentials', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast(result.error, 'error');
      } else {
        toast('Logged in successfully', 'success');
        router.push(callbackUrl);
      }
    } catch {
      toast('An unexpected error occurred during login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl glass-card p-8 space-y-8 animate-slide-in shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-neutral-800">Sign In</h1>
        <p className="mt-2 text-sm text-neutral-500">Welcome back to SokolBazar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-500/50 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-500/50 shadow-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-200 disabled:text-neutral-400 py-3.5 text-sm font-bold text-white transition-all shadow-xl shadow-orange-600/10 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-neutral-500 font-medium">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-orange-600 font-semibold hover:text-orange-500 transition-colors"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-mesh min-h-screen flex items-center justify-center py-16 px-6 flex-1">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            <p className="text-sm text-neutral-500">Loading sign in...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
