require('dotenv').config();
const express = require('express');
const questionRoutes = require('./routes/questionRoutes');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Question Service is running');
});

app.use('/questions', questionRoutes);

app.listen(port, () => {
  console.log(`Question Service running on http://localhost:${port}`);
});
