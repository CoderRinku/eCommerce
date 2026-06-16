'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Tag, Package, Home } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-64 border-r border-white/5 bg-neutral-900/50 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-lg font-bold tracking-tight text-transparent">
            ELITE ADMIN
          </span>
        </Link>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/25'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Storefront return link */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-neutral-800 text-neutral-300 text-sm font-medium hover:text-white hover:bg-neutral-700 transition-colors border border-white/5"
        >
          <Home className="h-4 w-4" />
          Storefront
        </Link>
      </div>
    </aside>
  );
}
