import { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 },
    images: [{ type: String, required: true }], // Image URLs
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Optimize query routing via slug search index
ProductSchema.index({ slug: 1 });

export const Product = models.Product || model('Product', ProductSchema);
