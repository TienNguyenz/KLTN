import { useState, useEffect } from "react";
import Sidebar from "../components/ui/SideBar.jsx";
import Dashboard from "./admin/Dashboard.jsx";
import HeaderAdmin from "../components/ui/HeaderAdmin.jsx";
import Students from "./admin/Students.jsx";
import LecturerList from "./admin/Lecturer.jsx";
import CouncilManagement from "./admin/CouncilManagement.jsx";
import ThesisApproval from "./admin/ThesisApproval.jsx";
import ThesisList from "./admin/ThesisList.jsx";
import ThesisHistory from "./admin/ThesisHistory.jsx";
import Registration from "./admin/Registration.jsx";
import Semester from "./admin/Semester.jsx";
import Evaluation from "./admin/Evaluation.jsx";
import AvailableTopics from '../components/admin/AvailableTopics';
import DeleteRequests from '../components/admin/DeleteRequests';
import axios from "axios";

const Home = () => {
  const [selected, setSelected] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalLecturers: 0,
    totalTopics: 0,
    totalGroups: 0,
    monthlyStats: [],
    classStats: [],
    groupProgress: []
  });

  useEffect(() => {
    // Fetch dashboard data when component mounts
    const fetchDashboardData = async () => {
      try {
        // Fetch all data
        const [studentsRes, lecturersRes, topicsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/students'),
          axios.get('http://localhost:5000/api/lecturers'),
          axios.get('http://localhost:5000/api/topics')
        ]);

        // Calculate statistics
        const students = studentsRes.data.data || [];
        const lecturers = lecturersRes.data.data || [];
        const topics = topicsRes.data.data || [];

        // Calculate total counts
        const totalStudents = students.length;
        const totalLecturers = lecturers.length;
        const totalTopics = topics.length;
        const totalGroups = topics.filter(t => t.topic_group_student?.length > 0).length;

        // Calculate monthly statistics (last 6 months)
        const monthlyStats = Array(6).fill(0).map((_, index) => {
          const date = new Date();
          date.setMonth(date.getMonth() - index);
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          
          return {
            month: `${month}/${year}`,
            count: topics.filter(t => {
              const topicDate = new Date(t.createdAt);
              return topicDate.getMonth() + 1 === month && topicDate.getFullYear() === year;
            }).length
          };
        }).reverse();

        // Calculate class statistics
        const classStats = topics.reduce((acc, topic) => {
          const className = topic.topic_major?.major_title || 'Khác';
          if (!acc[className]) {
            acc[className] = 0;
          }
          acc[className]++;
          return acc;
        }, {});

        const formattedClassStats = Object.entries(classStats).map(([className, count]) => ({
          className,
          studentCount: count
        }));

        // Calculate group progress
        const groupProgress = [
          topics.filter(t => t.topic_teacher_status === 'approved' && t.topic_leader_status === 'approved').length,
          topics.filter(t => t.topic_teacher_status === 'pending' || t.topic_leader_status === 'pending').length,
          topics.filter(t => !t.topic_teacher_status && !t.topic_leader_status).length
        ];

        setDashboardData({
          totalStudents,
          totalLecturers,
          totalTopics,
          totalGroups,
          monthlyStats,
          classStats: formattedClassStats,
          groupProgress
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

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
            {selected === "available-topics" && "Đề tài sẵn có"}
            {selected === "councils" && "Quản lý Hội đồng"}
            {selected === "semester" && "Quản lý Học kỳ"}
            {selected === "registration-period" && "Quản lý Đợt đăng ký"}
            {selected === "evaluation-form" && "Quản lý Phiếu đánh giá"}
            {selected === "delete-requests" && "Yêu cầu xóa đề tài"}
            {selected === "thesis-history" && "Lịch sử đề tài đã hoàn thành"}
          </h1>

          {/* Nội dung component động */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {selected === "dashboard" && <Dashboard data={dashboardData} />}
            {selected === "students" && <Students />}
            {selected === "lecturers" && <LecturerList />}
            {selected === "councils" && <CouncilManagement />}
            {selected === "topic-list" && <ThesisList />}
            {selected === "topic-approval" && <ThesisApproval setSelected={setSelected} />}
            {selected === "available-topics" && <AvailableTopics />}
            {selected === "semester" && <Semester />}
            {selected === "registration-period" && <Registration />}
            {selected === "evaluation-form" && <Evaluation />}
            {selected === "delete-requests" && <DeleteRequests />}
            {selected === "thesis-history" && <ThesisHistory />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home; 