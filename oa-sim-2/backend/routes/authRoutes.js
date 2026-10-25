import { Router } from 'express';
import { getCurrentUser, login } from '../controllers/authController.js';
import { requireUser } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireUser, getCurrentUser);

export default router;
