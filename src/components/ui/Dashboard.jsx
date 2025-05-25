import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaUsers,
} from "react-icons/fa";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các thành phần của Chart.js
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ data }) => {
  const {
    totalStudents,
    totalLecturers,
    totalTopics,
    totalGroups,
    monthlyStats,
    classStats,
    groupProgress
  } = data;

  // Dữ liệu cho biểu đồ đường (Line Chart)
  const lineData = {
    labels: monthlyStats.map(stat => stat.month) || [],
    datasets: [
      {
        label: "Số lượt tham gia",
        data: monthlyStats.map(stat => stat.count) || [],
        borderColor: "#42A5F5",
        backgroundColor: "rgba(66, 165, 245, 0.2)",
        tension: 0.4,
      },
    ],
  };

  // Dữ liệu cho biểu đồ cột (Bar Chart)
  const barData = {
    labels: classStats.map(stat => stat.className) || [],
    datasets: [
      {
        label: "Số lượng sinh viên",
        data: classStats.map(stat => stat.studentCount) || [],
        backgroundColor: ["#66BB6A", "#FFA726", "#EF5350"],
      },
    ],
  };

  // Dữ liệu cho biểu đồ Doughnut (tiến độ hoạt động của nhóm)
  const doughnutData = {
    labels: ["Hoàn thành", "Đang thực hiện", "Chưa bắt đầu"],
    datasets: [
      {
        data: groupProgress || [0, 0, 0], // Tỷ lệ %
        backgroundColor: ["#4CAF50", "#FFEB3B", "#F44336"],
      },
    ],
  };

  return (
    <div className="p-10 w-[900px] mx-auto ml-4 mt-8 overflow-hidden">
      {/* Phần thông tin tổng quan */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg w-60 text-center">
          <FaUserGraduate className="text-4xl mx-auto mb-2" />
          <h2 className="text-lg font-semibold">{totalStudents}+ Sinh viên tham gia</h2>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-xl shadow-lg w-60 text-center">
          <FaChalkboardTeacher className="text-4xl mx-auto mb-2" />
          <h2 className="text-lg font-semibold">{totalLecturers}+ Giảng viên hướng dẫn</h2>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg w-60 text-center">
          <FaBook className="text-4xl mx-auto mb-2" />
          <h2 className="text-lg font-semibold">{totalTopics}+ Đề tài nghiên cứu</h2>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-xl shadow-lg w-60 text-center">
          <FaUsers className="text-4xl mx-auto mb-2" />
          <h2 className="text-lg font-semibold">{totalGroups}+ Nhóm nghiên cứu</h2>
        </div>
      </div>

      {/* Phần biểu đồ */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Biểu đồ đường */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-md font-semibold text-gray-700 mb-2">
            Thống kê số lượt tham gia
          </h3>
          <Line data={lineData} />
        </div>

        {/* Biểu đồ cột */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-md font-semibold text-gray-700 mb-2">
            Số lượng sinh viên từng lớp
          </h3>
          <Bar data={barData} />
        </div>

        {/* Biểu đồ Doughnut - Tiến độ nhóm nghiên cứu */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-md font-semibold text-gray-700 mb-2">
            Tiến độ hoạt động của nhóm NCKH
          </h3>
          <Doughnut data={doughnutData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 