import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3002/api/users/forgot-password', { username });
      alert('Hãy kiểm tra email để lấy mật khẩu mới');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi quên mật khẩu');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Quên mật khẩu</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      <button type="submit">Gửi yêu cầu</button>
    </form>
  );
}
