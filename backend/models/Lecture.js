const mongoose = require('mongoose');
const { Schema } = mongoose;

const LectureSchema = new Schema({
  lectureTitle: {
    type: String,
    required: true,
    trim: true,
  },
  lectureDuration: {
    type: String,
    required: true,
    trim: true,
  },
  lectureUrl: {
    type: String,
    required: true,
    trim: true,
  },
  isPreviewFree: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Lecture', LectureSchema);