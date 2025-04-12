import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Sửa đường dẫn: lên 2 cấp
import { FaBell, FaUserCircle, FaSignOutAlt, FaBars, FaUserEdit } from 'react-icons/fa'; // Thêm FaBars

const StudentHeader = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true }); // Chuyển về trang login sau khi logout
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Left side: Hamburger (chức năng toggle sidebar có thể thêm sau) */}
      <div className="flex items-center">
         <button className="text-gray-500 focus:outline-none md:hidden mr-4">
            {/* Icon này sẽ ẩn/hiện sidebar trên mobile */} 
            <FaBars className="h-6 w-6" />
         </button>
         {/* Có thể thêm tiêu đề trang hiện tại ở đây nếu muốn */}
      </div>

      {/* Right side: Notifications, User Menu */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-700 relative focus:outline-none">
          <FaBell className="h-6 w-6" />
          {/* Badge thông báo (nếu có) */}
          {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span> */}
        </button>

        {/* User Menu Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008bc3]"
          >
            <span className="sr-only">Mở menu người dùng</span>
            <span className="text-gray-700 mr-2 hidden sm:block">{user?.name || 'Sinh Viên'}</span>
            {/* Sử dụng icon user hoặc avatar nếu có */} 
             <FaUserCircle className="h-8 w-8 rounded-full text-gray-500" /> 
             {/* <img className="h-8 w-8 rounded-full" src={user?.avatarUrl || defaultAvatar} alt="Avatar" /> */}
          </button>

          {/* Dropdown Panel */} 
          {dropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <Link
                to="/student/profile" // Route cho trang profile sinh viên
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)} // Đóng dropdown khi click
              >
                 <FaUserEdit className="mr-3 h-5 w-5 text-gray-500"/>
                 Thông tin cá nhân
              </Link>
              <button
                onClick={() => { handleLogout(); setDropdownOpen(false); }}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                 <FaSignOutAlt className="mr-3 h-5 w-5 text-gray-500"/>
                 Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentHeader; 