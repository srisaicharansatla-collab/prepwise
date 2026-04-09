import express from 'express';
import { getAllCourses, getCourseById, getSubtopicLessons, getSubtopicContent } from '../controllers/courseController.js';

const router = express.Router();

// Get all courses
router.get('/', getAllCourses);

// Get course by ID
router.get('/:id', getCourseById);

// Get lessons for subtopic/module
router.get('/:courseId/subtopic/:subtopicId/lessons', getSubtopicLessons);
router.get('/:courseId/subtopic/:subtopicId/content', getSubtopicContent);

export default router;
