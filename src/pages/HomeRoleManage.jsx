import { useState } from "react";
import Sidebar from "../components/ui/SideBar.jsx";
import Dashboard from "../components/ui/Dashboard.jsx";
import HeaderAdmin from "../components/ui/HeaderAdmin.jsx";
import Students from "../components/ui/Students.jsx";
import LecturerList from "../components/ui/Lecturer.jsx";
import CouncilManagement from "../components/ui/CouncilManagement.jsx";
import ThesisApproval from "../components/ui/ThesisApproval.jsx";
import Registration from "./admin/Registration.jsx";
import Semester from "./admin/Semester.jsx";
import Evaluation from "./admin/Evaluation.jsx";

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
            {selected === "topic-list" && "Danh sách đề tài"}
            {selected === "topic-approval" && "Xét duyệt đề tài"}
            {selected === "councils" && "Quản lý Hội đồng"}
            {selected === "semester" && "Quản lý Học kỳ"}
            {selected === "registration-period" && "Quản lý Đợt đăng ký"}
            {selected === "evaluation-form" && "Quản lý Phiếu đánh giá"}
          </h1>

          {/* Nội dung component động */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {selected === "dashboard" && <Dashboard />}
            {selected === "students" && <Students />}
            {selected === "lecturers" && <LecturerList />}
            {selected === "councils" && <CouncilManagement />}
            {selected === "topic-list" && <div>Trang Danh sách đề tài</div>}
            {selected === "topic-approval" && <ThesisApproval />}
            {selected === "semester" && <Semester />}
            {selected === "registration-period" && <Registration />}
            {selected === "evaluation-form" && <Evaluation />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home; 