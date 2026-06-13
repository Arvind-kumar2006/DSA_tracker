import mongoose from 'mongoose';
import { DEFAULT_INTERVALS } from './UserSettings.js';

export const PLATFORMS = ['LeetCode', 'GFG', 'Codeforces', 'Other'];

const questionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    questionName: { type: String, required: true, trim: true },
    problemUrl: { type: String, default: '', trim: true },
    platform: { type: String, required: true, enum: PLATFORMS },
    tags: [{ type: String, trim: true }],
    approach: { type: String, default: '' },
    timeComplexity: { type: String, default: '' },
    confidenceLevel: { type: Number, required: true, min: 1, max: 5 },
    lastRevisedDate: { type: Date, required: true },
    mistakeNotes: { type: String, default: '' },
    customRevisionDays: { type: Number, min: 1, max: 365, default: null },
    customReminderDate: { type: Date, default: null },
  },
  { timestamps: true }
);

questionSchema.virtual('nextRevisionDate').get(function () {
  if (this.customReminderDate) return new Date(this.customReminderDate);
  const days = this.customRevisionDays || DEFAULT_INTERVALS[this.confidenceLevel] || 5;
  const next = new Date(this.lastRevisedDate);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return next;
});

questionSchema.set('toJSON', { virtuals: true });
questionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Question', questionSchema);
