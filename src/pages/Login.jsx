import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginBackground from '../images/login_background.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // Lưu token vào localStorage
      localStorage.setItem('token', data.token);
      
      // Lưu thông tin user vào context
      login(data.user);

      // Chuyển hướng dựa vào role
      let targetPath = from;
      if (data.user.role === 'sinhvien') {
        targetPath = '/student';
      } else if (data.user.role === 'giaovu') {
        targetPath = '/HomeRoleManage';
      } else if (data.user.role === 'giangvien') {
        targetPath = '/lecturer';
      }

      navigate(targetPath, { replace: true });
    } catch (error) {
      setError(error.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen relative"
      style={{
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      {/* Login form container */}
      <div className="relative z-10 bg-white p-8 md:p-10 rounded-xl shadow-xl w-full max-w-md mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Đăng Nhập Hệ Thống</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-6 text-center text-sm">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#008bc3] focus:border-transparent placeholder-gray-400"
              id="email"
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Mật khẩu
            </label>
            <input
              className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#008bc3] focus:border-transparent placeholder-gray-400"
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <button
              className="w-full bg-[#008bc3] hover:bg-[#0073a8] text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-300 shadow-md"
              type="submit"
            >
              Đăng Nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
