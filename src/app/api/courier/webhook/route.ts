import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/Order';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { status, tracking_code, invoice } = body;

    if (!tracking_code || !status) {
      return NextResponse.json({ message: 'Missing status or tracking code' }, { status: 400 });
    }

    await connectToDatabase();

    let order = null;
    if (invoice && invoice.length === 24) {
      // Validate MongoDB ObjectId format
      order = await Order.findById(invoice);
    }

    if (!order) {
      order = await Order.findOne({ 'courierDetails.trackingId': tracking_code });
    }

    if (!order) {
      return NextResponse.json({ message: 'Associated order not found' }, { status: 404 });
    }

    // Map Steadfast courier status to local order/payment states
    let mappedOrderStatus = order.orderStatus;
    let mappedPaymentStatus = order.paymentStatus;

    const lowStatus = status.toLowerCase();
    if (lowStatus === 'delivered') {
      mappedOrderStatus = 'Delivered';
      mappedPaymentStatus = 'Paid'; // Courier has collected the Cash
    } else if (lowStatus === 'cancelled' || lowStatus === 'returned') {
      mappedOrderStatus = 'Cancelled';
    } else if (lowStatus === 'in_transit' || lowStatus === 'shipped') {
      mappedOrderStatus = 'Shipped';
    } else if (lowStatus === 'delivered_reverse' || lowStatus === 'return_received') {
      mappedOrderStatus = 'Cancelled';
      mappedPaymentStatus = 'Refunded';
    }

    order.orderStatus = mappedOrderStatus;
    order.paymentStatus = mappedPaymentStatus;
    order.courierDetails.courierStatus = status;
    order.courierDetails.statusUpdatedByWebhookAt = new Date();

    await order.save();

    return NextResponse.json({ message: 'Webhook update processed successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    console.error('Courier webhook processing failed:', errorMessage);
    return NextResponse.json(
      { message: 'Webhook processing failed', error: errorMessage },
      { status: 500 }
    );
  }
}
