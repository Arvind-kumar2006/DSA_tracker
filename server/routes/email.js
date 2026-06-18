import { Router } from 'express';
import User from '../models/User.js';
import {
  isEmailConfigured,
  sendTestEmail,
  verifySmtpConnection,
} from '../services/emailService.js';
import { processRevisionAlerts, findDueQuestions } from '../services/revisionAlertService.js';
import UserSettings from '../models/UserSettings.js';

const router = Router();

function getRecipient() {
  return process.env.DEFAULT_ALERT_EMAIL || process.env.SMTP_USER;
}

router.get('/status', async (_req, res) => {
  try {
    const recipient = getRecipient();
    let dueCount = 0;

    if (recipient) {
      const users = await User.find();
      for (const user of users) {
        const settings = await UserSettings.getForUser(user._id);
        const intervals = settings.getIntervalsObject();
        dueCount += (await findDueQuestions(user._id, intervals)).length;
      }
    }

    res.json({
      smtpConfigured: isEmailConfigured(),
      alertsEnabled: process.env.ALERTS_ENABLED !== 'false',
      recipient,
      cronSchedule: process.env.ALERT_CRON_SCHEDULE || '0 8 * * *',
      dueCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/test', async (_req, res) => {
  try {
    if (!isEmailConfigured()) {
      return res.status(400).json({ error: 'SMTP not configured in server/.env' });
    }

    const recipient = getRecipient();
    if (!recipient) {
      return res.status(400).json({ error: 'DEFAULT_ALERT_EMAIL not set' });
    }

    await verifySmtpConnection();
    await sendTestEmail(recipient);

    res.json({ message: `Test email sent to ${recipient}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/send-now', async (req, res) => {
  try {
    const result = await processRevisionAlerts({ force: Boolean(req.body?.force) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/send-now', async (req, res) => {
  try {
    const result = await processRevisionAlerts({ force: false });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
