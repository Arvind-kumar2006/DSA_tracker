import cron from 'node-cron';
import { processRevisionAlerts, processWeeklySummaries } from '../services/revisionAlertService.js';
import { isEmailConfigured } from '../services/emailService.js';

const DEFAULT_SCHEDULE = '0 8 * * *';
const WEEKLY_SCHEDULE = '0 9 * * 0';

export function startRevisionCron() {
  if (!isEmailConfigured()) {
    console.log('Email alerts: SMTP not configured — skipping cron setup');
    return;
  }

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
      }
    } catch (err) {
      console.error('Revision alert cron failed:', err.message);
    }
  });

  if (cron.validate(WEEKLY_SCHEDULE)) {
    cron.schedule(WEEKLY_SCHEDULE, async () => {
      console.log(`[${new Date().toISOString()}] Running weekly summary...`);
      try {
        await processWeeklySummaries();
      } catch (err) {
        console.error('Weekly summary cron failed:', err.message);
      }
    });
    console.log(`Weekly summary: cron scheduled (${WEEKLY_SCHEDULE})`);
  }

  console.log(`Email alerts: cron scheduled (${schedule})`);
}
