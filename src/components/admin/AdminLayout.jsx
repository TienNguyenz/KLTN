import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Avatar, Dropdown, Badge, Space } from 'antd';
import {
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  HistoryOutlined,
  BellOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isTopicMenuOpen, setIsTopicMenuOpen] = useState(true);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const baseLinkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200";
  const activeLinkClasses = "bg-blue-600 text-white hover:bg-blue-700";
  const subMenuLinkClasses = "flex items-center px-4 py-2 pl-12 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 text-sm";

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1c23] text-gray-100 flex flex-col h-screen">
        <div className="flex items-center p-4 border-b border-gray-700">
          <img 
            src="/src/images/SGU-LOGO.png" 
            alt="Logo" 
            className="h-8 w-8 mr-3"
          />
          <div>
            <div className="text-lg font-bold">DDT THESIS</div>
          </div>
        </div>

        <nav className="flex-grow mt-4 overflow-y-auto">
          <NavLink 
            to="/admin"
            end
            className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            <HomeOutlined className="mr-3" /> Tổng quan
          </NavLink>

          {/* Menu Đề tài */}
          <div>
            <button 
              onClick={() => setIsTopicMenuOpen(!isTopicMenuOpen)}
              className={`${baseLinkClasses} w-full justify-between`}
            >
              <div className="flex items-center">
                <FileTextOutlined className="mr-3" /> Đề tài
              </div>
              <span className="transform transition-transform duration-200">
                {isTopicMenuOpen ? '▼' : '▶'}
              </span>
            </button>
            {isTopicMenuOpen && (
              <div className="bg-gray-900 py-2">
                <NavLink 
                  to="/admin/approve-groups"
                  className={({ isActive }) => `${subMenuLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                  Duyệt nhóm thực hiện
                </NavLink>
                <NavLink 
                  to="/admin/topics"
                  className={({ isActive }) => `${subMenuLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                  Quản lí đề tài
                </NavLink>
              </div>
            )}
          </div>

          <NavLink 
            to="/admin/students"
            className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            <UserOutlined className="mr-3" /> Sinh viên
          </NavLink>

          <NavLink 
            to="/admin/lecturers"
            className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            <TeamOutlined className="mr-3" /> Giảng viên
          </NavLink>

          <NavLink 
            to="/admin/committees"
            className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            <TeamOutlined className="mr-3" /> Hội đồng
          </NavLink>

          {/* Menu Thiết lập */}
          <div>
            <button 
              onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
              className={`${baseLinkClasses} w-full justify-between`}
            >
              <div className="flex items-center">
                <SettingOutlined className="mr-3" /> Thiết lập
              </div>
              <span className="transform transition-transform duration-200">
                {isSettingsMenuOpen ? '▼' : '▶'}
              </span>
            </button>
            {isSettingsMenuOpen && (
              <div className="bg-gray-900 py-2">
                <NavLink 
                  to="/admin/semester"
                  className={({ isActive }) => `${subMenuLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                  Học kỳ
                </NavLink>
                <NavLink 
                  to="/admin/registration"
                  className={({ isActive }) => `${subMenuLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                  Đợt đăng ký
                </NavLink>
                <NavLink 
                  to="/admin/evaluation"
                  className={({ isActive }) => `${subMenuLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                  Phiếu đánh giá
                </NavLink>
              </div>
            )}
          </div>

          <NavLink 
            to="/admin/history"
            className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            <HistoryOutlined className="mr-3" /> Lịch sử đề tài
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm px-4 py-2 flex items-center justify-end">
          <Space size={16}>
            <Badge count={5} className="cursor-pointer">
              <BellOutlined style={{ fontSize: '20px' }} />
            </Badge>
            <Dropdown 
              menu={{ 
                items: [
                  {
                    key: '1',
                    label: 'Hồ sơ',
                    icon: <UserOutlined />,
                  },
                  {
                    key: '2',
                    label: 'Đăng xuất',
                    icon: <LogoutOutlined />,
                    onClick: logout,
                  },
                ]
              }} 
              placement="bottomRight"
            >
              <Space className="cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name || 'Admin'}</span>
              </Space>
            </Dropdown>
          </Space>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 