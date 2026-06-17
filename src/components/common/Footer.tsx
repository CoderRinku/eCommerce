'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  // Don't show public footer in admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-white/5 bg-neutral-950/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
              🍃 SokolBazar
            </span>
            <p className="text-sm text-neutral-400 max-w-xs">
              SokolBazar is a premium D2C organic food platform offering 100% chemical-free, pure honey, ghee, spices, nuts, and traditional foods.
            </p>
          </div>

          {/* Links Grid */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider">Navigation</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-sm text-neutral-400 hover:text-white transition-colors">
                    Shop Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="text-sm text-neutral-400 hover:text-white transition-colors">
                    Shopping Cart
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider">Customer Care</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">
                    Track Order
                  </Link>
                </li>
                <li className="text-sm text-neutral-400">
                  Dhaka, Bangladesh
                </li>
                <li className="text-sm text-neutral-400">
                  support@sokolbazar.com
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright block */}
        <div className="mt-12 border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} SokolBazar. All rights reserved.
          </p>
          <p className="text-xs text-neutral-500">
            Made with Next.js, Mongoose & Steadfast Courier API.
          </p>
        </div>
      </div>
    </footer>
  );
}
