require('dotenv').config();
const express = require('express');
const searchRoutes = require('./routes/searchRoutes');

const app = express();
app.use(express.json());

app.use('/search', searchRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Search Service is running at http://localhost:${PORT}`);
});
