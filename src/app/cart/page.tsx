'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Trash2, Plus, Minus, ArrowRight, Ticket, Loader2 } from 'lucide-react';

interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartTotalWeight } = useCart();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', code: couponCode, cartTotal }),
      });

      const data = await response.json();

      if (response.ok) {
        setAppliedCoupon(data.coupon);
        // Persist coupon code to sessionStorage for Checkout page usage
        sessionStorage.setItem('applied_coupon_code', data.coupon.code);
        toast(`Coupon ${data.coupon.code} applied successfully!`, 'success');
      } else {
        toast(data.message || 'Invalid coupon code', 'error');
        setAppliedCoupon(null);
        sessionStorage.removeItem('applied_coupon_code');
      }
    } catch {
      toast('Failed to validate coupon', 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    sessionStorage.removeItem('applied_coupon_code');
    toast('Coupon removed', 'info');
  };

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? Math.round((cartTotal * appliedCoupon.discountValue) / 100)
      : appliedCoupon.discountValue
    : 0;

  const totalAmount = cartTotal - discountAmount;

  if (cart.length === 0) {
    return (
      <div className="bg-mesh min-h-screen py-32 px-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Your Shopping Cart is Empty</h1>
        <p className="text-neutral-400 text-sm mb-8 max-w-sm">
          Looks like you haven&apos;t added anything to your cart yet. Explore our premium catalog to
          get started.
        </p>
        <Link
          href="/shop"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg cursor-pointer"
        >
          Go to Shop
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-mesh min-h-screen py-16 px-6 max-w-7xl mx-auto w-full flex-1">
      <h1 className="text-3xl font-extrabold text-white mb-12">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => {
            const hasDiscount = item.product.discountPrice > 0;
            const price = hasDiscount ? item.product.discountPrice : item.product.price;
            return (
              <div
                key={item.product._id}
                className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl glass-card w-full"
              >
                {/* Image */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-900 border border-white/5">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">
                    {item.product.category}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-white leading-tight">
                    {item.product.title}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap gap-2 items-center justify-center sm:justify-start">
                    <span className="text-xs text-neutral-400 font-semibold">
                      BDT {price.toLocaleString()} each
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] bg-neutral-900 border border-white/5 px-2 py-0.5 rounded-md text-neutral-400 font-bold">
                      ⚖️ {item.product.weight} {item.product.unit}
                    </span>
                  </div>
                </div>

                {/* Quantity selection & actions */}
                <div className="flex items-center gap-6 justify-between w-full sm:w-auto">
                  <div className="flex items-center rounded-lg bg-neutral-900 border border-white/5 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-white w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-sm font-extrabold text-white w-24 text-right">
                    BDT {(price * item.quantity).toLocaleString()}
                  </p>

                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 transition-all cursor-pointer animate-fade-in"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="rounded-2xl glass-card p-6 space-y-6">
          <h2 className="text-lg font-bold text-white">Order Summary</h2>

          {/* Subtotal */}
          <div className="flex justify-between text-sm py-3 border-b border-white/5">
            <span className="text-neutral-400">Subtotal</span>
            <span className="font-bold text-white">BDT {cartTotal.toLocaleString()}</span>
          </div>

          {/* Coupon Code Input */}
          <div className="space-y-3 pt-3">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5" />
              Promo Coupon
            </span>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400">
                <span className="font-bold">{appliedCoupon.code} Applied</span>
                <button
                  onClick={handleRemoveCoupon}
                  className="font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/5 text-xs text-white uppercase placeholder-neutral-500 focus:outline-none focus:border-emerald-500/30"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 transition-colors cursor-pointer flex items-center justify-center min-w-[70px]"
                >
                  {validatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
                </button>
              </div>
            )}
          </div>

          {/* Calculations */}
          <div className="space-y-3 pt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Total Weight</span>
              <span className="font-semibold text-white">{(cartTotalWeight / 1000).toFixed(2)} kg</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between">
                <span className="text-neutral-400">
                  Discount ({appliedCoupon.discountValue}
                  {appliedCoupon.discountType === 'percentage' ? '%' : ' BDT'})
                </span>
                <span className="text-emerald-400">- BDT {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-400">Shipping</span>
              <span className="text-neutral-500 font-medium">Calculated at Checkout</span>
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-baseline pt-6 border-t border-white/5">
            <span className="text-sm font-medium text-white">Estimated Total</span>
            <span className="text-xl font-extrabold text-white">
              BDT {totalAmount.toLocaleString()}
            </span>
          </div>

          {/* Checkout button */}
          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-sm font-semibold text-white transition-all shadow-xl shadow-emerald-600/10 cursor-pointer"
          >
            Proceed to Checkout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
