import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    clubId: { type: String, enum: ['computer_club', 'events_and_clubs'], default: 'computer_club' },
    category: { type: String, default: 'Club Merchandise' },
    price: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

export const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);
