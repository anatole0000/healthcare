const pool = require('../db/pool');
const elastic = require('../services/elastic');
const redis = require('../services/redis');
exports.searchQuestions = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Missing query' });

  const cacheKey = `search:questions:${q}`;

  try {
    // 1️⃣ Check cache Redis
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // 2️⃣ Search in Elasticsearch
    const result = await elastic.search({
      index: 'questions',
      query: {
        multi_match: {
          query: q,
          fields: ['title', 'content']
        }
      }
    });

    const hits = result.hits.hits.map(hit => hit._source);

    // 3️⃣ Store in Redis cache
    await redis.setEx(cacheKey, 30, JSON.stringify(hits));

    res.json(hits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.searchAnswers = async (req, res) => {
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
};

exports.searchDoctors = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Missing query' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE role = "doctor" AND username LIKE ?',
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchArticles = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Missing query' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM articles WHERE title LIKE ? OR content LIKE ?',
      [`%${q}%`, `%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Missing query' });

  try {
    const [questions] = await pool.query(
      'SELECT title FROM questions WHERE title LIKE ? LIMIT 10',
      [`%${q}%`]
    );
    res.json(questions.map(q => q.title));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
