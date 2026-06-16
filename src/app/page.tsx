import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { Coupon } from '@/models/Coupon';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, BadgePercent, Star } from 'lucide-react';
import Image from 'next/image';

export default async function Home() {
  await connectToDatabase();

  // Auto-seed the database if empty so the site displays content out-of-the-box
  let featuredProducts = await Product.find({ isFeatured: true, isActive: true }).limit(4);
  if (featuredProducts.length === 0) {
    try {
      await Product.create([
        {
          title: 'Premium Minimalist Watch',
          slug: 'minimalist-watch',
          description: 'A sleek, elegant timepiece crafted with surgical-grade stainless steel and sapphire crystal glass. Features Japanese quartz movement.',
          price: 12000,
          discountPrice: 9500,
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
          category: 'Accessories',
          stock: 15,
          isFeatured: true,
          isActive: true,
        },
        {
          title: 'Hyper-Responsive Sneakers',
          slug: 'hyper-sneakers',
          description: 'Ultralight running shoes featuring responsive foam cushioning and breathability mesh upper. Perfect for performance and street fashion.',
          price: 8500,
          discountPrice: 0,
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'],
          category: 'Footwear',
          stock: 25,
          isFeatured: true,
          isActive: true,
        },
        {
          title: 'Ultra-Bass ANC Headphones',
          slug: 'anc-headphones',
          description: 'Immersive wireless headphones with hybrid Active Noise Cancelling, 40-hour battery life, and crystal clear voice calls.',
          price: 15000,
          discountPrice: 13500,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
          category: 'Electronics',
          stock: 8,
          isFeatured: true,
          isActive: true,
        },
        {
          title: 'Classic Leather Backpack',
          slug: 'leather-backpack',
          description: 'Handcrafted full-grain leather backpack designed to protect your laptop and carry daily essentials. Water-resistant liner.',
          price: 18000,
          discountPrice: 16000,
          images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80'],
          category: 'Bags',
          stock: 12,
          isFeatured: true,
          isActive: true,
        },
      ]);
      featuredProducts = await Product.find({ isFeatured: true, isActive: true }).limit(4);
    } catch (e) {
      console.error('Failed to seed default products:', e);
    }
  }

  // Auto-seed a welcome coupon code if no coupons exist
  const couponCount = await Coupon.countDocuments();
  if (couponCount === 0) {
    try {
      await Coupon.create({
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 2000,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-12-31'),
        usageLimit: 500,
        usedCount: 0,
        isActive: true,
      });
    } catch (e) {
      console.error('Failed to seed welcome coupon:', e);
    }
  }

  return (
    <div className="bg-mesh min-h-screen relative overflow-hidden">
      {/* Animated Glowing Orbital Blobs (Background) */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[130px] animate-float-reverse pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-xs text-indigo-400 font-semibold animate-fade-in-up duration-700">
          <BadgePercent className="h-4 w-4 text-indigo-400" />
          Use Coupon WELCOME10 for 10% Off
        </div>
        <h1 className="mt-8 text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] animate-fade-in-up delay-100 duration-700">
          Redefining Everyday Essentials with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
            Premium Design
          </span>
        </h1>
        <p className="mt-8 text-lg text-neutral-400 max-w-2xl leading-relaxed animate-fade-in-up delay-200 duration-700">
          Handcrafted lifestyle products made with precision and minimal aesthetics. Experience express checkout with cash on delivery inside Bangladesh.
        </p>
        <div className="mt-10 flex gap-4 animate-fade-in-up delay-300 duration-700">
          <Link
            href="/shop"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-semibold text-white hover:bg-indigo-500 transition-all duration-300 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02] group cursor-pointer"
          >
            Explore Catalog
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Selling Points Grid */}
      <section className="border-t border-b border-white/5 bg-neutral-950/20 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Express Delivery</h3>
              <p className="mt-2 text-sm text-neutral-400">
                Inside Dhaka delivery in 24-48 hours. Express shipping everywhere outside Dhaka.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Secure Cash on Delivery</h3>
              <p className="mt-2 text-sm text-neutral-400">
                Pay on arrival at your doorstep. We support bKash, Nagad, and COD methods.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Surgical Grade Quality</h3>
              <p className="mt-2 text-sm text-neutral-400">
                A single brand committed to sustainable sourcing and pristine material craftsmanship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Featured Catalog</h2>
            <p className="mt-2 text-sm text-neutral-400">Selected creations representing our design system</p>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            See all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => {
            const hasDiscount = product.discountPrice > 0;
            return (
              <div
                key={product._id.toString()}
                className="group relative flex flex-col rounded-2xl glass-card p-4 transition-all duration-300 hover:border-indigo-500/20"
              >
                {/* Product Image Container */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-900">
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    sizes="(max-w-768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {hasDiscount && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-indigo-600 text-xs font-bold text-white shadow-lg">
                      Sale
                    </span>
                  )}
                </div>

                {/* Product Text info */}
                <div className="mt-4 flex-1 flex flex-col">
                  <span className="text-xs text-neutral-500 font-medium">{product.category}</span>
                  <h3 className="mt-1.5 text-sm font-bold text-white line-clamp-1">{product.title}</h3>
                  <p className="mt-2 text-xs text-neutral-400 line-clamp-2">{product.description}</p>
                  
                  {/* Price & Cart navigation */}
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
                    <Link
                      href={`/product/${product.slug}`}
                      className="p-2 rounded-lg bg-white/5 border border-white/5 text-neutral-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all cursor-pointer"
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
