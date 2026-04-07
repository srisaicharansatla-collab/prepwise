import express from 'express';
import {
  getFeed,
  getUserFeed,
  createFeedPost,
  toggleCheer,
  deleteFeedPost,
} from '../controllers/feedController.js';
import { protect, restrictedTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All feed routes require authentication
router.use(protect);

// Global feed (paginated)              GET  /api/feed?page=1&limit=10
router.get('/', getFeed);

// User-specific feed (paginated)       GET  /api/feed/user/:userId
router.get('/user/:userId', getUserFeed);

// Share an achievement                 POST /api/feed
router.post('/', createFeedPost);

// Toggle cheer on a post               PUT  /api/feed/:id/cheer
router.put('/:id/cheer', toggleCheer);

// Delete a post (owner or admin)       DELETE /api/feed/:id
router.delete('/:id', deleteFeedPost);

export default router;
