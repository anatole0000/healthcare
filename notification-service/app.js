require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Nodemailer transporter config
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true nếu port 465, false nếu 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// Tạo bảng notifications (nếu chưa có)
async function createTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type VARCHAR(50),
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
createTable().catch(console.error);

// Gửi notification (lưu DB + gửi email)
app.post('/notify', async (req, res) => {
  const { user_id, type, message, email } = req.body;

  if (!user_id || !message || !email) {
    return res.status(400).json({ message: 'Missing user_id, message or email' });
  }

  try {
    // Lưu notification vào DB
    await pool.query(
      'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
      [user_id, type || 'general', message]
    );

    // Gửi email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Notification: ${type || 'General'}`,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Notification sent and saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending notification' });
  }
});

// Lấy notification chưa đọc cho user
app.get('/notifications/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Đánh dấu notification là đã đọc
app.put('/notifications/:id/read', async (req, res) => {
  const notificationId = req.params.id;

  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Notification Service running at http://localhost:${PORT}`);
});
