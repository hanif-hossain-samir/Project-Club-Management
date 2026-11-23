import mongoose from 'mongoose';

const controllerApplicationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    applicantName: { type: String, required: true, trim: true },
    applicantEmail: { type: String, required: true, lowercase: true, trim: true },
    studentId: { type: String, required: true, trim: true, index: true },
    department: { type: String, default: 'Undergraduate' },
    currentSemester: { type: String, default: '5th Semester' },
    cgpa: { type: String, default: '3.50' },
    targetClub: { type: String, enum: ['computer_club', 'events_and_clubs'], required: true },
    targetWing: { type: String, required: true },
    statementOfIntent: { type: String, required: true },
    experience: { type: String, default: 'Active university volunteer' },
    portfolioLink: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    submittedAt: { type: String, required: true },
    reviewedAt: String,
    reviewedBy: String,
    adminNotes: String
  },
  { timestamps: true }
);

export const ControllerApplicationModel =
  mongoose.models.ControllerApplication ||
  mongoose.model('ControllerApplication', controllerApplicationSchema);
