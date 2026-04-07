import Course from '../models/Course.js';

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
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// Get lessons for course subtopic/module
export const getSubtopicLessons = async (req, res, next) => {
  try {
    const { courseId, subtopicId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Assume subtopicId is module index or title - adjust based on frontend
    const module = course.modules.find(m => m._id.toString() === subtopicId || m.title.toLowerCase() === subtopicId.toLowerCase());
    if (!module) {
      // Fallback: flatten all lessons if no specific module
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
