require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const { log } = require('./utils/logger');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const PORT = process.env.PORT || 3003;

// Tạo bảng answers nếu chưa có
async function createTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS answers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_id INT NOT NULL,
      user_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
createTable().catch(console.error);

// Tạo câu trả lời mới
app.post('/answers', async (req, res) => {
  const { question_id, user_id, content } = req.body;
  if (!question_id || !user_id || !content) {
    await log('answer-service', 'warn', 'POST /answers thiếu trường');
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)',
      [question_id, user_id, content]
    );
    await log('answer-service', 'info', `userId=${user_id} trả lời questionId=${question_id}`);
    res.status(201).json({ message: 'Answer created', id: result.insertId });
  } catch (err) {
    await log('answer-service', 'error', `Lỗi tạo answer: ${err.message}`);
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Lấy danh sách câu trả lời theo câu hỏi
app.get('/answers/:questionId', async (req, res) => {
  const questionId = req.params.questionId;
  try {
    const [rows] = await pool.query('SELECT * FROM answers WHERE question_id = ?', [questionId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Answer Service running at http://localhost:${PORT}`);
});

