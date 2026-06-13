import Question from '../models/Question.js';
import UserSettings from '../models/UserSettings.js';
import SentAlert from '../models/SentAlert.js';
import { isDueForRevision, startOfDay } from '../utils/revision.js';
import { isEmailConfigured, sendRevisionDigest, sendWeeklySummary } from './emailService.js';

export async function findDueQuestions(userId, intervals) {
  const questions = await Question.find({ user: userId });
  return questions.filter((q) => isDueForRevision(q, intervals));
}

export async function findUnsentDueQuestions(userId, intervals) {
  const due = await findDueQuestions(userId, intervals);
  const today = startOfDay();
  const unsent = [];

  for (const q of due) {
    const alreadySent = await SentAlert.findOne({ questionId: q._id, alertDate: today });
    if (!alreadySent) unsent.push(q);
  }
  return unsent;
}

async function markAlertsSent(questions) {
  const today = startOfDay();
  const records = questions.map((q) => ({ questionId: q._id, alertDate: today }));
  await SentAlert.insertMany(records, { ordered: false }).catch(() => {});
}

function getRecipientEmail() {
  return process.env.DEFAULT_ALERT_EMAIL || process.env.SMTP_USER;
}

function areAlertsEnabled() {
  return process.env.ALERTS_ENABLED !== 'false';
}

export async function processRevisionAlerts({ force = false, userId } = {}) {
  if (!isEmailConfigured()) {
    return { sent: false, reason: 'SMTP not configured', count: 0 };
  }
  if (!areAlertsEnabled()) {
    return { sent: false, reason: 'Alerts disabled', count: 0 };
  }

  const recipient = getRecipientEmail();
  if (!recipient) {
    return { sent: false, reason: 'No recipient email configured', count: 0 };
  }

  const settings = userId
    ? await UserSettings.getForUser(userId)
    : null;
  const intervals = settings?.getIntervalsObject() || undefined;

  const query = userId ? { user: userId } : {};
  const allQuestions = await Question.find(query);
  const userIntervals = intervals || { 1: 2, 2: 3, 3: 5, 4: 7, 5: 10 };

  const due = allQuestions.filter((q) => isDueForRevision(q, userIntervals));
  let questions = due;

  if (!force) {
    const today = startOfDay();
    const unsent = [];
    for (const q of due) {
      const alreadySent = await SentAlert.findOne({ questionId: q._id, alertDate: today });
      if (!alreadySent) unsent.push(q);
    }
    questions = unsent;
  }

  if (questions.length === 0) {
    return { sent: false, reason: 'No due questions', count: 0 };
  }

  await sendRevisionDigest(recipient, questions, userIntervals);
  if (!force) await markAlertsSent(questions);

  return { sent: true, count: questions.length, recipient };
}

export async function processWeeklySummaries() {
  if (!isEmailConfigured() || !areAlertsEnabled()) return;

  const recipient = getRecipientEmail();
  if (!recipient) return;

  const users = await UserSettings.find({ weeklyEmailEnabled: true });
  for (const setting of users) {
    const intervals = setting.getIntervalsObject();
    const questions = await Question.find({ user: setting.user });
    const { getStatsForUser } = await import('./statsService.js');
    const stats = await getStatsForUser(setting.user);

    await sendWeeklySummary(recipient, { stats, questions, intervals });
  }
}
