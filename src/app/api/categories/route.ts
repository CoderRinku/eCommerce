import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/Category';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();

    let categories = await Category.find({ isActive: true });

    // Auto-seed default categories if empty
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Honey', slug: 'honey', description: 'Raw and organic raw forest honey and honey comb' },
        { name: 'Ghee', slug: 'ghee', description: 'Pure grass-fed premium hand-churned cow ghee' },
        { name: 'Spices', slug: 'spices', description: '100% pure native spices ground to perfection' },
        { name: 'Nuts', slug: 'nuts', description: 'Premium selection of premium nuts and seed mixes' },
        { name: 'Traditional Foods', slug: 'traditional-foods', description: 'Homemade traditional pickles, molasses, and snacks' },
      ];

      await Category.create(defaultCategories);
      categories = await Category.find({ isActive: true });
    }

    return NextResponse.json(categories);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { message: 'Failed to fetch categories', error: err.message },
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

    const { name, description, image } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    await connectToDatabase();

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json({ message: 'Category already exists' }, { status: 400 });
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      image: image || '',
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { message: 'Failed to create category', error: err.message },
      { status: 500 }
    );
  }
}
