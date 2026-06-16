'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { Loader2, Truck, X, Eye } from 'lucide-react';

interface OrderItem {
  product: {
    _id: string;
    title: string;
  };
  quantity: number;
  price: number;
}

interface OrderData {
  _id: string;
  user: {
    name: string;
    email: string;
  };
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

export default function AdminOrdersManager() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  // Status Change States
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = React.useCallback(async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch {
      toast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadOrders]);

  const handleUpdateStatus = async (
    orderId: string,
    updates: { orderStatus?: OrderData['orderStatus']; paymentStatus?: string }
  ) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast('Order status updated successfully', 'success');

        // Refresh local order lists state
        setOrders((prevOrders) =>
          prevOrders.map((ord) =>
            ord._id === orderId
              ? {
                  ...ord,
                  orderStatus: updates.orderStatus || ord.orderStatus,
                  paymentStatus: updates.paymentStatus || ord.paymentStatus,
                }
              : ord
          )
        );

        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) =>
            prev
              ? {
                  ...prev,
                  orderStatus: updates.orderStatus || prev.orderStatus,
                  paymentStatus: updates.paymentStatus || prev.paymentStatus,
                }
              : null
          );
        }
      } else {
        toast('Failed to update status', 'error');
      }
    } catch {
      toast('Error occurred updating status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-neutral-400">Loading orders manager...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Manage Orders</h1>
        <p className="mt-1.5 text-xs text-neutral-400">
          Dispatch courier consignments, verify payments, and change order states.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Orders Listing Table */}
        <div className="xl:col-span-2 rounded-2xl glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-400">
              <thead>
                <tr className="border-b border-white/5 text-neutral-500 bg-neutral-900/10">
                  <th className="p-4 font-semibold uppercase">Order ID</th>
                  <th className="p-4 font-semibold uppercase">Customer</th>
                  <th className="p-4 font-semibold uppercase">Total</th>
                  <th className="p-4 font-semibold uppercase">Order Status</th>
                  <th className="p-4 font-semibold uppercase">Payment</th>
                  <th className="p-4 font-semibold uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                      selectedOrder?._id === order._id ? 'bg-indigo-600/5' : ''
                    }`}
                  >
                    <td className="p-4 font-bold text-white uppercase">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white">{order.shippingAddress.name}</p>
                      <p className="text-[10px] text-neutral-500">{order.user?.email || 'Guest'}</p>
                    </td>
                    <td className="p-4 font-bold text-white">
                      BDT {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <select
                        disabled={updatingId === order._id}
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleUpdateStatus(order._id, {
                            orderStatus: e.target.value as OrderData['orderStatus'],
                          })
                        }
                        className="px-2 py-1 rounded-md bg-neutral-800 border border-white/5 text-[11px] text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer disabled:opacity-40"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Order details inspector */}
        <div>
          {selectedOrder ? (
            <div className="rounded-2xl glass-card p-6 space-y-6 animate-slide-in">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Order Detail
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-neutral-500 hover:text-white transition-colors cursor-pointer animate-fade-in"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* IDs and dates */}
              <div className="text-xs space-y-2.5 text-neutral-400">
                <p>
                  <span className="text-neutral-500 font-medium">Order ID:</span>{' '}
                  <span className="font-bold text-white uppercase select-all">
                    {selectedOrder._id}
                  </span>
                </p>
                <p>
                  <span className="text-neutral-500 font-medium">Placed At:</span>{' '}
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="text-neutral-500 font-medium">Order Status:</span>{' '}
                  <span className="font-bold text-white">{selectedOrder.orderStatus}</span>
                </p>
                <p>
                  <span className="text-neutral-500 font-medium">Payment status:</span>{' '}
                  <span className="font-bold text-white">{selectedOrder.paymentStatus}</span>
                  {selectedOrder.paymentStatus !== 'Paid' && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedOrder._id, { paymentStatus: 'Paid' })
                      }
                      className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/15 text-[9px] font-bold text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/10 cursor-pointer"
                    >
                      Mark Paid
                    </button>
                  )}
                </p>
              </div>

              {/* Courier consignment Details */}
              {selectedOrder.courierDetails?.trackingId && (
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 space-y-2 text-xs">
                  <p className="font-bold text-indigo-400 flex items-center gap-1.5">
                    <Truck className="h-4 w-4" />
                    Steadfast Courier Dispatch
                  </p>
                  <p className="text-neutral-400">
                    <span className="text-neutral-500">Tracking Code:</span>{' '}
                    <span className="font-bold text-white select-all">
                      {selectedOrder.courierDetails.trackingId}
                    </span>
                  </p>
                  <p className="text-neutral-400">
                    <span className="text-neutral-500">Courier Status:</span>{' '}
                    <span className="font-semibold text-neutral-300 capitalize">
                      {selectedOrder.courierDetails.courierStatus}
                    </span>
                  </p>
                </div>
              )}

              {/* Delivery Details */}
              <div className="border-t border-white/5 pt-4 space-y-2 text-xs text-neutral-400">
                <h3 className="font-bold text-white">Shipping Details</h3>
                <p>
                  <span className="text-neutral-500">Name:</span> {selectedOrder.shippingAddress.name}
                </p>
                <p>
                  <span className="text-neutral-500">Phone:</span>{' '}
                  {selectedOrder.shippingAddress.phone}
                </p>
                <p>
                  <span className="text-neutral-500">District:</span>{' '}
                  {selectedOrder.shippingAddress.district}
                </p>
                <p>
                  <span className="text-neutral-500">Address:</span>{' '}
                  {selectedOrder.shippingAddress.address}
                </p>
              </div>

              {/* Items Details */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <h3 className="text-xs font-bold text-white">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item) => {
                    if (!item.product) return null;
                    return (
                      <div key={item.product._id} className="flex justify-between items-center text-xs">
                        <div className="flex-1">
                          <p className="font-bold text-white line-clamp-1">{item.product.title}</p>
                          <p className="text-neutral-500 mt-0.5">
                            {item.quantity} x BDT {item.price.toLocaleString()}
                          </p>
                        </div>
                        <span className="font-bold text-white text-right shrink-0">
                          BDT {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calculations */}
              <div className="border-t border-white/5 pt-4 space-y-2 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>BDT {selectedOrder.subTotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>- BDT {selectedOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>BDT {selectedOrder.shippingCharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-white/5">
                  <span>Grand Total</span>
                  <span>BDT {selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-dashed border-white/5 text-center text-xs text-neutral-500 bg-neutral-900/10">
              Select an order from the list to view its shipment details and perform updates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
