const express = require('express');
const router = express.Router();
const pool = require('../db');

// 🔍 Search Questions
router.get('/questions', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Missing query' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM questions WHERE title LIKE ? OR content LIKE ?',
      [`%${q}%`, `%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔍 Search Answers
router.get('/answers', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Missing query' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM answers WHERE content LIKE ?',
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
