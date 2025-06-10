import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Đăng ký
export const register = (data) => api.post('/auth/register', data);

// Đăng nhập
export const login = (data) => api.post('/auth/login', data);

// Quên mật khẩu
export const forgotPassword = (username) =>
  api.post('/auth/forgot-password', { username });

// Lấy user info
export const getMe = (token) =>
  api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

// Đổi mật khẩu
export const updatePassword = (token, newPassword) =>
  api.put(
    '/auth/update-password',
    { newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
