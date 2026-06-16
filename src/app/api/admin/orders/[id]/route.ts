import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { orderStatus, paymentStatus, courierStatus } = body;

    await connectToDatabase();

    const updateFields: Record<string, string> = {};
    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (courierStatus) updateFields['courierDetails.courierStatus'] = courierStatus;

    const updatedOrder = await Order.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    return NextResponse.json(
      { message: 'Failed to update order', error: errorMessage },
      { status: 500 }
    );
  }
}
