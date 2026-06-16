'use client';

import React, { useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Minus, Plus, ShoppingBag } from 'lucide-react';

interface ProductInteractiveProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    price: number;
    discountPrice: number;
    images: string[];
    category: string;
    stock: number;
  };
}

export function ProductInteractive({ product }: ProductInteractiveProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast('Product is out of stock', 'error');
      return;
    }
    addToCart(product, quantity);
    toast(`${quantity} x ${product.title} added to cart`, 'success');
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="space-y-6">
      {/* Quantity Selectors */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-400 font-medium">Quantity:</span>
          <div className="flex items-center rounded-xl bg-neutral-900 border border-white/5 overflow-hidden">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="px-4 py-2 text-neutral-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 text-sm font-bold text-white w-12 text-center">{quantity}</span>
            <button
              onClick={handleIncrement}
              disabled={quantity >= product.stock}
              className="px-4 py-2 text-neutral-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cart CTA Button */}
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 py-4 text-sm font-bold text-white transition-all shadow-xl shadow-indigo-600/10 cursor-pointer"
      >
        <ShoppingBag className="h-5 w-5" />
        {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
      </button>
    </div>
  );
}
