import mongoose from 'mongoose';

const confidenceHistorySchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    confidenceLevel: { type: Number, required: true, min: 1, max: 5 },
    revisedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

confidenceHistorySchema.index({ question: 1, revisedAt: -1 });

export default mongoose.model('ConfidenceHistory', confidenceHistorySchema);
