import { Router } from 'express';
import { getCarById, listCars, listMyCars } from '../controllers/carController.js';
import { requireUser } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.get('/', listCars);
router.get('/mine', requireUser, listMyCars);
router.get('/:id', validateObjectId('params', 'id', 'Invalid car id'), getCarById);

export default router;
