'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';

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
}

export default function Shop() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
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
    fetchProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (e: React.MouseEvent, product: ProductItem) => {
    e.preventDefault();
    if (product.stock <= 0) {
      toast('Product is out of stock', 'error');
      return;
    }
    addToCart(product, 1);
    toast(`${product.title} added to cart`, 'success');
  };

  return (
    <div className="bg-mesh min-h-screen py-16 px-6 max-w-7xl mx-auto w-full">
      {/* Title */}
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-white">Shop Catalog</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Discover premium goods, crafted for daily longevity.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-neutral-900/50 border border-white/5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-indigo-600 border-transparent text-white shadow-lg shadow-indigo-600/15'
                  : 'bg-neutral-900/40 border-white/5 text-neutral-400 hover:text-white hover:bg-neutral-900/80'
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
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-neutral-500">Loading catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-white/5 rounded-2xl bg-neutral-900/10">
          <p className="text-neutral-400">No products matched your search.</p>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => {
            const hasDiscount = product.discountPrice > 0;
            const isOutOfStock = product.stock <= 0;
            return (
              <div
                key={product._id}
                className="group relative flex flex-col rounded-2xl glass-card p-4 transition-all duration-300 hover:border-indigo-500/20"
              >
                {/* Product Image */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-900">
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    sizes="(max-w-768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {hasDiscount && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-indigo-600 text-xs font-bold text-white">
                      Sale
                    </span>
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs">
                      <span className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs font-bold text-neutral-400 tracking-wider uppercase">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Text details */}
                <div className="mt-4 flex-1 flex flex-col">
                  <span className="text-xs text-neutral-500 font-medium">{product.category}</span>
                  <h3 className="mt-1.5 text-sm font-bold text-white line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-400 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Actions & Price */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      {hasDiscount ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-extrabold text-white">
                            BDT {product.discountPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-neutral-500 line-through">
                            BDT {product.price.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-extrabold text-white">
                          BDT {product.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/product/${product.slug}`}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        Details
                      </Link>
                      {!isOutOfStock && (
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </button>
                      )}
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
