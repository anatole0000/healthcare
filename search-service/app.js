require('dotenv').config();
const express = require('express');
const searchRoutes = require('./routes/searchRoutes');
const client = require('prom-client');

const app = express();
app.use(express.json());

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2]
});

register.registerMetric(httpDuration);

// Middleware to track request duration
app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    end({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    });
  });
  next();
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API routes
app.use('/search', searchRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Search Service is running at http://localhost:${PORT}`);
});
