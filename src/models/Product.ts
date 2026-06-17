import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    images: [{ type: String, required: true }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, required: true, default: 0 },
    isOrganic: { type: Boolean, default: true },
    weight: { type: Number, required: true }, // Weight in grams, ml, or quantity
    unit: { type: String, enum: ['g', 'kg', 'ml', 'litre', 'pcs'], default: 'g' },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
