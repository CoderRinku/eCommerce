import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: { type: String, default: '' },
    shippingAddress: {
      address: { type: String, default: '' },
      district: { type: String, default: '' }, // Inside Dhaka / Outside Dhaka / specific districts
      city: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const User = models.User || model('User', UserSchema);
