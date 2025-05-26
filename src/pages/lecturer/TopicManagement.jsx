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
    }
  };

  useEffect(() => {
    console.log('user:', user); // Log user để kiểm tra
    const fetchTopics = async () => {
    setIsLoading(true);
      try {
        if (!user?.id) return;
        // Gọi API mới lấy tất cả đề tài của giảng viên
        const res = await axios.get(`/api/topics/instructor/${user.id}/all`);
        console.log('API response:', res.data); // Thêm log để debug
        setTopics(res.data);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setTopics([]);
      } finally {
      setIsLoading(false);
      }
    };
    if (user?.id) fetchTopics();
  }, [user?.id]);

  const handleAddTopic = () => {
      navigate('/lecturer/topics/add'); 
  };

  const handleEditTopic = (topicId) => {
      navigate(`/lecturer/topics/${topicId}/edit`);
  };

  const filteredTopics = topics.filter(topic => 
    topic.topic_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.topic_instructor?.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="mb-4 relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Tìm kiếm đề tài..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
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
                filteredTopics.map((topic) => (
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
           {/* Pagination Placeholder (giống TopicsList) */}
           <div className="flex items-center space-x-1">
              {/* ... nút phân trang ... */} 
              <span className="px-2 py-1 bg-blue-500 text-white rounded">1</span> 
              {/* ... */} 
               <select className="ml-2 border rounded p-1 text-xs"><option>5</option></select>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TopicManagement; 