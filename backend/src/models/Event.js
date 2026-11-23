import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    userId: String,
    userName: { type: String, required: true },
    studentId: { type: String, required: true },
    email: { type: String, required: true },
    department: String,
    registeredAt: String,
    ticketCode: String
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    clubId: { type: String, enum: ['computer_club', 'events_and_clubs'], required: true, index: true },
    wingSlug: { type: String, required: true, index: true },
    category: { type: String, default: 'General Event' },
    kicker: String,
    description: { type: String, default: '' },
    fullDetails: { type: String, default: '' },
    bannerUrl: String,
    date: { type: String, required: true },
    time: String,
    venue: { type: String, required: true },
    registrationDeadline: String,
    capacity: { type: Number, default: 100 },
    registeredCount: { type: Number, default: 0 },
    chiefGuests: [String],
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['upcoming', 'ongoing', 'past'], default: 'upcoming' },
    registrations: [registrationSchema]
  },
  { timestamps: true }
);

export const EventModel = mongoose.models.Event || mongoose.model('Event', eventSchema);
