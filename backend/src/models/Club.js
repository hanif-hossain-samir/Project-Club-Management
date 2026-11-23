import mongoose from 'mongoose';

const convenerSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    designation: String,
    department: String,
    avatar: String,
    email: String
  },
  { _id: false }
);

const achievementSchema = new mongoose.Schema(
  {
    year: String,
    title: String,
    description: String
  },
  { _id: false }
);

const clubWingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    clubId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    kicker: String,
    badge: String,
    iconName: String,
    shortDesc: String,
    fullDesc: String,
    bannerUrl: String,
    vision: String,
    weeklySchedule: String,
    roomLocation: String,
    conveners: [convenerSchema],
    keyActivities: [String],
    pastAchievements: [achievementSchema],
    membershipPerks: [String]
  },
  { _id: false }
);

const clubSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    shortCode: { type: String, required: true },
    categoryName: String,
    motto: String,
    establishedYear: Number,
    totalMembers: { type: Number, default: 0 },
    logoUrl: String,
    email: String,
    hotline: String,
    presidentName: String,
    advisorName: String,
    advisorDesignation: String,
    wings: [clubWingSchema]
  },
  { timestamps: true }
);

export const ClubModel = mongoose.models.Club || mongoose.model('Club', clubSchema);
