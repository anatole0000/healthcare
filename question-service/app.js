const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 3001;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'lengoc2252005',
  database: 'medquad_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Question Service is running');
});


// Lấy 10 câu hỏi trả lời đầu tiên
app.get('/questions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, question, answer FROM medquad LIMIT 10');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Tìm kiếm câu hỏi theo từ khóa
app.get('/questions/search', async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const [rows] = await pool.query('SELECT id, question, answer FROM medquad WHERE question LIKE ? LIMIT 10', [`%${keyword}%`]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Question Service running on http://localhost:${port}`);
});
