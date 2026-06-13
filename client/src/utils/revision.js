export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getNextRevisionDate(question, intervals) {
  if (question.customReminderDate) {
    return startOfDay(question.customReminderDate);
  }
  const days = question.customRevisionDays || intervals[question.confidenceLevel] || 5;
  const next = startOfDay(question.lastRevisedDate);
  next.setDate(next.getDate() + days);
  return next;
}

export function isDueForRevision(question, intervals) {
  return getNextRevisionDate(question, intervals) <= startOfDay();
}

export function getConfidenceStyle(level) {
  if (level <= 2) return 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800';
  if (level === 3) return 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800';
  return 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800';
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
