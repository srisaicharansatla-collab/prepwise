import express from 'express';
import { updateStats } from '../controllers/statsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/update-stats', protect, updateStats);

export default router;

