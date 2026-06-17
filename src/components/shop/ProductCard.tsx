'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { ShoppingBag, ArrowRight, Leaf, Star } from 'lucide-react';

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice: number;
    images: string[];
    category: any;
    stock: number;
    isOrganic: boolean;
    weight: number;
    unit: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const hasDiscount = product.discountPrice > 0;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;
  const isOutOfStock = product.stock <= 0;

  const catName = typeof product.category === 'object' && product.category 
    ? product.category.name 
    : (product.category || 'Organic Food');

  const cartProduct = {
    _id: product._id,
    title: product.title,
    slug: product.slug,
    price: product.price,
    discountPrice: product.discountPrice,
    images: product.images,
    stock: product.stock,
    category: typeof product.category === 'object' && product.category ? product.category.name : String(product.category),
    weight: product.weight,
    unit: product.unit,
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) {
      toast('Product is out of stock', 'error');
      return;
    }
    addToCart(cartProduct, 1);
    toast(`${product.title} added to cart!`, 'success');
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) {
      toast('Product is out of stock', 'error');
      return;
    }
    // Add to cart and redirect directly to checkout
    addToCart(cartProduct, 1);
    router.push('/checkout');
  };

  // English to Bangla number mapping for local aesthetics
  const toBanglaNum = (num: number) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (w) => banglaDigits[Number(w)]);
  };

  return (
    <div className="group relative flex flex-col rounded-3xl glass-card-premium p-4.5">
      {/* Product Image Section */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-900/50 border border-white/5 block">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-w-768px) 100vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-106"
        />
        
        {/* badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isOrganic && (
            <span className="px-2.5 py-1 rounded-lg bg-orange-600/90 text-[9px] font-bold text-white shadow-md flex items-center gap-0.5 backdrop-blur-xs uppercase tracking-wider">
              <Leaf className="h-2.5 w-2.5" />
              100% Pure
            </span>
          )}
        </div>

        {hasDiscount && (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-amber-500 text-[9px] font-bold text-white shadow-md z-10 font-sans tracking-wide">
            {toBanglaNum(Math.round(((product.price - product.discountPrice) / product.price) * 100))}% ছাড়
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs rounded-2xl z-20">
            <span className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs font-bold text-neutral-400 tracking-wider uppercase">
              স্টক শেষ (Out of Stock)
            </span>
          </div>
        )}
      </Link>

      {/* Product Info Section */}
      <div className="mt-4.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Weight */}
          <div className="flex items-center justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
            <span>{catName}</span>
            <span className="bg-neutral-900/60 px-2.5 py-0.5 rounded-md border border-white/5">
              {toBanglaNum(product.weight)} {product.unit === 'g' ? 'গ্রাম' : product.unit === 'kg' ? 'কেজি' : product.unit === 'ml' ? 'মিলি' : product.unit === 'litre' ? 'লিটার' : 'পিস'}
            </span>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block mt-2">
            <h3 className="text-sm font-extrabold text-neutral-800 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors duration-300">
              {product.title}
            </h3>
          </Link>

          {/* Review Score Mockup */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="h-3 w-3 fill-amber-400" />
            </div>
            <span className="text-[10px] text-neutral-500 font-bold">৪.৯ ({toBanglaNum(45)} রিভিউ)</span>
          </div>
        </div>

        <div>
          {/* Price Block */}
          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <span className="text-base font-black text-orange-600">
                  ৳ {toBanglaNum(product.discountPrice)}
                </span>
                <span className="text-xs text-neutral-500 line-through">
                  ৳ {toBanglaNum(product.price)}
                </span>
              </>
            ) : (
              <span className="text-base font-black text-neutral-800">
                ৳ {toBanglaNum(product.price)}
              </span>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleOrderNow}
              disabled={isOutOfStock}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-800 disabled:text-neutral-500 py-3 text-xs font-bold text-white transition-all glow-button-orange cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              অর্ডার করুন (Order Now)
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full flex items-center justify-center gap-1 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 disabled:bg-neutral-800 disabled:text-neutral-500 py-2.5 text-[11px] font-bold text-neutral-300 hover:text-white transition-all active:scale-[0.98] cursor-pointer"
            >
              কার্টে যোগ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
