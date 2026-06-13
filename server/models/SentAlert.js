import mongoose from 'mongoose';

const sentAlertSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    alertDate: { type: Date, required: true },
  },
  { timestamps: true }
);

sentAlertSchema.index({ questionId: 1, alertDate: 1 }, { unique: true });

export default mongoose.model('SentAlert', sentAlertSchema);
