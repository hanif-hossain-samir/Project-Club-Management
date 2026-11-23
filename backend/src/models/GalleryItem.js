import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    caption: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    clubId: { type: String, enum: ['computer_club', 'events_and_clubs'], required: true, index: true },
    wingSlug: { type: String, required: true, index: true },
    eventName: { type: String, default: 'University Album Photo' },
    date: { type: String, required: true },
    photogName: String,
    likes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const GalleryItemModel =
  mongoose.models.GalleryItem || mongoose.model('GalleryItem', galleryItemSchema);
