import React, { useState } from 'react';
import { register } from '../api/userApi';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await register(form);
      alert(res.data.message);
    } catch (err) {
      alert(err.response.data.message || 'Đăng ký thất bại');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Đăng ký</button>
    </form>
  );
}

export default Register;
