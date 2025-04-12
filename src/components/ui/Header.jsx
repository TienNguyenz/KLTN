import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md px-4 py-3 flex items-center justify-between sticky top-0 left-0 w-full z-50">
      <div className="flex items-center">
        <Link to="/">
          <img 
            src="/src/images/SGU-LOGO.png" 
            alt="Logo TDMU" 
            className="w-16 h-16 object-contain mr-4"
          />
        </Link>
      </div>
      <nav className="hidden md:flex space-x-6 items-center">
        <Link to="/" className="text-base font-medium text-gray-600 hover:text-[#008bc3]">Trang chủ</Link>
        <Link to="/about" className="text-base font-medium text-gray-600 hover:text-[#008bc3]">Giới thiệu</Link>
        <Link to="/news" className="text-base font-medium text-gray-600 hover:text-[#008bc3]">Tin tức</Link>
        <Link to="/notifications" className="text-base font-medium text-gray-600 hover:text-[#008bc3]">Thông báo</Link>
        <Link to="/contact" className="text-base font-medium text-gray-600 hover:text-[#008bc3]">Liên hệ</Link>
      </nav>
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            {user.role === 'sinhvien' && 
              <Link to="/student" className="text-sm font-medium text-gray-600 hover:text-[#008bc3]">Trang Sinh Viên</Link>
            }
            {user.role === 'giangvien' && 
              <Link to="/lecturer/dashboard" className="text-sm font-medium text-gray-600 hover:text-[#008bc3]">Dashboard GV</Link>
            }
            {user.role === 'giaovu' && 
              <Link to="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-[#008bc3]">Dashboard Admin</Link>
            }
            
            <span className="text-sm text-gray-700">Chào, {user.name}!</span>
            <Link to="/profile" className="text-sm font-medium text-gray-600 hover:text-[#008bc3]">Hồ sơ</Link>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors duration-300"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="bg-[#008bc3] hover:bg-[#0073a8] text-white text-sm font-medium px-5 py-2 rounded-full transition-colors duration-300 shadow-sm"
          >
            Đăng nhập / Đăng ký
          </Link>
        )}
      </div>
    </header>
  );
}
