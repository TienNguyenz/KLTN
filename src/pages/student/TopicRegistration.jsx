import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Đường dẫn này đúng
// Import lại các hàm và dữ liệu mock
import { getAvailableTopicById, mockStudents } from '../../data/mockThesisData'; 
// Import lại các icons cần thiết
import { FaBook, FaUserGraduate, FaUsers, FaTag, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'; 

const TopicRegistration = () => {
  const { topicId } = useParams(); // Lấy topicId từ URL
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // State cho các thành viên được chọn (key là `student${index}`, value là studentId)
  const [teamMemberIds, setTeamMemberIds] = useState({}); 
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError('');
    // Sử dụng hàm mock data thay vì fetch API
    setTimeout(() => { // Giả lập độ trễ
      const topicData = getAvailableTopicById(topicId);
      if (topicData) {
        setTopic(topicData);
        // Khởi tạo state cho team members dựa trên maxStudents
        const initialTeamMembers = {};
        if (topicData.maxStudents > 1) {
            for (let i = 2; i <= topicData.maxStudents; i++) {
                initialTeamMembers[`student${i}`] = '';
            }
        }
        setTeamMemberIds(initialTeamMembers);
      } else {
        setError('Không tìm thấy thông tin đề tài với ID này.');
      }
      setIsLoading(false);
    }, 300);
  }, [topicId]); // Phụ thuộc vào topicId từ URL

  const handleMemberChange = (e) => {
    const { name, value } = e.target; // name sẽ là "student2", "student3", ...
    
    // Kiểm tra trùng lặp thành viên (bao gồm cả user hiện tại và các dropdown khác)
    const currentSelectedIds = Object.values(teamMemberIds)
                                     .filter(id => id !== '' && id !== teamMemberIds[name]); // Lấy các id đã chọn khác (loại trừ giá trị đang xét)
                                     
    if (value && (value === user?.id || currentSelectedIds.includes(value))) {
        alert('Sinh viên này đã được chọn hoặc là chính bạn!');
         // Reset lại giá trị dropdown này nếu bị trùng
         setTeamMemberIds(prev => ({ ...prev, [name]: '' })); 
        return; 
    }
    
    setTeamMemberIds(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // Lấy danh sách thành viên cuối cùng (bao gồm user hiện tại và các dropdown có giá trị)
    const members = [user?.id, ...Object.values(teamMemberIds)].filter(Boolean); 
    
    // Có thể thêm validation ở đây: ví dụ số lượng thành viên tối thiểu/tối đa
    if (members.length > topic.maxStudents) {
        alert(`Số lượng thành viên không được vượt quá ${topic.maxStudents}.`);
        return;
    }
    // if (members.length < MIN_STUDENTS) { ... }

    console.log("Registering for topic:", topicId);
    console.log("Team members:", members);
    alert(`Đăng ký đề tài "${topic.name}" thành công! (Xem Console log). Chức năng thực tế đang phát triển.`);
    
    // --- Logic gọi API backend để đăng ký --- 
    // fetch('/api/register-topic', { 
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ topicId, members })
    // })
    // .then(res => res.json())
    // .then(data => {
    //    console.log(data);
          // Cập nhật trạng thái đăng ký trong AuthContext hoặc fetch lại dữ liệu
    //    navigate('/student'); 
    // })
    // .catch(err => { console.error(err); alert('Có lỗi xảy ra khi đăng ký.')});
    // --------------------------------------

    // Tạm thời chuyển hướng về trang chủ sinh viên sau khi submit giả lập
    navigate('/student'); 
  };

  // Lấy thông tin user hiện tại và các sinh viên khác
  const currentUserInfo = mockStudents.find(s => s.id === user?.id);
  const currentUserDisplay = currentUserInfo ? `${currentUserInfo.name} - ${currentUserInfo.mssv}` : `Sinh viên ${user?.id}`;
  // Lọc danh sách sinh viên có thể chọn (loại trừ user hiện tại)
  const otherStudents = mockStudents.filter(s => s.id !== user?.id);

  // --- Render Loading, Error, hoặc Not Found --- 
  if (isLoading) {
    return <div className="p-8 text-center">Đang tải thông tin đề tài...</div>;
  }
  if (error) {
     return <div className="p-8 text-center text-red-600">Lỗi: {error}</div>;
  }
  // Kiểm tra lại !topic sau khi loading xong và không có lỗi
  if (!topic) {
    return <div className="p-8 text-center">Không tìm thấy đề tài.</div>;
  }

  // --- Render Giao diện chính --- 
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Ghi Danh Đề Tài</h1>
      
      {/* --- Phần Thông tin đề tài (read-only) --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6 border-l-4 border-[#008bc3] pl-3">THÔNG TIN ĐỀ TÀI</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
             {/* Tên đề tài */} 
             <div>
               <label className="block text-sm font-medium text-gray-500 mb-1">Tên đề tài</label>
               <p className="text-lg text-gray-900 font-semibold flex items-start">
                 <FaBook className="text-[#008bc3] mr-2 mt-1 flex-shrink-0" />
                 <span>{topic.name}</span>
               </p>
             </div>
             {/* GVHD */} 
             <div>
               <label className="block text-sm font-medium text-gray-500 mb-1">Giảng viên hướng dẫn</label>
               <p className="text-md text-gray-800 flex items-center">
                  <FaUserGraduate className="text-[#008bc3] mr-2 flex-shrink-0" /> 
                  {topic.supervisor}
                </p>
             </div>
             {/* Chuyên ngành */} 
              <div>
               <label className="block text-sm font-medium text-gray-500 mb-1">Chuyên ngành</label>
               <p className="text-md text-gray-800">{topic.major}</p>
             </div>
             {/* Loại đề tài */} 
              <div>
               <label className="block text-sm font-medium text-gray-500 mb-1">Loại đề tài</label>
               <p className="text-md text-gray-800 flex items-center">
                  <FaTag className="text-[#008bc3] mr-2 flex-shrink-0" />
                  {topic.type}
                </p>
             </div>
             {/* Số lượng SV tối đa */} 
              <div>
               <label className="block text-sm font-medium text-gray-500 mb-1">Số lượng sinh viên thực hiện tối đa</label>
               <p className="text-md text-gray-800 flex items-center">
                  <FaUsers className="text-[#008bc3] mr-2 flex-shrink-0" />
                  {topic.maxStudents}
                </p>
             </div>
           </div>
          {/* Có thể thêm Yêu cầu đề tài nếu có trong mock data */} 
      </div>

      {/* --- Phần Các nhóm đã đăng ký --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
         <h3 className="text-md font-semibold text-gray-700 mb-3">Các nhóm đăng ký</h3>
         {/* Tạm thời hiển thị thông báo chưa có */}
         <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded border border-orange-200 flex items-center">
           <FaInfoCircle className="mr-2 flex-shrink-0"/> Hiện tại chưa có sinh viên đăng ký đề tài này.
         </p>
         {/* Logic hiển thị danh sách nhóm thực tế từ API */} 
      </div>

      {/* --- Form Đăng ký đề tài --- */}
      <form onSubmit={handleRegisterSubmit} className="bg-white p-6 rounded-lg shadow-md">
         <h3 className="text-md font-semibold text-gray-700 mb-4">Đăng ký đề tài</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Sinh viên 1 (hiện tại) */}
           <div>
             <label htmlFor="student1" className="block text-sm font-medium text-gray-700 mb-1">Sinh viên 1</label>
             <input
               type="text"
               id="student1"
               value={currentUserDisplay}
               className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
               readOnly
               disabled
             />
           </div>
           
           {/* Render các dropdown chọn sinh viên khác (nếu maxStudents > 1) */}
           {Object.keys(teamMemberIds).map((key, index) => (
              <div key={key}>
                 <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">Sinh viên {index + 2}</label>
                 <select
                   id={key}     // ví dụ: student2
                   name={key}    // ví dụ: student2
                   value={teamMemberIds[key]} // Lấy value từ state
                   onChange={handleMemberChange} // Gọi hàm xử lý khi chọn
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#008bc3] focus:border-[#008bc3] text-sm bg-white"
                 >
                   <option value="">Select...</option>
                   {/* Lọc danh sách otherStudents để loại bỏ những người đã được chọn ở dropdown khác */}
                   {otherStudents
                     .filter(student => 
                        !Object.values(teamMemberIds)
                               .filter((id, i) => i !== index) // Lấy id đã chọn ở các select khác
                               .includes(student.id) // Kiểm tra xem student này đã được chọn chưa
                     )
                     .map(student => (
                       <option key={student.id} value={student.id}>{student.name} - {student.mssv}</option>
                   ))}
                 </select>
               </div>
           ))}
         </div>
         
          {/* Nút Đăng ký */} 
          <div className="flex justify-end pt-6 mt-6 border-t">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                // Disable nút nếu đề tài không còn chỗ (isAvailable=false)
                disabled={!topic.isAvailable} 
              >
                <FaCheckCircle className="-ml-1 mr-2 h-5 w-5" />
                {topic.isAvailable ? 'Đăng ký đề tài' : 'Đã đủ số lượng'}
              </button>
          </div>
          {!topic.isAvailable && (
             <p className="text-right text-sm text-red-600 mt-2">Đề tài này đã đủ số lượng sinh viên đăng ký.</p>
          )} 
      </form>

    </div>
  );
};

export default TopicRegistration; 