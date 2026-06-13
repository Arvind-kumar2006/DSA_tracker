import { Router } from 'express';
import Question from '../models/Question.js';
import ConfidenceHistory from '../models/ConfidenceHistory.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateQuestionBody } from '../middleware/validate.js';
import { recordRevision } from '../services/activityService.js';
import {
  getStatsForUser,
  getMistakePatterns,
  getSimilarQuestions,
} from '../services/statsService.js';
import UserSettings from '../models/UserSettings.js';
import { getNextRevisionDate, isDueForRevision } from '../utils/revision.js';

const router = Router();
router.use(authMiddleware);

async function getIntervals(userId) {
  const settings = await UserSettings.getForUser(userId);
  return settings.getIntervalsObject();
}

async function findUserQuestion(id, userId) {
  return Question.findOne({ _id: id, user: userId });
}

router.get('/', async (req, res) => {
  try {
    const questions = await Question.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    res.json(await getStatsForUser(req.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mistake-patterns', async (req, res) => {
  try {
    res.json(await getMistakePatterns(req.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/practice', async (req, res) => {
  try {
    const intervals = await getIntervals(req.userId);
    const questions = await Question.find({ user: req.userId });
    const due = questions.filter((q) => isDueForRevision(q, intervals));
    due.sort((a, b) => getNextRevisionDate(a, intervals) - getNextRevisionDate(b, intervals));
    res.json(due);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export', async (req, res) => {
  try {
    const questions = await Question.find({ user: req.userId });
    const settings = await UserSettings.getForUser(req.userId);
    res.json({
      exportedAt: new Date().toISOString(),
      settings: {
        revisionIntervals: settings.getIntervalsObject(),
        interviewTargetDate: settings.interviewTargetDate,
      },
      questions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/import', async (req, res) => {
  try {
    const { questions, settings } = req.body;
    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: 'questions array is required' });
    }

    let imported = 0;
    for (const q of questions) {
      const { _id, user, createdAt, updatedAt, ...data } = q;
      await Question.create({ ...data, user: req.userId });
      imported++;
    }

    if (settings) {
      const userSettings = await UserSettings.getForUser(req.userId);
      if (settings.revisionIntervals) {
        for (const [k, v] of Object.entries(settings.revisionIntervals)) {
          userSettings.revisionIntervals.set(String(k), Number(v));
        }
      }
      if (settings.interviewTargetDate !== undefined) {
        userSettings.interviewTargetDate = settings.interviewTargetDate
          ? new Date(settings.interviewTargetDate)
          : null;
      }
      await userSettings.save();
    }

    res.json({ message: `Imported ${imported} questions`, imported });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/restore', async (req, res) => {
  try {
    const { _id, user, createdAt, updatedAt, __v, ...data } = req.body;
    const question = new Question({ ...data, user: req.userId });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/bulk/revise', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    await Question.updateMany(
      { _id: { $in: ids }, user: req.userId },
      { lastRevisedDate: new Date(), customReminderDate: null }
    );

    for (const id of ids) {
      const q = await Question.findById(id);
      if (q) {
        await ConfidenceHistory.create({
          question: id,
          user: req.userId,
          confidenceLevel: q.confidenceLevel,
        });
      }
    }
    await recordRevision(req.userId);

    res.json({ message: `Marked ${ids.length} questions as revised` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const deleted = await Question.find({ _id: { $in: ids }, user: req.userId });
    await Question.deleteMany({ _id: { $in: ids }, user: req.userId });

    res.json({ message: `Deleted ${deleted.length} questions`, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const history = await ConfidenceHistory.find({
      question: req.params.id,
      user: req.userId,
    }).sort({ revisedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/similar', async (req, res) => {
  try {
    const question = await findUserQuestion(req.params.id, req.userId);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(await getSimilarQuestions(question, req.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', validateQuestionBody, async (req, res) => {
  try {
    const question = new Question({ ...req.body, user: req.userId });
    await question.save();
    await ConfidenceHistory.create({
      question: question._id,
      user: req.userId,
      confidenceLevel: question.confidenceLevel,
    });
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', validateQuestionBody, async (req, res) => {
  try {
    const existing = await findUserQuestion(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Question not found' });

    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (req.body.confidenceLevel && req.body.confidenceLevel !== existing.confidenceLevel) {
      await ConfidenceHistory.create({
        question: question._id,
        user: req.userId,
        confidenceLevel: question.confidenceLevel,
      });
    }

    res.json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id/revise', async (req, res) => {
  try {
    const existing = await findUserQuestion(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Question not found' });

    const updates = {
      lastRevisedDate: new Date(),
      customReminderDate: null,
    };
    if (req.body.confidenceLevel) {
      updates.confidenceLevel = Number(req.body.confidenceLevel);
    }

    const question = await Question.findByIdAndUpdate(req.params.id, updates, { new: true });

    await ConfidenceHistory.create({
      question: question._id,
      user: req.userId,
      confidenceLevel: question.confidenceLevel,
    });
    await recordRevision(req.userId);

    res.json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const question = await findUserQuestion(req.params.id, req.userId);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    await question.deleteOne();
    res.json({ message: 'Deleted successfully', question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
