import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "../../images/login_background.jpg";
import { BellOutlined } from '@ant-design/icons';
import { useState, useEffect } from "react";
import axios from "axios";

const HeaderAdmin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNoti, setShowNoti] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const userId = user?._id || user?.id;
    console.log('Current admin user:', user);
    if (!userId) return;
    axios.get(`http://localhost:5000/api/notifications/${userId}`)
      .then(res => setNotifications(res.data.data || []))
      .catch(() => setNotifications([]));
  }, [user]);

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
            <span className="text-sm text-gray-200">Xin chào Admin</span>
            <span className="font-medium text-white">{user?.full_name}</span>
          </div>
          <span style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNoti(!showNoti)}>
            <BellOutlined style={{ fontSize: 28, color: 'white' }} />
            {notifications.some(n => !n.user_notification_isRead) && (
              <span style={{
                position: 'absolute', top: 0, right: 0, width: 10, height: 10,
                background: 'red', borderRadius: '50%', border: '2px solid white'
              }} />
            )}
            {showNoti && (
              <div style={{
                position: 'absolute', right: 0, top: 36, width: 350, maxHeight: 400,
                background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0001', zIndex: 9999, overflowY: 'auto'
              }}>
                <div className="font-bold p-3 border-b">Thông báo mới</div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-400">Không có thông báo</div>
                ) : notifications.map((n, idx) => (
                  <div key={n._id || idx} className="p-3 border-b last:border-b-0">
                    <div className="font-semibold">{n.user_notification_title}</div>
                    <div className="text-sm text-gray-600">{n.user_notification_content}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </span>
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