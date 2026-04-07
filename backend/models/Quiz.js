import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
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
    type: String, 
  }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
