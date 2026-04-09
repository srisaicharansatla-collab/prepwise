import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import generateToken from '../utils/generateToken.js';

// Register a new user and return auth token
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Enhanced validation
    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Username, email, and password are required');
    }
    if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      res.status(400);
      throw new Error('Username must be 3-20 chars, alphanumeric + underscore');
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400);
      throw new Error('Please enter a valid email');
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400);
      throw new Error('A user with that email or username already exists');
    }

    const user = await User.create({ username, email, password });

    const token = generateToken(res, user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        totalXP: user.totalXP,
        currentStreak: user.currentStreak,
        accuracyRate: user.accuracyRate,
        badges: user.badges,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Authenticate a user and return auth token
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400);
      throw new Error('Please enter a valid email');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const token = generateToken(res, user._id);
    user.password = undefined;

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        totalXP: user.totalXP,
        currentStreak: user.currentStreak,
        accuracyRate: user.accuracyRate,
        badges: user.badges,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Get logged in user profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── POST /progress ─────────────────────────────────────────────────────────
// Update Gamification Progress (course/lesson/subtopic completion).
// FIXED: Removed MongoDB transactions — they SILENTLY FAIL on standalone
// local MongoDB (transactions require replica sets). Uses direct save() instead.
export const updateProgress = async (req, res, next) => {
  try {
    const { courseId, lessonId, subtopicId, xpEarned = 10, isLessonCompletion = false, isSubtopicCompletion = false } = req.body;
    const userId = req.user._id;

    // Input validation
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      res.status(400);
      throw new Error('Invalid courseId');
    }
    if (lessonId && !mongoose.Types.ObjectId.isValid(lessonId)) {
      res.status(400);
      throw new Error('Invalid lessonId');
    }
    if (xpEarned < 0 || xpEarned > 100) {
      res.status(400);
      throw new Error('XP earned must be between 0 and 100');
    }

    // Find this specific user by _id
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    let badgesUnlocked = [];

    // 1. Streak Logic
    if (isLessonCompletion || isSubtopicCompletion) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (user.lastActivityDate) {
        const last = new Date(user.lastActivityDate);
        last.setHours(0, 0, 0, 0);
        const diffInDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

        if (diffInDays === 1) {
          user.currentStreak += 1;
        } else if (diffInDays > 1) {
          user.currentStreak = 1;
        }
      } else {
        user.currentStreak = 1;
      }
      user.lastActivityDate = new Date();
    }

    // 2. XP
    user.totalXP += xpEarned;

    // 3. Track completed lessons
    if (lessonId && !user.completedLessons.find(l => l.lessonId.toString() === lessonId)) {
      user.completedLessons.push({ courseId, lessonId, completedAt: new Date() });
    }

    // 4. Track completed subtopics
    if (subtopicId && isSubtopicCompletion && !user.completedSubtopics.find(st => st.subtopicId === subtopicId && st.courseId.toString() === courseId)) {
      user.completedSubtopics.push({ courseId, subtopicId, completedAt: new Date() });
    }

    // 5. Badge checks
    const courseSubtopicsCompleted = user.completedSubtopics.filter(st => st.courseId.toString() === courseId);
    if (courseSubtopicsCompleted.length >= 6) {
      if (!user.badges.find(b => b.name === `${courseId} Master`)) {
        const badge = { name: `${courseId} Master`, icon: '🏆', earnedAt: new Date() };
        user.badges.push(badge);
        badgesUnlocked.push(badge);
      }
    }

    const owned = user.badges.map(b => b.name);
    if (user.currentStreak >= 3 && !owned.includes('On Fire!')) {
      const badge = { name: 'On Fire!', icon: '🔥', earnedAt: new Date() };
      user.badges.push(badge); badgesUnlocked.push(badge);
    }
    if (user.currentStreak >= 7 && !owned.includes('Week Warrior')) {
      const badge = { name: 'Week Warrior', icon: '📅', earnedAt: new Date() };
      user.badges.push(badge); badgesUnlocked.push(badge);
    }
    if (user.completedLessons.length >= 1 && !owned.includes('First Steps')) {
      const badge = { name: 'First Steps', icon: '🎓', earnedAt: new Date() };
      user.badges.push(badge); badgesUnlocked.push(badge);
    }
    if (user.totalXP >= 100 && !owned.includes('Century Club')) {
      const badge = { name: 'Century Club', icon: '💯', earnedAt: new Date() };
      user.badges.push(badge); badgesUnlocked.push(badge);
    }

    // 6. Save (no transaction — works on standalone MongoDB)
    await user.save();

    console.log(
      `[DB WRITE ✓] progress | user=${user.username} | ` +
      `xp+=${xpEarned} | totalXP=${user.totalXP} | streak=${user.currentStreak}`
    );

    // Return the FULL updated user object so frontend doesn't have to guess
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        totalXP: user.totalXP,
        currentStreak: user.currentStreak,
        lastActivityDate: user.lastActivityDate,
        accuracyRate: user.accuracyRate,
        totalAttempted: user.totalAttempted,
        totalCorrect: user.totalCorrect,
        badges: user.badges,
        completedLessons: user.completedLessons,
        completedSubtopics: user.completedSubtopics,
      },
      gamificationUpdate: {
        xpGained: xpEarned,
        newTotalXP: user.totalXP,
        currentStreak: user.currentStreak,
        badgesUnlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /update-progress ──────────────────────────────────────────────────
// The "Data Bridge" endpoint for MCQ answers.
// Receives { isCorrect }, updates XP (+5), streak, accuracy_rate.
// Returns the FULL updated user object for atomic frontend state sync.
export const updateQuizProgress = async (req, res, next) => {
  try {
    const { isCorrect } = req.body;
    const userId = req.user._id;

    // Validate the isCorrect boolean
    if (typeof isCorrect !== 'boolean') {
      res.status(400);
      throw new Error('isCorrect (boolean) is required in the request body');
    }

    // Find this specific user by their _id
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // 1. Increment total attempts
    user.totalAttempted += 1;

    // 2. If correct → +5 XP and increment correct counter
    if (isCorrect) {
      user.totalXP += 5;
      user.totalCorrect += 1;
    }

    // 3. Streak logic: check if lastActivityDate was yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastActivityDate) {
      const last = new Date(user.lastActivityDate);
      last.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.currentStreak += 1;  // yesterday → continue streak
      } else if (diffDays > 1) {
        user.currentStreak = 1;   // missed days → reset
      }
      // diffDays === 0 → same day, keep streak as-is
    } else {
      user.currentStreak = 1;     // first ever activity
    }
    user.lastActivityDate = new Date();

    // 4. Recalculate accuracy_rate = (correct / total) * 100
    user.accuracyRate = parseFloat(
      ((user.totalCorrect / user.totalAttempted) * 100).toFixed(2)
    );

    // 5. Save to database
    await user.save();

    // 6. Log successful DB write
    console.log(
      `[DB WRITE ✓] update-progress | user=${user.username} | ` +
      `correct=${isCorrect} | totalXP=${user.totalXP} | ` +
      `streak=${user.currentStreak} | accuracy=${user.accuracyRate}%`
    );

    // Return the FULL updated user object — frontend "Success Hook" depends on this
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        totalXP: user.totalXP,
        currentStreak: user.currentStreak,
        lastActivityDate: user.lastActivityDate,
        accuracyRate: user.accuracyRate,
        totalAttempted: user.totalAttempted,
        totalCorrect: user.totalCorrect,
        badges: user.badges,
      },
    });
  } catch (error) {
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

// Retrieve all users for admin dashboard
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ totalXP: -1 });
    
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// ─── POST /updateUserStats (TEST DB) ─────────────────────────────────────
// Robust endpoint specifically for test database.
// Uses MONGO_TEST_URI (separate from main DB).
// Exact same logic as updateQuizProgress + transaction-like read/modify/write.
// Explicit try/catch + returns UPDATED row for frontend confirmation.
export const updateUserStatsTestDB = async (req, res) => {
  let testConn = null;
  
  try {
    const { isCorrect } = req.body;
    const userId = req.user._id;

    console.log(`[TEST-DB] updateUserStats | userId=${userId} | isCorrect=${isCorrect}`);

    // Validate input
    if (typeof isCorrect !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        error: 'isCorrect (boolean) is required' 
      });
    }

    // Create SEPARATE test DB connection
    const testUri = process.env.MONGO_TEST_URI || process.env.MONGO_URI_TEST;
    if (!testUri) {
      return res.status(500).json({ 
        success: false, 
        error: 'MONGO_TEST_URI not configured in .env' 
      });
    }

    testConn = mongoose.createConnection(testUri);
    
    // Get User model for test DB
    const TestUser = testConn.model('User', require('../models/User').schema);

    // Read user BEFORE update
    const user = await TestUser.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found in test DB' 
      });
    }

    console.log(`[TEST-DB READ ✓] Before: XP=${user.totalXP}, streak=${user.currentStreak}, accuracy=${user.accuracyRate}%`);

    // 1. totalAttempted++
    user.totalAttempted += 1;

    // 2. If correct: +5 XP, totalCorrect++
    if (isCorrect) {
      user.totalXP += 5;
      user.totalCorrect += 1;
    }

    // 3. Streak logic (same as main DB)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastActivityDate) {
      const last = new Date(user.lastActivityDate);
      last.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.currentStreak += 1;
      } else if (diffDays > 1) {
        user.currentStreak = 1;
      }
    } else {
      user.currentStreak = 1;
    }
    user.lastActivityDate = new Date();

    // 4. accuracyRate = (totalCorrect / totalAttempted) * 100
    user.accuracyRate = parseFloat(
      ((user.totalCorrect / user.totalAttempted) * 100).toFixed(2)
    );

    // 5. Save & return UPDATED row
    await user.save();

    console.log(`[TEST-DB WRITE ✓] After: XP=${user.totalXP}, streak=${user.currentStreak}, accuracy=${user.accuracyRate}%`);

    res.status(200).json({
      success: true,
      message: 'Test DB updated successfully',
      updatedRow: {
        _id: user._id,
        username: user.username,
        totalXP: user.totalXP,
        currentStreak: user.currentStreak,
        accuracyRate: user.accuracyRate,
        totalAttempted: user.totalAttempted,
        totalCorrect: user.totalCorrect,
        lastActivityDate: user.lastActivityDate,
        badges: user.badges,
      }
    });

  } catch (error) {
    console.error('[TEST-DB ERROR]', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  } finally {
    // Cleanup connection
    if (testConn) {
      await testConn.close();
    }
  }
};

// Promote user to admin (for development/testing)
export const promoteToAdmin = async (req, res, next) => {

  try {
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Admin role required');
    }

    const { userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400);
      throw new Error('Invalid userId');
    }

    if (userId === req.user._id.toString()) {
      res.status(400);
      throw new Error('Cannot promote self');
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.role = 'admin';
    await user.save();

    res.status(200).json({ success: true, message: 'User promoted to admin' });
  } catch (error) {
    next(error);
  }
};
