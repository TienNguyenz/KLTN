import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
// Import icons (thêm các icon cần thiết khác sau)
import { FaHome, FaListAlt, FaUsers, FaCheckSquare, FaHistory, FaChalkboardTeacher, FaUserGraduate, FaClipboardCheck, FaComments, FaCog, FaChevronDown, FaChevronRight } from 'react-icons/fa'; 
import LecturerHeader from './LecturerHeader'; // Header riêng cho Giảng viên

const LecturerLayout = () => {
  // Sử dụng màu sắc của SGU (xanh dương đậm và trắng)
  const baseLinkClasses = "flex items-center px-5 py-3 text-gray-300 hover:bg-blue-700 hover:text-white transition-colors duration-200 text-sm";
  const activeLinkClasses = "bg-blue-800 text-white border-r-4 border-white"; // Màu xanh đậm hơn cho active, thêm border nổi bật
  const subMenuLinkClasses = "flex items-center pl-12 pr-4 py-2 text-gray-400 hover:bg-blue-700 hover:text-white transition-colors duration-200 text-xs";

  // State để quản lý menu con (Đề tài)
  const [isTopicMenuOpen, setIsTopicMenuOpen] = useState(true); // Mở mặc định

  const toggleTopicMenu = () => {
    setIsTopicMenuOpen(!isTopicMenuOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-64 bg-[#1a2b4a] flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <div className="h-full flex flex-col">
          {/* Tiêu đề sidebar với tên cổng SGU Thesis */}
          <div className="p-5 text-center text-xl font-bold border-b border-gray-700 text-white flex-shrink-0">
            HỆ THỐNG QUẢN LÝ ĐỀ TÀI NCKH SGU
          </div>
         
          <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-blue-950">
          <NavLink 
             to="/lecturer" // Hoặc /lecturer/dashboard
             end 
             className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
           >
            <FaHome className="mr-3 w-5" /> Tổng quan
          </NavLink>

          {/* Menu Đề tài (có menu con) */}
          <div>
             <button 
               onClick={toggleTopicMenu} 
               className={`${baseLinkClasses} w-full justify-between`}
             >
               <div className="flex items-center">
                 <FaCog className="mr-3 w-5" /> Đề tài
               </div>
               {isTopicMenuOpen ? <FaChevronDown className="w-3 h-3" /> : <FaChevronRight className="w-3 h-3" />}
             </button>
             {isTopicMenuOpen && ( 
                <div className="bg-[#13213a]">
                   <NavLink 
                      to="/lecturer/proposed-topics" 
                      className={({ isActive }) => `${subMenuLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                      <FaUserGraduate className="mr-3 w-4 opacity-0" /> Sinh viên đề xuất
                   </NavLink>
                   <NavLink 
                      to="/lecturer/topics" 
                      className={({ isActive }) => `${subMenuLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                       <FaListAlt className="mr-3 w-4 opacity-0" /> Quản lí đề tài
                   </NavLink>
                   <NavLink 
                      to="/lecturer/supervised-topics" 
                      className={({ isActive }) => `${subMenuLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                      <FaChalkboardTeacher className="mr-3 w-4 opacity-0" /> Đề tài hướng dẫn
                   </NavLink>
                </div>
             )} 
          </div>

          <NavLink 
             to="/lecturer/committee" 
             className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
           >
            <FaUsers className="mr-3 w-5" /> Hội đồng
          </NavLink>
           <NavLink 
             to="/lecturer/history" 
             className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
           >
            <FaHistory className="mr-3 w-5" /> Lịch sử đề tài
          </NavLink>
        </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Fixed Header */}
        <LecturerHeader className="flex-shrink-0 h-16 bg-white border-b border-gray-200" />
        
        {/* Main Content - Scrollable Container */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          <div className="h-full overflow-y-auto">
            <main className="container mx-auto px-6 py-8">
           <Outlet /> 
         </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerLayout; 