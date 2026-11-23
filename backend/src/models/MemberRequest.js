import mongoose from 'mongoose';

const memberRequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    department: { type: String, default: 'General' },
    clubId: { type: String, enum: ['computer_club', 'events_and_clubs'], required: true, index: true },
    wingSlug: { type: String, required: true, index: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    submittedAt: { type: String, required: true },
    reviewedAt: String,
    reviewedBy: String
  },
  { timestamps: true }
);

export const MemberRequestModel =
  mongoose.models.MemberRequest || mongoose.model('MemberRequest', memberRequestSchema);
