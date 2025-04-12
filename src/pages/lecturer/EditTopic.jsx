import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTopicById } from '../../data/mockThesisData'; // Import hàm lấy chi tiết đề tài
import { FaPlus, FaMinus, FaUserPlus, FaSave, FaTrash, FaPaperPlane } from 'react-icons/fa';

const EditTopic = () => {
  const navigate = useNavigate();
  const { topicId } = useParams(); // Lấy topicId từ URL

  const [topicName, setTopicName] = useState('');
  const [semester, setSemester] = useState('');
  const [topicType, setTopicType] = useState('');
  const [studentCount, setStudentCount] = useState(1);
  const [description, setDescription] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch topic data on component mount
  useEffect(() => {
    const fetchTopic = async () => {
      setIsLoading(true);
      setError('');
      try {
        const topicData = await getTopicById(topicId);
        if (topicData) {
          setTopicName(topicData.name);
          setSemester(topicData.semester || ''); // Handle cases where semester might be missing
          setTopicType(topicData.type || '');
          setStudentCount(topicData.maxStudents || topicData.studentCount || 1); // Use maxStudents or studentCount
          setDescription(topicData.description || '');
          // setSelectedStudents(topicData.students || []); // Assuming students are part of data
        } else {
          setError('Không tìm thấy đề tài.');
        }
      } catch (err) {
        console.error("Error fetching topic:", err);
        setError('Lỗi khi tải dữ liệu đề tài.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  const handleStudentCountChange = (increment) => {
    setStudentCount(prev => Math.max(1, prev + increment));
  };

  const handleSelectStudents = () => {
    alert('Chức năng chọn sinh viên đang được phát triển!');
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!topicName || !semester || !topicType || !description) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    const updatedTopicData = {
      id: parseInt(topicId, 10),
      name: topicName,
      semester,
      type: topicType,
      maxStudents: studentCount,
      description,
      selectedStudents,
      // Include other fields as needed for update API
    };
    console.log('Updating topic:', updatedTopicData);
    alert('Đã cập nhật đề tài thành công (giả lập)!');
    // Logic gọi API cập nhật
    navigate('/lecturer/topics');
  };

  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đề tài "${topicName}"?`)) {
        console.log('Deleting topic:', topicId);
        alert('Đã xóa đề tài thành công (giả lập)!');
        // Logic gọi API xóa
        navigate('/lecturer/topics');
    }
  };

  const handleSubmitRegistration = () => {
      alert('Chức năng gửi đăng ký/duyệt đề tài đang phát triển!');
      // Logic gọi API để thay đổi status hoặc gửi đi duyệt
  };

  if (isLoading) {
    return <div className="p-8">Đang tải chi tiết đề tài...</div>;
  }

  if (error) {
     return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 md:p-8 bg-gray-100 min-h-full">
      {/* Tiêu đề có thể thay đổi */} 
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Chi Tiết Đề Tài</h1>

      <form onSubmit={handleUpdate} className="bg-white p-6 md:p-8 rounded-lg shadow-md space-y-6">
        
        {/* Form fields are similar to AddTopic */}
        {/* Row 1: Semester and Topic Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Chọn học kỳ</label>
            <select 
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="">Vui lòng chọn</option>
              <option value="HK1_2023_2024">HK1 - 2023-2024</option>
              <option value="HK2_2023_2024">HK2 - 2023-2024</option>
              <option value="HK3_2023_2024">HK3 - 2023-2024</option>
            </select>
          </div>
          <div className="md:col-span-1"> {/* Adjust column span */} 
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
              <option value="KLTN">Khóa luận tốt nghiệp</option>
              <option value="TTTN">Thực tập tốt nghiệp</option>
              <option value="NNCKH">Nghiên cứu khoa học</option>
            </select>
          </div>
        </div>

        {/* Row 2: Student Count, Select Button, Selected List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
           <div>
             <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700 mb-1">Số lượng thực hiện</label>
             <div className="flex items-center mt-1">
                 {/* Buttons and input for count */}
                 <button type="button" onClick={() => handleStudentCountChange(-1)} disabled={studentCount <= 1} className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"><FaMinus className="h-4 w-4" /></button>
                 <input type="number" id="studentCount" value={studentCount} readOnly className="w-16 text-center border-t border-b border-gray-300 py-2 focus:outline-none focus:ring-0 sm:text-sm"/>
                 <button type="button" onClick={() => handleStudentCountChange(1)} className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"><FaPlus className="h-4 w-4" /></button>
             </div>
           </div>
            <div>
                 <button type="button" onClick={handleSelectStudents} className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                     <FaUserPlus className="mr-2 -ml-1 h-5 w-5" />Chọn sinh viên
                 </button>
            </div>
             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Danh sách sinh viên được chọn</label>
                 <div className="mt-1 p-3 h-16 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500 overflow-y-auto">
                    {selectedStudents.length === 0 ? 'Chưa chọn sinh viên nào' : selectedStudents.map(student => <div key={student.id}>{student.name}</div>)}
                 </div>
             </div>
        </div>

        {/* Row 3: Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả đề tài</label>
          <textarea 
            id="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Mô tả chi tiết đề tài này..."
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        {/* Row 4: Action Buttons */} 
        <div className="flex flex-col md:flex-row justify-end items-center pt-4 space-y-3 md:space-y-0 md:space-x-3">
              {/* Nút cập nhật đã có trong form submit */}
              {/* <button 
              type="submit" // This button now submits the form
              className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              > 
                  <FaSave className="mr-2 -ml-1 h-5 w-5" />
                  Cập nhật đề tài 
              </button> */}
              <div className="w-full md:w-auto flex justify-end space-x-3">
                  <button 
                      type="button"
                      onClick={handleDelete}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                      <FaTrash className="mr-2 -ml-1 h-4 w-4" />
                      Xóa
                  </button>
                  <button 
                      type="button"
                      onClick={handleSubmitRegistration}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                      <FaPaperPlane className="mr-2 -ml-1 h-4 w-4" />
                      Gửi đăng ký
                  </button>
                  <button 
                      type="submit" // Nút này sẽ trigger handleUpdate
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                      <FaSave className="mr-2 -ml-1 h-4 w-4" />
                      Cập nhật đề tài
                  </button>
              </div>
        </div>

      </form>
    </div>
  );
};

export default EditTopic; 