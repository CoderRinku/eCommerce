import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { Coupon } from '@/models/Coupon';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCourierOrder } from '@/lib/courier-sdk';

// Rollback helper to restore stock if checkout fails midway
async function rollbackStock(items: { productId: string; quantity: number }[]) {
  for (const item of items) {
    await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized. Login required' }, { status: 401 });
    }

    await connectToDatabase();

    // If administrator, return all orders, otherwise just return the user's orders
    const query = session.user.role === 'admin' ? {} : { user: session.user.id };

    const orders = await Order.find(query)
      .populate('orderItems.product')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    return NextResponse.json(
      { message: 'Failed to fetch orders', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const deductedItems: { productId: string; quantity: number }[] = [];
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized. Login required' }, { status: 401 });
    }

    const body = await req.json();
    const { orderItems, shippingAddress, paymentMethod, couponApplied } = body;

    if (!orderItems || orderItems.length === 0 || !shippingAddress) {
      return NextResponse.json(
        { message: 'Missing order items or shipping details' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Validate items and verify stocks
    let subTotal = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct || !dbProduct.isActive) {
        await rollbackStock(deductedItems);
        return NextResponse.json(
          { message: `Product not found or unavailable` },
          { status: 400 }
        );
      }

      // Deduct stock safely (prevents race conditions)
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity }, isActive: true },
        { $inc: { stock: -item.quantity } }
      );

      if (result.modifiedCount === 0) {
        await rollbackStock(deductedItems);
        return NextResponse.json(
          { message: `Insufficient stock for product: ${dbProduct.title}` },
          { status: 400 }
        );
      }

      deductedItems.push({ productId: item.product.toString(), quantity: item.quantity });

      const itemPrice = dbProduct.discountPrice > 0 ? dbProduct.discountPrice : dbProduct.price;
      subTotal += itemPrice * item.quantity;
      validatedItems.push({
        product: dbProduct._id,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    // 2. Validate Coupon if applied
    let discountAmount = 0;
    let couponDoc = null;
    if (couponApplied) {
      couponDoc = await Coupon.findOne({ code: couponApplied.toUpperCase(), isActive: true });
      if (couponDoc) {
        const now = new Date();
        const isValidDate =
          now >= new Date(couponDoc.startDate) && now <= new Date(couponDoc.endDate);
        const withinLimit =
          couponDoc.usageLimit === null || couponDoc.usedCount < couponDoc.usageLimit;
        const meetsMinAmount = subTotal >= couponDoc.minOrderAmount;

        if (isValidDate && withinLimit && meetsMinAmount) {
          if (couponDoc.discountType === 'percentage') {
            discountAmount = Math.round((subTotal * couponDoc.discountValue) / 100);
          } else {
            discountAmount = couponDoc.discountValue;
          }
        }
      }
    }

    // 3. Shipping Charge Logic
    // Inside Dhaka: BDT 60, Outside Dhaka: BDT 120
    const isInsideDhaka = shippingAddress.district.toLowerCase().includes('dhaka');
    const shippingCharge = isInsideDhaka
      ? Number(process.env.SHIPPING_CHARGE_INSIDE_DHAKA) || 60
      : Number(process.env.SHIPPING_CHARGE_OUTSIDE_DHAKA) || 120;

    const totalAmount = subTotal + shippingCharge - discountAmount;

    // 4. Create Order in Database
    const order = await Order.create({
      user: session.user.id,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid', // Prepaid marked Paid instantly in mock setup
      shippingCharge,
      discountAmount,
      subTotal,
      totalAmount,
      orderStatus: 'Pending',
      couponApplied: couponApplied || '',
    });

    // 5. Auto Dispatch to Courier System
    // COD amount is what the courier collects. If order is prepaid, COD collection is 0.
    const codAmountToCollect = paymentMethod === 'COD' ? totalAmount : 0;
    const courierResult = await createCourierOrder({
      invoiceId: order._id.toString(),
      recipientName: shippingAddress.name,
      recipientPhone: shippingAddress.phone,
      recipientAddress: `${shippingAddress.address}, ${shippingAddress.city}`,
      codAmount: codAmountToCollect,
      note: `Coupon: ${couponApplied || 'None'}. Subtotal: ${subTotal}`,
    });

    if (courierResult.success) {
      order.courierDetails = {
        courierName: 'Steadfast',
        trackingId: courierResult.trackingId,
        consignmentId: courierResult.consignmentId,
        courierStatus: courierResult.courierStatus,
      };
      await order.save();
    }

    // 6. Increment coupon used count if valid coupon applied
    if (couponDoc) {
      await Coupon.updateOne({ _id: couponDoc._id }, { $inc: { usedCount: 1 } });
    }

    return NextResponse.json(
      {
        message: 'Order created successfully',
        orderId: order._id,
        trackingId: order.courierDetails?.trackingId,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    console.error('Order creation failed:', errorMessage);
    // Rollback any stocks deducted in this session
    await rollbackStock(deductedItems);
    return NextResponse.json(
      { message: 'Order creation failed', error: errorMessage },
      { status: 500 }
    );
  }
}
