import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudentRegisteredTopic, getAvailableTopics } from '../../data/mockThesisData';
import { FaTimesCircle, FaBook, FaUserGraduate, FaUsers, FaTag, FaInfoCircle, FaHome, FaListAlt, FaLightbulb, FaSearch, FaSort, FaPencilAlt, FaCalendarAlt, FaClock, FaPaperPlane, FaUpload, FaDownload, FaEye, FaInfo, FaUserCircle } from 'react-icons/fa';
import StudentHeader from '../../components/student/StudentHeader';
import { mockLecturers, mockMajors, mockTopicTypes, mockStudents } from '../../data/mockThesisData';

// Component con để hiển thị chi tiết đề tài hoặc thông báo chưa đăng ký
const TopicDetails = () => {
  const { user } = useAuth();
  const [registeredTopic, setRegisteredTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // State để quản lý file được chọn (ví dụ cho 1 mục)
  const [selectedProposalFile, setSelectedProposalFile] = useState(null);

  useEffect(() => {
    const studentId = user?.id;
    const studentRole = user?.role;

    // console.log("TopicDetails useEffect running. ID:", studentId, "Role:", studentRole); // Bỏ comment nếu cần debug

    if (studentId && studentRole === 'sinhvien') {
      setIsLoading(true);
      setTimeout(() => {
        const topicData = getStudentRegisteredTopic(studentId); // Sử dụng studentId
        setRegisteredTopic(topicData);
        setIsLoading(false);
      }, 300);
    } else {
      setIsLoading(false);
    }
    // Chỉ chạy lại effect nếu user.id hoặc user.role thay đổi
  }, [user?.id, user?.role]);

  const handleCancelRegistration = () => {
    alert('Chức năng hủy đăng ký đang được phát triển!');
    // setRegisteredTopic(null);
  };

  // --- Các hàm xử lý file mới --- 
  const handleFileChange = (event, fileType) => {
      const file = event.target.files[0];
      if (file) {
          console.log(`Selected ${fileType}:`, file.name);
          // Lưu file vào state tương ứng (ví dụ)
          if (fileType === 'proposal') setSelectedProposalFile(file);
          // Cần state riêng cho các loại file khác
      }
  };

  const handleUploadFile = (fileType) => {
      let fileToUpload = null;
      if (fileType === 'proposal') fileToUpload = selectedProposalFile;
      // Lấy file từ state tương ứng khác
      
      if (fileToUpload) {
          alert(`Đang tải lên ${fileType}: ${fileToUpload.name}. Chức năng đang phát triển!`);
          // Logic gọi API để upload file
          // Sau khi upload thành công, cập nhật mock data hoặc fetch lại
          // registeredTopic.documents[fileType] = { name: fileToUpload.name, url: 'url-sau-khi-upload' };
          // Reset state file đã chọn
          // setSelectedProposalFile(null);
      } else {
          alert('Vui lòng chọn file trước khi tải lên.');
      }
  };

  const handleViewGrades = () => {
      alert('Xem điểm. Chức năng đang phát triển!');
      // Logic chuyển trang hoặc hiển thị modal điểm
  };
  
    const handleViewCommittee = () => {
      alert('Xem thông tin hội đồng. Chức năng đang phát triển!');
      // Logic chuyển trang hoặc hiển thị modal thông tin hội đồng
  };
  // ------------------------------

  if (isLoading) {
    return <div className="p-8 text-center">Đang tải thông tin đề tài...</div>;
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Trang chủ Sinh viên</h1>

      {registeredTopic ? (
        <>
          {/* Phần Thông tin đề tài (đã có) + nút Xem điểm */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
             <div className="flex justify-between items-start mb-6">
               <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Thông Tin Đề Tài Đã Đăng Ký</h2>
                {/* Nút Hủy đăng ký hoặc Xem điểm tùy trạng thái */} 
                {registeredTopic.grades?.finalGrade ? ( // Nếu đã có điểm cuối cùng
                    <button 
                      onClick={handleViewGrades}
                      className="flex items-center bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded-md transition-colors duration-300"
                    >
                       <FaEye className="mr-2" /> Xem điểm
                    </button>
                ) : (
                    <button 
                      onClick={handleCancelRegistration} 
                      className="flex items-center bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium px-4 py-2 rounded-md transition-colors duration-300"
                    >
                      <FaTimesCircle className="mr-2" /> Hủy đăng ký
                    </button>
                )}
             </div>
              {/* ... (hiển thị các thông tin đề tài như cũ) ... */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                   {/* ... Tên đề tài, GVHD, Chuyên ngành, Loại đề tài ... */} 
                   {/* Số lượng SV thực hiện */} 
                    <div>
                       <label className="block text-sm font-medium text-gray-500 mb-1">Số lượng sinh viên thực hiện tối đa</label>
                       <p className="text-md text-gray-800 flex items-center">
                          <FaUsers className="text-[#008bc3] mr-2 flex-shrink-0" />
                          {registeredTopic.maxStudents}
                        </p>
                    </div>
               </div>
              {/* Chi tiết đề tài (Yêu cầu đề tài) */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Chi tiết đề tài (Yêu cầu)</label>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700 text-sm space-y-2 whitespace-pre-line h-40 overflow-y-auto">
                  {registeredTopic.details.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
          </div>

          {/* Phần Các nhóm đăng ký */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-4">Các nhóm đăng ký</h3>
            {registeredTopic.registeredGroups && registeredTopic.registeredGroups.length > 0 ? (
               registeredTopic.registeredGroups.map(group => (
                 <div key={group.groupId} className="border rounded-md p-4">
                   <p className="text-sm font-medium text-gray-600 mb-2">{group.groupId} (Số lượng: {group.members.length})</p>
                   <ul className="space-y-1">
                      {group.members.map(member => (
                        <li key={member.id} className="flex items-center justify-between text-sm text-gray-800">
                           <span className="flex items-center">
                              <FaUserCircle className="mr-2 text-gray-400" /> {member.name}
                           </span>
                           <span className="text-gray-500">{member.mssv}</span>
                        </li>
                      ))}
                   </ul>
                 </div>
               ))
            ) : (
               <p className="text-sm text-orange-600">Hiện tại chưa có sinh viên đăng ký đề tài này.</p>
            )}
          </div>

          {/* Phần Tài liệu quan trọng */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
             <h3 className="text-md font-semibold text-gray-700 mb-4">Tài liệu quan trọng</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mục 1: Đơn xin hướng dẫn */}
                <div className="border rounded-md p-4 space-y-2 text-sm">
                   <label className="font-medium">1. Đơn xin hướng dẫn khóa luận</label>
                   {registeredTopic.documents?.proposal?.name ? (
                      <div className="flex items-center justify-between text-blue-600">
                         <span>{registeredTopic.documents.proposal.name}</span>
                         <a href={registeredTopic.documents.proposal.url || '#'} target="_blank" rel="noopener noreferrer" title="Tải xuống">
                            <FaDownload />
                         </a>
                      </div>
                   ) : (
                      <p className="text-red-600">Không có tệp nào.</p>
                   )}
                   <div className="flex gap-2">
                     <input type="file" id="proposalFile" className="hidden" onChange={(e) => handleFileChange(e, 'proposal')}/>
                     <label htmlFor="proposalFile" className="flex-1 cursor-pointer text-center px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 text-xs">Chọn file</label>
                     <button onClick={() => handleUploadFile('proposal')} className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs">Tải lên</button>
                   </div>
                   {selectedProposalFile && <p className="text-xs text-gray-500 truncate">Đã chọn: {selectedProposalFile.name}</p>} 
                </div>
                 {/* Mục 2: Đơn xin bảo vệ (Tương tự) */}
                <div className="border rounded-md p-4 space-y-2 text-sm">
                   <label className="font-medium">2. Đơn xin bảo vệ khóa luận</label>
                   {/* ... Hiển thị file đã upload hoặc "Không có tệp nào." ... */} 
                   <p className="text-red-600">Không có tệp nào.</p>
                    <div className="flex gap-2">
                     <input type="file" id="defenseFile" className="hidden" onChange={(e) => handleFileChange(e, 'defenseRequest')}/>
                     <label htmlFor="defenseFile" className="flex-1 cursor-pointer text-center px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 text-xs">Chọn file</label>
                     <button onClick={() => handleUploadFile('defenseRequest')} className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs">Tải lên</button>
                   </div>
                   {/* ... Hiển thị tên file đã chọn ... */} 
                </div>
                 {/* Mục 3: Báo cáo cuối cùng (Tương tự) */}
                 <div className="border rounded-md p-4 space-y-2 text-sm">
                   <label className="font-medium">3. Báo cáo cuối cùng</label>
                   {/* ... Hiển thị file đã upload hoặc "Không có tệp nào." ... */} 
                   <p className="text-red-600">Không có tệp nào.</p>
                    <div className="flex gap-2">
                     <input type="file" id="reportFile" className="hidden" onChange={(e) => handleFileChange(e, 'finalReport')}/>
                     <label htmlFor="reportFile" className="flex-1 cursor-pointer text-center px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 text-xs">Chọn file</label>
                     <button onClick={() => handleUploadFile('finalReport')} className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs">Tải lên</button>
                   </div>
                   {/* ... Hiển thị tên file đã chọn ... */} 
                </div>
             </div>
          </div>
          
           {/* Phần Thông tin phản biện và nút */}
           <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-500 mb-1">Giảng viên phản biện</label>
                     <p className="text-md text-gray-800">{registeredTopic.reviewer || 'Chưa có thông tin'}</p>
                  </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-500 mb-1">Hội đồng phản biện</label>
                     <p className="text-md text-gray-800">{registeredTopic.committee || 'Chưa có hội đồng chấm điểm'}</p>
                  </div>
              </div>
               <div className="flex flex-wrap justify-end gap-4 border-t pt-6">
                 <button 
                      onClick={handleViewCommittee}
                      className="flex items-center bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium px-4 py-2 rounded-md transition-colors duration-300"
                    >
                       <FaInfo className="mr-2" /> Thông tin hội đồng
                    </button>
                  <button 
                      onClick={handleViewGrades}
                      className="flex items-center bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded-md transition-colors duration-300"
                      disabled={!registeredTopic.grades?.finalGrade} // Disable nếu chưa có điểm
                    >
                       <FaEye className="mr-2" /> Xem điểm
                    </button>
               </div>
           </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
           <FaInfoCircle className="text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Bạn hiện chưa đăng ký đề tài nào.</p>
          <button className="mt-6 bg-[#008bc3] hover:bg-[#0073a8] text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300">
             Tìm kiếm đề tài
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
  const navigate = useNavigate(); // Khởi tạo navigate

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => { 
      const data = getAvailableTopics(); 
      setTopics(data);
      setIsLoading(false);
    }, 300); 
  }, []);

  const handleRegisterClick = (topicId) => {
     // Chuyển hướng đến trang ghi danh
     navigate(`/student/topics/${topicId}/register`); 
  };

  const filteredTopics = topics.filter(topic => 
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md">
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="6" className="p-4 text-center text-gray-500">Đang tải...</td></tr>
              ) : filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {topic.isAvailable ? (
                         <button 
                           onClick={() => handleRegisterClick(topic.id)}
                           className="text-blue-600 hover:text-blue-800 focus:outline-none disabled:text-gray-300"
                           title="Ghi danh"
                         >
                           <FaPencilAlt />
                         </button>
                      ) : (
                         <span className="text-gray-400" title="Đã đủ số lượng">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-normal font-medium text-gray-900">{topic.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{topic.supervisor}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{topic.major}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{topic.type}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{topic.maxStudents}</td>
                  </tr>
                ))
              ) : (
                 <tr><td colSpan="6" className="p-4 text-center text-gray-500">Không tìm thấy đề tài phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination (Placeholder) */}
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
  const { user } = useAuth(); // Lấy thông tin user hiện tại
  // State cho các trường trong form
  const [formData, setFormData] = useState({
    topicName: '',
    supervisorId: '',
    majorId: '',
    topicTypeId: '',
    description: '',
    student1Id: user?.id || '', // Mặc định là user đang đăng nhập
    student2Id: '',
    student3Id: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate dữ liệu (ví dụ: kiểm tra các trường bắt buộc)
    if (!formData.topicName || !formData.supervisorId || !formData.majorId || !formData.topicTypeId || !formData.description) {
       alert('Vui lòng điền đầy đủ các trường bắt buộc (*).');
       return;
    }
    console.log("Submitting Proposal:", formData);
    alert('Đề xuất đã được gửi (Xem Console log để biết chi tiết). Chức năng thực tế đang phát triển!');
    // Logic gửi đề xuất lên backend (gọi API)
  };

  // Lấy tên user hiện tại từ mockStudents để hiển thị (hoặc từ user.name)
  const currentUserInfo = mockStudents.find(s => s.id === user?.id);
  const currentUserDisplay = currentUserInfo ? `${currentUserInfo.name} - ${currentUserInfo.mssv}` : `Sinh viên ${user?.id}`;

  // Lọc danh sách sinh viên khác để chọn thành viên
  const otherStudents = mockStudents.filter(s => s.id !== user?.id);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Đề Xuất Đề Tài Với Giảng Viên</h1>

      {/* Filters Row (giống trang TopicsList, có thể tách thành component riêng sau) */}
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
         {/* Có thể bỏ nút Đề xuất ở đây vì đây là trang đề xuất */}
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
            <option value="" disabled>Chọn giảng viên</option>
            {mockLecturers.map(lecturer => (
              <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>
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
              <option value="" disabled>Chọn chuyên ngành</option>
               {mockMajors.map(major => (
                <option key={major.id} value={major.id}>{major.name}</option>
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
              <option value="" disabled>Chọn loại đề tài</option>
              {mockTopicTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Sinh viên 1 (hiện tại) */}
             <div>
               <label htmlFor="student1Id" className="block text-sm font-medium text-gray-700 mb-1">Sinh viên 1</label>
               <input
                 type="text"
                 id="student1Id"
                 value={currentUserDisplay} // Hiển thị tên + MSSV
                 className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
                 readOnly
                 disabled
               />
             </div>
             {/* Sinh viên 2 */}
             <div>
               <label htmlFor="student2Id" className="block text-sm font-medium text-gray-700 mb-1">Sinh viên 2</label>
               <select
                 id="student2Id"
                 name="student2Id"
                 value={formData.student2Id}
                 onChange={handleChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#008bc3] focus:border-[#008bc3] text-sm bg-white"
               >
                 <option value="">Chọn sinh viên</option>
                 {otherStudents.map(student => (
                   <option key={student.id} value={student.id}>{student.name} - {student.mssv}</option>
                 ))}
               </select>
             </div>
              {/* Sinh viên 3 */}
             <div>
               <label htmlFor="student3Id" className="block text-sm font-medium text-gray-700 mb-1">Sinh viên 3</label>
               <select
                 id="student3Id"
                 name="student3Id"
                 value={formData.student3Id}
                 onChange={handleChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#008bc3] focus:border-[#008bc3] text-sm bg-white"
               >
                 <option value="">Chọn sinh viên</option>
                  {otherStudents.map(student => (
                   <option key={student.id} value={student.id}>{student.name} - {student.mssv}</option>
                 ))}
               </select>
             </div>
          </div>
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