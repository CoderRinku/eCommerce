'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { ShieldCheck, Truck, Loader2, CreditCard } from 'lucide-react';
import { calculateShippingCharge } from '@/lib/shipping';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart, cartTotal, cartTotalWeight, clearCart } = useCart();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Inside Dhaka');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bKash' | 'Nagad'>('COD');

  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);



  // Load name from session when available
  useEffect(() => {
    if (session?.user?.name && name === '') {
      setTimeout(() => {
        setName(session.user.name || '');
      }, 0);
    }
  }, [session, name]);

  // Load coupon from session storage and query API to verify details
  useEffect(() => {
    const savedCoupon = sessionStorage.getItem('applied_coupon_code');
    if (savedCoupon && cartTotal > 0 && couponCode === '') {
      setTimeout(() => {
        setCouponCode(savedCoupon);
      }, 0);
      fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', code: savedCoupon, cartTotal }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.coupon) {
            const disc =
              data.coupon.discountType === 'percentage'
                ? Math.round((cartTotal * data.coupon.discountValue) / 100)
                : data.coupon.discountValue;
            setTimeout(() => {
              setDiscountAmount(disc);
            }, 0);
          }
        })
        .catch((err: unknown) => console.error('Failed to validate coupon during checkout', err));
    }
  }, [cartTotal, couponCode]);

  const shippingCharge = calculateShippingCharge(cartTotalWeight, district);
  const grandTotal = cartTotal + shippingCharge - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !district) {
      toast('Please fill in all shipping details', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const orderItems = cart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItems,
          shippingAddress: {
            name,
            phone,
            address,
            district,
            city: district,
          },
          paymentMethod,
          couponApplied: couponCode || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast('Order placed successfully!', 'success');
        sessionStorage.removeItem('applied_coupon_code');
        
        // Save checkout details for guest/authenticated success landing page
        sessionStorage.setItem('last_order', JSON.stringify({
          orderId: data.orderId,
          totalAmount: grandTotal,
          trackingId: data.trackingId,
          shippingAddress: { name, phone, address, district }
        }));
        
        clearCart();
        router.push('/checkout/success');
      } else {
        toast(data.message || 'Checkout failed', 'error');
      }
    } catch {
      toast('An error occurred during order processing', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 bg-mesh">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="mt-4 text-sm text-neutral-400">Loading checkout session...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 text-center bg-mesh">
        <h1 className="text-xl font-bold text-white mb-4">Your Cart is Empty</h1>
        <button
          onClick={() => router.push('/shop')}
          className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-mesh min-h-screen py-16 px-6 max-w-7xl mx-auto w-full flex-1">
      <h1 className="text-3xl font-extrabold text-white mb-12">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Shipping & Payment Fields */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Form */}
          <div className="rounded-2xl glass-card p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-400" />
              Delivery Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/5 text-sm text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/5 text-sm text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase">
                Shipping District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/5 text-sm text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
              >
                <option value="Inside Dhaka">Inside Dhaka (Express Shipping - BDT 60)</option>
                <option value="Outside Dhaka">Outside Dhaka (Express Shipping - BDT 120)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase">
                Full Address
              </label>
              <textarea
                required
                rows={3}
                placeholder="House, Flat, Road, Area details"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/5 text-sm text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          {/* Payment Options */}
          <div className="rounded-2xl glass-card p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-400" />
              Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-orange-600/10 border-orange-500 text-white'
                    : 'bg-neutral-900/50 border-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="sr-only"
                />
                <span className="text-sm font-bold">Cash on Delivery</span>
                <span className="text-[10px] text-neutral-500 mt-1">Pay on Doorstep Delivery</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'bKash'
                    ? 'bg-orange-600/10 border-orange-500 text-white'
                    : 'bg-neutral-900/50 border-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bKash"
                  checked={paymentMethod === 'bKash'}
                  onChange={() => setPaymentMethod('bKash')}
                  className="sr-only"
                />
                <span className="text-sm font-bold">bKash (Mock Checkout)</span>
                <span className="text-[10px] text-neutral-500 mt-1">Instant digital payment</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'Nagad'
                    ? 'bg-orange-600/10 border-orange-500 text-white'
                    : 'bg-neutral-900/50 border-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Nagad"
                  checked={paymentMethod === 'Nagad'}
                  onChange={() => setPaymentMethod('Nagad')}
                  className="sr-only"
                />
                <span className="text-sm font-bold">Nagad (Mock Checkout)</span>
                <span className="text-[10px] text-neutral-500 mt-1">Instant digital payment</span>
              </label>
            </div>

            {paymentMethod !== 'COD' && (
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/15 text-xs text-orange-400 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-orange-400 shrink-0" />
                <span>
                  Sandbox Mode: Confirming checkout will trigger instant mock authorization.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Checkout Panel */}
        <div className="rounded-2xl glass-card p-6 space-y-6">
          <h2 className="text-lg font-bold text-white">Order Summary</h2>

          {/* Cart item listing */}
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {cart.map((item) => {
              const price =
                item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
              return (
                <div key={item.product._id} className="flex justify-between items-center gap-3 text-xs">
                  <div className="flex-1">
                    <p className="font-bold text-white line-clamp-1">{item.product.title}</p>
                    <p className="text-neutral-500 mt-0.5">
                      {item.quantity} x BDT {price.toLocaleString()}
                    </p>
                  </div>
                  <span className="font-bold text-white text-right">
                    BDT {(price * item.quantity).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-3 pt-6 border-t border-white/5 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Items Subtotal</span>
              <span className="font-medium text-white">BDT {cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Total Order Weight</span>
              <span className="font-medium text-white">{(cartTotalWeight / 1000).toFixed(2)} kg</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-400">Coupon Discount ({couponCode})</span>
                <span className="text-orange-400 font-bold">
                  - BDT {discountAmount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-400">Shipping Charge</span>
              <span className="font-medium text-white">BDT {shippingCharge.toLocaleString()}</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-baseline pt-6 border-t border-white/5">
            <span className="text-sm font-semibold text-white">Total Amount</span>
            <span className="text-xl font-extrabold text-white">
              BDT {grandTotal.toLocaleString()}
            </span>
          </div>

          {/* Checkout Submit CTA button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 py-3.5 text-sm font-bold text-white transition-all shadow-xl shadow-orange-600/10 cursor-pointer disabled:bg-neutral-800 disabled:text-neutral-500"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Order...
              </>
            ) : (
              `Place Order (BDT ${grandTotal.toLocaleString()})`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
