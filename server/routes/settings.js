import { Router } from 'express';
import UserSettings, { DEFAULT_INTERVALS } from '../models/UserSettings.js';
import { authMiddleware } from '../middleware/auth.js';
import { PLATFORMS } from '../models/Question.js';
import { getUserTags } from '../services/statsService.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const settings = await UserSettings.getForUser(req.userId);
    const tags = await getUserTags(req.userId);

    res.json({
      revisionIntervals: settings.getIntervalsObject(),
      interviewTargetDate: settings.interviewTargetDate,
      weeklyEmailEnabled: settings.weeklyEmailEnabled,
      pushNotificationsEnabled: settings.pushNotificationsEnabled,
      platforms: PLATFORMS,
      tags,
      defaultIntervals: DEFAULT_INTERVALS,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const settings = await UserSettings.getForUser(req.userId);
    const { revisionIntervals, interviewTargetDate, weeklyEmailEnabled, pushNotificationsEnabled } = req.body;

    if (revisionIntervals) {
      for (const [k, v] of Object.entries(revisionIntervals)) {
        const key = Number(k);
        const val = Number(v);
        if (key >= 1 && key <= 5 && val >= 1 && val <= 365) {
          settings.revisionIntervals.set(String(key), val);
        }
      }
    }
    if (interviewTargetDate !== undefined) {
      settings.interviewTargetDate = interviewTargetDate ? new Date(interviewTargetDate) : null;
    }
    if (weeklyEmailEnabled !== undefined) settings.weeklyEmailEnabled = Boolean(weeklyEmailEnabled);
    if (pushNotificationsEnabled !== undefined) {
      settings.pushNotificationsEnabled = Boolean(pushNotificationsEnabled);
    }

    await settings.save();
    const tags = await getUserTags(req.userId);

    res.json({
      revisionIntervals: settings.getIntervalsObject(),
      interviewTargetDate: settings.interviewTargetDate,
      weeklyEmailEnabled: settings.weeklyEmailEnabled,
      pushNotificationsEnabled: settings.pushNotificationsEnabled,
      platforms: PLATFORMS,
      tags,
      defaultIntervals: DEFAULT_INTERVALS,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
