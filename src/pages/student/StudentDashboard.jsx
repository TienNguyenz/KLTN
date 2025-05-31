import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTimesCircle, FaBook, FaUserGraduate, FaUsers, FaTag, FaInfoCircle, FaHome, FaListAlt, FaLightbulb, FaSearch, FaSort, FaPencilAlt, FaCalendarAlt, FaClock, FaPaperPlane, FaUpload, FaDownload, FaEye, FaInfo, FaUserCircle, FaFilePdf } from 'react-icons/fa';
import StudentHeader from '../../components/student/StudentHeader';
import axios from 'axios';
import RegisteredTopicDetails from './RegisteredTopicDetails';
import { Modal, Tabs, Table, Button, Collapse } from 'antd';
import { message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

// Component con để hiển thị chi tiết đề tài hoặc thông báo chưa đăng ký
const TopicDetails = () => {
  const { user } = useAuth();
  const [registeredTopic, setRegisteredTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewGradesOpen, setIsViewGradesOpen] = useState(false);
  const [isViewCouncilOpen, setIsViewCouncilOpen] = useState(false);
  const [councilInfo, setCouncilInfo] = useState(null);
  const [lecturers, setLecturers] = useState([]);
  const [majors, setMajors] = useState([]);
  const navigate = useNavigate();
  const [studentScores, setStudentScores] = useState({});

  useEffect(() => {
    if (!user?.user_id) {
      setIsLoading(false);
      return;
    }
    const fetchRegisteredTopic = async () => {
      try {
        const response = await axios.get(`/api/topics/student/${user.user_id}`);
        setRegisteredTopic(response.data);
      } catch (error) {
        console.error('Error fetching registered topic:', error);
        setRegisteredTopic(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegisteredTopic();
  }, [user?.user_id]);

  useEffect(() => {
    if (!registeredTopic || !registeredTopic.topic_group_student) return;
    const fetchAllScores = async () => {
      const newScores = {};
      for (const student of registeredTopic.topic_group_student) {
        const res = await axios.get('/api/scoreboards', {
          params: { student_id: student.id, topic_id: registeredTopic.id }
        });
        const scoreboards = res.data;
        // Lấy điểm cá nhân GVHD
        const gvhdScore = scoreboards.find(s => s.evaluator_type === 'gvhd')?.total_score || 0;
        // Lấy điểm hội đồng
        const hoidongScore = scoreboards.find(s => s.evaluator_type === 'hoidong')?.total_score || 0;
        // Nếu có điểm nhóm riêng, lấy thêm (hoặc tính trung bình các điểm cá nhân GVHD)
        // const groupScore = ...;
        const scoreObj = {
          gvhd: gvhdScore,
          hoidong: hoidongScore,
          // group: groupScore,
          total: gvhdScore + hoidongScore // + groupScore nếu có
        };
        if (student.id) newScores[student.id] = scoreObj;
        if (student._id) newScores[student._id] = scoreObj;
        if (student.user_id) newScores[student.user_id] = scoreObj;
      }
      setStudentScores(newScores);
    };
    fetchAllScores();
  }, [registeredTopic]);

  const handleCancelRegistration = () => alert('Chức năng hủy đăng ký đang được phát triển!');
  const handleViewGrades = async () => {
    // Nếu đã có councilInfo thì chỉ mở modal
    if (councilInfo) {
      setIsViewGradesOpen(true);
      return;
    }
    // Nếu chưa có, tự động fetch thông tin hội đồng
    if (!registeredTopic?.topic_assembly) {
      setIsViewGradesOpen(true);
      return;
    }
    try {
      const res = await axios.get('/api/database/collections/assemblies');
      const councils = res.data.data || [];
      const topicAssemblyId = registeredTopic?.topic_assembly?._id || registeredTopic?.topic_assembly;
      const found = councils.find(c => String(c._id) === String(topicAssemblyId));
      setCouncilInfo(found);
    } catch {
      setCouncilInfo(null);
    } finally {
      setIsViewGradesOpen(true);
    }
  };
  const handleViewCouncil = async () => {
    if (!registeredTopic?.topic_assembly) {
      message.info('Đề tài chưa được phân hội đồng!');
      return;
    }
    try {
      console.log('DEBUG - Fetching council info...');
      const res = await axios.get('/api/database/collections/assemblies');
      const councils = res.data.data || [];
      const topicAssemblyId = registeredTopic?.topic_assembly?._id || registeredTopic?.topic_assembly;
      const found = councils.find(c => String(c._id) === String(topicAssemblyId));
      console.log('DEBUG registeredTopic:', registeredTopic);
      console.log('DEBUG topicAssemblyId:', topicAssemblyId);
      console.log('DEBUG councils:', councils);
      console.log('DEBUG found council:', found);
      setCouncilInfo(found);
      setIsViewCouncilOpen(true);
      fetchLecturers();
      fetchMajors();
    } catch (error) {
      console.error('Error fetching council info:', error);
      message.error('Không thể tải thông tin hội đồng!');
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await axios.get('/api/database/collections/User');
      setLecturers(res.data.data.filter(u => u.role === 'giangvien'));
    } catch {
      setLecturers([]);
    }
  };

  const fetchMajors = async () => {
    try {
      const res = await axios.get('/api/database/collections/majors');
      setMajors(res.data.data || []);
    } catch {
      setMajors([]);
    }
  };

  const getLecturerName = (id) => {
    if (!id) return '-';
    const found = lecturers.find(l => String(l._id) === String(id) || String(l.user_id) === String(id));
    return found ? `${found.user_id} - ${found.user_name}` : id;
  };

  const getMajorName = (major) => {
    if (!major) return '-';
    if (typeof major === 'object') {
      return major.major_name || major.major_title || major._id || '-';
    }
    // Nếu là ID, tra cứu trong majors
    const found = majors.find(m => String(m._id) === String(major));
    return found ? (found.major_name || found.major_title) : major;
  };

  if (isLoading) return <div className="p-8 text-center">Đang tải thông tin đề tài...</div>;
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Trang chủ Sinh viên</h1>
      {registeredTopic && registeredTopic.topic_title ? (
        registeredTopic.status === 'rejected' || registeredTopic.topic_teacher_status === 'rejected' ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <span className="text-4xl text-red-500 mx-auto mb-4 inline-block">❌</span>
            <p className="text-lg text-red-600 mb-2 font-semibold">Đề tài của bạn đã bị từ chối!</p>
            <p className="text-gray-600 mb-2 font-semibold">{registeredTopic.topic_title}</p>
            {registeredTopic.reject_reason && (
              <p className="text-red-500 mb-4">Lý do: {registeredTopic.reject_reason}</p>
            )}
            <div className="flex flex-col md:flex-row justify-center gap-4 mt-4">
              {registeredTopic.rejectType === 'register' ? (
                <>
                  <button
                    className="bg-[#008bc3] hover:bg-[#0073a8] text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300"
                    onClick={() => navigate(`/student/topics/${registeredTopic._id}/register`)}
                  >
                    Ghi danh lại đề tài
                  </button>
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-full transition-colors duration-300"
                    onClick={async () => {
                      try {
                        await axios.post(`/api/topics/${registeredTopic._id}/reset-for-new-registration`);
                        navigate('/student/topics');
                      } catch (err) {
                        console.error('Error resetting topic:', err);
                        alert('Có lỗi khi mở lại đề tài cho sinh viên khác đăng ký!');
                      }
                    }}
                  >
                    Ghi danh đề tài mới
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="bg-[#008bc3] hover:bg-[#0073a8] text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300"
                    onClick={() => navigate('/student/proposals', { state: { resubmitTopic: registeredTopic } })}
                  >
                    Đề xuất lại đề tài
                  </button>
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-full transition-colors duration-300"
                    onClick={() => navigate('/student/proposals')}
                  >
                    Đề xuất đề tài mới
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <RegisteredTopicDetails
              topic={registeredTopic}
              onCancel={handleCancelRegistration}
              onViewGrades={handleViewGrades}
              onViewCouncil={handleViewCouncil}
            />
            <ViewGradesModal
              open={isViewGradesOpen}
              onClose={() => setIsViewGradesOpen(false)}
              topic={registeredTopic}
              user={user}
              studentScores={studentScores}
              lecturers={lecturers}
              councilInfo={councilInfo}
            />
            <Modal
              open={isViewCouncilOpen}
              onCancel={() => setIsViewCouncilOpen(false)}
              footer={null}
              title={<span style={{fontWeight:700,fontSize:20}}>Thông tin hội đồng</span>}
              width={540}
            >
              {!registeredTopic?.topic_assembly ? (
                <div className="text-gray-500 text-center text-lg font-semibold py-6">Chưa phân hội đồng</div>
              ) : councilInfo ? (
                <div className="space-y-3">
                  <div className="mb-2"><b>Tên hội đồng:</b> <span className="text-blue-700">{councilInfo.assembly_name}</span></div>
                  <div className="mb-2">
                    <b>Chuyên ngành:</b> <span className="text-green-700">{getMajorName(councilInfo.assembly_major)}</span>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <b>Chủ tịch:</b>
                    <span className="inline-flex items-center gap-2 bg-blue-50 px-2 py-1 rounded">
                      <span className="font-semibold text-blue-800">
                        {getLecturerName(councilInfo.chairman)}
                      </span>
                      <span className="text-xs text-gray-500">(Chủ tịch)</span>
                    </span>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <b>Thư ký:</b>
                    <span className="inline-flex items-center gap-2 bg-blue-50 px-2 py-1 rounded">
                      <span className="font-semibold text-blue-800">{getLecturerName(councilInfo.secretary)}</span>
                      <span className="text-xs text-gray-500">(Thư ký)</span>
                    </span>
                  </div>
                  <div className="mb-2 flex items-start gap-2">
                    <b>Thành viên:</b>
                    <span className="inline-flex flex-wrap gap-2">
                      {Array.isArray(councilInfo.members) && councilInfo.members.length > 0
                        ? councilInfo.members.map((m, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-gray-800">
                              {getLecturerName(m)}
                              <span className="text-xs text-gray-400">(Thành viên)</span>
                            </span>
                          ))
                        : <span className="italic text-gray-400">-</span>}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-red-500 text-center text-lg font-semibold py-6">Không tìm thấy thông tin hội đồng</div>
              )}
            </Modal>
          </>
        )
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <FaInfoCircle className="text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-4">Bạn hiện chưa đăng ký đề tài nào.</p>
          <button
            className="mt-2 bg-[#008bc3] hover:bg-[#0073a8] text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300"
            onClick={() => navigate('/student/topics')}
          >
            Tìm kiếm đề tài để đăng ký
          </button>
        </div>
      )}
    </div>
  );
};

// Component Danh sách Đề tài
const TopicsList = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        const facultyId = user?.user_faculty;
        const response = await axios.get('/api/topics', {
          params: { facultyId }
        });
        if (Array.isArray(response.data.data)) {
          setTopics(response.data.data);
        } else if (response.data && Array.isArray(response.data.topics)) {
          setTopics(response.data.topics);
        } else {
          setTopics([]);
        }
      } catch {
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
    // Kiểm tra trạng thái đề tài của sinh viên
    if (user?.user_id) {
      axios.get(`/api/topics/student/${user.user_id}`)
        .then(res => {
          const topic = res.data;
          if (
            topic &&
            (["pending", "waiting", "active"].includes(topic.status) ||
             ["pending", "waiting", "approved"].includes(topic.topic_teacher_status))
          ) {
            setIsBlocked(true);
          }
        })
        .catch(() => setIsBlocked(false));
    }
  }, [user?.user_faculty, user?.user_id]);

  const handleRegisterClick = (topicId, isBlockedTopic) => {
    if (isBlocked || isBlockedTopic) {
      return;
    }
    navigate(`/student/topics/${topicId}/register`);
  };

  const filteredTopics = topics.filter(topic => {
    // Chỉ lấy đề tài chưa có SV và đang ở trạng thái pending
    if (!Array.isArray(topic.topic_group_student) || topic.topic_group_student.length > 0) return false;
    if (topic.status !== 'pending') return false;
    const searchString = searchTerm.toLowerCase();
    return (
      topic.topic_title?.toLowerCase().includes(searchString) ||
      topic.topic_instructor?.user_name?.toLowerCase().includes(searchString) ||
      topic.topic_major?.major_title?.toLowerCase().includes(searchString) ||
      topic.topic_category?.topic_category_title?.toLowerCase().includes(searchString) ||
      topic.topic_category?.type_name?.toLowerCase().includes(searchString)
  );
  });

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Danh Sách Đề Tài</h1>
      
      {/* Filters and Actions Row */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center border rounded px-2 py-1 bg-gray-100">
             <FaCalendarAlt className="text-green-500 mr-2" /> 
             <span>HK1 - 2023/2024</span>
          </div>
          <div className="flex items-center border rounded px-2 py-1">
             <FaClock className="text-gray-500 mr-2" />
             <span>25/12/2023</span>
          </div>
           <div className="flex items-center border rounded px-2 py-1">
             <FaClock className="text-gray-500 mr-2" />
             <span>31/01/2024</span>
          </div>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md"
          onClick={() => navigate('/student/proposals')}
        >
           Đề xuất
        </button>
      </div>

      {/* Search and Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Danh sách đề tài</h2>
            <div className="relative w-full max-w-xs">
              <input 
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-[#008bc3]"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
         </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Ghi danh</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề tài <FaSort className="inline ml-1 text-gray-400" /></th> 
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GVHD <FaSort className="inline ml-1 text-gray-400" /></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyên ngành <FaSort className="inline ml-1 text-gray-400" /></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại đề tài <FaSort className="inline ml-1 text-gray-400" /></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tối đa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="7" className="p-4 text-center text-gray-500">Đang tải...</td></tr>
              ) : filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <tr key={topic._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                         <button 
                        onClick={() => handleRegisterClick(topic._id, topic.topic_block)}
                        className={`text-blue-600 hover:text-blue-800 focus:outline-none ${topic.topic_block || isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={topic.topic_block ? 'Đề tài đã bị khóa' : isBlocked ? 'Bạn đã có đề tài đang thực hiện hoặc chờ duyệt' : 'Ghi danh'}
                        disabled={topic.topic_block || isBlocked}
                         >
                           <FaPencilAlt />
                         </button>
                    </td>
                    <td className="px-4 py-3 whitespace-normal font-medium text-gray-900">
                      {topic.topic_title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {topic.topic_instructor?.user_name || ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {topic.topic_major?.major_title || ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {topic.topic_category?.topic_category_title || topic.topic_category?.type_name || ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {topic.topic_max_members}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        topic.topic_block 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {topic.topic_block ? 'Đã khóa' : 'Có thể đăng ký'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="p-4 text-center text-gray-500">Không tìm thấy đề tài phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between text-xs text-gray-600">
           <div>Hiển thị 1 đến {filteredTopics.length} của {topics.length} đề tài</div>
           <div className="flex items-center space-x-1">
              <button className="p-1 border rounded disabled:text-gray-300" disabled>&laquo;</button>
              <button className="p-1 border rounded disabled:text-gray-300" disabled>&lsaquo;</button>
              <span className="px-2 py-1 bg-blue-500 text-white rounded">1</span> 
              <button className="p-1 border rounded">&rsaquo;</button>
              <button className="p-1 border rounded">&raquo;</button>
               <select className="ml-2 border rounded p-1 text-xs">
                 <option>5</option>
                 <option>10</option>
                 <option>20</option>
               </select>
           </div>
        </div>
      </div>
    </div>
  );
};

// Component Đề xuất Đề tài
const Proposals = () => {
  const { user } = useAuth();
  const location = useLocation();
  const resubmitTopic = location.state?.resubmitTopic;
  const facultyId = user?.user_faculty; // Lấy facultyId của sinh viên
  // Helper để lấy _id đúng kiểu string
  const getId = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field._id) return field._id;
    return '';
  };
  const [formData, setFormData] = useState({
    topic_title: resubmitTopic?.topic_title || '',
    topic_instructor: getId(resubmitTopic?.topic_instructor),
    topic_major: getId(resubmitTopic?.topic_major),
    topic_category: getId(resubmitTopic?.topic_category),
    topic_description: resubmitTopic?.topic_description || '',
    topic_max_members: resubmitTopic?.topic_max_members || 2,
    student1Id: user?.user_id || '',
    student2Id: '',
    student3Id: '',
    student4Id: ''
  });
  // Thêm state cho file đơn xin hướng dẫn
  const [guidanceFile, setGuidanceFile] = useState(null);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState('');
  const [convertedPdfName, setConvertedPdfName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  // States cho dữ liệu từ MongoDB
  const [instructors, setInstructors] = useState([]);
  const [majors, setMajors] = useState([]);
  const [topicTypes, setTopicTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalError, setModalError] = useState({ open: false, message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [
          instructorsRes,
          majorsRes,
          topicTypesRes,
          studentsRes
        ] = await Promise.all([
          axios.get(`/api/instructors?facultyId=${facultyId}`),
          axios.get(`/api/majors?facultyId=${facultyId}`),
          axios.get('/api/topics/topic-types'),
          axios.get(`/api/students?facultyId=${facultyId}`)
        ]);

        setInstructors(instructorsRes.data.data);
        setMajors(majorsRes.data.data);
        setTopicTypes(topicTypesRes.data.data);
        setStudents(studentsRes.data.data.filter(s => s._id !== user?.user_id));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (facultyId) fetchData();
  }, [user?.user_id, facultyId]);

  useEffect(() => {
    // Nếu đang resubmit và đã có danh sách, set lại formData cho đúng _id
    if (resubmitTopic && instructors.length && majors.length && topicTypes.length) {
      setFormData(prev => ({
        ...prev,
        topic_instructor: getId(resubmitTopic?.topic_instructor),
        topic_major: getId(resubmitTopic?.topic_major),
        topic_category: getId(resubmitTopic?.topic_category),
      }));
    }
    // Kiểm tra trạng thái đề tài của sinh viên
    if (user?.user_id) {
      axios.get(`/api/topics/student/${user.user_id}`)
        .then(res => {
          const topic = res.data;
          if (
            topic &&
            (["pending", "waiting", "active"].includes(topic.status) ||
             ["pending", "waiting", "approved"].includes(topic.topic_teacher_status))
          ) {
            setIsBlocked(true);
          }
        })
        .catch(() => setIsBlocked(false));
    }
    // eslint-disable-next-line
  }, [instructors, majors, topicTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Hàm xử lý chọn file
  const handleGuidanceFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setConvertedPdfUrl('');
    setConvertedPdfName('');
    setDocFile(null);
    setGuidanceFile(null);
    if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setDocFile(file);
      alert('File DOC/DOCX sẽ được chuyển sang PDF trước khi upload. Bấm "Tải lên" để chuyển đổi.');
      return;
    }
    if (file.type === 'application/pdf') {
      setGuidanceFile(file);
    } else {
      alert('Chỉ hỗ trợ file PDF, DOC, DOCX.');
    }
  };

  const handleUploadAdvisorRequest = async () => {
    setIsUploading(true);
    try {
      // Hiện modal thông báo đang convert
      const convertModal = document.createElement('div');
      convertModal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
      convertModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-lg font-semibold text-gray-800">Đang chuyển đổi Word sang PDF...</p>
        </div>
      `;
      document.body.appendChild(convertModal);

      const formDataFile = new FormData();
      formDataFile.append('file', docFile || guidanceFile);
      const res = await axios.post('/api/topics/upload-advisor-request', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setConvertedPdfUrl(res.data.file);
      setConvertedPdfName(res.data.originalName || 'advisor_request.pdf');
      setDocFile(null);
      setGuidanceFile(null);

      // Xóa modal đang convert
      document.body.removeChild(convertModal);

      // Hiện modal thông báo thành công
      const successModal = document.createElement('div');
      successModal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
      successModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <div class="text-green-500 text-5xl mb-4">✓</div>
          <p class="text-lg font-semibold text-gray-800">Tải file và chuyển đổi thành công!</p>
          <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Đóng</button>
        </div>
      `;
      document.body.appendChild(successModal);

      // Xóa modal thành công khi click nút đóng
      successModal.querySelector('button').onclick = () => {
        document.body.removeChild(successModal);
      };
    } catch {
      // Xóa modal đang convert nếu có lỗi
      const convertModal = document.querySelector('.fixed.inset-0');
      if (convertModal) {
        document.body.removeChild(convertModal);
      }

      // Hiện modal thông báo lỗi
      const errorModal = document.createElement('div');
      errorModal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
      errorModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <div class="text-red-500 text-5xl mb-4">✕</div>
          <p class="text-lg font-semibold text-gray-800">Lỗi khi upload file đơn xin hướng dẫn!</p>
          <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Đóng</button>
        </div>
      `;
      document.body.appendChild(errorModal);

      // Xóa modal lỗi khi click nút đóng
      errorModal.querySelector('button').onclick = () => {
        document.body.removeChild(errorModal);
      };
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!convertedPdfUrl) {
      setModalError({ open: true, message: 'Vui lòng tải lên file đơn xin hướng dẫn (PDF, DOC, DOCX) và chuyển đổi thành công trước khi gửi đề xuất!' });
      return;
    }
    try {
      // Tạo mảng thành viên, bắt đầu với trưởng nhóm
      let leaderId = user._id;
      if (!leaderId) {
        const leader = students.find(s => s.user_id === user.user_id);
        leaderId = leader?._id;
      }
      const members = [leaderId];
      
      // Thêm các thành viên khác nếu có
      for (let i = 2; i <= formData.topic_max_members; i++) {
        const memberId = formData[`student${i}Id`];
        if (memberId) {
          members.push(memberId);
        }
      }

      // Kiểm tra số lượng thành viên
      if (members.length < 2) {
        alert('Vui lòng chọn ít nhất 1 thành viên khác');
        return;
      }

      let creatorId = user._id;
      if (!creatorId) {
        const leader = students.find(s => s.user_id === user.user_id);
        creatorId = leader?._id;
      }

      const proposalData = {
        topic_title: formData.topic_title,
        topic_instructor: formData.topic_instructor,
        topic_major: formData.topic_major,
        topic_category: formData.topic_category,
        topic_description: formData.topic_description,
        topic_max_members: parseInt(formData.topic_max_members),
        topic_group_student: members,
        topic_creator: creatorId,
        topic_advisor_request: convertedPdfUrl
      };

      let isSuccess = false;
      if (resubmitTopic && resubmitTopic._id && resubmitTopic.topic_teacher_status === 'rejected') {
        // Đề xuất lại: gọi API cập nhật lại đề tài cũ
        const res = await axios.put(`/api/topics/${resubmitTopic._id}/resubmit`, proposalData, {
          headers: { 'Content-Type': 'application/json' }
        });
        isSuccess = res.data && res.data.topic;
      } else {
        // Đề xuất mới hoàn toàn
        const response = await axios.post('/api/topics/propose', proposalData, {
          headers: { 'Content-Type': 'application/json' }
        });
        isSuccess = response.data;
      }
      if (isSuccess) {
        setModalError({ open: true, message: 'Đề xuất đã được gửi thành công!' });
        setTimeout(() => {
          setModalError({ open: false, message: '' });
          setFormData({
            ...formData,
            topic_title: '',
            topic_instructor: '',
            topic_major: '',
            topic_category: '',
            topic_description: '',
            student2Id: '',
            student3Id: '',
            student4Id: ''
          });
          setGuidanceFile(null);
          setConvertedPdfUrl('');
          setConvertedPdfName('');
          navigate('/student');
        }, 1500);
      }
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        if (data.registeredMembers && Array.isArray(data.registeredMembers)) {
          setModalError({ open: true, message: data.message + ': ' + data.registeredMembers.join('\n') });
        } else if (data.message) {
          setModalError({ open: true, message: data.message });
        } else {
          setModalError({ open: true, message: JSON.stringify(data) });
        }
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Đề Xuất Đề Tài Với Giảng Viên</h1>

      {/* Filters Row */}
       <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
         <div className="flex items-center space-x-4 text-sm">
           <div className="flex items-center border rounded px-2 py-1 bg-gray-100">
              <FaCalendarAlt className="text-green-500 mr-2" /> 
              <span>HK1 - 2023/2024</span>
           </div>
           <div className="flex items-center border rounded px-2 py-1">
              <FaClock className="text-gray-500 mr-2" />
              <span>25/12/2023</span>
           </div>
            <div className="flex items-center border rounded px-2 py-1">
              <FaClock className="text-gray-500 mr-2" />
              <span>31/01/2024</span>
           </div>
         </div>
       </div>

      {/* Proposal Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <h2 className="text-lg font-semibold text-gray-700 border-l-4 border-[#008bc3] pl-3 mb-6">MẪU ĐỀ XUẤT</h2>
        
        {/* Tên đề tài */}
        <div>
          <label htmlFor="topic_title" className="block text-sm font-medium text-gray-700 mb-1">
             Tên đề tài <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="topic_title"
            name="topic_title"
            value={formData.topic_title}
            onChange={handleChange}
            placeholder="Bạn vui lòng nhập tên đề tài ..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#008bc3] focus:border-[#008bc3] text-sm"
            required
          />
        </div>

        {/* GVHD */}
        <div>
          <label htmlFor="topic_instructor" className="block text-sm font-medium text-gray-700 mb-1">
             Giảng viên hướng dẫn <span className="text-red-500">*</span>
          </label>
          <select
            id="topic_instructor"
            name="topic_instructor"
            value={formData.topic_instructor}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#008bc3] focus:border-[#008bc3] text-sm bg-white"
            required
          >
            <option value="">Chọn giảng viên</option>
            {instructors.map(instructor => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.user_name}
              </option>
            ))}
          </select>
        </div>

        {/* Chuyên ngành & Loại đề tài (Inline) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="topic_major" className="block text-sm font-medium text-gray-700 mb-1">
              Chuyên ngành <span className="text-red-500">*</span>
            </label>
            <select
              id="topic_major"
              name="topic_major"
              value={formData.topic_major}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#008bc3] focus:border-[#008bc3] text-sm bg-white"
              required
            >
              <option value="">Chọn chuyên ngành</option>
              {majors.map(major => (
                <option key={major._id} value={major._id}>
                  {major.major_title}
                </option>
              ))}
            </select>
          </div>
           <div>
            <label htmlFor="topic_category" className="block text-sm font-medium text-gray-700 mb-1">
              Loại đề tài <span className="text-red-500">*</span>
            </label>
            <select
              id="topic_category"
              name="topic_category"
              value={formData.topic_category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#008bc3] focus:border-[#008bc3] text-sm bg-white"
              required
            >
              <option value="">Chọn loại đề tài</option>
              {topicTypes.map(type => (
                <option key={type._id} value={type._id}>
                  {type.topic_category_title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Số lượng thành viên */}
        <div>
          <label htmlFor="topic_max_members" className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng thành viên <span className="text-red-500">*</span>
          </label>
          <select
            id="topic_max_members"
            name="topic_max_members"
            value={formData.topic_max_members}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#008bc3] focus:border-[#008bc3] text-sm bg-white"
            required
          >
            <option value="2">2 thành viên</option>
            <option value="3">3 thành viên</option>
            <option value="4">4 thành viên</option>
          </select>
        </div>

        {/* Mô tả chi tiết */}
        <div>
          <label htmlFor="topic_description" className="block text-sm font-medium text-gray-700 mb-1">
             Mô tả chi tiết đề tài <span className="text-red-500">*</span>
          </label>
          <textarea
            id="topic_description"
            name="topic_description"
            rows="4"
            value={formData.topic_description}
            onChange={handleChange}
            placeholder="Viết mô tả đề tài hoặc tính năng của đề tài ..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#008bc3] focus:border-[#008bc3] text-sm"
            required
          ></textarea>
        </div>
        
        {/* Chọn Sinh viên */}
        <div className="border-t pt-6">
          <h3 className="text-md font-semibold text-gray-700 mb-4">Thành viên nhóm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Sinh viên 1 (hiện tại) */}
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sinh viên 1 (Trưởng nhóm)</label>
               <input
                 type="text"
                value={`${user?.user_name || ''} (${user?.user_id || ''})`}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
                 readOnly
                 disabled
               />
             </div>

            {/* Các thành viên khác */}
            {Array.from({ length: formData.topic_max_members - 1 }, (_, idx) => (
              <div key={idx + 2}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sinh viên {idx + 2}
                </label>
               <select
                  name={`student${idx + 2}Id`}
                  value={formData[`student${idx + 2}Id`]}
                 onChange={handleChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#008bc3] focus:border-[#008bc3] text-sm bg-white"
                  required
               >
                 <option value="">Chọn sinh viên</option>
                  {students
                    .filter(student => {
                      // Không hiển thị người dùng hiện tại (trưởng nhóm)
                      if (student._id === user._id || student.user_id === user.user_id) return false;
                      // Kiểm tra xem sinh viên đã được chọn ở ô khác chưa
                      const isSelectedInOtherField = Object.entries(formData)
                        .filter(([key]) => key.startsWith('student'))
                        .some(([key, value]) => key !== `student${idx + 2}Id` && value === student._id);
                      return !isSelectedInOtherField;
                    })
                    .map(student => (
                      <option key={student._id} value={student._id}>
                        {student.user_name} ({student.user_id})
                      </option>
                    ))
                  }
               </select>
             </div>
            ))}
          </div>
        </div>

        {/* Nộp file đơn xin hướng dẫn - giao diện đẹp */}
        <div className="bg-gray-50 rounded border p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
            <div className="flex items-center space-x-2 mb-2 md:mb-0">
              <FaFilePdf className="text-2xl text-red-600" />
              <span className="font-semibold text-blue-900 text-base">Đơn xin hướng dẫn</span>
            </div>
            <div className="flex-1">
              {/* Ưu tiên: file vừa chọn (chưa upload) -> file đã upload -> chưa có file */}
              {docFile
                ? <span className="text-blue-700 text-sm">{docFile.name}</span>
                : guidanceFile
                  ? <span className="text-green-700 text-sm">{guidanceFile.name}</span>
                  : convertedPdfUrl
                    ? <span className="text-green-700 text-sm">{convertedPdfName}</span>
                    : <span className="text-red-500 text-sm">Chưa có file.</span>
              }
              {convertedPdfUrl && (
                <a href={convertedPdfUrl} target="_blank" rel="noopener noreferrer" className="ml-4 text-blue-500 underline text-sm">Xem file</a>
              )}
            </div>
          </div>
          <div className="flex space-x-2 mt-3">
            <label className="inline-block">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleGuidanceFileChange}
                className="hidden"
              />
              <span className="inline-block px-4 py-2 bg-gray-200 rounded cursor-pointer text-sm font-medium hover:bg-gray-300">Chọn file</span>
            </label>
            {(docFile || guidanceFile) && !convertedPdfUrl && (
            <button
              type="button"
                className={`px-4 py-2 rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isUploading}
                onClick={handleUploadAdvisorRequest}
              >
                {isUploading ? 'Đang tải...' : 'Tải lên'}
            </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">Hỗ trợ các định dạng: PDF, DOC, DOCX</p>
        </div>

        {/* Nút Submit */}
        <div className="flex justify-end pt-4">
            <button
              type="submit"
              className={`inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#008bc3] hover:bg-[#0073a8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008bc3] transition-colors ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isBlocked}
            >
              <FaPaperPlane className="-ml-1 mr-2 h-5 w-5" />
              {isBlocked ? 'Bạn đã có đề tài đang thực hiện hoặc chờ duyệt' : 'Gửi Đề Xuất'}
            </button>
        </div>
      </form>
      <Modal open={modalError.open} onCancel={() => setModalError({ open: false, message: '' })} footer={null} centered closable>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="text-5xl mb-3 text-red-500">❗</div>
          <div className="text-lg font-semibold text-center whitespace-pre-line mb-4" style={{lineHeight:1.5}}>{modalError.message}</div>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold text-base shadow hover:bg-blue-700 transition-colors"
            style={{minWidth:100}}
            onClick={() => setModalError({ open: false, message: '' })}
          >Đóng</button>
        </div>
      </Modal>
    </div>
  );
};

// Đổi tên Layout chính của Student
const StudentLayout = () => {
  // Sử dụng màu sắc của SGU (xanh dương đậm và trắng)
  const linkClasses = "flex items-center px-5 py-3 text-gray-300 hover:bg-blue-700 hover:text-white transition-colors duration-200";
  const activeLinkClasses = "bg-blue-800 text-white border-r-4 border-white"; // Màu xanh đậm hơn cho active, thêm border nổi bật

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a2b4a] text-slate-100 flex flex-col fixed h-full z-30">
         <div className="p-4 text-center text-xl font-bold border-b border-gray-700">
            HỆ THỐNG QUẢN LÝ ĐỀ TÀI NCKH SGU
         </div>
         
        <nav className="flex-grow mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-blue-950">
          <NavLink 
             to="/student"
             end
             className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
           >
            <FaHome className="mr-3" /> Trang chủ SV
          </NavLink>
          <NavLink 
             to="/student/topics"
             className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
           >
             <FaListAlt className="mr-3" /> Đề tài
          </NavLink>
          <NavLink 
             to="/student/proposals"
             className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
           >
             <FaLightbulb className="mr-3" /> Đề xuất
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow ml-64 flex flex-col">
         <StudentHeader />
         <main className="flex-grow overflow-auto">
            <Outlet /> 
         </main>
      </div>
    </div>
  );
};

