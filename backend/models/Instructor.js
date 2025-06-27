// models/Instructor.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const InstructorSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    default: '',
  },
  expertise: {
    type: [String],
    default: [],
  },
  courses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      default: [],
    }
  ],
  profileImage: {
    type: String,
    default: '/default-profile.png',
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Instructor', InstructorSchema);