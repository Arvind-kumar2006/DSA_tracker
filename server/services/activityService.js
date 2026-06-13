import Activity from '../models/Activity.js';
import { startOfDay } from '../utils/revision.js';

export async function recordRevision(userId) {
  const today = startOfDay();
  await Activity.findOneAndUpdate(
    { user: userId, date: today },
    { $inc: { revisionCount: 1 } },
    { upsert: true, new: true }
  );
}

export async function getUserActivities(userId, limit = 90) {
  return Activity.find({ user: userId }).sort({ date: -1 }).limit(limit);
}
