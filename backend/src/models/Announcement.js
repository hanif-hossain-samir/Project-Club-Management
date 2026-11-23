import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    clubId: { type: String, enum: ['computer_club', 'events_and_clubs', 'all'], default: 'all', index: true },
    wingSlug: { type: String, default: 'all' },
    priority: { type: String, enum: ['urgent', 'important', 'general', 'competition'], default: 'general' },
    publishedAt: { type: String, required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, required: true },
    attachmentName: String,
    imageUrl: String,
    category: { type: String, default: 'Notice' },
    pinned: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export const AnnouncementModel =
  mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
