// utils/logger.js
const axios = require('axios');

const LOGGING_URL = process.env.LOGGING_URL || 'http://localhost:3006/logs';

async function log(service, level, message) {
  try {
    await axios.post(LOGGING_URL, { service, level, message });
  } catch (err) {
    console.error(`[Logger Error] ${err.message}`);
  }
}

module.exports = { log };
