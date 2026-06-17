'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';
import Image from 'next/image';

interface ProductItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number;
  images: string[];
  category: string;
  stock: number;
  isFeatured: boolean;
  isOrganic: boolean;
  weight: number;
  unit: string;
}

export default function AdminProductsManager() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('g');
  const [isOrganic, setIsOrganic] = useState(true);

  const [saving, setSaving] = useState(false);

  const loadProducts = React.useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch {
      toast('Failed to load products list', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setImageUrl('');
    setCategory('');
    setStock('');
    setIsFeatured(false);
    setWeight('');
    setUnit('g');
    setIsOrganic(true);
    setShowModal(true);
  };

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setTitle(product.title);
    setSlug(product.slug);
    setDescription(product.description);
    setPrice(product.price.toString());
    setDiscountPrice(product.discountPrice?.toString() || '');
    setImageUrl(product.images[0]);
    setCategory(product.category);
    setStock(product.stock.toString());
    setIsFeatured(product.isFeatured);
    setWeight(product.weight?.toString() || '');
    setUnit(product.unit || 'g');
    setIsOrganic(product.isOrganic !== undefined ? product.isOrganic : true);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !description || !price || !imageUrl || !category || !stock || !weight) {
      toast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      title,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : 0,
      images: [imageUrl],
      category,
      stock: parseInt(stock),
      isFeatured,
      isOrganic,
      weight: parseFloat(weight),
      unit,
    };

    try {
      let response;
      if (editingProduct) {
        response = await fetch(`/api/products/${editingProduct.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        toast(
          editingProduct ? 'Product updated successfully' : 'Product created successfully',
          'success'
        );
        setShowModal(false);
        loadProducts();
      } else {
        const errData = await response.json();
        toast(errData.message || 'Operation failed', 'error');
      }
    } catch {
      toast('An error occurred during submission', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: ProductItem) => {
    if (!confirm(`Are you sure you want to delete "${product.title}"?`)) return;

    try {
      const response = await fetch(`/api/products/${product.slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast('Product deleted successfully', 'success');
        loadProducts();
      } else {
        toast('Failed to delete product', 'error');
      }
    } catch {
      toast('An error occurred during deletion', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-neutral-400">Loading catalog management...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Manage Products</h1>
          <p className="mt-1.5 text-xs text-neutral-400">
            Update pricing, catalog info, and stock inventory.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Catalog Table */}
      <div className="rounded-2xl glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-400">
            <thead>
              <tr className="border-b border-white/5 text-neutral-500 bg-neutral-900/10">
                <th className="p-4 font-semibold uppercase">Product</th>
                <th className="p-4 font-semibold uppercase">Category</th>
                <th className="p-4 font-semibold uppercase">Weight & Organic</th>
                <th className="p-4 font-semibold uppercase">Price</th>
                <th className="p-4 font-semibold uppercase">Stock</th>
                <th className="p-4 font-semibold uppercase">Featured</th>
                <th className="p-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                >
                  {/* Thumbnail & Title */}
                  <td className="p-4 flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-white/5">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-white">{product.title}</p>
                      <p className="text-[10px] text-neutral-500 uppercase">{product.slug}</p>
                    </div>
                  </td>
                  <td className="p-4 text-white font-medium">{product.category}</td>
                  <td className="p-4 text-white font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-white">{product.weight} {product.unit}</span>
                      {product.isOrganic ? (
                        <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded w-max">🍃 Organic</span>
                      ) : (
                        <span className="text-[9px] text-neutral-400 font-bold bg-neutral-800 px-1.5 py-0.5 rounded w-max">Regular</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {product.discountPrice > 0 ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-white">
                          BDT {product.discountPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-neutral-500 line-through">
                          BDT {product.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-white font-mono">
                        BDT {product.price.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-white">{product.stock} units</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        product.isFeatured
                          ? 'bg-indigo-500/15 text-indigo-400'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {product.isFeatured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition-all cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-white/10 p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-base font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Price (BDT)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Discount Price (BDT)
                  </label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Footwear"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Stock Inventory
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Weight / Volume
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40 cursor-pointer"
                  >
                    <option value="g">g (Grams)</option>
                    <option value="kg">kg (Kilograms)</option>
                    <option value="ml">ml (Milliliters)</option>
                    <option value="litre">litre (Litres)</option>
                    <option value="pcs">pcs (Pieces)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase">
                  Product Image URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/5 text-white focus:outline-none focus:border-indigo-500/40"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded bg-neutral-800 border-white/5 text-indigo-600 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
                  />
                  <label
                    htmlFor="featured"
                    className="text-[10px] font-semibold text-neutral-400 mb-0.5 uppercase select-none cursor-pointer"
                  >
                    Featured product (Landing Page showcase)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="organic"
                    checked={isOrganic}
                    onChange={(e) => setIsOrganic(e.target.checked)}
                    className="rounded bg-neutral-800 border-white/5 text-indigo-600 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
                  />
                  <label
                    htmlFor="organic"
                    className="text-[10px] font-semibold text-neutral-400 mb-0.5 uppercase select-none cursor-pointer"
                  >
                    🍃 Certified Organic / Pure Honey & Ghee Quality
                  </label>
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
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
