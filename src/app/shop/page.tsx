'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

interface ProductItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number;
  images: string[];
  category: CategoryItem | string;
  stock: number;
  isOrganic: boolean;
  weight: number;
  unit: string;
}

export default function Shop() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(() => {
      fetchProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Safely extract category names for filters
  const categoriesList = [
    'All',
    ...Array.from(
      new Set(
        products.map((p) =>
          typeof p.category === 'object' && p.category ? p.category.name : (p.category as string)
        )
      )
    ),
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    
    const catName = typeof p.category === 'object' && p.category ? p.category.name : (p.category as string);
    const matchesCategory = selectedCategory === 'All' || catName === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-mesh min-h-screen py-16 px-6 max-w-7xl mx-auto w-full">
      {/* Title */}
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-neutral-850 text-neutral-800">SokolBazar Organic Foods</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Source chemical-free, pure, and premium organic groceries direct from farmers.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search organic honey, ghee, spices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-neutral-250 border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors shadow-sm"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          {categoriesList.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-orange-600 border-transparent text-white shadow-lg shadow-orange-600/15'
                  : 'bg-white border-neutral-200 text-neutral-605 text-neutral-600 hover:text-orange-600 hover:bg-orange-50/50 hover:border-orange-500/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-sm text-neutral-500">Loading SokolBazar catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-neutral-200 rounded-2xl bg-white shadow-sm">
          <p className="text-neutral-500">No organic foods matched your selection.</p>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
