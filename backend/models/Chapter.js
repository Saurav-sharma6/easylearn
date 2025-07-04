const mongoose = require('mongoose');
const { Schema } = mongoose;
const Lecture = require('./Lecture');

const ChapterSchema = new Schema({
  chapterTitle: {
    type: String,
    required: true,
    trim: true,
  },
  chapterContent: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Lecture',
    },
  ],
});

module.exports = mongoose.model('Chapter', ChapterSchema);