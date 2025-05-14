import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus, FaUserPlus, FaSave } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AddTopic = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topicName, setTopicName] = useState('');
  const [semester, setSemester] = useState('');
  const [topicType, setTopicType] = useState('');
  const [studentCount, setStudentCount] = useState(1);
  const [description, setDescription] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [topicTypes, setTopicTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [semestersRes, typesRes, studentsRes] = await Promise.all([
          axios.get('/api/semesters'),
          axios.get('/api/topics/topic-types'),
          axios.get('/api/students')
        ]);
        setSemesters(semestersRes.data);
        setTopicTypes(typesRes.data);
        setStudents(studentsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Adjust selected students if studentCount changes
  useEffect(() => {
    if (selectedStudents.length > studentCount) {
      setSelectedStudents(selectedStudents.slice(0, studentCount));
    }
  }, [studentCount]);

  const handleStudentCountChange = (increment) => {
    setStudentCount(prev => Math.max(1, prev + increment));
  };

  const handleSelectStudents = () => {
    setShowStudentModal(true);
  };

  const handleStudentCheckbox = (student) => {
    const exists = selectedStudents.find(s => s._id === student._id);
    if (exists) {
      setSelectedStudents(selectedStudents.filter(s => s._id !== student._id));
    } else if (selectedStudents.length < studentCount) {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const handleCloseStudentModal = () => {
    setShowStudentModal(false);
  };

  const checkStudentsRegistration = async () => {
    try {
      // Kiểm tra từng sinh viên xem đã đăng ký đề tài nào chưa
      const studentChecks = await Promise.all(
        selectedStudents.map(async (student) => {
          const response = await axios.get(`/api/topics/student/${student.user_id}`);
          return {
            student,
            hasTopic: response.data !== null
          };
        })
      );

      // Lọc ra những sinh viên đã đăng ký đề tài
      const registeredStudents = studentChecks.filter(check => check.hasTopic);
      
      if (registeredStudents.length > 0) {
        const studentList = registeredStudents
          .map(s => `${s.student.user_name} (${s.student.user_id})`)
          .join('\n');
        alert(`Các sinh viên sau đã đăng ký đề tài khác:\n${studentList}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking student registration:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra thông tin cơ bản
    if (!topicName || !semester || !topicType || !description) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    const lecturerId = user?._id || user?.id;
    if (!lecturerId) {
      alert('Không xác định được thông tin giảng viên.');
      return;
    }

    if (!user?.user_major) {
      alert('Không xác định được chuyên ngành của giảng viên.');
      return;
    }

    // Không bắt buộc phải chọn sinh viên
    // Nếu có chọn sinh viên thì kiểm tra số lượng và đã đăng ký đề tài khác chưa
    if (selectedStudents.length > 0) {
      if (selectedStudents.length !== studentCount) {
        alert('Vui lòng chọn đủ số lượng sinh viên.');
        return;
      }
      const canProceed = await checkStudentsRegistration();
      if (!canProceed) {
        return;
      }
    }

    try {
      const payload = {
        topic_title: topicName,
        topic_instructor: lecturerId,
        topic_major: user.user_major,
        topic_category: topicType,
        topic_description: description,
        topic_max_members: studentCount,
        topic_group_student: selectedStudents.map(s => s._id),
        topic_creator: lecturerId,
        topic_registration_period: semester,
        topic_teacher_status: "approved"
      };

      await axios.post('/api/topics/propose', payload);
      alert('Đã tạo đề tài thành công! Đề tài sẽ hiển thị khi được admin duyệt.');
      navigate('/lecturer/topics');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Có lỗi xảy ra khi tạo đề tài.');
      }
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-100 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Thêm Đề Tài Mới</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-md space-y-6">
        {/* Row 1: Semester and Topic Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Học kỳ</label>
            <select 
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="">Vui lòng chọn</option>
              {semesters.map(s => (
                <option key={s._id} value={s._id}>{s.semester}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="topicType" className="block text-sm font-medium text-gray-700 mb-1">Loại đề tài</label>
            <select 
              id="topicType"
              value={topicType}
              onChange={(e) => setTopicType(e.target.value)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="">Vui lòng chọn</option>
              {topicTypes.map(t => (
                <option key={t._id} value={t._id}>{t.topic_category_title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Topic Name */}
        <div>
          <label htmlFor="topicName" className="block text-sm font-medium text-gray-700 mb-1">Tên đề tài</label>
          <input 
            type="text"
            id="topicName"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            required
            placeholder="Nhập tên đề tài"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Row 3: Student Count and Select Button */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
           <div>
             <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700 mb-1">Số lượng sinh viên thực hiện</label>
             <div className="flex items-center mt-1">
                <button 
                  type="button" 
                  onClick={() => handleStudentCountChange(-1)} 
                  className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={studentCount <= 1}
                >
                    <FaMinus className="h-4 w-4" />
                </button>
                <input 
                    type="number" 
                    id="studentCount" 
                    value={studentCount} 
                readOnly
                    className="w-16 text-center border-t border-b border-gray-300 py-2 focus:outline-none focus:ring-0 sm:text-sm"
                />
                 <button 
                  type="button" 
                  onClick={() => handleStudentCountChange(1)} 
                  className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <FaPlus className="h-4 w-4" />
                </button>
             </div>
           </div>
            <div>
                 <button 
                  type="button" 
                  onClick={handleSelectStudents} 
                  className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <FaUserPlus className="mr-2 -ml-1 h-5 w-5" />
                    Chọn sinh viên
                </button>
            </div>
        </div>

         {/* Row 4: Selected Students List */}
         <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Danh sách sinh viên được chọn</label>
             <div className="mt-1 p-3 h-24 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500 overflow-y-auto">
                 {selectedStudents.length === 0 ? 'Chưa chọn sinh viên nào' : (
              selectedStudents.map(student => <div key={student._id}>{student.user_name} ({student.user_id})</div>) 
                 )}
             </div>
         </div>

        {/* Row 5: Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết đề tài</label>
          <textarea 
            id="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Nhập mô tả chi tiết về đề tài..."
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        {/* Row 6: Submit Button */}
        <div className="flex justify-end pt-4">
             <button 
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <FaSave className="mr-2 -ml-1 h-5 w-5" />
                Tạo đề tài
            </button>
        </div>
      </form>

      {/* Student Selection Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Chọn sinh viên ({selectedStudents.length}/{studentCount})</h2>
            <div className="max-h-64 overflow-y-auto mb-4">
              {students.map(student => (
                <div key={student._id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={!!selectedStudents.find(s => s._id === student._id)}
                    disabled={
                      !selectedStudents.find(s => s._id === student._id) && selectedStudents.length >= studentCount
                    }
                    onChange={() => handleStudentCheckbox(student)}
                    className="mr-2"
                  />
                  <span>{student.user_name} ({student.user_id})</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseStudentModal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTopic; 