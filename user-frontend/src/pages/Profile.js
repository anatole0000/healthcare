import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:3002/api/users/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUser(res.data);
      } catch (err) {
        alert(err.response?.data?.message || 'Không thể lấy thông tin người dùng');
      }
    };
    fetchProfile();
  }, []);

  if (!user) return <div>Đang tải...</div>;

  return (
    <div>
      <h2>Thông tin người dùng</h2>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
