'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AdminSidebar } from '@/components/common/AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-neutral-400">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated' && session.user.role === 'admin') {
    return (
      <div className="flex min-h-screen bg-neutral-950 text-white font-sans">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto max-h-screen">{children}</main>
      </div>
    );
  }

  return null;
}
