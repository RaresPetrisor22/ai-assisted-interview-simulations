import User from '../models/User.js';
import { serializeUser } from '../utils/serializers.js';

export async function login(req, res) {
  const { email } = req.body ?? {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.status(200).json({ user: serializeUser(user) });
}

export async function getCurrentUser(req, res) {
  res.status(200).json({ user: serializeUser(req.user) });
}
