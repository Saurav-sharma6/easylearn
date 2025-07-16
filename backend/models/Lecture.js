const mongoose = require('mongoose');
const { Schema } = mongoose;

const LectureSchema = new Schema({
  lectureTitle: {
    type: String,
    required: true,
  },
  lectureDuration: {
    type: String,
    required: true,
  },
  lectureUrl: {
    type: String,
    required: true,
  },
  isPreviewFree: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Lecture', LectureSchema);