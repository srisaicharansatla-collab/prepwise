import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import { courseData } from './courseContent.js';

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prepwise');
    console.log('✅ Connected to MongoDB');

    // Don't clear users - only course data
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    console.log('🗑️ Cleared course data (users safe)');

    const processCourse = async (courseKey) => {
      const courseDataObj = courseData[courseKey];
      const modules = [];

      for (const [subtopicKey, subtopic] of Object.entries(courseDataObj.subtopics)) {
        const lessonIds = [];
        const quizIds = [];

        for (const item of subtopic.lessons) {
          if (item.type === 'quiz') {
            // Remove the numeric id from frontend data to avoid MongoDB _id conflicts
            const { id, ...quizData } = item;
            const quiz = new Quiz(quizData);
            await quiz.save();
            quizIds.push(quiz._id);
          } else {
            const lesson = new Lesson({
              title: `${item.type.toUpperCase()} Slide ${item.id}`,
              courseId: null,
              explanationCards: [{
                title: item.type.charAt(0).toUpperCase() + item.type.slice(1),
                content: item.content
              }]
            });
            await lesson.save();
            lessonIds.push(lesson._id);
          }
        }

        modules.push({
          title: subtopic.title,
          lessons: lessonIds,
          quizzes: quizIds
        });
      }

      const course = new Course({
        title: courseDataObj.title,
        description: courseDataObj.description,
        difficulty: 'Beginner',
        modules
      });
      await course.save();

      // Update lessons with courseId
      const allLessonIds = modules.flatMap(m => m.lessons);
      await Lesson.updateMany({ _id: { $in: allLessonIds } }, { courseId: course._id });

      return course;
    };

    const cppCourse = await processCourse('cpp');
    const pythonCourse = await processCourse('python');

    console.log('✅ Seeded courses:', [cppCourse.title, pythonCourse.title]);
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedCourses();
