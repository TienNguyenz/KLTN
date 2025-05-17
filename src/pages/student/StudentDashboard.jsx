import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTimesCircle, FaBook, FaUserGraduate, FaUsers, FaTag, FaInfoCircle, FaHome, FaListAlt, FaLightbulb, FaSearch, FaSort, FaPencilAlt, FaCalendarAlt, FaClock, FaPaperPlane, FaUpload, FaDownload, FaEye, FaInfo, FaUserCircle, FaFilePdf } from 'react-icons/fa';
import StudentHeader from '../../components/student/StudentHeader';
import axios from 'axios';
import RegisteredTopicDetails from './RegisteredTopicDetails';

// Component con để hiển thị chi tiết đề tài hoặc thông báo chưa đăng ký
const TopicDetails = () => {
  const { user } = useAuth();
  const [registeredTopic, setRegisteredTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegisteredTopic = async () => {
      try {
        console.log('Fetching registered topic for user_id:', user?.user_id);
        // Tìm đề tài mà sinh viên đang tham gia
        const response = await axios.get(`/api/topics/student/${user?.user_id}`);
        console.log('API Response:', response.data);
        if (response.data) {
          console.log('Setting registered topic:', response.data);
          setRegisteredTopic(response.data);
        } else {
          console.log('No registered topic found');
        }
      } catch (error) {
        console.error('Error fetching registered topic:', error);
        console.error('Error details:', error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.user_id) {
      console.log('User ID exists, fetching registered topic');
      fetchRegisteredTopic();
    } else {
      console.log('No user ID found');
      setIsLoading(false);
    }
  }, [user?.user_id]);

  // Các hàm xử lý
  const handleCancelRegistration = () => {
    alert('Chức năng hủy đăng ký đang được phát triển!');
  };
  const handleViewGrades = () => {
      alert('Xem điểm. Chức năng đang phát triển!');
  };
    const handleViewCommittee = () => {
      alert('Xem thông tin hội đồng. Chức năng đang phát triển!');
  };

  const isRegistered = registeredTopic && registeredTopic.topic_title;

  if (isLoading) {
    return <div className="p-8 text-center">Đang tải thông tin đề tài...</div>;
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Trang chủ Sinh viên</h1>
      {isRegistered ? (
        <RegisteredTopicDetails
          topic={registeredTopic}
          onCancel={handleCancelRegistration}
          onViewGrades={handleViewGrades}
          onViewCommittee={handleViewCommittee}
        />
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
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
    setIsLoading(true);
        // Thêm timeout để đảm bảo backend đã sẵn sàng
        const response = await axios.get('/api/topics', {
          timeout: 5000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        console.log('Topics data:', response.data);

        if (Array.isArray(response.data)) {
          setTopics(response.data);
        } else if (response.data && Array.isArray(response.data.topics)) {
          // Trong trường hợp API trả về dạng { topics: [...] }
          setTopics(response.data.topics);
        } else {
          console.error('Expected array of topics but got:', response.data);
          setTopics([]);
        }
      } catch (error) {
        console.error('Error fetching topics:', error.message);
        if (error.response) {
          // Server trả về response với status code nằm ngoài range 2xx
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        } else if (error.request) {
          // Request được gửi nhưng không nhận được response
          console.error('No response received:', error.request);
        } else {
          // Có lỗi khi setting up request
          console.error('Error setting up request:', error.message);
        }
        setTopics([]);
      } finally {
      setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleRegisterClick = (topicId, isBlocked) => {
    if (isBlocked) {
      alert('Đề tài này đã bị khóa và không thể đăng ký.');
      return;
    }
     navigate(`/student/topics/${topicId}/register`); 
  };

  const filteredTopics = topics.filter(topic => {
    const searchString = searchTerm.toLowerCase();
    return (
      topic.topic_title?.toLowerCase().includes(searchString) ||
      topic.topic_instructor?.toString().toLowerCase().includes(searchString) ||
      topic.topic_major?.toString().toLowerCase().includes(searchString) ||
      topic.topic_category?.toString().toLowerCase().includes(searchString)
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
                        className={`text-blue-600 hover:text-blue-800 focus:outline-none ${topic.topic_block ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={topic.topic_block ? 'Đề tài đã bị khóa' : 'Ghi danh'}
                        disabled={topic.topic_block}
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
                      {topic.topic_category?.type_name || ''}
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
  const facultyId = user?.user_faculty; // Lấy facultyId của sinh viên
  const [formData, setFormData] = useState({
    topicName: '',
    supervisorId: '',
    majorId: '',
    topicTypeId: '',
    description: '',
    maxMembers: 2, // Mặc định 2 thành viên
    student1Id: user?.user_id || '',
    student2Id: '',
    student3Id: '',
    student4Id: ''
  });
  // Thêm state cho file đơn xin hướng dẫn
  const [guidanceFile, setGuidanceFile] = useState(null);

  // States cho dữ liệu từ MongoDB
  const [instructors, setInstructors] = useState([]);
  const [majors, setMajors] = useState([]);
  const [topicTypes, setTopicTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

        setInstructors(instructorsRes.data);
        setMajors(majorsRes.data);
        setTopicTypes(topicTypesRes.data);
        setStudents(studentsRes.data.filter(s => s._id !== user?.user_id));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (facultyId) fetchData();
  }, [user?.user_id, facultyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Tạo mảng thành viên, bắt đầu với trưởng nhóm
      let leaderId = user._id;
      if (!leaderId) {
        const leader = students.find(s => s.user_id === user.user_id);
        leaderId = leader?._id;
      }
      const members = [leaderId];
      
      // Thêm các thành viên khác nếu có
      for (let i = 2; i <= formData.maxMembers; i++) {
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
        topic_title: formData.topicName,
        topic_instructor: formData.supervisorId,
        topic_major: formData.majorId,
        topic_category: formData.topicTypeId,
        topic_description: formData.description,
        topic_max_members: formData.maxMembers,
        topic_group_student: members,
        topic_creator: creatorId
      };
      // Sử dụng FormData để gửi kèm file
      const formDataToSend = new FormData();
      Object.entries(proposalData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => formDataToSend.append(key, v));
        } else {
          formDataToSend.append(key, value);
        }
      });
      if (guidanceFile) {
        formDataToSend.append('guidanceFile', guidanceFile);
      }
      await axios.post('/api/topics/propose', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Đề xuất đã được gửi thành công!');
      // Reset form
      setFormData({
        ...formData,
        topicName: '',
        supervisorId: '',
        majorId: '',
        topicTypeId: '',
        description: '',
        student2Id: '',
        student3Id: '',
        student4Id: ''
      });
      setGuidanceFile(null);
    } catch (error) {
      console.error('Error submitting proposal:', error);
      if (error.response?.data?.message) {
        if (error.response.data.registeredMembers) {
          alert(`${error.response.data.message}\n\n${error.response.data.registeredMembers.join('\n')}`);
        } else {
          alert(error.response.data.message);
        }
      } else {
        alert('Có lỗi xảy ra khi gửi đề xuất!');
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
          <label htmlFor="topicName" className="block text-sm font-medium text-gray-700 mb-1">
             Tên đề tài <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="topicName"
            name="topicName"
            value={formData.topicName}
            onChange={handleChange}
            placeholder="Bạn vui lòng nhập tên đề tài ..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#008bc3] focus:border-[#008bc3] text-sm"
            required
          />
        </div>

        {/* GVHD */}
        <div>
          <label htmlFor="supervisorId" className="block text-sm font-medium text-gray-700 mb-1">
             Giảng viên hướng dẫn <span className="text-red-500">*</span>
          </label>
          <select
            id="supervisorId"
            name="supervisorId"
            value={formData.supervisorId}
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
            <label htmlFor="majorId" className="block text-sm font-medium text-gray-700 mb-1">
              Chuyên ngành <span className="text-red-500">*</span>
            </label>
            <select
              id="majorId"
              name="majorId"
              value={formData.majorId}
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
            <label htmlFor="topicTypeId" className="block text-sm font-medium text-gray-700 mb-1">
              Loại đề tài <span className="text-red-500">*</span>
            </label>
            <select
              id="topicTypeId"
              name="topicTypeId"
              value={formData.topicTypeId}
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
          <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng thành viên <span className="text-red-500">*</span>
          </label>
          <select
            id="maxMembers"
            name="maxMembers"
            value={formData.maxMembers}
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
             Mô tả chi tiết đề tài <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
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
            {Array.from({ length: formData.maxMembers - 1 }, (_, idx) => (
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
              {/* Nếu có file mẫu, thêm link tải mẫu */}
              {/* <a href="/templates/guidance_request_template.docx" download className="ml-2 text-blue-500 hover:text-blue-700 text-sm flex items-center" title="Tải file mẫu">
                <FaDownload className="mr-1" /> Tải mẫu
              </a> */}
            </div>
            <div className="flex-1">
              {guidanceFile ? (
                <span className="text-green-700 text-sm">{guidanceFile.name}</span>
              ) : (
                <span className="text-red-500 text-sm">Chưa có file.</span>
              )}
            </div>
          </div>
          <div className="flex space-x-2 mt-3">
            <label className="inline-block">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={e => setGuidanceFile(e.target.files[0])}
                className="hidden"
              />
              <span className="inline-block px-4 py-2 bg-gray-200 rounded cursor-pointer text-sm font-medium hover:bg-gray-300">Chọn file</span>
            </label>
            <button
              type="button"
              className={`px-4 py-2 rounded text-sm font-medium text-white ${guidanceFile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={!guidanceFile}
              onClick={() => document.querySelector('input[type=file][accept=".pdf,.doc,.docx"]').click()}
            >
              Tải lên
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Hỗ trợ các định dạng: PDF, DOC, DOCX</p>
        </div>

        {/* Nút Submit */}
        <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#008bc3] hover:bg-[#0073a8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008bc3] transition-colors"
            >
              <FaPaperPlane className="-ml-1 mr-2 h-5 w-5" />
              Gửi Đề Xuất
            </button>
        </div>
      </form>
    </div>
  );
};

// Đổi tên Layout chính của Student
const StudentLayout = () => {
  const linkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150";
  const activeLinkClasses = "bg-gray-900 text-white";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-gray-100 flex flex-col fixed h-full z-30">
         <div className="p-4 text-center text-xl font-bold border-b border-gray-700">
            DDT THESIS
         </div>
         
        <nav className="flex-grow mt-4">
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

// Export layout mới và các component con
export { StudentLayout, TopicDetails, TopicsList, Proposals }; 