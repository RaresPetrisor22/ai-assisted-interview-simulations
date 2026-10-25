import { Router } from 'express';
import { addToWatchlist, getWatchlist, removeFromWatchlist } from '../controllers/watchlistController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getWatchlist);
router.route('/:movieId').post(addToWatchlist).delete(removeFromWatchlist);

export default router;
