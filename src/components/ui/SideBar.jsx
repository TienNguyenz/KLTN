import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaCog,
  FaHome,
  FaListAlt,
  FaCheckSquare,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaFileAlt,
} from "react-icons/fa";
import Logo from "../../images/login_background.jpg";
import { useState } from "react";

const Sidebar = ({ setSelected }) => {
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleTopicsClick = () => {
    setIsTopicsOpen(!isTopicsOpen);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-gray-400 shadow-md p-4">
      {/* Logo & Tên hệ thống */}
      <div className="flex justify-center mb-4">
        <img src={Logo} alt="Logo" className="w-16 h-16 rounded-full" />
      </div>
      <h2 className="text-center text-xl font-semibold text-blue-600">
        Hệ thống NCKH
      </h2>

      {/* Menu Items */}
      <nav className="mt-6 space-y-3">
        <MenuItem
          icon={<FaHome />}
          text="Dashboard"
          onClick={() => setSelected("dashboard")}
        />
        <MenuItem
          icon={<FaUserGraduate />}
          text="Sinh viên"
          onClick={() => setSelected("students")}
        />
        <MenuItem
          icon={<FaChalkboardTeacher />}
          text="Giảng viên"
          onClick={() => setSelected("lecturers")}
        />
        <MenuItem
          icon={<FaUsers />}
          text="Hội đồng"
          onClick={() => setSelected("councils")}
        />
        <div>
          <MenuItem
            icon={<FaBook />}
            text="Đề tài"
            onClick={handleTopicsClick}
          />
          {isTopicsOpen && (
            <div className="ml-6 space-y-2">
              <MenuItem
                icon={<FaListAlt />}
                text="Danh sách đề tài"
                onClick={() => setSelected("topic-list")}
              />
              <MenuItem
                icon={<FaCheckSquare />}
                text="Xét duyệt đề tài"
                onClick={() => setSelected("topic-approval")}
              />
            </div>
          )}
        </div>
        <div>
        <MenuItem
          icon={<FaCog />}
            text="Thiết lập"
            onClick={handleSettingsClick}
          />
          {isSettingsOpen && (
            <div className="ml-6 space-y-2">
              <MenuItem
                icon={<FaCalendarAlt />}
                text="Học kỳ"
                onClick={() => setSelected("semester")}
              />
              <MenuItem
                icon={<FaClipboardList />}
                text="Đợt đăng ký"
                onClick={() => setSelected("registration-period")}
              />
              <MenuItem
                icon={<FaFileAlt />}
                text="Phiếu đánh giá"
                onClick={() => setSelected("evaluation-form")}
        />
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

const MenuItem = ({ icon, text, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center space-x-3 px-4 py-2 rounded-lg cursor-pointer transition hover:bg-gray-200"
  >
    <span className="text-lg">{icon}</span>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

export default Sidebar; 