import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Coupon } from '@/models/Coupon';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json(coupons);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    return NextResponse.json(
      { message: 'Failed to fetch coupons', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    await connectToDatabase();

    // 1. Validate Coupon Action (Public Endpoint)
    if (action === 'validate') {
      const { code, cartTotal } = body;
      if (!code) {
        return NextResponse.json({ message: 'Coupon code is required' }, { status: 400 });
      }

      const coupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (!coupon) {
        return NextResponse.json({ message: 'Invalid coupon code' }, { status: 404 });
      }

      if (!coupon.isActive) {
        return NextResponse.json({ message: 'Coupon is inactive' }, { status: 400 });
      }

      const now = new Date();
      if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
        return NextResponse.json({ message: 'Coupon has expired' }, { status: 400 });
      }

      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ message: 'Coupon usage limit reached' }, { status: 400 });
      }

      if (cartTotal !== undefined && cartTotal < coupon.minOrderAmount) {
        return NextResponse.json(
          {
            message: `Minimum order amount of BDT ${coupon.minOrderAmount} required for this coupon`,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: 'Coupon validated successfully',
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderAmount: coupon.minOrderAmount,
        },
      });
    }

    // 2. Create Coupon Action (Admin Protected)
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }

    const { code, discountType, discountValue, minOrderAmount, startDate, endDate, usageLimit } =
      body;

    if (!code || !discountType || discountValue === undefined || !startDate || !endDate) {
      return NextResponse.json({ message: 'Missing required coupon fields' }, { status: 400 });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { message: 'A coupon with this code already exists' },
        { status: 400 }
      );
    }

    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit: usageLimit !== undefined ? usageLimit : null,
      usedCount: 0,
      isActive: true,
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    return NextResponse.json(
      { message: 'Coupon operation failed', error: errorMessage },
      { status: 500 }
    );
  }
}