const ViewGradesModal = ({ open, onClose, topic, user, studentScores, lecturers = [], councilInfo = null }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [personalScores, setPersonalScores] = useState([]); // Danh sách tất cả các bảng điểm cá nhân
  const [groupScores, setGroupScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupStudentMap, setGroupStudentMap] = useState({});
  const [groupStudentIdToUserId, setGroupStudentIdToUserId] = useState({});

  // Lấy tất cả bảng điểm cá nhân của SV cho đề tài này
  const fetchPersonalScores = async () => {
    setLoading(true);
    // Ưu tiên lấy user._id (ObjectId), fallback user.id, user.user_id
    const userId = user?._id || user?.id || user?.user_id;
    if (!user || !userId || !topic || !topic._id) {
      setPersonalScores([]);
      setLoading(false);
      return;
    }
    // Log debug
    console.log('DEBUG fetchPersonalScores: userId', userId, 'topicId', topic._id);
    const res = await axios.get(`/api/scoreboards?student_id=${userId}&topic_id=${topic._id}`);
    const scores = Array.isArray(res.data) ? res.data : [];
    console.log('DEBUG fetchPersonalScores: scores', scores);
    setPersonalScores(scores);
    setLoading(false);
  };

  // Lấy điểm nhóm
  const fetchGroupScores = async () => {
    setLoading(true);
    const res = await axios.get(`/api/scoreboards?topic_id=${topic._id}`);
    setGroupScores(res.data);
    const map = {};
    const idToUserId = {};
    if (topic.topic_group_student) {
      topic.topic_group_student.forEach(s => {
        map[s._id?.toString()] = s.user_name || s.name || s.user_id;
        idToUserId[s._id?.toString()] = s.user_id;
      });
    }
    setGroupStudentMap(map);
    setGroupStudentIdToUserId(idToUserId);
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      if (activeTab === 'personal') {
        fetchPersonalScores();
      } else if (activeTab === 'group' && groupScores.length === 0) {
        fetchGroupScores();
      }
    }
    // eslint-disable-next-line
  }, [open, activeTab]);

  // Khi chuyển tab
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'personal') {
      fetchPersonalScores();
    }
    if (key === 'group' && groupScores.length === 0) {
      fetchGroupScores();
    }
  };

  // Tính trung bình nhóm
  const groupAvg = groupScores.length
    ? (groupScores.reduce((sum, s) => sum + (s.total_score || 0), 0) / groupScores.length).toFixed(2)
    : 0;

  // Lấy điểm cá nhân, hội đồng, nhóm cho user hiện tại (ưu tiên _id, fallback user_id, id)
  let scoreObj = studentScores?.[user._id] || studentScores?.[user.user_id] || studentScores?.[user.id] || {};
  const personal = scoreObj.gvhd ?? 0;
  const hoidong = scoreObj.hoidong ?? 0;
  // Nếu có điểm nhóm riêng, lấy ở đây, nếu không thì dùng groupAvg
  const group = Number(groupAvg) || 0;

  const total = personal + group + hoidong;

  // Helper lấy tên giảng viên từ lecturers (dùng cho cả GVHD và hội đồng)
  const getLecturerName = (id) => {
    if (!id) return '-';
    // Nếu là GVHD, ưu tiên lấy từ topic.topic_instructor
    if (
      topic &&
      topic.topic_instructor &&
      (String(id) === String(topic.topic_instructor) ||
        (typeof topic.topic_instructor === 'object' &&
          (String(id) === String(topic.topic_instructor._id) ||
           String(id) === String(topic.topic_instructor.user_id)))
      )
    ) {
      if (typeof topic.topic_instructor === 'object') {
        return topic.topic_instructor.user_name || topic.topic_instructor.fullname || topic.topic_instructor._id || '-';
      }
    }
    const found = lecturers.find(l => String(l._id) === String(id) || String(l.user_id) === String(id));
    return found ? `${found.user_id} - ${found.user_name}` : id;
  };

  // Gom điểm theo vai trò
  const gvhdScore = personalScores.find(s => s.evaluator_type === 'gvhd');
  let chairmanScore, secretaryScore, memberScore;
  if (councilInfo) {
    chairmanScore = personalScores.find(s => s.evaluator_type === 'hoidong' && String(s.grader) === String(councilInfo.chairman));
    secretaryScore = personalScores.find(s => s.evaluator_type === 'hoidong' && String(s.grader) === String(councilInfo.secretary));
    // Lấy thành viên đầu tiên (nếu có nhiều thành viên thì chỉ lấy 1 người, hoặc cộng trung bình nếu muốn)
    memberScore = personalScores.find(s => s.evaluator_type === 'hoidong' && Array.isArray(councilInfo.members) && councilInfo.members.some(m => String(m) === String(s.grader)));
  }

  // Tính tổng điểm theo trọng số
  const weightedTotal = (
    (gvhdScore?.total_score || 0) * 0.4 +
    (chairmanScore?.total_score || 0) * 0.2 +
    (secretaryScore?.total_score || 0) * 0.2 +
    (memberScore?.total_score || 0) * 0.2
  ).toFixed(2);

  // Hàm lấy màu cho xếp loại
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return '#22c55e'; // xanh lá
      case 'B': return '#2563eb'; // xanh dương
      case 'C': return '#f59e42'; // cam
      case 'D': return '#ef4444'; // đỏ
      default: return '#64748b'; // xám
    }
  };

  // Hàm lấy icon cho vai trò
  const getRoleIcon = (role) => {
    switch (role) {
      case 'GVHD': return '👨‍🏫';
      case 'Chủ tịch': return '👑';
      case 'Thư ký': return '📝';
      case 'Thành viên': return '👤';
      default: return '👤';
    }
  };

  // Helper lấy xếp loại từ điểm
  const getGrade = (score) => {
    if (score >= 8) return 'A';
    if (score >= 6.5) return 'B';
    if (score >= 5) return 'C';
    return 'D';
  };

  // Tab "Điểm cá nhân": gom đúng 3 vai trò hội đồng, không lặp, không thiếu
  let councilPanels = [];
  if (councilInfo) {
    const allCouncilScores = personalScores.filter(s => s.evaluator_type === 'hoidong');
    // Chủ tịch
    const chairmanArr = allCouncilScores.filter(s => String(s.grader) === String(councilInfo.chairman));
    if (chairmanArr.length) {
      const avg = (chairmanArr.reduce((a,b)=>a+(b.total_score||0),0)/chairmanArr.length).toFixed(2);
      const grade = getGrade(avg);
      councilPanels.push({
        key: 'chairman',
        label: (
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:22}}>{getRoleIcon('Chủ tịch')}</span>
            <span style={{fontWeight:700}}>Chủ tịch:</span>
            <span style={{color:'#2563eb',fontWeight:600}}>{getLecturerName(councilInfo.chairman)}</span>
            <span style={{marginLeft:16,fontWeight:600}}>Tổng điểm:</span>
            <span style={{color:'#0ea5e9',fontWeight:700,fontSize:18}}>{avg}</span>
            <span style={{marginLeft:8,color:getGradeColor(grade),fontWeight:700}}>{grade}</span>
          </div>
        ),
        children: (
          <div style={{marginTop:8}}>
            <div style={{marginBottom:8,fontWeight:600}}>
              Tổng điểm: <span style={{color:'#0ea5e9',fontWeight:700}}>{avg}</span>
              <span style={{marginLeft:8,color:getGradeColor(grade),fontWeight:700}}>{grade}</span>
            </div>
          </div>
        )
      });
    }
    // Thư ký
    const secretaryArr = allCouncilScores.filter(s => String(s.grader) === String(councilInfo.secretary));
    if (secretaryArr.length) {
      const avg = (secretaryArr.reduce((a,b)=>a+(b.total_score||0),0)/secretaryArr.length).toFixed(2);
      const grade = getGrade(avg);
      councilPanels.push({
        key: 'secretary',
        label: (
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:22}}>{getRoleIcon('Thư ký')}</span>
            <span style={{fontWeight:700}}>Thư ký:</span>
            <span style={{color:'#2563eb',fontWeight:600}}>{getLecturerName(councilInfo.secretary)}</span>
            <span style={{marginLeft:16,fontWeight:600}}>Tổng điểm:</span>
            <span style={{color:'#0ea5e9',fontWeight:700,fontSize:18}}>{avg}</span>
            <span style={{marginLeft:8,color:getGradeColor(grade),fontWeight:700}}>{grade}</span>
          </div>
        ),
        children: (
          <div style={{marginTop:8}}>
            <div style={{marginBottom:8,fontWeight:600}}>
              Tổng điểm: <span style={{color:'#0ea5e9',fontWeight:700}}>{avg}</span>
              <span style={{marginLeft:8,color:getGradeColor(grade),fontWeight:700}}>{grade}</span>
            </div>
          </div>
        )
      });
    }
    // Thành viên (có thể nhiều người)
    const memberArr = allCouncilScores.filter(s => Array.isArray(councilInfo.members) && councilInfo.members.some(m => String(m) === String(s.grader)));
    if (memberArr.length) {
      const avg = (memberArr.reduce((a,b)=>a+(b.total_score||0),0)/memberArr.length).toFixed(2);
      const grade = getGrade(avg);
      councilPanels.push({
        key: 'member',
        label: (
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:22}}>{getRoleIcon('Thành viên')}</span>
            <span style={{fontWeight:700}}>Thành viên:</span>
            <span style={{color:'#2563eb',fontWeight:600}}>{Array.isArray(councilInfo.members) && councilInfo.members.map(getLecturerName).join(', ')}</span>
            <span style={{marginLeft:16,fontWeight:600}}>Tổng điểm:</span>
            <span style={{color:'#0ea5e9',fontWeight:700,fontSize:18}}>{avg}</span>
            <span style={{marginLeft:8,color:getGradeColor(grade),fontWeight:700}}>{grade}</span>
          </div>
        ),
        children: (
          <div style={{marginTop:8}}>
            <div style={{marginBottom:8,fontWeight:600}}>
              Tổng điểm: <span style={{color:'#0ea5e9',fontWeight:700}}>{avg}</span>
              <span style={{marginLeft:8,color:getGradeColor(grade),fontWeight:700}}>{grade}</span>
            </div>
          </div>
        )
      });
    }
  }

  // Tab "Điểm nhóm": chỉ hiện 3 dòng: Chủ tịch, Thư ký, Thành viên, mỗi dòng là điểm trung bình vai trò
  // Điểm nhóm của Hội đồng
  // Tính điểm trung bình cho từng vai trò
  const groupCouncilScores = groupScores.filter(s => s.evaluator_type === 'hoidong');
  const groupChairmanArr = groupCouncilScores.filter(s => String(s.grader) === String(councilInfo?.chairman));
  const groupSecretaryArr = groupCouncilScores.filter(s => String(s.grader) === String(councilInfo?.secretary));
  const groupMemberArr = groupCouncilScores.filter(s => Array.isArray(councilInfo?.members) && councilInfo.members.some(m => String(m) === String(s.grader)));
  const groupCouncilTable = [
    {
      key: 'chairman',
      role: 'Chủ tịch',
      name: getLecturerName(councilInfo?.chairman),
      avg: groupChairmanArr.length ? (groupChairmanArr.reduce((a,b)=>a+(b.total_score||0),0)/groupChairmanArr.length).toFixed(2) : '-',
      grade: groupChairmanArr.length ? getGrade((groupChairmanArr.reduce((a,b)=>a+(b.total_score||0),0)/groupChairmanArr.length).toFixed(2)) : '-'
    },
    {
      key: 'secretary',
      role: 'Thư ký',
      name: getLecturerName(councilInfo?.secretary),
      avg: groupSecretaryArr.length ? (groupSecretaryArr.reduce((a,b)=>a+(b.total_score||0),0)/groupSecretaryArr.length).toFixed(2) : '-',
      grade: groupSecretaryArr.length ? getGrade((groupSecretaryArr.reduce((a,b)=>a+(b.total_score||0),0)/groupSecretaryArr.length).toFixed(2)) : '-'
    },
    {
      key: 'member',
      role: 'Thành viên',
      name: Array.isArray(councilInfo?.members) ? councilInfo.members.map(getLecturerName).join(', ') : '-',
      avg: groupMemberArr.length ? (groupMemberArr.reduce((a,b)=>a+(b.total_score||0),0)/groupMemberArr.length).toFixed(2) : '-',
      grade: groupMemberArr.length ? getGrade((groupMemberArr.reduce((a,b)=>a+(b.total_score||0),0)/groupMemberArr.length).toFixed(2)) : '-'
    }
  ];

  // Panel GVHD
  const panels = [];
  if (gvhdScore) {
    const grade = getGrade(gvhdScore.total_score);
    panels.push({
      key: 'gvhd',
      label: (
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:22}}>{getRoleIcon('GVHD')}</span>
          <span style={{fontWeight:700}}>GVHD:</span>
          <span style={{color:'#2563eb',fontWeight:600}}>{getLecturerName(gvhdScore.grader)}</span>
          <span style={{marginLeft:16,fontWeight:600}}>Tổng điểm:</span>
          <span style={{color:'#0ea5e9',fontWeight:700,fontSize:18}}>{gvhdScore.total_score}</span>
          <span style={{marginLeft:8,color:getGradeColor(grade),fontWeight:700}}>{grade}</span>
        </div>
      ),
      children: (
        <div style={{marginTop:8}}>
          <div style={{marginBottom:8,fontWeight:600}}>
            Tổng điểm: <span style={{color:'#0ea5e9',fontWeight:700}}>{gvhdScore.total_score}</span>
            <span style={{marginLeft:8,color:getGradeColor(grade),fontWeight:700}}>{grade}</span>
          </div>
        </div>
      )
    });
  }
  panels.push(...councilPanels);

  // Tính trung bình nhóm GVHD
  const groupGVHDScores = groupScores.filter(s => s.evaluator_type === 'gvhd');
  const groupGVHDAvg = groupGVHDScores.length ? (groupGVHDScores.reduce((sum, s) => sum + (s.total_score || 0), 0) / groupGVHDScores.length).toFixed(2) : '-';
  // Tính trung bình nhóm Hội đồng (trung bình 3 vai trò, chỉ tính vai trò có điểm)
  const groupCouncilAvgs = groupCouncilTable.map(row => Number(row.avg)).filter(v => !isNaN(v));
  const groupCouncilAvg = groupCouncilAvgs.length ? (groupCouncilAvgs.reduce((a,b)=>a+b,0)/groupCouncilAvgs.length).toFixed(2) : '-';
  // Tổng điểm nhóm = GVHD*0.4 + Hội đồng*0.6
  let groupTotal = '-';
  if (!isNaN(Number(groupGVHDAvg)) && !isNaN(Number(groupCouncilAvg))) {
    groupTotal = (Number(groupGVHDAvg)*0.4 + Number(groupCouncilAvg)*0.6).toFixed(2);
  }

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={900} title="Xem điểm">
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <Tabs.TabPane tab="Điểm cá nhân" key="personal">
          {panels.length > 0 ? (
            <>
              <Collapse accordion items={panels} style={{background:'#f8fafc',borderRadius:12,boxShadow:'0 2px 8px #e0e7ef',marginBottom:16}} />
              <div className="mt-4 text-right font-bold text-xl" style={{color:'#22c55e'}}>
                Tổng điểm (theo trọng số): <span>{weightedTotal}</span>
            </div>
            </>
          ) : (
            <div className="text-gray-500 italic">Chưa có điểm.</div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Điểm nhóm" key="group">
          {/* Điểm nhóm của GVHD */}
          <div className="mb-8">
            <div className="font-semibold text-base mb-2">Điểm nhóm của GVHD</div>
          <Table
              dataSource={groupScores.filter(s => s.evaluator_type === 'gvhd').map((s) => ({
                key: s.student_id + '-' + s.grader,
              name: groupStudentMap[s.student_id] || s.student_id,
                mssv: groupStudentIdToUserId[s.student_id] || s.student_id,
              total: s.total_score,
              grade: s.student_grades
            }))}
            columns={[
              { title: 'Tên sinh viên', dataIndex: 'name' },
              { title: 'MSSV', dataIndex: 'mssv' },
              { title: 'Tổng điểm', dataIndex: 'total' },
              { title: 'Xếp loại', dataIndex: 'grade' }
            ]}
            pagination={false}
            loading={loading}
              summary={pageData => {
                if (!pageData.length) return null;
                const avg = (pageData.reduce((sum, s) => sum + (s.total || 0), 0) / pageData.length).toFixed(2);
                const grade = avg >= 8 ? 'A' : avg >= 6.5 ? 'B' : avg >= 5 ? 'C' : 'D';
                return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}><b>Trung bình nhóm</b></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}><b>{avg}</b></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}><b>{grade}</b></Table.Summary.Cell>
              </Table.Summary.Row>
                );
              }}
              locale={{ emptyText: 'Chưa có điểm nhóm của GVHD' }}
            />
          </div>
          {/* Điểm nhóm của Hội đồng */}
          <div>
            <div className="font-semibold text-base mb-2">Điểm nhóm của Hội đồng</div>
            <Table
              dataSource={groupCouncilTable}
              columns={[
                { title: 'Vai trò', dataIndex: 'role' },
                { title: 'Tên', dataIndex: 'name' },
                { title: 'Điểm trung bình', dataIndex: 'avg' },
                { title: 'Xếp loại', dataIndex: 'grade' }
              ]}
              pagination={false}
              loading={loading}
              locale={{ emptyText: 'Chưa có điểm nhóm của Hội đồng' }}
              summary={pageData => {
                if (!pageData.length) return null;
                const avgs = pageData.map(r => Number(r.avg)).filter(v => !isNaN(v));
                if (!avgs.length) return null;
                const avg = (avgs.reduce((a,b)=>a+b,0)/avgs.length).toFixed(2);
                const grade = avg >= 8 ? 'A' : avg >= 6.5 ? 'B' : avg >= 5 ? 'C' : 'D';
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}><b>Trung bình nhóm</b></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}><b>{avg}</b></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}><b>{grade}</b></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
          {/* BỎ phần tổng điểm nhóm ở đây */}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Điểm tổng" key="total">
          <div className="p-6">
            <div className="mb-4 text-lg">
              <div>Điểm cá nhân (GVHD): <b className="text-blue-600">{personal}</b></div>
              <div>Điểm nhóm: <b className="text-blue-600">{groupGVHDAvg}</b></div>
              <div>Điểm hội đồng: <b className="text-blue-600">{groupCouncilAvg}</b></div>
            </div>
            <div className="text-xl font-bold mt-6">
              Tổng điểm: <span className="text-green-600">{(Number(personal)*0.4 + Number(groupGVHDAvg)*0.3 + Number(groupCouncilAvg)*0.3).toFixed(2)}</span>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

// Export layout mới và các component con
export { StudentLayout, TopicDetails, TopicsList, Proposals }; 