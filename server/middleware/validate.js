import { PLATFORMS } from '../models/Question.js';

export function validateQuestionBody(req, res, next) {
  const body = req.body;
  const errors = [];

  if (req.method === 'POST' || body.questionName !== undefined) {
    if (!body.questionName?.trim()) errors.push('Question name is required');
  }
  if (body.platform !== undefined && !PLATFORMS.includes(body.platform)) {
    errors.push(`Platform must be one of: ${PLATFORMS.join(', ')}`);
  }
  if (body.confidenceLevel !== undefined) {
    const level = Number(body.confidenceLevel);
    if (level < 1 || level > 5) errors.push('Confidence level must be between 1 and 5');
  }
  if (body.problemUrl && !/^https?:\/\/.+/.test(body.problemUrl)) {
    errors.push('Problem URL must start with http:// or https://');
  }
  if (body.customRevisionDays !== undefined && body.customRevisionDays !== null) {
    const days = Number(body.customRevisionDays);
    if (days < 1 || days > 365) errors.push('Custom revision days must be between 1 and 365');
  }

  if (errors.length) return res.status(400).json({ error: errors.join('. ') });
  next();
}
