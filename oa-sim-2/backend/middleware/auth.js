import User from '../models/User.js';
import { isObjectId } from '../utils/validators.js';

export async function requireUser(req, res, next) {
  const userId = req.header('x-user-id');

  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!isObjectId(userId)) {
    return res.status(401).json({ message: 'Invalid user' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({ message: 'Invalid user' });
  }

  req.user = user;
  next();
}
