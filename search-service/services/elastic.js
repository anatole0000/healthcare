const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTIC_URL || 'http://localhost:9200'
});

module.exports = client;
