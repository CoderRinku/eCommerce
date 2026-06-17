import mongoose, { Schema } from 'mongoose';

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  weight: { type: Number, required: true }, // Weight at checkout
});

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // Optional for guest checkout
    orderItems: [OrderItemSchema],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      district: { type: String, required: true }, // 'Inside Dhaka' or 'Outside Dhaka'
    },
    paymentMethod: { type: String, enum: ['COD', 'bKash', 'Nagad'], required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    shippingCharge: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    subTotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    totalWeight: { type: Number, required: true }, // Accumulated order weight (in grams) for Courier API calculations
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    courierDetails: {
      courierName: { type: String, default: 'Steadfast' },
      consignmentId: { type: String },
      trackingId: { type: String },
      courierStatus: { type: String },
      statusUpdatedByWebhookAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
