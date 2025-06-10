import React, { useState } from 'react';
import axios from 'axios';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:3002/api/users/update-password', { newPassword }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Đổi mật khẩu thành công');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi đổi mật khẩu');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Đổi mật khẩu</h2>
      <input
        type="password"
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
      />
      <button type="submit">Cập nhật</button>
    </form>
  );
}
