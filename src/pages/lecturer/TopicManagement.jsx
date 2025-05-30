import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
// Import icons
import { FaSearch, FaSort, FaPlus, FaEdit } from 'react-icons/fa'; 

const TopicManagement = () => {
  console.log('TopicManagement component mounted'); // Log khi component render
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  
  const [majors, setMajors] = useState([]); // State lưu danh sách chuyên ngành
  const [selectedMajor, setSelectedMajor] = useState(''); // State lưu chuyên ngành được chọn

  useEffect(() => {
    console.log('user:', user); // Log user để kiểm tra
    const fetchTopics = async () => {
    setIsLoading(true);
      try {
        if (!user?.id) return;
        // Gọi API mới lấy tất cả đề tài của giảng viên
        const res = await axios.get(`/api/topics/instructor/${user.id}/all`);
        console.log('API response topics:', res.data); // Thêm log để debug response topics
        setTopics(res.data);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setTopics([]);
      } finally {
      setIsLoading(false);
      }
    };

    const fetchMajorsByFaculty = async () => {
      try {
        if (!user?.user_faculty) return; // Chỉ fetch nếu có facultyId của user
        const res = await axios.get(`/api/majors?facultyId=${user.user_faculty}`);
        // Đảm bảo data trả về là mảng
        console.log('API response majors:', res.data); // Thêm log để debug response majors
        if (Array.isArray(res.data.data)) {
           setMajors(res.data.data);
        } else if (Array.isArray(res.data)) {
           setMajors(res.data);
        } else {
          setMajors([]);
        }
      } catch (error) {
        console.error('Error fetching majors:', error);
        setMajors([]);
      }
    };

    if (user?.id) fetchTopics();
    if (user?.user_faculty) fetchMajorsByFaculty(); // Fetch majors khi có user và facultyId
  }, [user?.id, user?.user_faculty]); // Dependency includes user.user_faculty

  const handleAddTopic = () => {
      navigate('/lecturer/topics/add'); 
  };

  const handleEditTopic = (topicId) => {
      navigate(`/lecturer/topics/${topicId}/edit`);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const filteredTopics = topics.filter(topic => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    // Tìm kiếm trong tên đề tài, tên giảng viên, ID, và toàn bộ object (để bắt mã/thời gian)
    const topicDataString = JSON.stringify(topic).toLowerCase();
    
    // Log để kiểm tra giá trị topic_major và selectedMajor
    console.log('Filtering topic:', topic.topic_title);
    console.log('topic.topic_major:', topic.topic_major);
    console.log('selectedMajor:', selectedMajor);
    console.log('topic.topic_major?._id:', topic.topic_major?._id);

    // Lọc theo chuyên ngành nếu có selectedMajor
    // So sánh bằng cách chuyển cả hai về string để đảm bảo đúng kiểu dữ liệu
    if (selectedMajor && topic.topic_major && topic.topic_major !== selectedMajor) {
      console.log('Topic filtered out by major:', topic.topic_title, ' - Major ID:', topic.topic_major);
      return false;
    }

    return (
      topic.topic_title?.toLowerCase().includes(lowerSearchTerm) ||
      topic.topic_instructor?.user_name?.toLowerCase().includes(lowerSearchTerm) ||
      topic._id?.toLowerCase().includes(lowerSearchTerm) ||
      topicDataString.includes(lowerSearchTerm)
    );
  });

  const totalPages = Math.ceil(filteredTopics.length / PAGE_SIZE) || 1;
  const paginatedTopics = filteredTopics.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Map trạng thái sang tiếng Việt và màu sắc
  const statusConfig = {
    approved: {
      text: 'Đã duyệt',
      color: 'bg-green-100 text-green-800'
    },
    pending: {
      text: 'Chờ duyệt',
      color: 'bg-yellow-100 text-yellow-800'
    },
    rejected: {
      text: 'Từ chối',
      color: 'bg-red-100 text-red-800'
    },
    waiting: {
      text: 'Có sinh viên đăng ký',
      color: 'bg-blue-100 text-blue-800'
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-100 min-h-full">
      {/* Header Row */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Đề tài lên trưởng khoa</h1>
        <button 
          onClick={handleAddTopic}
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-sm"
        >
          <FaPlus className="mr-2 -ml-1 h-5 w-5" />
          Thêm đề tài
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <div className="relative w-full max-w-sm flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm đề tài..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          {/* Dropdown lọc chuyên ngành */}
          <div className="relative w-full max-w-xs">
             <select
               value={selectedMajor}
               onChange={(e) => setSelectedMajor(e.target.value)}
               className="w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none -webkit-appearance-none"
             >
               <option value="">Tất cả chuyên ngành</option>
               {majors.map(major => (
                 <option key={major._id} value={major._id}>
                   {major.major_title}
                 </option>
               ))}
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề tài</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GVHD</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại đề tài</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SV Thực Hiện</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảng viên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="6" className="p-4 text-center text-gray-500">Đang tải...</td></tr>
              ) : filteredTopics.length > 0 ? (
                paginatedTopics.map((topic) => (
                  <tr key={topic._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-normal font-medium text-gray-900">{topic.topic_title}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{topic.topic_instructor?.user_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{topic.topic_category?.type_name || topic.topic_category?.topic_category_title || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-center">{topic.topic_group_student?.length ?? 0}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[topic.topic_teacher_status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusConfig[topic.topic_teacher_status]?.text || '-'}
                       </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleEditTopic(topic._id)} 
                        className="text-indigo-600 hover:text-indigo-900" 
                        title="Sửa"
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                 <tr><td colSpan="6" className="p-4 text-center text-gray-500">Không có đề tài nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination & Total */}
        <div className="mt-6 flex items-center justify-between text-xs text-gray-600">
           <div>Tổng cộng {filteredTopics.length} đề tài</div>
           <div className="flex items-center space-x-1">
             <button
               className={`px-2 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
               onClick={() => handlePageChange(currentPage - 1)}
               disabled={currentPage === 1}
             >
               &lt;
             </button>
             {/* Hiển thị phân trang tối ưu */}
             {totalPages <= 7 ? (
               Array.from({ length: totalPages }, (_, i) => (
                 <button
                   key={i + 1}
                   className={`px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                   onClick={() => handlePageChange(i + 1)}
                 >
                   {i + 1}
                 </button>
               ))
             ) : (
               <>
                 <button
                   className={`px-2 py-1 rounded ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                   onClick={() => handlePageChange(1)}
                 >1</button>
                 {currentPage > 4 && <span className="px-2">...</span>}
                 {currentPage > 3 && (
                   <button
                     className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-blue-100"
                     onClick={() => handlePageChange(currentPage - 2)}
                   >{currentPage - 2}</button>
                 )}
                 {currentPage > 2 && (
                   <button
                     className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-blue-100"
                     onClick={() => handlePageChange(currentPage - 1)}
                   >{currentPage - 1}</button>
                 )}
                 <button
                   className="px-2 py-1 rounded bg-blue-500 text-white"
                   disabled
                 >{currentPage}</button>
                 {currentPage < totalPages - 1 && (
                   <button
                     className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-blue-100"
                     onClick={() => handlePageChange(currentPage + 1)}
                   >{currentPage + 1}</button>
                 )}
                 {currentPage < totalPages - 2 && (
                   <button
                     className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-blue-100"
                     onClick={() => handlePageChange(currentPage + 2)}
                   >{currentPage + 2}</button>
                 )}
                 {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                 <button
                   className={`px-2 py-1 rounded ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                   onClick={() => handlePageChange(totalPages)}
                 >{totalPages}</button>
               </>
             )}
             <button
               className={`px-2 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
               onClick={() => handlePageChange(currentPage + 1)}
               disabled={currentPage === totalPages}
             >
               &gt;
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TopicManagement; 