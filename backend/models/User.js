import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'instructor'],
      default: 'student',
    },
    totalXP: {
      type: Number,
      default: 0,
      min: [0, 'XP cannot be negative'],
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: [0, 'Streak cannot be negative'],
    },
    lastActivityDate: {
      type: Date,
    },
    badges: [
      {
        name: { type: String, required: true },
        icon: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    completedLessons: [
      {
        lessonId: { type: mongoose.Schema.Types.ObjectId, required: true }, // References the subdocument ID of a lesson
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        completedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
