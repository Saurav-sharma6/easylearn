const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  contentId: { type: String, required: true },
  type: { type: String, required: true }, // (it can be "video", "pdf", etc)
  url: { type: String, required: true },
  totalDuration: { type: Number, required: true }, // in minutes
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, default: 0 }, // Default 0 for free courses
  category: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }], // Array of strings for keywords & recommendations
  content: [contentSchema], // Array of content objects
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Limit to 100 content items to avoid excessive document size
courseSchema.path('content').validate(function (value) {
  return value.length <= 100;
}, 'A course cannot have more than 100 content items');

courseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Course', courseSchema);