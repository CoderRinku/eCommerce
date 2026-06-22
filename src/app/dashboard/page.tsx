'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/providers/ToastProvider';
import { Loader2, Package, Truck, Compass, CheckCircle2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  product: {
    _id: string;
    title: string;
    images: string[];
  };
  quantity: number;
  price: number;
}

interface OrderData {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    district: string;
    city: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  shippingCharge: number;
  discountAmount: number;
  subTotal: number;
  totalAmount: number;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  courierDetails?: {
    courierName: string;
    trackingId: string;
    courierStatus: string;
  };
  createdAt: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  // Authenticate checks
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard');
    }
  }, [status, router]);

  useEffect(() => {
    async function loadOrders() {
      if (status !== 'authenticated') return;
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          toast('Failed to load orders', 'error');
        }
      } catch {
        toast('An error occurred loading dashboard', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [status, toast]);

  const getStatusStep = (orderStatus: string) => {
    switch (orderStatus) {
      case 'Pending':
        return 1;
      case 'Processing':
        return 2;
      case 'Shipped':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 0; // Cancelled
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 bg-mesh">
        <Loader2 className="h-8 w-8 text-orange-655 text-orange-600 animate-spin" />
        <p className="mt-4 text-sm text-neutral-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-mesh min-h-screen py-16 px-6 max-w-7xl mx-auto w-full flex-1">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-neutral-800">My Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-555 text-neutral-500">
          Welcome back, {session?.user?.name}. Manage your profile and track active shipments.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-neutral-200 rounded-2xl bg-white shadow-sm">
          <Package className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
          <p className="text-neutral-500 font-medium">You haven&apos;t placed any orders yet.</p>
          <button
            onClick={() => router.push('/shop')}
            className="mt-6 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-orange-500 transition-colors cursor-pointer shadow-lg shadow-orange-600/10"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        /* Orders checklist */
        <div className="space-y-10 animate-slide-in">
          {orders.map((order) => {
            const currentStep = getStatusStep(order.orderStatus);
            const isCancelled = order.orderStatus === 'Cancelled';
            return (
              <div key={order._id} className="rounded-2xl glass-card overflow-hidden shadow-sm">
                {/* Header info */}
                <div className="p-6 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                      Order ID
                    </span>
                    <p className="text-sm font-bold text-neutral-800 uppercase">{order._id}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-neutral-500">
                    <div>
                      <span className="block text-[10px] text-neutral-500 font-semibold uppercase">
                        Total Amount
                      </span>
                      <span className="font-bold text-neutral-850 text-neutral-800">
                        BDT {order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-500 font-semibold uppercase">
                        Payment Status
                      </span>
                      <span
                        className={`font-semibold ${
                          order.paymentStatus === 'Paid' ? 'text-orange-600 font-bold' : 'text-amber-600 font-bold'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    {order.courierDetails?.trackingId && (
                      <div className="col-span-2 sm:col-span-1">
                        <span className="block text-[10px] text-neutral-500 font-semibold uppercase">
                          Steadfast Tracking
                        </span>
                        <span className="font-bold text-orange-600 uppercase select-all">
                          {order.courierDetails.trackingId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar timeline */}
                <div className="p-6 border-b border-neutral-200 bg-white">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-6">
                    Delivery Progress
                  </h3>

                  {isCancelled ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 text-xs text-rose-600 font-medium">
                      <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                      <span>This order has been cancelled or returned.</span>
                    </div>
                  ) : (
                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2">
                      {/* Connection Bar (desktop) */}
                      <div className="absolute left-6 right-6 top-[18px] h-0.5 bg-neutral-200 -z-10 hidden sm:block">
                        <div
                          className="h-full bg-orange-600 transition-all duration-500"
                          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                        />
                      </div>

                      {/* Step Items */}
                      {[
                        { label: 'Pending', icon: Package, step: 1 },
                        { label: 'Processing', icon: Compass, step: 2 },
                        { label: 'Shipped', icon: Truck, step: 3 },
                        { label: 'Delivered', icon: CheckCircle2, step: 4 },
                      ].map((item) => {
                        const ItemIcon = item.icon;
                        const active = currentStep >= item.step;
                        return (
                          <div
                            key={item.label}
                            className="flex sm:flex-col items-center gap-3 sm:gap-2 bg-white px-3 z-10 w-full sm:w-auto"
                          >
                            <div
                              className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all ${
                                active
                                  ? 'bg-orange-600 border-transparent text-white shadow-lg shadow-orange-600/20'
                                  : 'bg-neutral-100 border-neutral-200 text-neutral-400'
                              }`}
                            >
                              <ItemIcon className="h-4 w-4" />
                            </div>
                            <div className="text-left sm:text-center">
                              <p
                                className={`text-xs font-bold ${
                                  active ? 'text-neutral-800' : 'text-neutral-450 text-neutral-400'
                                }`}
                              >
                                {item.label}
                              </p>
                              {item.label === 'Shipped' && order.courierDetails?.courierStatus && (
                                <p className="text-[9px] text-neutral-500 capitalize">
                                  {order.courierDetails.courierStatus}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Items & Address */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 bg-white/50">
                  {/* Items list */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-200 pb-2">
                      Order Items
                    </h3>
                    {order.orderItems.map((item) => {
                      if (!item.product) return null;
                      return (
                        <div key={item.product._id} className="flex items-center gap-4 text-xs">
                          <div className="relative h-12 w-12 rounded-lg bg-white border border-neutral-200 overflow-hidden">
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-neutral-800 line-clamp-1">
                              {item.product.title}
                            </p>
                            <p className="text-neutral-500 mt-0.5">
                              {item.quantity} x BDT {item.price.toLocaleString()}
                            </p>
                          </div>
                          <span className="font-bold text-neutral-800">
                            BDT {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-200 pb-2">
                      Shipping details
                    </h3>
                    <div className="mt-4 text-xs space-y-2.5 text-neutral-550 text-neutral-500">
                      <p className="font-bold text-neutral-800">{order.shippingAddress.name}</p>
                      <p className="font-semibold text-neutral-600">
                        {order.shippingAddress.phone}
                      </p>
                      <p className="text-neutral-600">{order.shippingAddress.address}</p>
                      <p className="text-neutral-500 font-semibold">{order.shippingAddress.district}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
