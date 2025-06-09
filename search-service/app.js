require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const PORT = process.env.PORT || 3004;

// 🔍 Search questions by keyword
app.get('/questions', async (req, res) => {
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

// 🔍 Search answers by keyword
app.get('/answers', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Search Service is running at http://localhost:${PORT}`);
});
