import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus, FaUserPlus, FaSave } from 'react-icons/fa';

const AddTopic = () => {
  const navigate = useNavigate();
  const [topicName, setTopicName] = useState('');
  const [semester, setSemester] = useState('');
  const [topicType, setTopicType] = useState('');
  const [studentCount, setStudentCount] = useState(1);
  const [description, setDescription] = useState('');
  // Placeholder for selected students
  const [selectedStudents, setSelectedStudents] = useState([]);

  const handleStudentCountChange = (increment) => {
    setStudentCount(prev => Math.max(1, prev + increment)); // Ensure count is at least 1
  };

  const handleSelectStudents = () => {
    alert('Chức năng chọn sinh viên đang được phát triển!');
    // Logic để mở modal/popup chọn sinh viên sẽ được thêm sau
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation (can be improved)
    if (!topicName || !semester || !topicType || !description) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const newTopicData = {
      name: topicName,
      semester,
      type: topicType,
      maxStudents: studentCount,
      description,
      selectedStudents, // Include selected students if needed
      // Add lecturer ID/info automatically here based on logged-in user
      lecturerStatus: 'READY', // Default status
      adminStatus: 'PENDING',   // Default status
    };

    console.log('Submitting new topic:', newTopicData);
    alert('Đã tạo đề tài thành công (giả lập)! Chuyển về trang quản lý.');
    // Logic gọi API để lưu đề tài sẽ được thêm sau
    // Ví dụ: createTopicAPI(newTopicData).then(() => navigate('/lecturer/topics'));
    navigate('/lecturer/topics'); // Redirect back to the list
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
              <option value="HK1_2023_2024">HK1 - 2023-2024</option>
              <option value="HK2_2023_2024">HK2 - 2023-2024</option>
              <option value="HK3_2023_2024">HK3 - 2023-2024</option>
              {/* Thêm các học kỳ khác */}
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
              <option value="KLTN">Khóa luận tốt nghiệp</option>
              <option value="TTTN">Thực tập tốt nghiệp</option>
              <option value="NNCKH">Nghiên cứu khoa học</option>
              {/* Thêm các loại khác */}
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
                    readOnly // Make it read-only, controlled by buttons
                    className="w-16 text-center border-t border-b border-gray-300 py-2 focus:outline-none focus:ring-0 sm:text-sm"
                />
                 <button 
                  type="button" 
                  onClick={() => handleStudentCountChange(1)} 
                  className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  // Add max limit if needed
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
                     // Render list of selected students here later
                     selectedStudents.map(student => <div key={student.id}>{student.name}</div>) 
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
    </div>
  );
};

export default AddTopic; 