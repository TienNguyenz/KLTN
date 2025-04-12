import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Đảm bảo đường dẫn đúng

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy đường dẫn người dùng muốn truy cập trước khi bị chuyển đến login (nếu có)
  const from = location.state?.from?.pathname || "/"; 

  const handleLogin = (e) => {
    e.preventDefault();
    setError(''); // Xóa lỗi cũ

    // --- GIẢ LẬP XÁC THỰC --- 
    let userData = null;

    if (username === 'sinhvien01' && password === 'password123') {
      userData = { id: 'sv001', name: 'Nguyễn Văn Sinh Viên', role: 'sinhvien' };
    } else if (username === 'giaovu01' && password === 'password123') {
      userData = { id: 'gv001', name: 'Trần Thị Giáo Vụ', role: 'giaovu' };
    } else if (username === 'giangvien01' && password === 'password123') {
      userData = { id: 'gvien001', name: 'Lê Anh Giảng Viên', role: 'giangvien' };
    }
    // Thêm các role khác nếu cần

    if (userData) {
      login(userData); // Gọi hàm login từ context
      
      // --- Cập nhật logic chuyển hướng --- 
      let targetPath = from; 
      
      if (userData.role === 'sinhvien') {
        targetPath = '/student'; // Sinh viên vào layout riêng của họ
      } else if (userData.role === 'giaovu') {
         targetPath = '/admin/dashboard'; 
      } else if (userData.role === 'giangvien') {
         targetPath = '/lecturer/topics'; 
      }
      // Bỏ kiểm tra targetPath === '/' vì layout đã được tách riêng
      
      navigate(targetPath, { replace: true }); 
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
    // --- KẾT THÚC GIẢ LẬP ---
  };

  return (
    // Thêm mt âm để bù lại padding của App.jsx nếu trang này không nên có khoảng trống trên cùng
    // Hoặc điều chỉnh padding/margin trong App.jsx/Header cho phù hợp hơn
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-12 md:py-0"> 
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Đăng Nhập Hệ Thống</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-6 text-center text-sm">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#008bc3] focus:border-transparent placeholder-gray-400"
              id="username"
              type="text"
              placeholder="Nhập tên đăng nhập (vd: sinhvien01)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              placeholder="Nhập mật khẩu (vd: password123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Optional: Add forgot password link here */}
            {/* <a href="#" className="text-sm text-[#008bc3] hover:underline mt-2 inline-block">Quên mật khẩu?</a> */}
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
