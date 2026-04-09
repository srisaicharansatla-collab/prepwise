import mongoose from 'mongoose';

// Sub-schema organizing lessons and quiz references into modules
const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
  },
  description: {
    type: String,
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
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
