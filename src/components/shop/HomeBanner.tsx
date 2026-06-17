'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Phone } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  bgColor: string;
  textColor: string;
  badgeColor: string;
}

export function HomeBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 1,
      badge: '১০% বিশেষ ছাড়',
      title: 'সুন্দরবনের খাঁটি প্রাকৃতিক মধু',
      subtitle: 'Sundarban Raw Wild Honey',
      description: 'সরাসরি সুন্দরবনের চাক থেকে সংগৃহীত ১০০% বিশুদ্ধ এবং অপরিশোধিত মধু। প্রাকৃতিক পুষ্টি ও ঔষধি গুণে ভরপুর।',
      buttonText: 'মধু সংগ্রহ করুন',
      buttonLink: '/shop?category=honey',
      imageUrl: '/honey_banner.png',
      bgColor: 'bg-[#faf5e6]',
      textColor: 'text-amber-700',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200/50',
    },
    {
      id: 2,
      badge: 'প্রিমিয়াম কোয়ালিটি',
      title: 'ঐতিহ্যবাহী বিলোনা ঘি',
      subtitle: 'Premium Hand-Churned Cow Ghee',
      description: 'ঘাসের খাওয়ানো গরুর খাঁটি দুধের সর থেকে ঐতিহ্যবাহী বিলোনা পদ্ধতিতে তৈরি সুগন্ধি দানাদার প্রিমিয়াম ঘি।',
      buttonText: 'ঘি অর্ডার করুন',
      buttonLink: '/shop?category=ghee',
      imageUrl: '/ghee_banner.png',
      bgColor: 'bg-[#edf7f1]',
      textColor: 'text-emerald-700',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200/50',
    },
    {
      id: 3,
      badge: 'নতুন কালেকশন',
      title: 'ভেজালমুক্ত হাতে তৈরি মসলা',
      subtitle: '100% Pure Native Spices',
      description: 'কোনো কৃত্রিম রঙ বা প্রিজারভেটিভ ছাড়া সম্পূর্ণ প্রাকৃতিক উপায়ে ঘরে ভাঙানো হলুদ, মরিচ ও ধনিয়া গুড়া।',
      buttonText: 'মসলা দেখুন',
      buttonLink: '/shop?category=spices',
      imageUrl: '/spices_banner.png',
      bgColor: 'bg-[#fef4eb]',
      textColor: 'text-orange-700',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200/50',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full aspect-[21/9] min-h-[340px] md:min-h-[420px] rounded-3xl overflow-hidden border border-neutral-100 shadow-sm group">
      {/* Slides mapping */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 grid grid-cols-1 md:grid-cols-12 ${
            slide.bgColor
          } ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Left Text details column */}
          <div className="md:col-span-7 flex flex-col justify-center p-6 md:p-12 space-y-3 md:space-y-5 text-left z-20">
            <span className={`inline-block self-start px-3 py-1.5 rounded-full border text-[10px] md:text-xs font-bold ${slide.badgeColor} uppercase tracking-wider`}>
              {slide.badge}
            </span>
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-neutral-800 leading-tight">
                {slide.title}
              </h2>
              <p className="text-xs md:text-sm font-semibold text-neutral-500">
                {slide.subtitle}
              </p>
            </div>
            <p className="text-xs md:text-sm text-neutral-600 max-w-lg leading-relaxed line-clamp-2 md:line-clamp-none">
              {slide.description}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href={slide.buttonLink}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 md:px-6 py-2.5 md:py-3.5 text-xs md:text-sm font-bold text-white hover:bg-emerald-500 transition-all duration-300 shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                {slide.buttonText}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:01810000000"
                className="flex items-center gap-2 rounded-xl bg-white border border-neutral-200 px-5 md:px-6 py-2.5 md:py-3.5 text-xs md:text-sm font-bold text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <Phone className="h-4 w-4 text-emerald-600" />
                ফোনে অর্ডার: ০১৮১০০০০০০০
              </a>
            </div>
          </div>

          {/* Right Sourced Image Column */}
          <div className="hidden md:block md:col-span-5 relative h-full w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 pointer-events-none z-10" />
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="30vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        </div>
      ))}

      {/* Slide Nav Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/95 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-all hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-xs"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/95 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-all hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-xs"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 transition-all rounded-full cursor-pointer ${
              index === currentSlide ? 'w-6 bg-emerald-600' : 'w-1.5 bg-neutral-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

