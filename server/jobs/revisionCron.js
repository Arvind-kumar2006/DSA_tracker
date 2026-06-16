import cron from 'node-cron';
import { processRevisionAlerts, findDueQuestions } from '../services/revisionAlertService.js';
import { isEmailConfigured } from '../services/emailService.js';
import User from '../models/User.js';
import UserSettings from '../models/UserSettings.js';

const DEFAULT_SCHEDULE = '0 8 * * *';
const WEEKLY_SCHEDULE = '0 9 * * 0';

async function logEmailStatus() {
  if (!isEmailConfigured()) {
    console.log('Email alerts: SMTP not configured');
    return;
  }

  const recipient = process.env.DEFAULT_ALERT_EMAIL || process.env.SMTP_USER;
  let dueCount = 0;

  const users = await User.find();
  for (const user of users) {
    const settings = await UserSettings.getForUser(user._id);
    dueCount += (await findDueQuestions(user._id, settings.getIntervalsObject())).length;
  }

  console.log(`Email alerts: recipient=${recipient}, due today=${dueCount}`);
}

export function startRevisionCron() {
  if (!isEmailConfigured()) {
    console.log('Email alerts: SMTP not configured — skipping cron setup');
    return;
  }

  logEmailStatus().catch(() => {});

  const schedule = process.env.ALERT_CRON_SCHEDULE || DEFAULT_SCHEDULE;

  if (!cron.validate(schedule)) {
    console.error(`Email alerts: invalid cron schedule "${schedule}"`);
    return;
  }

  cron.schedule(schedule, async () => {
    console.log(`[${new Date().toISOString()}] Running revision alert check...`);
    try {
      const result = await processRevisionAlerts();
      if (result.sent) {
        console.log(`Sent revision digest to ${result.recipient} (${result.count} questions)`);
      } else {
        console.log(`No alert sent: ${result.reason}`);
      }
    } catch (err) {
      console.error('Revision alert cron failed:', err.message);
    }
  });

  if (cron.validate(WEEKLY_SCHEDULE)) {
    cron.schedule(WEEKLY_SCHEDULE, async () => {
      console.log(`[${new Date().toISOString()}] Running weekly summary...`);
      try {
        const { processWeeklySummaries } = await import('../services/revisionAlertService.js');
        await processWeeklySummaries();
      } catch (err) {
        console.error('Weekly summary cron failed:', err.message);
      }
    });
    console.log(`Weekly summary: cron scheduled (${WEEKLY_SCHEDULE})`);
  }

  console.log(`Email alerts: cron scheduled (${schedule})`);
}
