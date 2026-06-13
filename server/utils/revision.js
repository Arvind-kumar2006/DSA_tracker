import { DEFAULT_INTERVALS } from '../models/UserSettings.js';

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getNextRevisionDate(question, intervals = DEFAULT_INTERVALS) {
  if (question.customReminderDate) {
    return startOfDay(question.customReminderDate);
  }
  const days = question.customRevisionDays || intervals[question.confidenceLevel] || 5;
  const next = startOfDay(question.lastRevisedDate);
  next.setDate(next.getDate() + days);
  return next;
}

export function isDueForRevision(question, intervals = DEFAULT_INTERVALS) {
  return getNextRevisionDate(question, intervals) <= startOfDay();
}

export function daysOverdue(question, intervals = DEFAULT_INTERVALS) {
  const next = getNextRevisionDate(question, intervals);
  const diff = startOfDay() - next;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getConfidenceLabel(level) {
  if (level <= 2) return 'Weak';
  if (level === 3) return 'Medium';
  return 'Strong';
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function computeStreak(activities) {
  if (!activities.length) return { current: 0, longest: 0 };

  const dates = [...new Set(activities.map((a) => startOfDay(a.date).getTime()))].sort((a, b) => b - a);
  const today = startOfDay().getTime();
  const yesterday = today - 86400000;

  let current = 0;
  if (dates[0] === today || dates[0] === yesterday) {
    let expected = dates[0];
    for (const d of dates) {
      if (d === expected) {
        current++;
        expected -= 86400000;
      } else break;
    }
  }

  let longest = 0;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    if (dates[i - 1] - dates[i] === 86400000) run++;
    else {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  longest = Math.max(longest, run, current);

  return { current, longest };
}
