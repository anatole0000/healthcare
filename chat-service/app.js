require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const PORT = process.env.PORT || 3004;

// Tạo bảng chat_messages nếu chưa có
async function createTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conversation_id INT NOT NULL,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      message TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
createTable().catch(console.error);

// Gửi tin nhắn mới
app.post('/messages', async (req, res) => {
  const { conversation_id, sender_id, receiver_id, message } = req.body;
  if (!conversation_id || !sender_id || !receiver_id || !message) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO chat_messages (conversation_id, sender_id, receiver_id, message) VALUES (?, ?, ?, ?)',
      [conversation_id, sender_id, receiver_id, message]
    );
    res.status(201).json({ message: 'Message sent', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Lấy lịch sử chat theo conversation_id
app.get('/messages/:conversationId', async (req, res) => {
  const conversationId = req.params.conversationId;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY timestamp ASC',
      [conversationId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Chat Service running at http://localhost:${PORT}`);
});
