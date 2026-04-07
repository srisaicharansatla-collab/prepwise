import mongoose from 'mongoose';
import User from '../models/User.js';

// Get logged in user profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Update Gamification Progress securely and atomically
export const updateProgress = async (req, res, next) => {
  // Establish a MongoDB Transaction explicitly for Atomicity (prevents double-XP race conditions)
  // Note: Transactions require MongoDB Replica Sets (e.g. Atlas clustering)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { courseId, lessonId, xpEarned = 10 } = req.body;
    const userId = req.user._id;

    // Fetch the user enforcing the pessimistic context of this transaction
    const user = await User.findById(userId).session(session);

    if (!user) {
      throw new Error('User not found');
    }

    let badgesUnlocked = [];

    // 1. Calculate Streak Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to absolute midnight for exact day delta processing

    const lastActivity = user.lastActivityDate;
    if (lastActivity) {
      const last = new Date(lastActivity);
      last.setHours(0, 0, 0, 0);

      const diffInDays = (today - last) / (1000 * 60 * 60 * 24);

      if (diffInDays === 1) {
        user.currentStreak += 1;
      } else if (diffInDays > 1) {
        // Punish player if they missed a day (streak resets)
        user.currentStreak = 1;
      }
      // If diffInDays === 0, they already submitted today, maintain streak without iterating.
    } else {
      user.currentStreak = 1;
    }

    user.lastActivityDate = new Date();

    // 2. Safely Assign Experience Points
    user.totalXP += xpEarned;

    // 3. Prevent Re-granting completion for the exact same lesson
    const alreadyCompleted = user.completedLessons.find(
      (lesson) => lesson.lessonId.toString() === lessonId
    );

    if (!alreadyCompleted) {
      user.completedLessons.push({
        courseId,
        lessonId,
        completedAt: new Date(),
      });
    }

    // 4. Dynamically Assess Gamification Engine (Threshold Badges)
    const currentOwnedBadges = user.badges.map((b) => b.name);

    if (user.currentStreak >= 3 && !currentOwnedBadges.includes('On Fire!')) {
      const badge = { name: 'On Fire!', icon: 'flame-3.png', earnedAt: new Date() };
      user.badges.push(badge);
      badgesUnlocked.push(badge);
    }

    const firstStepsCondition = user.completedLessons.length >= 1;
    if (firstStepsCondition && !currentOwnedBadges.includes('First Steps')) {
      const badge = { name: 'First Steps', icon: 'scholar-1.png', earnedAt: new Date() };
      user.badges.push(badge);
      badgesUnlocked.push(badge);
    }

    // Execute atomic save. Triggers potential rollbacks if simultaneous execution compromised consistency.
    await user.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      gamificationUpdate: {
        xpGained: xpEarned,
        newTotalXP: user.totalXP,
        currentStreak: user.currentStreak,
        badgesUnlocked,           // Useful flag for front-end notification popups
        isAlreadyCompleted: !!alreadyCompleted, // Inform FE if this was a re-run
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// Retrieve Top 10 Scholars sorted descending by their Total Experience Points strictly for the Social Dashboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const topUsers = await User.find()
      .sort({ totalXP: -1 })
      .limit(10)
      .select('username avatar totalXP currentStreak badges'); // Do not expose sensitive auth logic
    
    res.status(200).json({ success: true, data: topUsers });
  } catch (error) {
    next(error);
  }
};
