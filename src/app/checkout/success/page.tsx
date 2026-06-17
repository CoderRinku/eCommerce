'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CheckCircle2, ShoppingBag, Truck, Calendar, UserPlus, FileText } from 'lucide-react';

interface OrderSummary {
  orderId: string;
  totalAmount: number;
  trackingId?: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    district: string;
  };
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem('last_order');
    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Failed to parse last order details', e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="bg-mesh min-h-screen py-32 flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600 border-solid" />
        <p className="mt-4 text-xs text-neutral-400">Loading order receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-mesh min-h-screen py-32 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-xl font-bold text-white mb-4">No order details found</h1>
        <p className="text-neutral-400 text-xs mb-8 max-w-sm">
          If you recently placed an order, please check your dashboard or contact customer support.
        </p>
        <Link
          href="/shop"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  const isInsideDhaka = order.shippingAddress.district.toLowerCase().includes('dhaka');
  const deliveryTimeline = isInsideDhaka ? '1 to 2 business days (Express)' : '3 to 5 business days';

  return (
    <div className="bg-mesh min-h-screen py-16 px-6 max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Order Placed Successfully!</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Thank you for shopping at SokolBazar. Your order has been registered in our system.
        </p>
      </div>

      <div className="space-y-6">
        {/* Order Info Card */}
        <div className="rounded-2xl glass-card p-6 space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">Order ID</span>
              <p className="text-sm font-bold text-white uppercase select-all">{order.orderId}</p>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">Total Paid/COD</span>
              <p className="text-sm font-bold text-white">BDT {order.totalAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Delivery Estimates */}
            <div className="space-y-2">
              <p className="font-bold text-neutral-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <Calendar className="h-4 w-4 text-emerald-400" />
                Estimated Delivery
              </p>
              <p className="text-white text-xs font-semibold">{deliveryTimeline}</p>
              <p className="text-neutral-500 text-[10px] leading-relaxed">
                Courier partners will contact you prior to delivery.
              </p>
            </div>

            {/* Courier info if trackable */}
            {order.trackingId && (
              <div className="space-y-2">
                <p className="font-bold text-neutral-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                  <Truck className="h-4 w-4 text-emerald-400" />
                  Steadfast Courier tracking
                </p>
                <p className="text-white font-mono text-xs font-bold uppercase select-all">{order.trackingId}</p>
                <p className="text-neutral-500 text-[10px]">
                  Use this tracking ID to track shipment status on portal.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address Summary */}
        <div className="rounded-2xl glass-card p-6 space-y-3 text-xs text-neutral-400">
          <h3 className="font-bold text-white uppercase tracking-wider text-[10px]">Shipping Address Summary</h3>
          <div className="border-t border-white/5 pt-3 space-y-1.5">
            <p className="font-bold text-white">{order.shippingAddress.name}</p>
            <p className="text-neutral-300 font-semibold">{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.address}</p>
            <p className="text-neutral-400 font-semibold">{order.shippingAddress.district}</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/shop"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/5 py-3.5 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
          
          {session ? (
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/register"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              Create Account for Tracking
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
