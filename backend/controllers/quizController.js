import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Get quiz by ID (without revealing correct answer)
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-correctAnswer -__v -createdAt -updatedAt');
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

// Validate quiz answer server-side
export const validateQuizAnswer = async (req, res, next) => {
  try {
    const { quizId, courseId, selectedAnswer } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!quizId || !courseId || !selectedAnswer) {
      return res.status(400).json({ success: false, message: 'Quiz ID, Course ID, and selected answer are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ success: false, message: 'Invalid quiz ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    // Get the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check if user already attempted this quiz
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingAttempt = user.quizAttempts.find(
      attempt => attempt.quizId.toString() === quizId
    );

    if (existingAttempt) {
      // Return existing attempt result (prevent re-answering)
      return res.status(200).json({
        success: true,
        data: {
          isCorrect: existingAttempt.isCorrect,
          correctAnswer: quiz.correctAnswer,
          explanation: quiz.explanation,
          xpEarned: existingAttempt.xpEarned,
          alreadyAttempted: true,
          message: 'You have already attempted this quiz'
        }
      });
    }

    // Validate the answer
    const isCorrect = selectedAnswer === quiz.correctAnswer;
    const xpEarned = isCorrect ? 5 : 0;

    // Record the attempt
    user.quizAttempts.push({
      quizId,
      courseId,
      selectedAnswer,
      isCorrect,
      xpEarned,
      attemptedAt: new Date()
    });

    // Award XP and Update Global Answer Stats
    user.totalAttempted = (user.totalAttempted || 0) + 1;
    if (isCorrect) {
      user.totalCorrect = (user.totalCorrect || 0) + 1;
    }
    user.accuracyRate = parseFloat(
      ((user.totalCorrect / user.totalAttempted) * 100).toFixed(2)
    );
    user.totalXP += xpEarned;

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivity = user.lastActivityDate;
    
    if (lastActivity) {
      const last = new Date(lastActivity);
      last.setHours(0, 0, 0, 0);
      const diffInDays = (today - last) / (1000 * 60 * 60 * 24);
      
      if (diffInDays === 1) {
        user.currentStreak += 1;
      } else if (diffInDays > 1) {
        user.currentStreak = 1;
      }
    } else {
      user.currentStreak = 1;
    }
    user.lastActivityDate = new Date();

    // Check for badges
    let badgesUnlocked = [];
    const currentOwnedBadges = user.badges.map(b => b.name);

    if (user.currentStreak >= 3 && !currentOwnedBadges.includes('On Fire!')) {
      const badge = { name: 'On Fire!', icon: '🔥', earnedAt: new Date() };
      user.badges.push(badge);
      badgesUnlocked.push(badge);
    }

    if (user.currentStreak >= 7 && !currentOwnedBadges.includes('Week Warrior')) {
      const badge = { name: 'Week Warrior', icon: '📅', earnedAt: new Date() };
      user.badges.push(badge);
      badgesUnlocked.push(badge);
    }

    if (user.totalXP >= 100 && !currentOwnedBadges.includes('Century Club')) {
      const badge = { name: 'Century Club', icon: '💯', earnedAt: new Date() };
      user.badges.push(badge);
      badgesUnlocked.push(badge);
    }

    if (user.quizAttempts.length >= 1 && !currentOwnedBadges.includes('First Quiz')) {
      const badge = { name: 'First Quiz', icon: '🎯', earnedAt: new Date() };
      user.badges.push(badge);
      badgesUnlocked.push(badge);
    }

    if (user.quizAttempts.filter(a => a.isCorrect).length >= 10 && !currentOwnedBadges.includes('Quiz Master')) {
      const badge = { name: 'Quiz Master', icon: '🧠', earnedAt: new Date() };
      user.badges.push(badge);
      badgesUnlocked.push(badge);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: quiz.correctAnswer,
        explanation: quiz.explanation,
        xpEarned,
        alreadyAttempted: false,
        newTotalXP: user.totalXP,
        currentStreak: user.currentStreak,
        badgesUnlocked
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's quiz attempts for a course (for review)
export const getQuizAttemptsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const user = await User.findById(userId)
      .populate('quizAttempts.quizId')
      .select('quizAttempts');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const courseAttempts = user.quizAttempts.filter(
      attempt => attempt.courseId.toString() === courseId
    );

    const stats = {
      totalAttempts: courseAttempts.length,
      correctAnswers: courseAttempts.filter(a => a.isCorrect).length,
      incorrectAnswers: courseAttempts.filter(a => !a.isCorrect).length,
      accuracy: courseAttempts.length > 0 
        ? Math.round((courseAttempts.filter(a => a.isCorrect).length / courseAttempts.length) * 100) 
        : 0,
      totalXpFromQuizzes: courseAttempts.reduce((sum, a) => sum + a.xpEarned, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        attempts: courseAttempts,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all quizzes for a subtopic (for admin/review purposes)
export const getQuizzesBySubtopic = async (req, res, next) => {
  try {
    const { courseId, subtopicId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const module = course.modules.find(
      m => m._id.toString() === subtopicId || m.title.toLowerCase() === subtopicId.toLowerCase()
    );

    if (!module) {
      return res.status(404).json({ success: false, message: 'Subtopic not found' });
    }

    const quizzes = await Quiz.find({ _id: { $in: module.quizzes } });

    res.status(200).json({
      success: true,
      data: quizzes,
      count: quizzes.length
    });
  } catch (error) {
    next(error);
  }
};

// Get quiz statistics for a user
export const getUserQuizStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate('quizAttempts.quizId')
      .select('quizAttempts totalXP');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const totalAttempts = user.quizAttempts.length;
    const correctAnswers = user.quizAttempts.filter(a => a.isCorrect).length;
    const incorrectAnswers = user.quizAttempts.filter(a => !a.isCorrect).length;
    const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
    const totalXpFromQuizzes = user.quizAttempts.reduce((sum, a) => sum + a.xpEarned, 0);

    // Group by course
    const byCourse = {};
    user.quizAttempts.forEach(attempt => {
      const courseId = attempt.courseId.toString();
      if (!byCourse[courseId]) {
        byCourse[courseId] = {
          courseId,
          totalAttempts: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          xpEarned: 0
        };
      }
      byCourse[courseId].totalAttempts++;
      if (attempt.isCorrect) {
        byCourse[courseId].correctAnswers++;
      } else {
        byCourse[courseId].incorrectAnswers++;
      }
      byCourse[courseId].xpEarned += attempt.xpEarned;
    });

    // Calculate accuracy per course
    Object.values(byCourse).forEach(course => {
      course.accuracy = course.totalAttempts > 0 
        ? Math.round((course.correctAnswers / course.totalAttempts) * 100) 
        : 0;
    });

    res.status(200).json({
      success: true,
      data: {
        overall: {
          totalAttempts,
          correctAnswers,
          incorrectAnswers,
          accuracy,
          totalXpFromQuizzes
        },
        byCourse: Object.values(byCourse)
      }
    });
  } catch (error) {
    next(error);
  }
};