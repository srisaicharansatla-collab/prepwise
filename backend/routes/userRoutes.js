import express from 'express';
import { getUserProfile, updateProgress, getLeaderboard } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.post('/progress', protect, updateProgress);
router.get('/leaderboard', protect, getLeaderboard);

export default router;
