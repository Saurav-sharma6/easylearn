const mongoose = require('mongoose');
const { Schema } = mongoose;

const CourseSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  instructor: {
    type: String,
    required: true,
    trim: true,
  },
  instructorId: { //New field – reference to Instructor._id
    type: Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  originalPrice: {
    type: Number,
    default: null,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  students: {
    type: Number,
    default: 0,
  },
  duration: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  isEnrolled: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Course', CourseSchema);