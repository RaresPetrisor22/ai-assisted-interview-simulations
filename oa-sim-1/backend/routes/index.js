import { Router } from 'express';
import authRoutes from './authRoutes.js';
import movieRoutes from './movieRoutes.js';
import watchlistRoutes from './watchlistRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/watchlist', watchlistRoutes);

export default router;
