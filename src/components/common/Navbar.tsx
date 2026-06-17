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
  
  React.useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const isActive = (path: string) => pathname === path;

  // Don't show public navbar in admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 font-black text-xs tracking-tighter transition-all group-hover:scale-105 group-hover:shadow-emerald-500/35">
                SB
              </span>
              <span className="text-base font-black tracking-tight text-neutral-800 transition-colors duration-300">
                Sokol<span className="text-emerald-500 font-extrabold">Bazar</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-xs uppercase tracking-wider font-bold transition-all relative py-1.5 hover:text-emerald-500 ${
                isActive('/') 
                  ? 'text-emerald-500 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-emerald-500' 
                  : 'text-neutral-500 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-500/40 hover:after:w-full after:transition-all after:duration-300'
              }`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`text-xs uppercase tracking-wider font-bold transition-all relative py-1.5 hover:text-emerald-500 ${
                isActive('/shop') 
                  ? 'text-emerald-500 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-emerald-500' 
                  : 'text-neutral-500 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-500/40 hover:after:w-full after:transition-all after:duration-300'
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
              className="relative p-2 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
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
                    className="p-2 text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <Shield className="h-5 w-5" />
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  title="My Dashboard"
                  className="p-2 text-neutral-550 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-neutral-800">{session.user.name}</p>
                  <p className="text-[10px] text-neutral-500 capitalize">{session.user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
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
