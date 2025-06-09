require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3004;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Tổng quan hệ thống
app.get('/analytics/overview', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) AS total_users FROM users');
    const [questions] = await pool.query('SELECT COUNT(*) AS total_questions FROM questions');
    const [answers] = await pool.query('SELECT COUNT(*) AS total_answers FROM answers');

    res.json({
      users: users[0].total_users,
      questions: questions[0].total_questions,
      answers: answers[0].total_answers
    });
  } catch (err) {
    console.error('Error getting analytics:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Thêm endpoint thống kê theo ngày
app.get('/analytics/daily', async (req, res) => {
  try {
    // Giả sử bạn có bảng `questions` có cột `created_at` kiểu datetime
    // Thống kê số câu hỏi theo ngày trong 7 ngày gần nhất
    const [dailyQuestions] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as questions_count
      FROM questions
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    // Tương tự với bảng answers
    const [dailyAnswers] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as answers_count
      FROM answers
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    res.json({ dailyQuestions, dailyAnswers });
  } catch (err) {
    console.error('Error getting daily analytics:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Analytics Service running at http://localhost:${PORT}`);
});
