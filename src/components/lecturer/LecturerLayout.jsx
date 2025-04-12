import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
// Import icons (thêm các icon cần thiết khác sau)
import { FaHome, FaListAlt, FaUsers, FaCheckSquare, FaHistory, FaChalkboardTeacher, FaUserGraduate, FaClipboardCheck, FaComments, FaCog, FaChevronDown, FaChevronRight } from 'react-icons/fa'; 
import LecturerHeader from './LecturerHeader'; // Header riêng cho Giảng viên

const LecturerLayout = () => {
  const baseLinkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150 text-sm";
  const activeLinkClasses = "bg-gray-900 text-white";
  const subMenuLinkClasses = "flex items-center pl-11 pr-4 py-2 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-150 text-xs";

  // State để quản lý menu con (Đề tài)
  const [isTopicMenuOpen, setIsTopicMenuOpen] = useState(true); // Mở mặc định

  const toggleTopicMenu = () => {
    setIsTopicMenuOpen(!isTopicMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-gray-100 flex flex-col fixed h-full z-30">
         <div className="p-4 text-center text-xl font-bold border-b border-gray-700">
            GV PORTAL
         </div>
         
        <nav className="flex-grow mt-4 overflow-y-auto">
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
                <div className="bg-gray-850">
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
                      to="/lecturer/approve-groups" 
                      className={({ isActive }) => `${subMenuLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                      <FaClipboardCheck className="mr-3 w-4 opacity-0" /> Duyệt nhóm thực hiện
                   </NavLink>
                   <NavLink 
                      to="/lecturer/supervised-topics" 
                      className={({ isActive }) => `${subMenuLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                      <FaChalkboardTeacher className="mr-3 w-4 opacity-0" /> Đề tài hướng dẫn
                   </NavLink>
                    <NavLink 
                      to="/lecturer/review-topics" 
                      className={({ isActive }) => `${subMenuLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                      <FaComments className="mr-3 w-4 opacity-0" /> Đề tài phản biện
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
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow ml-64 flex flex-col">
         {/* Header riêng cho Giảng viên */}
         <LecturerHeader /> 
         <main className="flex-grow overflow-auto">
           <Outlet /> 
         </main>
      </div>
    </div>
  );
};

export default LecturerLayout; 