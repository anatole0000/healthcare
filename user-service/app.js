require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/', userRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`User Service chạy tại http://localhost:${PORT}`);
});
