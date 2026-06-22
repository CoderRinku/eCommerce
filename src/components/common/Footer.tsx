'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  MapPin, 
  Mail, 
  PhoneCall, 
  ShieldCheck, 
  Truck, 
  Clock, 
  CreditCard 
} from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Don't show public footer in admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white pt-16 pb-12 relative overflow-hidden">
      {/* Background soft blob for organic feel */}
      <div className="absolute bottom-0 left-0 h-[250px] w-[250px] rounded-full bg-orange-500/5 blur-[80px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Brand Info & Socials */}
          <div className="space-y-5">
            <Link href="/" className="inline-block">
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-xl font-black tracking-tight text-transparent flex items-center gap-1.5">
                🍃 SokolBazar
              </span>
            </Link>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
              সকলবাজার একটি প্রিমিয়াম অর্গানিক ফুড প্ল্যাটফর্ম। আমরা শতভাগ কেমিক্যালমুক্ত, নিরাপদ ও সুস্বাদু খাবার (যেমন মধু, ঘি, খাঁটি মসলা, বাদাম ও ঐতিহ্যবাহী খাবার) সরাসরি চাষীদের কাছ থেকে সংগ্রহ করে আপনার দোরগোড়ায় পৌঁছে দেই।
            </p>
            
            {/* Social Icons with micro-interactions */}
            <div className="flex items-center gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Facebook Page"
                className="h-8 w-8 rounded-xl bg-orange-50 hover:bg-orange-600 border border-orange-100 hover:border-orange-600 text-orange-600 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-600/15"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Youtube Channel"
                className="h-8 w-8 rounded-xl bg-orange-50 hover:bg-orange-600 border border-orange-100 hover:border-orange-600 text-orange-600 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-600/15"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram Account"
                className="h-8 w-8 rounded-xl bg-orange-50 hover:bg-orange-600 border border-orange-100 hover:border-orange-600 text-orange-600 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-600/15"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 tracking-wider relative inline-block pb-1">
              নেভিগেশন (Links)
              <span className="absolute bottom-0 left-0 h-[2px] w-8 bg-orange-500 rounded" />
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-xs text-neutral-500 hover:text-orange-600 hover:pl-1 transition-all duration-300 font-bold block">
                  হোম পেজ (Home)
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-xs text-neutral-500 hover:text-orange-600 hover:pl-1 transition-all duration-300 font-bold block">
                  সব প্রোডাক্ট (Catalog)
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-xs text-neutral-500 hover:text-orange-600 hover:pl-1 transition-all duration-300 font-bold block">
                  শপিং কার্ট (Cart)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-xs text-neutral-500 hover:text-orange-600 hover:pl-1 transition-all duration-300 font-bold block">
                  আমার ড্যাশবোর্ড (Dashboard)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contacts & Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 tracking-wider relative inline-block pb-1">
              যোগাযোগ ও ঠিকানা
              <span className="absolute bottom-0 left-0 h-[2px] w-8 bg-orange-500 rounded" />
            </h3>
            <ul className="space-y-3 text-xs text-neutral-550">
              <li className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-orange-550 text-orange-600 shrink-0 mt-0.5" />
                <span className="text-neutral-600 leading-relaxed font-semibold">
                  মিরপুর, ঢাকা, বাংলাদেশ
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-orange-550 text-orange-600 shrink-0" />
                <a href="mailto:support@sokolbazar.com" className="hover:text-orange-600 font-bold text-neutral-600 transition-colors">
                  support@sokolbazar.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <PhoneCall className="h-4.5 w-4.5 text-orange-550 text-orange-600 shrink-0" />
                <a href="tel:01810000000" className="hover:text-orange-600 font-extrabold text-neutral-650 text-neutral-800 transition-colors">
                  ০১৮১-০০০০০০০ (সাপোর্ট)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Local Badges */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 tracking-wider relative inline-block pb-1">
              আমাদের পার্টনারসমূহ
              <span className="absolute bottom-0 left-0 h-[2px] w-8 bg-orange-500 rounded" />
            </h3>
            
            {/* Payment & courier trust highlights */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <Truck className="h-4 w-4 text-orange-600 shrink-0" />
                <div className="text-[10px]">
                  <p className="font-bold text-neutral-700 leading-none">ডেলিভারি পার্টনার</p>
                  <p className="text-neutral-500 mt-0.5 text-[9px]">Steadfast Courier API Integration</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <CreditCard className="h-4 w-4 text-orange-600 shrink-0" />
                <div className="text-[10px]">
                  <p className="font-bold text-neutral-700 leading-none">পেমেন্ট মেথড</p>
                  <p className="text-neutral-500 mt-0.5 text-[9px]">বিকাশ / নগদ / ক্যাশ অন ডেলিভারি</p>
                </div>
              </div>
            </div>

            {/* Custom Local Logo Badges Container */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2 py-1 rounded bg-rose-50 border border-rose-100 text-rose-600 text-[9px] font-black tracking-wide uppercase">
                bKash
              </span>
              <span className="px-2 py-1 rounded bg-orange-50 border border-orange-100 text-orange-600 text-[9px] font-black tracking-wide uppercase">
                Nagad
              </span>
              <span className="px-2 py-1 rounded bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-black tracking-wide uppercase">
                COD
              </span>
              <span className="px-2 py-1 rounded bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-black tracking-wide uppercase">
                Steadfast
              </span>
            </div>
          </div>
          
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-neutral-150 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-neutral-400 font-medium">
            &copy; {new Date().getFullYear()} SokolBazar. সর্বস্বত্ব সংরক্ষিত। 
          </p>
          <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-semibold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
              ১০০% সিকিউর চেকআউট
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
              ২৪/৭ কাস্টমার সাপোর্ট
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

