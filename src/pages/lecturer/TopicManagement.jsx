import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAvailableTopics } from '../../data/mockThesisData'; // Import dữ liệu
// Import icons
import { FaSearch, FaSort, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'; 

// Hàm để lấy màu badge dựa trên status
const getStatusBadgeColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'READY':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'REGISTERED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
};

const TopicManagement = () => {
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Thêm state cho sort, pagination sau

  useEffect(() => {
    setIsLoading(true);
    // Giả lập fetch dữ liệu
    setTimeout(() => { 
      // Ở đây có thể filter đề tài thuộc giảng viên đang đăng nhập nếu cần
      const data = getAvailableTopics(); 
      setTopics(data);
      setIsLoading(false);
    }, 300); 
  }, []);

  const handleAddTopic = () => {
      navigate('/lecturer/topics/add'); 
  };

  const handleEditTopic = (topicId) => {
      // alert(`Chỉnh sửa đề tài ${topicId}. Chức năng đang phát triển!`);
      navigate(`/lecturer/topics/${topicId}/edit`); // Điều hướng đến trang sửa với topicId
  };

   const handleDeleteTopic = (topicId) => {
      if (window.confirm(`Bạn có chắc chắn muốn xóa đề tài ${topicId}?`)) {
          alert(`Xóa đề tài ${topicId}. Chức năng đang phát triển!`);
          // Logic gọi API xóa
          // setTopics(prev => prev.filter(t => t.id !== topicId));
      }
  };

  // Lọc dữ liệu (ví dụ đơn giản)
  const filteredTopics = topics.filter(topic => 
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
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
         {/* Search Input (có thể đặt ở đây hoặc trên header) */}
         {/* <div className="mb-4 relative w-full max-w-sm">
              <input type="text" placeholder="Tìm kiếm..." ... />
              <FaSearch ... />
            </div> */}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {/* Các cột như trong hình */} 
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề tài <FaSort className="inline ml-1 text-gray-400" /></th> 
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GVHD <FaSort className="inline ml-1 text-gray-400" /></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại đề tài <FaSort className="inline ml-1 text-gray-400" /></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SV Thực Hiện</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảng viên</th>{/* Status GV */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giáo vụ</th> {/* Status GVU */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="7" className="p-4 text-center text-gray-500">Đang tải...</td></tr>
              ) : filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-normal font-medium text-gray-900">{topic.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{topic.supervisor}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{topic.type}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-center">{topic.studentCount ?? 0}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(topic.lecturerStatus)}`}>
                          {topic.lecturerStatus || '-'}
                       </span>
                    </td>
                     <td className="px-4 py-3 whitespace-nowrap">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(topic.adminStatus)}`}>
                          {topic.adminStatus || '-'}
                       </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onClick={() => handleEditTopic(topic.id)} className="text-indigo-600 hover:text-indigo-900" title="Sửa"><FaEdit /></button>
                        <button onClick={() => handleDeleteTopic(topic.id)} className="text-red-600 hover:text-red-900" title="Xóa"><FaTrash /></button>
                        {/* Thêm nút xem chi tiết nếu cần */}
                    </td>
                  </tr>
                ))
              ) : (
                 <tr><td colSpan="7" className="p-4 text-center text-gray-500">Không có đề tài nào.</td></tr>
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