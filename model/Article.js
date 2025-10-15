const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  category: { type: String, required: true },
  language: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);
