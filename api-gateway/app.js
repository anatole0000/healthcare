require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;



// Proxy route user-service
app.use('/users', createProxyMiddleware({
  target: process.env.USER_SERVICE, // http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/users': '',
  }
}));

// Proxy route question-service
app.use('/questions', createProxyMiddleware({
  target: process.env.QUESTION_SERVICE, // http://localhost:3001
  changeOrigin: true,
  pathRewrite: {
    '^/questions': '',
  }
}));

// ✅ Proxy route answer-service
app.use('/answers', createProxyMiddleware({
  target: process.env.ANSWER_SERVICE, // http://localhost:3003
  changeOrigin: true,
  pathRewrite: {
    '^/answers': '',
  }
}));

// ✅ Proxy route search-service
app.use('/search', createProxyMiddleware({
  target: process.env.SEARCH_SERVICE, // http://localhost:3004
  changeOrigin: true,
  pathRewrite: {
    '^/search': '',
  }
}));

app.use('/notifications', createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE + '/notifications',
  changeOrigin: true,
  pathRewrite: {
    '^/notifications': '', // xoá prefix trước khi gửi qua
  },
}));

app.use('/logs', createProxyMiddleware({
  target: process.env.LOGGING_SERVICE + '/logs', // http://localhost:3006
  changeOrigin: true,
  pathRewrite: {
    '^/logs': '', // => forwarding tới /logs bên service
  },
  
}));

app.use('/analytics', createProxyMiddleware({
  target: process.env.ANALYTICS_SERVICE + '/analytics', // http://localhost:3005
  changeOrigin: true,
  pathRewrite: {
    '^/analytics': '', // => forwarding tới /analytics bên service
  },
}));

app.use('/chat', createProxyMiddleware({
  target: process.env.CHAT_SERVICE + '/chat', // http://localhost:3007
  changeOrigin: true,
  pathRewrite: {
    '^/chat': '', // => forwarding tới /chat bên service
  },
}));

app.listen(PORT, () => {
  console.log(`API Gateway running at http://localhost:${PORT}`);
});
