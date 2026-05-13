const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');

// GET /bookmarks — show all saved bookmarks
router.get('/', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find().sort({ savedAt: -1 });
    res.render('bookmarks', { title: 'My Bookmarks', bookmarks });
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    res.render('bookmarks', { title: 'My Bookmarks', bookmarks: [], error: 'Could not load bookmarks.' });
  }
});

// POST /bookmarks — save a new bookmark
router.post('/', async (req, res) => {
  const { repoName, repoUrl, author, description, stars, language, note } = req.body;
  try {
    await Bookmark.create({ repoName, repoUrl, author, description, stars: Number(stars) || 0, language, note });
    res.redirect('/bookmarks');
  } catch (err) {
    console.error('Error saving bookmark:', err);
    res.redirect('/repos');
  }
});

// POST /bookmarks/:id/delete — delete a bookmark
router.post('/:id/delete', async (req, res) => {
  try {
    await Bookmark.findByIdAndDelete(req.params.id);
  } catch (err) {
    console.error('Error deleting bookmark:', err);
  }
  res.redirect('/bookmarks');
});

module.exports = router;
