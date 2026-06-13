import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getNextRevisionDate,
  isDueForRevision,
  computeStreak,
  startOfDay,
} from '../utils/revision.js';

const intervals = { 1: 2, 2: 3, 3: 5, 4: 7, 5: 10 };

describe('revision utils', () => {
  it('calculates next revision date from confidence', () => {
    const q = { lastRevisedDate: '2026-06-01', confidenceLevel: 1 };
    const next = getNextRevisionDate(q, intervals);
    assert.equal(next.getDate(), 3);
  });

  it('uses custom revision days override', () => {
    const q = { lastRevisedDate: '2026-06-01', confidenceLevel: 5, customRevisionDays: 1 };
    const next = getNextRevisionDate(q, intervals);
    assert.equal(next.getDate(), 2);
  });

  it('detects due questions', () => {
    const past = { lastRevisedDate: new Date('2020-01-01'), confidenceLevel: 5 };
    assert.equal(isDueForRevision(past, intervals), true);
  });

  it('computes streak', () => {
    const today = startOfDay();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const streak = computeStreak([
      { date: today },
      { date: yesterday },
    ]);
    assert.ok(streak.current >= 1);
  });
});
