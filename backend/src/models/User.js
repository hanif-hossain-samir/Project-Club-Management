import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ['user', 'controller', 'administrator'], default: 'user' },
    studentId: { type: String, required: true, trim: true, index: true },
    department: { type: String, default: 'Undergraduate' },
    semester: { type: String },
    clubAffiliation: { type: String, enum: ['computer_club', 'events_and_clubs', null], default: null },
    assignedWing: {
      type: String,
      enum: ['programming', 'cyber_security', 'research', 'sports', 'cultural', 'tour', null],
      default: null
    },
    avatar: { type: String },
    joinedAt: { type: String },
    phone: { type: String }
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
