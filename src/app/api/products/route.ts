import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryQuery = searchParams.get('category');
    const isFeatured = searchParams.get('featured');
    const search = searchParams.get('search');

    await connectToDatabase();

    // Ensure categories are seeded first
    let categoriesList = await Category.find({ isActive: true });
    if (categoriesList.length === 0) {
      const defaultCategories = [
        { name: 'Honey', slug: 'honey', description: 'Raw and organic raw forest honey and honey comb' },
        { name: 'Ghee', slug: 'ghee', description: 'Pure grass-fed premium hand-churned cow ghee' },
        { name: 'Spices', slug: 'spices', description: '100% pure native spices ground to perfection' },
        { name: 'Nuts', slug: 'nuts', description: 'Premium selection of premium nuts and seed mixes' },
        { name: 'Traditional Foods', slug: 'traditional-foods', description: 'Homemade traditional pickles, molasses, and snacks' },
      ];
      await Category.create(defaultCategories);
      categoriesList = await Category.find({ isActive: true });
    }

    // Auto-seed default organic products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const honeyCat = categoriesList.find((c) => c.slug === 'honey');
      const gheeCat = categoriesList.find((c) => c.slug === 'ghee');
      const spicesCat = categoriesList.find((c) => c.slug === 'spices');
      const nutsCat = categoriesList.find((c) => c.slug === 'nuts');
      const traditionalCat = categoriesList.find((c) => c.slug === 'traditional-foods');

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
          isFeatured: false,
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
    }

    const query: { isActive: boolean; category?: mongoose.Types.ObjectId; isFeatured?: boolean; $or?: Array<Record<string, unknown>> } = { isActive: true };

    if (categoryQuery && categoryQuery !== 'all') {
      const matchedCat = categoriesList.find(
        (c) => c.slug === categoryQuery || c._id.toString() === categoryQuery
      );
      if (matchedCat) {
        query.category = matchedCat._id;
      } else if (mongoose.Types.ObjectId.isValid(categoryQuery)) {
        query.category = new mongoose.Types.ObjectId(categoryQuery);
      } else {
        return NextResponse.json([]);
      }
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { message: 'Failed to fetch products', error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug,
      description,
      price,
      discountPrice,
      images,
      category,
      stock,
      isOrganic,
      weight,
      unit,
      isFeatured,
    } = body;

    if (
      !title ||
      !slug ||
      !description ||
      price === undefined ||
      !images ||
      !category ||
      stock === undefined ||
      weight === undefined
    ) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const cleanSlug = slug.toLowerCase().trim().replace(/\s+/g, '-');

    const existingProduct = await Product.findOne({ slug: cleanSlug });
    if (existingProduct) {
      return NextResponse.json(
        { message: 'A product with this slug already exists' },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      title,
      slug: cleanSlug,
      description,
      price,
      discountPrice: discountPrice || 0,
      images,
      category,
      stock,
      isOrganic: isOrganic !== undefined ? !!isOrganic : true,
      weight,
      unit: unit || 'g',
      isFeatured: !!isFeatured,
      isActive: true,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { message: 'Failed to create product', error: err.message },
      { status: 500 }
    );
  }
}
