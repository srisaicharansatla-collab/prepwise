import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Lesson from '../models/Lesson.js';

// Get all courses
export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().select('-modules.quizzes.aiPromptUsed -modules.lessons.aiPromptUsed');
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// Get course by ID
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }
    // Transform modules array to frontend subtopics object format
    const transformedCourse = {
      ...course.toObject(),
      id: req.params.id,
      subtopics: course.modules.reduce((acc, module, index) => {
        const key = module.title.toLowerCase().replace(/\\s+/g, '');
        acc[key] = {
          title: module.title,
          lessons: [] // Frontend counts from this for stats
        };
        return acc;
      }, {})
    };
    res.status(200).json({
      success: true,
      data: transformedCourse
    });
  } catch (error) {
    next(error);
  }
};

// Get full subtopic content as frontend lessons array format
export const getSubtopicContent = async (req, res, next) => {
  try {
    const { courseId, subtopicId } = req.params;
    const course = await Course.findById(courseId).populate({
      path: 'modules.lessons',
      populate: { path: 'quizzes' }
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const module = course.modules.find(
      m => m._id.toString() === subtopicId || m.title.toLowerCase() === subtopicId.toLowerCase()
    );
    if (!module) {
      return res.status(404).json({ success: false, message: 'Subtopic not found' });
    }

    const lessonsArray = [];
    let idCounter = 1;

    // Text/code slides from lesson explanationCards
    for (const lesson of module.lessons) {
      for (const card of lesson.explanationCards) {
        lessonsArray.push({
          id: idCounter++,
          type: 'text',
          lessonId: lesson._id.toString(), // for lesson-completion tracking
          content: card.content,
        });
      }

      // Quiz slides — correctAnswer included for instant UI feedback
      // (XP is still server-gated via /api/quizzes/answer)
      for (const quiz of lesson.quizzes) {
        lessonsArray.push({
          id: idCounter++,
          type: 'quiz',
          quizId: quiz._id.toString(),
          lessonId: lesson._id.toString(),
          question: quiz.question,
          options: quiz.options,
          correctAnswer: quiz.correctAnswer,
          explanation: quiz.explanation,
        });
      }
    }

    // Module-level quizzes (not attached to a specific lesson)
    for (const quizId of module.quizzes) {
      const quiz = await Quiz.findById(quizId);
      if (quiz) {
        lessonsArray.push({
          id: idCounter++,
          type: 'quiz',
          quizId: quiz._id.toString(),
          question: quiz.question,
          options: quiz.options,
          correctAnswer: quiz.correctAnswer,
          explanation: quiz.explanation,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: lessonsArray,
      subtopicTitle: module.title,
      totalSlides: lessonsArray.length,
    });
  } catch (error) {
    next(error);
  }
};

// Legacy lessons endpoint
export const getSubtopicLessons = async (req, res, next) => {
  try {
    const { courseId, subtopicId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    const module = course.modules.find(m => m._id.toString() === subtopicId || m.title.toLowerCase() === subtopicId.toLowerCase());
    if (!module) {
      const allLessons = course.modules.flatMap(m => m.lessons.map(l => ({...l.toObject(), moduleTitle: m.title})));
      return res.status(200).json({
        success: true,
        data: allLessons
      });
    }

    const lessonsData = module.lessons.map(lesson => ({
      ...lesson.toObject(),
      moduleTitle: module.title
    }));

    res.status(200).json({
      success: true,
      data: lessonsData
    });
  } catch (error) {
    next(error);
  }
};
