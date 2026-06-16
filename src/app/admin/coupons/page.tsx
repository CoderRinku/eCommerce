'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { Loader2, Plus, Calendar, Ticket, X } from 'lucide-react';

interface CouponItem {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
}

export default function AdminCouponsManager() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');

  const [saving, setSaving] = useState(false);

  const loadCoupons = React.useCallback(async () => {
    try {
      const response = await fetch('/api/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch {
      toast('Failed to load coupons list', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCoupons();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadCoupons]);

  const openCreateModal = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinOrderAmount('');

    // Default dates setup (today up to 30 days later)
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(nextMonth);

    setUsageLimit('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue || !startDate || !endDate) {
      toast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
    };

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast('Coupon created successfully', 'success');
        setShowModal(false);
        loadCoupons();
      } else {
        const errData = await response.json();
        toast(errData.message || 'Failed to create coupon', 'error');
      }
    } catch {
      toast('Error occurred during coupon creation', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-neutral-400">Loading coupons manager...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Manage Coupons</h1>
          <p className="mt-1.5 text-xs text-neutral-400">
            Add coupon codes, adjust limits, and configure promotional campaigns.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-400">
            <thead>
              <tr className="border-b border-white/5 text-neutral-500 bg-neutral-900/10">
                <th className="p-4 font-semibold uppercase">Coupon Code</th>
                <th className="p-4 font-semibold uppercase">Discount</th>
                <th className="p-4 font-semibold uppercase">Min Order</th>
                <th className="p-4 font-semibold uppercase">Validity Period</th>
                <th className="p-4 font-semibold uppercase">Usage Status</th>
                <th className="p-4 font-semibold uppercase text-right">Active</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const now = new Date();
                const expired = now > new Date(coupon.endDate);
                return (
                  <tr
                    key={coupon._id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 font-bold text-white uppercase flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-indigo-400" />
                      {coupon.code}
                    </td>
                    <td className="p-4 font-bold text-white">
                      {coupon.discountValue}
                      {coupon.discountType === 'percentage' ? '%' : ' BDT'}
                    </td>
                    <td className="p-4 font-semibold text-white">
                      BDT {coupon.minOrderAmount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                        <span>
                          {new Date(coupon.startDate).toLocaleDateString()} -{' '}
                          {new Date(coupon.endDate).toLocaleDateString()}
                        </span>
                        {expired && (
                          <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                            Expired
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-white">{coupon.usedCount}</span>
                      <span className="text-neutral-500">
                        {' '}
                        / {coupon.usageLimit !== null ? coupon.usageLimit : '∞'} uses
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[9px] font-bold ${
                          coupon.isActive && !expired
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-neutral-800 text-neutral-500 border border-white/5'
                        }`}
                      >
                        {coupon.isActive && !expired ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-white/10 p-6 space-y-6 shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-base font-bold text-white">Create Coupon</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40 cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (BDT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Min Order Amount (BDT)
                  </label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer min-w-[70px] flex items-center justify-center"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
