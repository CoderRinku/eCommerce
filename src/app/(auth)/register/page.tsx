'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useToast } from '@/components/providers/ToastProvider';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Inside Dhaka');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          address,
          district,
          city: district,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast('Registration successful! Logging in...', 'success');

        // Sign in immediately to avoid prompting another login form
        const loginResult = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (loginResult?.error) {
          toast(loginResult.error, 'error');
          router.push('/login');
        } else {
          router.push('/');
        }
      } else {
        toast(data.message || 'Registration failed', 'error');
      }
    } catch {
      toast('An error occurred during registration', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen flex items-center justify-center py-16 px-6 flex-1">
      <div className="w-full max-w-lg rounded-2xl glass-card p-8 space-y-8 animate-slide-in shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-neutral-850 text-neutral-800">Create Account</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Join SokolBazar for pure organic groceries
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-500/50 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-500/50 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-500/50 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="tel"
                  placeholder="e.g. 01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-500/50 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-orange-500/50 cursor-pointer shadow-sm"
              >
                <option value="Inside Dhaka">Inside Dhaka</option>
                <option value="Outside Dhaka">Outside Dhaka</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase">
                Detailed Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="House, Road, Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-500/50 shadow-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-250 disabled:text-neutral-400 py-3.5 text-sm font-bold text-white transition-all shadow-xl shadow-orange-600/10 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500 font-medium">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-orange-600 font-semibold hover:text-orange-500 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
