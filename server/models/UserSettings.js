import mongoose from 'mongoose';

export const DEFAULT_INTERVALS = { 1: 2, 2: 3, 3: 5, 4: 7, 5: 10 };

const userSettingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    revisionIntervals: {
      type: Map,
      of: Number,
      default: () => new Map(Object.entries(DEFAULT_INTERVALS)),
    },
    interviewTargetDate: { type: Date, default: null },
    weeklyEmailEnabled: { type: Boolean, default: true },
    pushNotificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSettingsSchema.statics.getForUser = async function (userId) {
  let settings = await this.findOne({ user: userId });
  if (!settings) {
    settings = await this.create({ user: userId });
  }
  return settings;
};

userSettingsSchema.methods.getIntervalsObject = function () {
  const obj = { ...DEFAULT_INTERVALS };
  if (this.revisionIntervals) {
    for (const [k, v] of this.revisionIntervals.entries()) {
      obj[Number(k)] = v;
    }
  }
  return obj;
};

export default mongoose.model('UserSettings', userSettingsSchema);
