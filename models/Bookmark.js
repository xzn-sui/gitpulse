const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  repoName:    { type: String, required: true },
  repoUrl:     { type: String, required: true },
  author:      { type: String },
  description: { type: String },
  stars:       { type: Number },
  language:    { type: String },
  note:        { type: String },
  savedAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);
