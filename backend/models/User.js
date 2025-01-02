const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Unique username with validation and trimming
    username: {
      type: String,
      unique: true,
      required: [true, 'Username is required'],
      trim: true,
      lowercase: true, // Automatically converts username to lowercase
    },
    pomodoroSessions: {
      type: Number,
      default: 0,
      min: [0, 'Pomodoro sessions cannot be negative'],
    },
    focusTime: {
      type: Number,
      default: 0,
      min: [0, 'Focus time cannot be negative'],
    },
    restTime: {
      type: Number,
      default: 0,
      min: [0, 'Rest time cannot be negative'],
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isTimerRunning: {
      type: Boolean,
      default: false,
    },
    remainingTime: {
      type: Number,
      default: 0,
      min: [0, 'Remaining time cannot be negative'],
    },
    currentSessionType: {
      type: String,
      enum: ['work', 'rest'],
      default: 'work',
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt`
  }
);

// Pre-save hook to ensure username is always lowercase and trimmed
userSchema.pre('save', function (next) {
  this.username = this.username.toLowerCase().trim();
  next();
});

module.exports = mongoose.model('User', userSchema);
