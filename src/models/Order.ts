import { Schema, model, models } from 'mongoose';

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // Snapshotted price at transaction checkout
});

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [OrderItemSchema],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      district: { type: String, required: true }, // e.g., 'Inside Dhaka', 'Outside Dhaka' for shipping rule calculation
      city: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['COD', 'bKash', 'Nagad'], default: 'COD' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    paymentDetails: {
      transactionId: { type: String },
      paymentGateway: { type: String }, // 'bkash', 'nagad', or null for COD
    },
    shippingCharge: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    subTotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    courierDetails: {
      courierName: { type: String, default: 'Steadfast' },
      trackingId: { type: String, default: '' },
      consignmentId: { type: String, default: '' },
      courierStatus: { type: String, default: 'Pending' },
      statusUpdatedByWebhookAt: { type: Date },
    },
    couponApplied: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Order = models.Order || model('Order', OrderSchema);
