import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { Coupon } from '@/models/Coupon';
import Link from 'next/link';
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  BadgePercent,
  Leaf,
  CheckCircle2,
  Heart,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { HomeBanner } from '@/components/shop/HomeBanner';
import { ProductCard } from '@/components/shop/ProductCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  await connectToDatabase();

  // 1. Seed Categories first if empty
  let categories = await Category.find({ isActive: true });
  if (categories.length === 0) {
    try {
      const defaultCategories = [
        { name: 'Honey', slug: 'honey', description: 'Raw and organic forest honey' },
        { name: 'Ghee', slug: 'ghee', description: 'Pure grass-fed premium hand-churned cow ghee' },
        { name: 'Spices', slug: 'spices', description: '100% pure native spices ground to perfection' },
        { name: 'Nuts', slug: 'nuts', description: 'Premium selection of healthy nuts and seed mixes' },
        { name: 'Traditional Foods', slug: 'traditional-foods', description: 'Homemade traditional pickles and date palm molasses' },
      ];
      await Category.create(defaultCategories);
      categories = await Category.find({ isActive: true });
    } catch (e) {
      console.error('Failed to seed default categories:', e);
    }
  }

  // 2. Fetch all active products
  let products = await Product.find({ isActive: true }).populate('category');

  // Seed default products if database is empty
  if (products.length === 0) {
    try {
      const honeyCat = categories.find((c) => c.slug === 'honey');
      const gheeCat = categories.find((c) => c.slug === 'ghee');
      const spicesCat = categories.find((c) => c.slug === 'spices');
      const nutsCat = categories.find((c) => c.slug === 'nuts');
      const traditionalCat = categories.find((c) => c.slug === 'traditional-foods');

      const defaultProducts = [];

      if (honeyCat) {
        defaultProducts.push({
          title: 'Sundarban Raw Wild Honey',
          slug: 'sundarban-wild-honey',
          description: '100% pure, natural, and unprocessed forest honey collected directly from the Sundarbans. Packed with active biological enzymes.',
          price: 950,
          discountPrice: 850,
          images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80'],
          category: honeyCat._id,
          stock: 35,
          isOrganic: true,
          weight: 500,
          unit: 'g',
          isFeatured: true,
          isActive: true,
        });
      }

      if (gheeCat) {
        defaultProducts.push({
          title: 'Premium Hand-Churned Cow Ghee',
          slug: 'premium-cow-ghee',
          description: 'Aromatic, golden, and granular grass-fed cow ghee made using traditional hand-churning methods (Bilona). Preservative free.',
          price: 1600,
          discountPrice: 1450,
          images: ['https://images.unsplash.com/photo-1628294895520-aa33a4f89798?w=800&auto=format&fit=crop&q=80'],
          category: gheeCat._id,
          stock: 20,
          isOrganic: true,
          weight: 500,
          unit: 'g',
          isFeatured: true,
          isActive: true,
        });
      }

      if (spicesCat) {
        defaultProducts.push({
          title: 'Organic Ground Turmeric Powder',
          slug: 'organic-turmeric-powder',
          description: 'Premium organic turmeric root ground to a fine, rich yellow powder. High curcumin content with no added color or fillers.',
          price: 250,
          discountPrice: 0,
          images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80'],
          category: spicesCat._id,
          stock: 50,
          isOrganic: true,
          weight: 200,
          unit: 'g',
          isFeatured: true,
          isActive: true,
        });
      }

      if (nutsCat) {
        defaultProducts.push({
          title: 'Mixed Nuts & Seed Energy Booster',
          slug: 'mixed-nuts-booster',
          description: 'A high-energy, nutrient-rich blend of almonds, cashews, walnuts, pumpkin seeds, and organic chia. Dry-roasted and unsalted.',
          price: 750,
          discountPrice: 680,
          images: ['https://images.unsplash.com/photo-1596560548464-f010689b7f43?w=800&auto=format&fit=crop&q=80'],
          category: nutsCat._id,
          stock: 40,
          isOrganic: true,
          weight: 400,
          unit: 'g',
          isFeatured: true,
          isActive: true,
        });
      }

      if (traditionalCat) {
        defaultProducts.push({
          title: 'Pure Khejur Gur (Premium Date Molasses)',
          slug: 'pure-khejur-gur',
          description: 'Traditional granular date palm molasses hand-cooked by rural farmers in Jessore. Rich in authentic aroma and iron content.',
          price: 480,
          discountPrice: 420,
          images: ['https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop&q=80'],
          category: traditionalCat._id,
          stock: 15,
          isOrganic: true,
          weight: 1000,
          unit: 'g',
          isFeatured: true,
          isActive: true,
        });
      }

      await Product.create(defaultProducts);
      products = await Product.find({ isActive: true }).populate('category');
    } catch (e) {
      console.error('Failed to seed default products:', e);
    }
  }

  // 3. Seed Coupon if empty
  const couponCount = await Coupon.countDocuments();
  if (couponCount === 0) {
    try {
      await Coupon.create({
        code: 'SOKOL10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 1500,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-12-31'),
        usageLimit: 500,
        usedCount: 0,
        isActive: true,
      });
    } catch (e) {
      console.error('Failed to seed default coupon:', e);
    }
  }

  // Bangla labels for categories
  const banglaCategoryMap: Record<string, string> = {
    'honey': 'মধু কালেকশন (Honey)',
    'ghee': 'খাঁটি ঘি (Ghee)',
    'spices': 'খাঁটি মসলা গুড়া (Spices)',
    'nuts': 'বাদাম ও বীজ মিক্স (Nuts)',
    'traditional-foods': 'ঐতিহ্যবাহী খাবার (Traditional)',
  };

  return (
    <div className="bg-mesh min-h-screen relative overflow-hidden pb-16">
      {/* Background blobs for premium depth */}
      <div className="absolute top-[-5%] left-[-5%] h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[120px] animate-float-reverse pointer-events-none" />

      {/* Top Notification Promo Banner */}
      <div className="bg-gradient-to-r from-orange-900/5 to-amber-900/5 border-b border-neutral-100 py-2.5 px-4 text-center text-[11px] md:text-xs text-neutral-600 flex justify-center items-center gap-2 font-bold z-20 relative">
        <BadgePercent className="h-4 w-4 text-amber-550 text-amber-655" />
        <span>স্পেশাল প্রোমো কোড: <strong className="text-neutral-800">SOKOL10</strong> ব্যবহারে পাচ্ছেন ১০% ছাড় (ন্যূনতম অর্ডার ১৫০০ টাকা)।</span>
      </div>

      {/* Hero Category Layout Section (inspired by ghorerbazar.com layout) */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 md:py-10 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Category Sidebar (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-3 rounded-3xl glass-card p-5 border border-neutral-200/60 self-start shadow-sm">
            <h3 className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest mb-5 px-1.5 flex items-center justify-between">
              <span>ক্যাটাগরি সমূহ</span>
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            </h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat._id.toString()}>
                  <a
                    href={`#${cat.slug}`}
                    className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-neutral-600 hover:text-orange-600 hover:bg-orange-500/8 border border-transparent hover:border-orange-500/10 transition-all duration-300 group"
                  >
                    <span className="flex items-center gap-3">
                      <Leaf className="h-4 w-4 text-orange-500/60 group-hover:text-orange-500 group-hover:rotate-6 transition-all" />
                      {banglaCategoryMap[cat.slug] || cat.name}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/shop"
                  className="flex items-center justify-between px-3.5 py-3.5 rounded-2xl text-xs font-extrabold text-white bg-orange-600 hover:bg-orange-500 transition-all duration-300 shadow-lg shadow-orange-600/15 hover:shadow-orange-600/35 cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <ShoppingBag className="h-4 w-4" />
                    সব প্রোডাক্ট দেখুন
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Main Slider Column */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <HomeBanner />
          </div>
        </div>
      </section>

      {/* Mobile Category Navigation (Horizontal Scrollbar) */}
      <section className="lg:hidden px-4 mb-6 relative z-10">
        <h3 className="text-[9px] font-bold uppercase text-neutral-500 tracking-wider mb-3 px-1">
          ক্যাটাগরি বেছে নিন
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2.5 scrollbar-none">
          {categories.map((cat) => (
            <a
              key={cat._id.toString()}
              href={`#${cat.slug}`}
              className="flex-none px-4.5 py-2.5 rounded-2xl bg-white border border-neutral-200 text-xs font-bold text-neutral-600 hover:text-orange-600 active:bg-neutral-50 whitespace-nowrap transition-all duration-300"
            >
              {banglaCategoryMap[cat.slug] || cat.name}
            </a>
          ))}
          <Link
            href="/shop"
            className="flex-none px-4.5 py-2.5 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-xs font-bold text-orange-600 whitespace-nowrap"
          >
            সব প্রোডাক্ট
          </Link>
        </div>
      </section>

      {/* Feature / Trust highlights banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 md:my-10 z-10 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="flex items-center gap-4.5 p-5.5 rounded-3xl glass-card-premium border border-neutral-100">
            <div className="h-11 w-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 shrink-0 shadow-inner">
              <Truck className="h-5.5 w-5.5" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-black text-neutral-800 leading-tight">দেশব্যাপী ক্যাশ অন ডেলিভারি</h4>
              <p className="text-[10px] text-neutral-500 mt-1 font-medium">পণ্য বুঝে পেয়ে টাকা পরিশোধ করুন</p>
            </div>
          </div>

          <div className="flex items-center gap-4.5 p-5.5 rounded-3xl glass-card-premium border border-neutral-100">
            <div className="h-11 w-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 shrink-0 shadow-inner">
              <ShieldCheck className="h-5.5 w-5.5" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-black text-neutral-800 leading-tight">১০০% খাঁটি পণ্যের নিশ্চয়তা</h4>
              <p className="text-[10px] text-neutral-500 mt-1 font-medium">১০০% অর্গানিক ও ফ্রেশ ফুড গ্যারান্টি</p>
            </div>
          </div>

          <div className="flex items-center gap-4.5 p-5.5 rounded-3xl glass-card-premium border border-neutral-100">
            <div className="h-11 w-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 shrink-0 shadow-inner">
              <CheckCircle2 className="h-5.5 w-5.5" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-black text-neutral-800 leading-tight">সহজ রিটার্ন পলিসি</h4>
              <p className="text-[10px] text-neutral-500 mt-1 font-medium">পছন্দ না হলে ইনস্ট্যান্ট ফেরতযোগ্য</p>
            </div>
          </div>

          <a href="tel:01810000000" className="flex items-center gap-4.5 p-5.5 rounded-3xl glass-card-premium border border-neutral-100 hover:border-orange-500/20 transition-all cursor-pointer">
            <div className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-550 text-amber-600 shrink-0 shadow-inner">
              <Phone className="h-5.5 w-5.5" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-black text-neutral-800 leading-tight">সহায়তার জন্য কল করুন</h4>
              <p className="text-[10px] text-orange-600 font-bold mt-1">০১৮১-০০০০০০০ (২৪/৭ সাপোর্ট)</p>
            </div>
          </a>
        </div>
      </section>

      {/* Category Wise Products Shelves */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20 relative z-10">
        {categories.map((category) => {
          // Filter products for this specific category
          const categoryProducts = products.filter(
            (prod) =>
              prod.category &&
              (typeof prod.category === 'object'
                ? prod.category.slug === category.slug
                : prod.category === category._id.toString())
          ).slice(0, 4); // Limit to 4 on home screen shelf

          if (categoryProducts.length === 0) return null;

          return (
            <div key={category._id.toString()} id={category.slug} className="scroll-mt-24 space-y-8">
              {/* Shelf Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-100 pb-5 gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-neutral-800 flex items-center gap-3">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                    {banglaCategoryMap[category.slug] || category.name}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    {category.description || `${category.name} collection selected directly for premium pure standards`}
                  </p>
                </div>
                <Link
                  href={`/shop?category=${category.name}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-500 transition-colors shrink-0"
                >
                  সব দেখুন (View All)
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Shelf Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categoryProducts.map((prod) => (
                  <ProductCard key={prod._id.toString()} product={prod} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Guarantee & Sourcing Policy details */}
      <section className="bg-neutral-900/10 border-t border-b border-neutral-200/60 py-16 mt-16 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl font-extrabold text-neutral-800">আমরা কেন সেরা? (Why Choose Us)</h2>
          <p className="mt-3 text-xs md:text-sm text-neutral-500 max-w-xl mx-auto">
            আমরা গ্রাহকদের জন্য খাঁটি, কেমিক্যালমুক্ত এবং প্রাকৃতিক খাবার সরবরাহ করতে প্রতিশ্রুতিবদ্ধ।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="p-6 rounded-2xl glass-card-premium border border-neutral-150 space-y-4 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600">
                <Leaf className="h-5 w-5" />
              </div>
              <h3 className="text-sm md:text-base font-bold text-neutral-800">১০০% খাঁটি ও প্রাকৃতিক</h3>
              <p className="text-xs text-neutral-550 leading-relaxed">
                আমাদের প্রতিটি পণ্য সরাসরি চাষী ও খামারিদের থেকে সংগ্রহ করা হয়। কোনো কৃত্রিম প্রিজারভেটিভ, ভেজাল বা কেমিক্যাল ব্যবহার করা হয় না।
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card-premium border border-neutral-150 space-y-4 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm md:text-base font-bold text-neutral-800">কোয়ালিটি কন্ট্রোল টিম</h3>
              <p className="text-xs text-neutral-550 leading-relaxed">
                আমাদের প্রতিটি ব্যাচ নিজস্ব কোয়ালিটি কন্ট্রোল টিম দ্বারা ল্যাবরেটরি টেস্ট করা হয়। মান বজায় রাখতে কোনো আপোষ করা হয় না।
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card-premium border border-neutral-150 space-y-4 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-sm md:text-base font-bold text-neutral-800">ইনস্ট্যান্ট রিফান্ড গ্যারান্টি</h3>
              <p className="text-xs text-neutral-555 text-neutral-550 leading-relaxed">
                পণ্য গ্রহণের পর যদি কোনো ধরণের ভেজাল বা ত্রুটি প্রমাণিত হয়, তবে আমরা কোনো প্রশ্ন ছাড়াই ইনস্ট্যান্ট রিফান্ড বা এক্সচেঞ্জ অফার করি।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer FAQ / Trust Build Help */}
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-8 z-10 relative">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-extrabold text-neutral-800">সাধারণ জিজ্ঞাসা (Frequently Asked Questions)</h2>
          <p className="text-xs text-neutral-500 mt-2">অর্ডার করা ও প্রোডাক্ট সম্পর্কিত সাধারণ কিছু প্রশ্নের উত্তর</p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl glass-card-premium border border-neutral-150 space-y-2 shadow-xs">
            <h4 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-orange-600 shrink-0" />
              আমি কীভাবে অর্ডার করব?
            </h4>
            <p className="text-xs text-neutral-550 pl-6 leading-relaxed">
              যে পণ্যটি কিনতে চান তার নিচের "অর্ডার করুন (Order Now)" বাটনে ক্লিক করুন। এটি আপনাকে সরাসরি চেকআউট পেজে নিয়ে যাবে। সেখানে নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করে "অর্ডার প্লেস করুন" বাটনে ক্লিক করলেই আপনার অর্ডার সম্পন্ন হবে। কোনো লগইন করার প্রয়োজন নেই!
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card-premium border border-neutral-150 space-y-2 shadow-xs">
            <h4 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-orange-600 shrink-0" />
              ডেলিভারি চার্জ কত এবং কত সময় লাগবে?
            </h4>
            <p className="text-xs text-neutral-550 pl-6 leading-relaxed">
              ঢাকা সিটির ভিতরে ডেলিভারি চার্জ ৬০ টাকা এবং ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি দেওয়া হয়। ঢাকা সিটির বাইরে ডেলিভারি চার্জ ১২০ টাকা এবং ২ থেকে ৩ দিনের মধ্যে ডেলিভারি সম্পন্ন হয়।
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card-premium border border-neutral-150 space-y-2 shadow-xs">
            <h4 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-orange-600 shrink-0" />
              আমি কি ডেলিভারি নেওয়ার সময় পণ্য চেক করতে পারব?
            </h4>
            <p className="text-xs text-neutral-550 pl-6 leading-relaxed">
              হ্যাঁ, অবশ্যই! ডেলিভারি ম্যানের সামনে প্রোডাক্টটি খুলে কালার, দানা, সুগন্ধ এবং সিল যাচাই করে দেখে তারপর মূল্য পরিশোধ করবেন। কোনো সমস্যা থাকলে ডেলিভারি ম্যানের কাছেই রিটার্ন করতে পারবেন।
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
