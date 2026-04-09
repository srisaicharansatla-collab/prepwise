import express from 'express';
import { registerUser, loginUser, getUserProfile, updateProgress, updateQuizProgress, updateUserStatsTestDB, getLeaderboard, getAllUsers, promoteToAdmin } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictedTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/progress', protect, updateProgress);
router.post('/update-progress', protect, updateQuizProgress);
router.post('/updateUserStats', protect, updateUserStatsTestDB);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/all', protect, restrictedTo('admin'), getAllUsers);
router.post('/promote', protect, restrictedTo('admin'), promoteToAdmin);

export default router;

