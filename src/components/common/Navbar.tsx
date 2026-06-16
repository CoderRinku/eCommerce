'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/providers/CartProvider';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingBag, LogOut, Shield, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const isActive = (path: string) => pathname === path;

  // Don't show public navbar in admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-neutral-950/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-xl font-bold tracking-tight text-transparent group-hover:opacity-90 transition-opacity">
                ELITE D2C
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-indigo-400' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`text-sm font-medium transition-colors ${
                isActive('/shop') ? 'text-indigo-400' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Shop
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Session status */}
            {session ? (
              <div className="flex items-center gap-3">
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    title="Admin Panel"
                    className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <Shield className="h-5 w-5" />
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  title="My Dashboard"
                  className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-white/90">{session.user.name}</p>
                  <p className="text-[10px] text-neutral-500 capitalize">{session.user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
