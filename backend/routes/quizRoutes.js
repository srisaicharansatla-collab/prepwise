import express from 'express';
import { 
  getQuizById, 
  validateQuizAnswer, 
  getQuizAttemptsByCourse, 
  getQuizzesBySubtopic,
  getUserQuizStats 
} from '../controllers/quizController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes (no auth required for viewing quiz content)
router.get('/:id', getQuizById);

// Protected routes (require authentication)
router.use(protect);

// Submit quiz answer for validation
router.post('/answer', validateQuizAnswer);

// Get user's quiz statistics
router.get('/stats/my-stats', getUserQuizStats);

// Get quiz attempts for a specific course (for review)
router.get('/attempts/course/:courseId', getQuizAttemptsByCourse);

// Get all quizzes for a subtopic (admin/review)
router.get('/subtopic/:courseId/:subtopicId', getQuizzesBySubtopic);

export default router;