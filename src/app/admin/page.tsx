'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { Loader2, DollarSign, ShoppingCart, Users, Package, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Link from 'next/link';

interface DashboardRecentOrder {
  _id: string;
  user?: {
    name: string;
    email: string;
  } | null;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
}

interface DashboardChartData {
  name: string;
  sales: number;
  orders: number;
}

interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
}

interface AdminDashboardData {
  metrics: DashboardMetrics;
  recentOrders: DashboardRecentOrder[];
  salesChartData: DashboardChartData[];
}

export default function AdminDashboardOverview() {
  const { toast } = useToast();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/admin');
        if (response.ok) {
          const stats = await response.json();
          setData(stats);
        } else {
          toast('Failed to load dashboard metrics', 'error');
        }
      } catch {
        toast('Error loading metrics', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-neutral-400">Loading admin metrics...</p>
      </div>
    );
  }

  const { metrics, recentOrders, salesChartData } = data || {};

  const cards = [
    {
      name: 'Total Revenue',
      value: `BDT ${metrics?.totalSales?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-emerald-400',
    },
    { name: 'Total Orders', value: metrics?.totalOrders || 0, icon: ShoppingCart, color: 'text-indigo-400' },
    { name: 'Customers', value: metrics?.totalUsers || 0, icon: Users, color: 'text-blue-400' },
    { name: 'Catalog Items', value: metrics?.totalProducts || 0, icon: Package, color: 'text-violet-400' },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Dashboard Overview</h1>
        <p className="mt-1.5 text-xs text-neutral-400">
          Real-time platform sales metrics and order tracking logs.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const CardIcon = card.icon;
          return (
            <div key={card.name} className="p-6 rounded-2xl glass-card flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-500 font-semibold uppercase">{card.name}</span>
                <p className="mt-2 text-xl font-extrabold text-white">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-white/5 border border-white/5 ${card.color}`}>
                <CardIcon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Analytics Chart */}
      <div className="rounded-2xl glass-card p-6">
        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Revenue Over Time</h2>
        <div className="h-80 w-full">
          {salesChartData && salesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27273a" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#52525b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#09090b',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Revenue (BDT)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-neutral-500 border border-dashed border-white/5 rounded-xl">
              No sales activity logged yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders table */}
      <div className="rounded-2xl glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            See all orders
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-400">
            <thead>
              <tr className="border-b border-white/5 text-neutral-500">
                <th className="py-3 font-semibold uppercase">Order ID</th>
                <th className="py-3 font-semibold uppercase">Customer</th>
                <th className="py-3 font-semibold uppercase">Payment</th>
                <th className="py-3 font-semibold uppercase">Status</th>
                <th className="py-3 font-semibold uppercase">Total</th>
                <th className="py-3 font-semibold uppercase text-right">Placed At</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((order: DashboardRecentOrder) => (
                <tr
                  key={order._id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 font-bold text-white uppercase">
                    {order._id.substring(0, 8)}...
                  </td>
                  <td className="py-4 text-white font-medium">
                    {order.user?.name || 'Guest User'}
                  </td>
                  <td className="py-4">
                    <span className="capitalize">{order.paymentMethod}</span> ({order.paymentStatus})
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-4 font-bold text-white">
                    BDT {order.totalAmount?.toLocaleString()}
                  </td>
                  <td className="py-4 text-right text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
