import Question from '../models/Question.js';
import Activity from '../models/Activity.js';
import UserSettings from '../models/UserSettings.js';
import {
  getNextRevisionDate,
  isDueForRevision,
  computeStreak,
  startOfDay,
} from '../utils/revision.js';

export async function getStatsForUser(userId) {
  const [questions, settings, activities] = await Promise.all([
    Question.find({ user: userId }),
    UserSettings.getForUser(userId),
    Activity.find({ user: userId }).sort({ date: -1 }).limit(90),
  ]);

  const intervals = settings.getIntervalsObject();
  const total = questions.length;
  const weak = questions.filter((q) => q.confidenceLevel <= 2).length;
  const strong = questions.filter((q) => q.confidenceLevel >= 4).length;

  const dueToday = questions.filter((q) => isDueForRevision(q, intervals)).length;

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const dueNextWeek = questions.filter((q) => {
    const next = getNextRevisionDate(q, intervals);
    return next > startOfDay() && next <= startOfDay(nextWeek);
  }).length;

  const weakTagCounts = {};
  questions
    .filter((q) => q.confidenceLevel <= 2)
    .forEach((q) => {
      (q.tags || []).forEach((tag) => {
        weakTagCounts[tag] = (weakTagCounts[tag] || 0) + 1;
      });
    });

  const topicWeakness = Object.entries(weakTagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  let mostFrequentWeakTopic = topicWeakness[0]?.tag || null;

  const revisedToday = activities.find(
    (a) => startOfDay(a.date).getTime() === startOfDay().getTime()
  )?.revisionCount || 0;

  const { current: streak, longest: longestStreak } = computeStreak(activities);

  const interviewTargetDate = settings.interviewTargetDate;
  let daysUntilInterview = null;
  let suggestedDailyRevisions = null;
  if (interviewTargetDate) {
    const diff = startOfDay(interviewTargetDate) - startOfDay();
    daysUntilInterview = Math.max(0, Math.ceil(diff / 86400000));
    const remaining = dueToday + dueNextWeek;
    suggestedDailyRevisions = daysUntilInterview > 0
      ? Math.ceil(remaining / daysUntilInterview)
      : remaining;
  }

  return {
    total,
    weak,
    strong,
    mostFrequentWeakTopic,
    dueToday,
    dueNextWeek,
    topicWeakness,
    revisedToday,
    streak,
    longestStreak,
    interviewTargetDate,
    daysUntilInterview,
    suggestedDailyRevisions,
    revisionIntervals: intervals,
  };
}

export async function getMistakePatterns(userId) {
  const questions = await Question.find({ user: userId, mistakeNotes: { $ne: '' } });
  const patterns = {};

  questions.forEach((q) => {
    const notes = q.mistakeNotes
      .toLowerCase()
      .split(/[.,;!?\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    notes.forEach((note) => {
      patterns[note] = patterns[note] || { count: 0, questions: [] };
      patterns[note].count++;
      if (!patterns[note].questions.includes(q.questionName)) {
        patterns[note].questions.push(q.questionName);
      }
    });
  });

  return Object.entries(patterns)
    .filter(([, data]) => data.count > 1)
    .map(([pattern, data]) => ({ pattern, ...data }))
    .sort((a, b) => b.count - a.count);
}

export async function getSimilarQuestions(question, userId) {
  if (!question?.tags?.length) return [];
  return Question.find({
    user: userId,
    _id: { $ne: question._id },
    tags: { $in: question.tags },
  }).limit(5);
}

export async function getUserTags(userId) {
  const questions = await Question.find({ user: userId }, 'tags');
  const tagSet = new Set();
  questions.forEach((q) => (q.tags || []).forEach((t) => tagSet.add(t)));
  return [...tagSet].sort();
}
