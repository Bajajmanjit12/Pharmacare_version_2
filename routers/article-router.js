// routers/articles-router.js
const express = require('express');
const router = express.Router();
const Article = require('../models/article'); // create Mongoose model

// Insert new article
router.post('/new', async (req, res) => {
  try {
    const { title, text, category, language, date } = req.body;
    if (!title || !text || !category || !language) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const article = new Article({ title, text, category, language, date: date || new Date() });
    await article.save();

    res.status(201).json({ message: "Article added", data: article });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to insert article", error: err.message });
  }
});

// Get all articles (optionally filtered by language)
router.get('/', async (req, res) => {
  try {
    const { language } = req.query;
    const filter = language ? { language } : {};
    const articles = await Article.find(filter).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch articles", error: err.message });
  }
});

module.exports = router;
