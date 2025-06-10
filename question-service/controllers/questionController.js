const pool = require('../config/db');

// 🧠 Hiển thị 10 câu hỏi từ cả medquad và bảng questions
exports.getCombinedQuestions = async (req, res) => {
  try {
    const [medquadRows] = await pool.query(
      `SELECT id, question AS title, answer AS content, NULL as user_id, 'medquad' as source 
       FROM medquad LIMIT 5`
    );

    const [userQuestions] = await pool.query(
      `SELECT q.id, q.title, NULL as content, q.user_id, 'user' as source, u.username 
       FROM questions q 
       JOIN users u ON q.user_id = u.id 
       ORDER BY q.created_at DESC 
       LIMIT 5`
    );

    const combined = [...medquadRows, ...userQuestions];
    res.json(combined);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 🔍 Tìm kiếm câu hỏi trong cả 2 bảng
exports.searchCombinedQuestions = async (req, res) => {
  const keyword = req.query.keyword || '';
  try {
    const [medquadResults] = await pool.query(
      `SELECT id, question AS title, answer AS content, NULL as user_id, 'medquad' as source 
       FROM medquad 
       WHERE question LIKE ? LIMIT 5`,
      [`%${keyword}%`]
    );

    const [userQuestions] = await pool.query(
      `SELECT q.id, q.title, NULL as content, q.user_id, 'user' as source, u.username 
       FROM questions q 
       JOIN users u ON q.user_id = u.id 
       WHERE q.title LIKE ? 
       ORDER BY q.created_at DESC 
       LIMIT 5`,
      [`%${keyword}%`]
    );

    res.json([...medquadResults, ...userQuestions]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 📝 Tạo câu hỏi người dùng
exports.createQuestion = async (req, res) => {
  const { user_id, title, content } = req.body;
  if (!user_id || !title || !content) {
    return res.status(400).json({ message: 'Thiếu thông tin' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO questions (user_id, title, content) VALUES (?, ?, ?)',
      [user_id, title, content]
    );
    res.status(201).json({ message: 'Câu hỏi đã được tạo', question_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 📋 Tất cả câu hỏi người dùng
exports.getAllQuestions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT q.*, u.username FROM questions q JOIN users u ON q.user_id = u.id ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 📄 Chi tiết câu hỏi người dùng + các câu trả lời
exports.getQuestionDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const [[question]] = await pool.query(
      'SELECT q.*, u.username FROM questions q JOIN users u ON q.user_id = u.id WHERE q.id = ?',
      [id]
    );
    if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });

    const [answers] = await pool.query(
      'SELECT a.*, u.username FROM answers a JOIN users u ON a.user_id = u.id WHERE question_id = ?',
      [id]
    );

    res.json({ question, answers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
