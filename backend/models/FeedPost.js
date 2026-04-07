import mongoose from 'mongoose';

const feedPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must belong to a user'],
    },
    type: {
      type: String,
      enum: {
        values: ['lesson_completed', 'badge_earned', 'streak_milestone', 'course_completed'],
        message: '{VALUE} is not a valid post type',
      },
      required: [true, 'Post type is required'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [280, 'Post content cannot exceed 280 characters'],
      trim: true,
    },
    // Flexible metadata: can carry badgeIcon, courseName, xpGained, streakCount etc.
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Cheers = Likes. Stored as array of User refs for deduplication checks
    cheers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    // Virtual for cheer count — avoids full array serialization
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field: count of cheers without exposing full array
feedPostSchema.virtual('cheerCount').get(function () {
  return this.cheers.length;
});

// Index for fast chronological feed queries
feedPostSchema.index({ createdAt: -1 });
feedPostSchema.index({ user: 1, createdAt: -1 });

const FeedPost = mongoose.model('FeedPost', feedPostSchema);
export default FeedPost;
