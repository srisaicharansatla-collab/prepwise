import FeedPost from '../models/FeedPost.js';

// -------------------------------------------------------------------
// @desc    Get paginated global study feed
// @route   GET /api/feed?page=1&limit=10
// @access  Private
// -------------------------------------------------------------------
export const getFeed = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10); // Cap at 50 per request
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      FeedPost.find()
        .sort({ createdAt: -1 })          // Newest first
        .skip(skip)
        .limit(limit)
        .populate('user', 'username avatar totalXP currentStreak') // Only pull the relevant user fields
        .select('-cheers')                 // Exclude raw cheers array — use cheerCount virtual instead
        .lean({ virtuals: true }),         // Use lean() for speed; virtuals: true to keep cheerCount
      FeedPost.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------------------
// @desc    Get a single user's feed posts
// @route   GET /api/feed/user/:userId?page=1&limit=10
// @access  Private
// -------------------------------------------------------------------
export const getUserFeed = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      FeedPost.find({ user: req.params.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username avatar totalXP currentStreak')
        .select('-cheers')
        .lean({ virtuals: true }),
      FeedPost.countDocuments({ user: req.params.userId }),
    ]);

    res.status(200).json({
      success: true,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------------------
// @desc    Create a new study feed post (share an achievement)
// @route   POST /api/feed
// @access  Private
// -------------------------------------------------------------------
export const createFeedPost = async (req, res, next) => {
  try {
    const { type, content, metadata } = req.body;

    const post = await FeedPost.create({
      user: req.user._id,
      type,
      content,
      metadata: metadata || {},
    });

    // Populate user before responding so the client immediately has display data
    await post.populate('user', 'username avatar totalXP currentStreak');

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------------------
// @desc    Toggle a "cheer" (like) on a feed post — idempotent
// @route   PUT /api/feed/:id/cheer
// @access  Private
// -------------------------------------------------------------------
export const toggleCheer = async (req, res, next) => {
  try {
    const post = await FeedPost.findById(req.params.id);

    if (!post) {
      res.status(404);
      return next(new Error('Feed post not found'));
    }

    // Prevent self-cheering to maintain social integrity
    if (post.user.toString() === req.user._id.toString()) {
      res.status(400);
      return next(new Error('You cannot cheer your own achievement'));
    }

    const alreadyCheered = post.cheers.some(
      (uid) => uid.toString() === req.user._id.toString()
    );

    // Atomic toggle: add if not cheered, pull if already cheered
    const update = alreadyCheered
      ? { $pull: { cheers: req.user._id } }
      : { $addToSet: { cheers: req.user._id } }; // $addToSet guarantees no duplicates at DB level

    const updatedPost = await FeedPost.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    )
      .populate('user', 'username avatar totalXP currentStreak')
      .select('-cheers')
      .lean({ virtuals: true });

    res.status(200).json({
      success: true,
      cheered: !alreadyCheered,
      cheerCount: updatedPost.cheerCount,
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------------------
// @desc    Delete a feed post (owner only)
// @route   DELETE /api/feed/:id
// @access  Private
// -------------------------------------------------------------------
export const deleteFeedPost = async (req, res, next) => {
  try {
    const post = await FeedPost.findById(req.params.id);

    if (!post) {
      res.status(404);
      return next(new Error('Feed post not found'));
    }

    // Strictly authorize that only the owning user or an admin can delete
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Not authorized to delete this post'));
    }

    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post removed successfully' });
  } catch (error) {
    next(error);
  }
};
