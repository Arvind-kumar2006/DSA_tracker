import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Question from '../models/Question.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dsa-tracker-dev-secret-change-in-production';

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    const { userId } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    req.user = user;
    req.userId = user._id;

    await Question.updateMany({ user: null }, { user: user._id });

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
