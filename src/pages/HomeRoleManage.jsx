import { useState } from "react";
import Sidebar from "../components/ui/SideBar.jsx";
import Dashboard from "../components/ui/Dashboard.jsx";
import HeaderAdmin from "../components/ui/HeaderAdmin.jsx";
import Students from "../components/ui/Students.jsx";
import LecturerList from "../components/ui/Lecturer.jsx";

const Home = () => {
  const [selected, setSelected] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header cố định */}
      <HeaderAdmin />

      <div className="flex">
        {/* Sidebar bên trái */}
        <Sidebar setSelected={setSelected} />

        {/* Nội dung chính */}
        <main className="flex-1 ml-64 p-8 mt-16">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            {selected === "dashboard" && "Dashboard Tổng Quan"}
            {selected === "students" && "Quản lý Sinh viên"}
            {selected === "lecturers" && "Quản lý Giảng viên"}
            {selected === "projects" && "Quản lý Đề tài"}
            {selected === "settings" && "Cài đặt"}
          </h1>

          {/* Nội dung component động */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {selected === "dashboard" && <Dashboard />}
            {selected === "students" && <Students />}
            {selected === "lecturers" && <LecturerList />}
            {selected === "projects" && <div>Trang Quản lý Đề tài</div>}
            {selected === "settings" && <div>Trang Cài đặt</div>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home; 