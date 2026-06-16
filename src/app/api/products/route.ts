import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const isFeatured = searchParams.get('featured');
    const search = searchParams.get('search');

    await connectToDatabase();

    const query: { isActive: boolean; category?: string; isFeatured?: boolean; $or?: Array<Record<string, unknown>> } = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
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

    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    return NextResponse.json(
      { message: 'Failed to fetch products', error: errorMessage },
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
      isFeatured,
    } = body;

    if (
      !title ||
      !slug ||
      !description ||
      price === undefined ||
      !images ||
      !category ||
      stock === undefined
    ) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const existingProduct = await Product.findOne({ slug: slug.toLowerCase() });
    if (existingProduct) {
      return NextResponse.json(
        { message: 'A product with this slug already exists' },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      title,
      slug: slug.toLowerCase(),
      description,
      price,
      discountPrice: discountPrice || 0,
      images,
      category,
      stock,
      isFeatured: !!isFeatured,
      isActive: true,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    return NextResponse.json(
      { message: 'Failed to create product', error: errorMessage },
      { status: 500 }
    );
  }
}
