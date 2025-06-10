const mysql = require('mysql2/promise');
const retry = require('async-retry');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,      // 
  queueLimit: 0,
  connectTimeout: 10000     // 10s
});

// 
async function queryWithRetry(sql, params = []) {
  return retry(async (_bail) => {
    const [rows] = await pool.query(sql, params);
    return rows;
  }, {
    retries: 3,
    minTimeout: 500,
    onRetry: (err, attempt) => {
      console.warn(`Retry query (attempt ${attempt}):`, err.message);
    }
  });
}

// Graceful shutdown on SIGINT and SIGTERM
process.on('SIGINT', async () => {
  console.log('Closing MySQL pool (SIGINT)...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing MySQL pool (SIGTERM)...');
  await pool.end();
  process.exit(0);
});

module.exports = {
  pool,
  query: queryWithRetry
};
