import mongoose from 'mongoose';
import User from '../models/User.js';
import { forbidden, unauthorized } from '../utils/httpError.js';

/**
 * Simplified authentication: the caller identifies themselves with the
 * `x-user-id` header, which must be the id of an existing user.
 */
export const requireAuth = async (req, res, next) => {
  const userId = req.get('x-user-id');

  if (!userId) {
    throw unauthorized('Authentication required');
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw unauthorized('Invalid user id');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw unauthorized('User not found');
  }

  req.user = user;
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin()) {
    throw forbidden('Admin access required');
  }

  next();
};
