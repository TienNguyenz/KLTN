import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBook, FaUserGraduate, FaUsers, FaTag, FaInfoCircle, FaCheckCircle, FaSearch } from 'react-icons/fa';
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

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/topics/${topicId}`);
        console.log('API /api/topics/:id response:', response.data);
        if (response.data && response.data.data) {
          setTopic(response.data.data);
        } else if (response.data) {
          setTopic(response.data);
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
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchTopic();
    if (facultyId) fetchStudents();
  }, [topicId, user?.user_id, facultyId]);

  const handleMemberChange = (selectedOption, memberType) => {
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
      const registrationData = {
        studentId: leaderId,
      };
      for (let i = 2; i <= topic.topic_max_members; i++) {
        const memberId = selectedMembers[`member${i}`]?.value;
        if (memberId) {
          registrationData[`member${i}Id`] = memberId;
        }
      }
      await axios.post(`/api/topics/${topicId}/register`, registrationData);
      alert('Đăng ký đề tài thành công!');
      navigate('/student');
    } catch (error) {
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
      // Không hiển thị trưởng nhóm (user hiện tại) trong dropdown
      if (student._id === user._id || student.user_id === user?.user_id) return false;
      // ...các filter khác
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
    // Thành viên 2 luôn có thể chọn
    if (memberIndex === 2) return true;
    // Các thành viên tiếp theo chỉ có thể chọn nếu thành viên trước đó đã được chọn
    return selectedMembers[`member${memberIndex - 1}`] !== null;
  };

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
              {topic.topic_instructor?.user_name}
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
                      Sinh viên {memberIndex} {memberIndex === 2 ? '(Chọn ít nhất 1 thành viên)' : ''}
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
         
          <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
              className={`inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors ${
                topic.topic_block
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
              disabled={topic.topic_block}
              >
                <FaCheckCircle className="-ml-1 mr-2 h-5 w-5" />
              {topic.topic_block ? 'Đề tài đã bị khóa' : 'Xác nhận đăng ký'}
              </button>
          </div>
          {topic.topic_block && (
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