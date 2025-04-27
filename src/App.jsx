import { BrowserRouter as Router, Route, Routes, Outlet, Navigate, useLocation } from "react-router-dom";
import Header from "./components/ui/Header";
import Footer from './components/ui/Footer';
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TopicDetail from "./components/lecturer/TopicDetail";
import HomeRoleManage from "./pages/HomeRoleManage";

// Import các trang công khai
import HomePage from "./pages/Homepage";
import News from "./pages/News";
import GioiThieu from './pages/GioiThieu';
import LoginPage from "./pages/Login";
import ThongBaoPage from "./pages/Thongbao";
import LienHePage from "./pages/Lienhe";

// Import layout và các trang của sinh viên
import { StudentLayout, TopicDetails, TopicsList, Proposals } from "./pages/student/StudentDashboard"; 
import TopicRegistration from "./pages/student/TopicRegistration";

// Import layout và các trang của giảng viên
import LecturerLayout from "./components/lecturer/LecturerLayout";
import TopicManagement from "./pages/lecturer/TopicManagement";
import AddTopic from "./pages/lecturer/AddTopic";
import EditTopic from "./pages/lecturer/EditTopic";
import ApproveTopicList from "./pages/lecturer/ApproveTopicList";
import ApproveGroupDetails from "./pages/lecturer/ApproveGroupDetails";
import ProposedTopics from "./pages/lecturer/ProposedTopics";
import SupervisedTopics from "./components/lecturer/SupervisedTopics";
import ReviewTopics from './components/lecturer/ReviewTopics';
import ReviewTopicDetail from './components/lecturer/ReviewTopicDetail';
import CommitteeTopics from './components/lecturer/CommitteeTopics';
import CommitteeTopicDetail from './components/lecturer/CommitteeTopicDetail';
import LecturerDashboard from "./components/lecturer/LecturerDashboard";

// Import admin components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminTopicManagement from './pages/admin/TopicManagement';
import Semester from './pages/admin/Semester';
import Registration from './pages/admin/Registration';
import Evaluation from './pages/admin/Evaluation';

// Placeholders cho các role khác
// const LecturerDashboard = () => <div className="p-8"><h1>Dashboard Giảng Viên</h1><p>...</p></div>; // Thay bằng layout thật
const UserProfilePlaceholder = () => <div className="p-8"><h1>Trang Cá Nhân</h1><p>...</p></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

// Component quyết định layout và routes dựa trên role
const AppLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading application...</div>;
  }

  // Nếu đang ở trang login, không hiển thị layout
  if (location.pathname === '/login') {
    return <LoginPage />;
  }

  // Nếu user là sinh viên, sử dụng StudentLayout
  if (user?.role === 'sinhvien') {
    return (
      <Routes>
        <Route path="/student/*" element={
          <ProtectedRoute roles={['sinhvien']}>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<TopicDetails />} />
          <Route path="topics" element={<TopicsList />} />
          <Route path="topics/:topicId/register" element={<TopicRegistration />} />
          <Route path="proposals" element={<Proposals />} />
        </Route>
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    );
  }

  // Nếu user là giảng viên, sử dụng LecturerLayout
  if (user?.role === 'giangvien') {
    return (
      <Routes>
        <Route path="/lecturer/*" element={
          <ProtectedRoute roles={['giangvien']}>
            <LecturerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<LecturerDashboard />} />
          <Route path="topics" element={<TopicManagement />} />
          <Route path="topics/add" element={<AddTopic />} />
          <Route path="topics/:id/edit" element={<EditTopic />} />
          <Route path="topics/:id" element={<TopicDetail />} />
          <Route path="approve-groups" element={<ApproveTopicList />} />
          <Route path="approve-groups/:topicId" element={<ApproveGroupDetails />} />
          <Route path="proposed-topics" element={<ProposedTopics />} />
          <Route path="supervised-topics" element={<SupervisedTopics />} />
          <Route path="supervised-topics/:id" element={<TopicDetail />} />
          <Route path="review-topics" element={<ReviewTopics />} />
          <Route path="review-topics/:id" element={<ReviewTopicDetail />} />
          <Route path="committee" element={<CommitteeTopics />} />
          <Route path="committee-topics/:id" element={<CommitteeTopicDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/lecturer/topics" replace />} />
      </Routes>
    );
  }

  // Nếu user là giáo vụ, sử dụng HomeRoleManage
  if (user?.role === 'giaovu') {
    return (
      <Routes>
        <Route path="/HomeRoleManage" element={
          <ProtectedRoute roles={['giaovu']}>
            <HomeRoleManage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={<Navigate to="/HomeRoleManage" replace />} />
        <Route path="/admin/*" element={<Navigate to="/HomeRoleManage" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Layout mặc định cho người dùng chưa đăng nhập
  return (
    <DefaultLayout>
      <Routes>
        <Route index element={<HomePage />} /> 
        <Route path="/news" element={<News />} />
        <Route path="/about" element={<GioiThieu />} />
        <Route path="/notifications" element={<ThongBaoPage />} />
        <Route path="/contact" element={<LienHePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DefaultLayout>
  );
};

// Layout mặc định bao gồm Header và Footer
const DefaultLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
}

// Thêm placeholder cho trang profile sinh viên
const StudentProfilePlaceholder = () => <div className="p-6"><h2 className="text-xl font-semibold">Thông tin cá nhân</h2><p>Nội dung trang thông tin cá nhân sinh viên.</p></div>;

export default App;
