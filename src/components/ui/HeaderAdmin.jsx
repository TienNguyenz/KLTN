import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "../../images/login_background.jpg";

const HeaderAdmin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 h-16 shadow-md z-50"
      style={{
        backgroundImage: `url(${Logo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="flex items-center justify-between h-full px-6 bg-black bg-opacity-50">
        <div className="flex items-center space-x-4">
          <img src={Logo} alt="Logo" className="w-10 h-10 rounded-full" />
          <h1 className="text-xl font-bold text-white">Hệ thống Quản lý NCKH</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-200">Xin chào,</span>
            <span className="font-medium text-white">{user?.full_name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin; 