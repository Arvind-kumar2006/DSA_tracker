import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    revisionCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('Activity', activitySchema);
