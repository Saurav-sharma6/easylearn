const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
  progress: { type: Number, default: 0 }, // Seconds watched
  completed: { type: Boolean, default: false },
}, { timestamps: { updatedAt: 'updatedAt' } });

module.exports = mongoose.model('Progress', progressSchema);