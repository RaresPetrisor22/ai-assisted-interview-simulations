import User from '../models/User.js';
import { badRequest, unauthorized } from '../utils/httpError.js';

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email } = req.body ?? {};
    if (typeof email !== 'string' || !email.trim()) {
      throw badRequest('Email is required');
    }

    const user = await User.findByEmail(email);
    if (!user) {
      throw unauthorized('No account found for this email');
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
export const getCurrentUser = (req, res) => {
  res.status(200).json({ user: req.user });
};
