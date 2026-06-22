import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category'; // Register Category model for population
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { ProductInteractive } from '@/components/shop/ProductInteractive';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectToDatabase();

  // Populate category model to pull the readable name
  const productDoc = await Product.findOne({ slug, isActive: true }).populate('category');
  if (!productDoc) {
    notFound();
  }

  // Format mongoose doc to plain object for React Server Component boundary compliance
  const product = {
    _id: productDoc._id.toString(),
    title: productDoc.title,
    slug: productDoc.slug,
    description: productDoc.description,
    price: productDoc.price,
    discountPrice: productDoc.discountPrice,
    images: productDoc.images,
    category: productDoc.category && typeof productDoc.category === 'object' && 'name' in productDoc.category
      ? (productDoc.category.name as string)
      : 'Organic Food',
    stock: productDoc.stock,
    isOrganic: productDoc.isOrganic ?? true,
    weight: productDoc.weight || 0,
    unit: productDoc.unit || 'g',
  };

  const hasDiscount = product.discountPrice > 0;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-mesh min-h-screen py-16 px-6 max-w-7xl mx-auto w-full flex-1 animate-fade-in">
      {/* Back to Shop link */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-orange-600 mb-12 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Product Image Panel */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            priority
            sizes="(max-w-1024px) 100vw, 50vw"
            className="object-cover"
          />
          {hasDiscount && (
            <span className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-orange-600 text-xs font-bold text-white shadow-lg">
              Save BDT {(product.price - product.discountPrice).toLocaleString()}
            </span>
          )}
        </div>

        {/* Product Info details */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs text-neutral-550 text-neutral-500 font-semibold uppercase tracking-wider">
                {product.category}
              </span>
              {product.isOrganic && (
                <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-orange-600 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span>🍃</span> 100% Organic
                </span>
              )}
              <span className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs text-neutral-550 text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>⚖️</span> {product.weight} {product.unit}
              </span>
            </div>

            <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-neutral-800 leading-tight">
              {product.title}
            </h1>

            {/* Pricing Section */}
            <div className="mt-6 flex items-baseline gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-extrabold text-orange-600 text-amber-500">
                    BDT {product.discountPrice.toLocaleString()}
                  </span>
                  <span className="text-base text-neutral-400 text-neutral-500 line-through">
                    BDT {product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-extrabold text-neutral-800">
                  BDT {product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Level Indicator */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  isOutOfStock
                    ? 'bg-rose-500 animate-pulse'
                    : product.stock <= 10
                    ? 'bg-amber-500'
                    : 'bg-orange-500'
                }`}
              />
              <span className="text-xs text-neutral-500 font-medium">
                {isOutOfStock
                  ? 'Sold Out'
                  : product.stock <= 10
                  ? `Only ${product.stock} items left in stock!`
                  : 'Available in stock'}
              </span>
            </div>

            {/* Description details */}
            <p className="mt-8 text-neutral-600 text-sm leading-relaxed border-t border-neutral-200 pt-8">
              {product.description}
            </p>
          </div>

          {/* Action Call & Trust Badges */}
          <div className="mt-12 space-y-8 border-t border-neutral-200 pt-8">
            <ProductInteractive product={product} />

            {/* Quality indicators */}
            <div className="grid grid-cols-3 gap-4 border-t border-neutral-200 pt-8 text-center text-[10px] sm:text-xs text-neutral-500">
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span>Express Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-orange-600" />
                <span>COD Doorstep Support</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-5 w-5 text-orange-600" />
                <span>Quality Inspected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
