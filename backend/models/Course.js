import mongoose from 'mongoose';

// Sub-schema for lessons focusing on AI generated content tracking
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Lesson content is required'],
  },
  isAIGenerated: {
    type: Boolean,
    default: false,
  },
  aiPromptUsed: { 
    type: String, // Useful for debugging or regenerating AI content
    select: false, // Hide from standard API responses to save bandwidth
  }
});

// Sub-schema for quizzes with basic validations
const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Quiz question is required'],
  },
  options: {
    type: [String],
    required: true,
    validate: [v => v.length >= 2, 'Quiz must have at least 2 options'],
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
  },
  explanation: {
    type: String, // Critical for a learning platform to explain exactly why an AI-generated answer is correct
  }
});

// Sub-schema organizing lessons and quizzes into modules
const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
  },
  description: {
    type: String,
  },
  lessons: [lessonSchema],
  quizzes: [quizSchema],
});

// Main Course Schema
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      unique: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Course difficulty is required'],
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        message: '{VALUE} is not a valid difficulty level',
      },
      default: 'Beginner',
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    modules: [moduleSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin or Content Creator reference
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
