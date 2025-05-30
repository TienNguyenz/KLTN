import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBook, FaUserGraduate, FaUsers, FaTag, FaInfoCircle, FaCheckCircle, FaSearch, FaFileUpload } from 'react-icons/fa';
import axios from 'axios';
import Select from 'react-select';

const TopicRegistration = () => {
  const { topicId } = useParams();
  const { user } = useAuth();
  const facultyId = user?.user_faculty;
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState({
    member2: null,
    member3: null,
    member4: null
  });
  const [studentsWithTopic, setStudentsWithTopic] = useState([]);
  const [guidanceFile, setGuidanceFile] = useState(null);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState('');
  const [convertedPdfName, setConvertedPdfName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
    setIsLoading(true);
        const response = await axios.get(`/api/topics/${topicId}`);
        console.log('API /api/topics/:id response:', response.data);
        if (response.data && response.data.data) {
          const fetchedTopic = response.data.data;
          setTopic(fetchedTopic);
          // Initialize selectedMembers if topic has existing group students
          if (fetchedTopic.topic_group_student && fetchedTopic.topic_group_student.length > 0) {
            const initialMembers = {};
            // Filter out the current user (leader) and map other members
            const otherMembers = fetchedTopic.topic_group_student.filter(
              student => student._id !== user._id && student.user_id !== user.user_id
            );
            otherMembers.forEach((member, index) => {
              // Map to member2, member3, member4 based on index (start from member2)
              if (index < fetchedTopic.topic_max_members - 1) { // Ensure we don't exceed max members
                 initialMembers[`member${index + 2}`] = {
                   value: member._id,
                   label: `${member.user_name} (${member.user_id || 'Chưa có MSSV'})`,
                   userId: member.user_id
                 };
              }
            });
            setSelectedMembers(prev => ({ ...prev, ...initialMembers }));
          }
        } else if (response.data) {
          const fetchedTopic = response.data;
          setTopic(fetchedTopic);
          // Initialize selectedMembers if topic has existing group students
          if (fetchedTopic.topic_group_student && fetchedTopic.topic_group_student.length > 0) {
            const initialMembers = {};
            // Filter out the current user (leader) and map other members
            const otherMembers = fetchedTopic.topic_group_student.filter(
              student => student._id !== user._id && student.user_id !== user.user_id
            );
            otherMembers.forEach((member, index) => {
               if (index < fetchedTopic.topic_max_members - 1) {
                  initialMembers[`member${index + 2}`] = {
                    value: member._id,
                    label: `${member.user_name} (${member.user_id || 'Chưa có MSSV'})`,
                    userId: member.user_id
                  };
               }
             });
            setSelectedMembers(prev => ({ ...prev, ...initialMembers }));
          }
      } else {
        setError('Không tìm thấy thông tin đề tài với ID này.');
      }
      } catch (error) {
        console.error('Error fetching topic:', error);
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin đề tài.');
      } finally {
      setIsLoading(false);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get(`/api/students?facultyId=${facultyId}`);
        // Đảm bảo students là mảng
        if (Array.isArray(response.data)) {
        setStudents(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setStudents(response.data.data);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      }
    };

    const fetchStudentsWithTopic = async () => {
      try {
        const res = await axios.get('/api/topics');
        const allTopics = res.data.data || res.data || [];
        // Lọc chỉ lấy đề tài đang active hoặc pending, và KHÁC với đề tài hiện tại
        const validTopics = allTopics.filter(t => 
          (t.status === 'active' || t.status === 'pending') && t._id !== topicId
        );
        const registered = validTopics.flatMap(t => Array.isArray(t.topic_group_student) ? t.topic_group_student : []);
        setStudentsWithTopic(registered.map(s => s.user_id));
      } catch {
        setStudentsWithTopic([]);
      }
    };

    if (!user?.user_id) return;
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

    fetchTopic();
    if (facultyId) fetchStudents();
    fetchStudentsWithTopic();
  }, [topicId, user?.user_id, facultyId]);

  const handleMemberChange = (selectedOption, memberType) => {
    console.log('Selected option:', selectedOption);
    console.log('Current selectedMembers:', selectedMembers);
    
    const isAlreadySelected = Object.values(selectedMembers).some(member => 
      member && member.value === selectedOption?.value
    );

    if (isAlreadySelected) {
      alert('Sinh viên này đã được chọn!');
        return; 
    }
    
    setSelectedMembers(prev => ({
      ...prev,
      [memberType]: selectedOption
    }));
  };

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
      formDataFile.append('file', docFile);
      const res = await axios.post('/api/topics/upload-advisor-request', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setConvertedPdfUrl(res.data.file);
      setConvertedPdfName(res.data.originalName || 'advisor_request.pdf');
      setDocFile(null);
      setGuidanceFile(null);
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
      successModal.querySelector('button').onclick = () => {
        document.body.removeChild(successModal);
      };
    } catch {
      const convertModal = document.querySelector('.fixed.inset-0');
      if (convertModal) document.body.removeChild(convertModal);
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
      errorModal.querySelector('button').onclick = () => {
        document.body.removeChild(errorModal);
      };
    }
    setIsUploading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      let leaderId = user._id;
      if (!leaderId) {
        const leader = students.find(s => s.user_id === user.user_id);
        leaderId = leader?._id;
      }
      if (!leaderId) {
        alert('Không xác định được ID của trưởng nhóm.');
        return;
      }
      if (!convertedPdfUrl && !guidanceFile) {
        alert('Vui lòng tải lên file đơn xin hướng dẫn (PDF, DOC, DOCX) và chuyển đổi thành công trước khi gửi!');
        return;
      }
      const formData = new FormData();
      formData.append('studentId', leaderId);
      if (convertedPdfUrl) {
        formData.append('advisor_request', convertedPdfUrl);
      } else if (guidanceFile) {
        formData.append('advisor_request', guidanceFile);
      }
      for (let i = 2; i <= topic.topic_max_members; i++) {
        const memberId = selectedMembers[`member${i}`]?.value;
        if (memberId) {
          formData.append(`member${i}Id`, memberId);
        }
      }
      await axios.post(`/api/topics/${topicId}/register-v2`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Đăng ký đề tài và nộp đơn xin hướng dẫn thành công!');
      navigate('/student'); 
    } catch (error) {
      console.error('Error registering topic:', error);
      if (error.response?.data?.registeredMembers) {
        alert(error.response.data.registeredMembers.join('\n'));
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Có lỗi xảy ra khi đăng ký đề tài.');
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Đang tải thông tin đề tài...</div>;
  }

  if (error) {
     return <div className="p-8 text-center text-red-600">Lỗi: {error}</div>;
  }

  if (!topic) {
    return <div className="p-8 text-center">Không tìm thấy đề tài.</div>;
  }

  const studentOptions = students
    .filter(student => {
      if (student._id === user._id || student.user_id === user?.user_id) return false;
      if (studentsWithTopic.includes(student.user_id)) return false;
      const isSelected = Object.values(selectedMembers).some(member => 
        member && (
          member.value === student._id || 
          member.label.includes(student.user_id)
        )
      );
      if (isSelected) return false;
      return true;
    })
    .map(student => ({
      value: student._id,
      label: `${student.user_name} (${student.user_id || 'Chưa có MSSV'})`,
      userId: student.user_id
    }));

  // Kiểm tra xem có thể chọn thành viên thứ i hay không
  const canSelectMember = (memberIndex) => {
    // Thành viên 2 luôn có thể chọn nếu không bị block hoặc là thành viên cũ
    if (memberIndex === 2) return !topic.topic_block || isOldMember;
    // Các thành viên tiếp theo chỉ có thể chọn nếu thành viên trước đó đã được chọn VÀ (không bị block HOẶC là thành viên cũ)
    return selectedMembers[`member${memberIndex - 1}`] !== null && (!topic.topic_block || isOldMember);
  };

  // Xác định sinh viên hiện tại có phải là thành viên cũ không
  const isOldMember = topic.topic_group_student?.some(
    s => s._id === user._id || s.user_id === user.user_id
  );

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Ghi Danh Đề Tài</h1>
      
      {/* Thông tin đề tài */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6 border-l-4 border-[#008bc3] pl-3">THÔNG TIN ĐỀ TÀI</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
             <div>
               <label className="block text-sm font-medium text-gray-500 mb-1">Tên đề tài</label>
               <p className="text-lg text-gray-900 font-semibold flex items-start">
                 <FaBook className="text-[#008bc3] mr-2 mt-1 flex-shrink-0" />
              <span>{topic.topic_title}</span>
               </p>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-500 mb-1">Giảng viên hướng dẫn</label>
               <p className="text-md text-gray-800 flex items-center">
                  <FaUserGraduate className="text-[#008bc3] mr-2 flex-shrink-0" /> 
              {topic.topic_instructor?.name || topic.topic_instructor || 'Chưa có giảng viên'}
                </p>
             </div>
              <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Số lượng thành viên tối đa</label>
               <p className="text-md text-gray-800 flex items-center">
              <FaUsers className="text-[#008bc3] mr-2 flex-shrink-0" />
              {topic.topic_max_members} thành viên
                </p>
             </div>
              <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Số thành viên hiện tại</label>
               <p className="text-md text-gray-800 flex items-center">
                  <FaUsers className="text-[#008bc3] mr-2 flex-shrink-0" />
              {topic.topic_group_student?.length || 0} / {topic.topic_max_members}
                </p>
             </div>
           </div>

        {/* Chi tiết đề tài */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Mô tả đề tài</label>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700 text-sm space-y-2 whitespace-pre-line h-40 overflow-y-auto">
            {topic.topic_description}
      </div>
      </div>

        {/* Form đăng ký */}
        <form onSubmit={handleRegisterSubmit} className="mt-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Đăng ký thành viên nhóm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sinh viên 1 (người đăng ký) */}
           <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Sinh viên 1 (Trưởng nhóm)
                </label>
             <input
               type="text"
                  value={`${user?.user_name || ''} (${user?.user_id || ''})`}
               disabled
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
             />
           </div>
           
              {/* Các thành viên còn lại */}
              {topic.topic_max_members > 1 && Array.from({ length: topic.topic_max_members - 1 }, (_, idx) => {
                const memberIndex = idx + 2;
                return (
                  <div key={memberIndex}>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Sinh viên {memberIndex}
                    </label>
                    <Select
                      options={studentOptions}
                      value={selectedMembers[`member${memberIndex}`]}
                      onChange={(option) => handleMemberChange(option, `member${memberIndex}`)}
                      isDisabled={topic.topic_block || !canSelectMember(memberIndex)}
                      placeholder={canSelectMember(memberIndex) 
                        ? "Chọn sinh viên..." 
                        : "Vui lòng chọn thành viên trước"}
                      noOptionsMessage={() => "Không tìm thấy sinh viên phù hợp"}
                      className="basic-single-select"
                      classNamePrefix="select"
                      maxMenuHeight={200}
                      isOptionDisabled={(option) => {
                        const isSelected = Object.values(selectedMembers).some(member => 
                          member && (
                            member.value === option.value ||
                            member.userId === option.userId
                          )
                        );
                        return isSelected;
                      }}
                    />
                  </div>
                );
              })}
               </div>
         </div>
         
          {/* Form nộp đơn xin hướng dẫn */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Đơn xin hướng dẫn</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  File đính kèm 
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    onChange={handleGuidanceFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <FaFileUpload className="mr-2 h-5 w-5 text-gray-400" />
                    Chọn file
                  </label>
                  {guidanceFile && !convertedPdfUrl && (
                    <span className="text-green-700 text-sm">{guidanceFile.name}</span>
                  )}
                  {docFile && !convertedPdfUrl && (
                    <button
                      type="button"
                      className={`px-4 py-2 rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isUploading}
                      onClick={handleUploadAdvisorRequest}
                    >
                      {isUploading ? 'Đang tải...' : 'Tải lên'}
                    </button>
                  )}
                  {convertedPdfUrl && (
                    <span className="text-green-700 text-sm">{convertedPdfName}</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Hỗ trợ các định dạng: PDF, DOC, DOCX
                </p>
              </div>
            </div>
          </div>
         
          <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
              className={`inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors ${
                topic.topic_block && !isOldMember || isBlocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
              disabled={topic.topic_block && !isOldMember || isBlocked}
              >
                <FaCheckCircle className="-ml-1 mr-2 h-5 w-5" />
                {(topic.topic_block && !isOldMember) ? 'Đề tài đã bị khóa' : isBlocked ? 'Bạn đã có đề tài đang thực hiện hoặc chờ duyệt' : 'Xác nhận đăng ký'}
              </button>
          </div>
          {topic.topic_block && !isOldMember && (
            <p className="text-right text-sm text-red-600 mt-2">
              {topic.topic_group_student?.length >= topic.topic_max_members
                ? 'Đề tài này đã đủ số lượng sinh viên đăng ký.'
                : 'Đề tài này đã bị khóa và không thể đăng ký.'}
            </p>
          )} 
      </form>
      </div>
    </div>
  );
};

export default TopicRegistration; 