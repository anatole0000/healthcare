const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
// const { sendMail } = require('../utils/mailer');
const { emailQueue } = require('../queue');

// Đăng ký user mới
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email và password bắt buộc' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashed, role || 'patient']
    );
    res.status(201).json({ message: 'Đăng ký thành công', userId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Username hoặc email đã tồn tại' });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};


// Đăng nhập
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username và password bắt buộc' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'Sai username hoặc password' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Sai username hoặc password' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ message: 'Đăng nhập thành công', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy thông tin user đang đăng nhập
exports.getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
        [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xem thông tin profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Đổi mật khẩu
exports.updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu mới' });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Vui lòng cung cấp username' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const user = rows[0];

    const newPassword = crypto.randomBytes(4).toString('hex');
    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password = ? WHERE username = ?', [hashed, username]);

    // Thêm job gửi mail vào queue
    await emailQueue.add('sendResetPasswordMail', {
      to: user.email,
      subject: 'Khôi phục mật khẩu',
      text: `Mật khẩu mới của bạn là: ${newPassword}`
    });

    res.json({ message: 'Mật khẩu đã được đặt lại. Vui lòng kiểm tra email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
