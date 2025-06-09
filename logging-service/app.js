require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const PORT = process.env.PORT || 3004;

// Tạo bảng logs nếu chưa có
async function createTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service VARCHAR(255) NOT NULL,
      level VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
createTable().catch(console.error);

// API nhận log
app.post('/logs', async (req, res) => {
  const { service, level, message } = req.body;

  if (!service || !level || !message) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    await pool.query(
      'INSERT INTO logs (service, level, message) VALUES (?, ?, ?)',
      [service, level, message]
    );
    res.status(201).json({ message: 'Log saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API lấy logs (có thể filter theo service, level)
app.get('/logs', async (req, res) => {
  const { service, level } = req.query;
  let query = 'SELECT * FROM logs';
  const params = [];

  if(service && level) {
    query += ' WHERE service = ? AND level = ?';
    params.push(service, level);
  } else if(service) {
    query += ' WHERE service = ?';
    params.push(service);
  } else if(level) {
    query += ' WHERE level = ?';
    params.push(level);
  }

  query += ' ORDER BY timestamp DESC LIMIT 100';

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Logging Service running at http://localhost:${PORT}`);
});
