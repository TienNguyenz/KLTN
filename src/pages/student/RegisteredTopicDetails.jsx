import React, { useEffect, useState } from 'react';
import { FaBook, FaUserGraduate, FaUsers, FaInfoCircle, FaEye, FaCheckCircle, FaTimesCircle, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';

const RegisteredTopicDetails = ({ topic, onCancel, onViewGrades, onViewCommittee }) => {
  const statusMap = {
    approved: 'Đã duyệt',
    pending: 'Chờ duyệt',
    rejected: 'Từ chối'
  };

  // Lấy userId từ localStorage hoặc context
  const user = JSON.parse(localStorage.getItem('user'));

  // State để lưu file đã chọn
  const [outlineFile, setOutlineFile] = useState(null);
  const [finalFile, setFinalFile] = useState(null);

  const handleOutlineFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.docx')) {
        // TODO: Chuyển đổi .docx sang .pdf (có thể dùng thư viện như docx2pdf hoặc gọi API)
        alert('File .docx sẽ được chuyển sang .pdf. Chức năng đang được phát triển.');
      }
      setOutlineFile(file);
    }
  };

  const handleFinalFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.docx')) {
        // TODO: Chuyển đổi .docx sang .pdf (có thể dùng thư viện như docx2pdf hoặc gọi API)
        alert('File .docx sẽ được chuyển sang .pdf. Chức năng đang được phát triển.');
      }
      setFinalFile(file);
    }
  };

  const handleUploadOutline = () => {
    if (outlineFile) {
      // TODO: Gọi API để upload file outlineFile
      alert('Upload Đề cương thành công!');
    } else {
      alert('Vui lòng chọn file Đề cương.');
    }
  };

  const handleUploadFinal = () => {
    if (finalFile) {
      // TODO: Gọi API để upload file finalFile
      alert('Upload Báo cáo cuối cùng thành công!');
    } else {
      alert('Vui lòng chọn file Báo cáo cuối cùng.');
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký đề tài này?')) return;
    try {
      const res = await fetch(`/api/topics/${topic._id}/cancel-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.user_id })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Hủy đăng ký đề tài thành công!');
        window.location.reload();
      } else {
        alert(data.message || 'Có lỗi xảy ra khi hủy đăng ký!');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi hủy đăng ký!');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-start mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 flex-1">Thông Tin Đề Tài Đã Đăng Ký</h2>
        {topic.topic_teacher_status === 'approved' && topic.topic_leader_status === 'approved' ? (
          <div className="flex flex-row gap-2 justify-end items-center w-full max-w-xs">
            <button 
              onClick={onViewGrades}
              className="flex items-center bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded transition-colors duration-300 border border-green-300"
              style={{ minWidth: 100, justifyContent: 'center' }}
            >
              <FaEye className="mr-2" /> Xem điểm
            </button>
          </div>
        ) : (
          <button 
            onClick={handleCancelRegistration}
            className="flex items-center bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-medium px-4 py-2 rounded transition-colors duration-300 border border-orange-300"
            style={{ minWidth: 120, justifyContent: 'center' }}
          >
            <FaTimesCircle className="mr-2" /> Hủy đăng ký
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Tên đề tài</label>
          <p className="text-lg text-gray-900 font-semibold flex items-start">
            <FaBook className="text-[#008bc3] mr-2 mt-1 flex-shrink-0" />
            <span className="underline text-blue-700 cursor-pointer hover:text-blue-900">{topic.topic_title}</span>
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Giảng viên hướng dẫn</label>
          <p className="text-md text-gray-800 flex items-center">
            <FaUserGraduate className="text-[#008bc3] mr-2 flex-shrink-0" />
            {topic.topic_instructor?.user_name || 'Chưa có giảng viên'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Chuyên ngành</label>
          <p className="text-md text-gray-800 flex items-center">
            {topic.topic_major?.major_title || '---'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Loại đề tài</label>
          <p className="text-md text-gray-800 flex items-center">
            {topic.topic_category?.topic_category_title || '---'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Số lượng thành viên thực hiện</label>
          <p className="text-md text-gray-800 flex items-center">
            {topic.topic_group_student?.length || 0}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái đề tài</label>
          <p className="text-md text-gray-800 flex items-center">
            <FaCheckCircle className="text-[#008bc3] mr-2 flex-shrink-0" />
            {statusMap[topic.topic_teacher_status] || topic.topic_teacher_status}
          </p>
        </div>
      </div>
      {/* Chi tiết đề tài */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">Chi tiết đề tài</label>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700 text-sm space-y-2 whitespace-pre-line h-40 overflow-y-auto">
          {topic.topic_description}
        </div>
      </div>
      {/* Nhóm đăng ký */}
      <div className="mt-8">
        <h3 className="text-md font-semibold text-gray-700 mb-2">NHÓM 1</h3>
        <div className="bg-white border border-blue-200 rounded-lg p-4 mb-2">
          <div className="mb-2 text-gray-600">Số lượng: {topic.topic_max_members}</div>
          <ul className="space-y-1">
            {Array.isArray(topic.topic_group_student) && topic.topic_group_student.length > 0 ? (
              topic.topic_group_student.map((m, idx) => (
                <li key={m.user_id || idx} className="flex items-center gap-2">
                  <FaUserGraduate className="text-[#008bc3]" />
                  <span>{m.user_name}</span>
                  <span className="text-gray-500 ml-2">{m.user_id}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">Chưa có thành viên nhóm.</li>
            )}
          </ul>
        </div>
      </div>
      {/* Tài liệu quan trọng */}
      <div className="mt-8">
        <h3 className="text-md font-semibold text-gray-700 mb-2">Tài liệu quan trọng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Đề cương (Outline) */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex flex-col items-center">
            <span className="font-medium mb-2 text-blue-700 flex items-center gap-2">
              <FaFileAlt className="text-xl" /> Đề cương (Outline)
            </span>
            {topic.outlineFile ? (
              <a
                href={topic.outlineFile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline mb-2 hover:text-green-900"
              >
                {topic.outlineFile.split('/').pop()}
              </a>
            ) : (
              <span className="text-red-500 mb-2">Chưa có file.</span>
            )}
            <div className="flex gap-2 mt-2">
              <input
                type="file"
                id="outline-upload"
                className="hidden"
                onChange={handleOutlineFileChange}
              />
              <label htmlFor="outline-upload">
                <button
                  className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors"
                  type="button"
                >
                  Chọn file
                </button>
              </label>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                type="button"
                onClick={handleUploadOutline}
              >
                Tải lên
              </button>
            </div>
            {outlineFile && <span className="text-sm text-gray-600 mt-1">{outlineFile.name}</span>}
          </div>
          {/* Báo cáo cuối cùng */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex flex-col items-center">
            <span className="font-medium mb-2 text-blue-700 flex items-center gap-2">
              <FaFileAlt className="text-xl" /> Báo cáo cuối cùng
            </span>
            {topic.finalReportFile ? (
              <a
                href={topic.finalReportFile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline mb-2 hover:text-green-900"
              >
                {topic.finalReportFile.split('/').pop()}
              </a>
            ) : (
              <span className="text-red-500 mb-2">Chưa có file.</span>
            )}
            <div className="flex gap-2 mt-2">
              <input
                type="file"
                id="final-upload"
                className="hidden"
                onChange={handleFinalFileChange}
                disabled={topic.topic_teacher_status === 'pending' || topic.topic_leader_status === 'pending'}
              />
              <label htmlFor="final-upload">
                <button
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    topic.topic_teacher_status === 'pending' || topic.topic_leader_status === 'pending'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  type="button"
                  disabled={topic.topic_teacher_status === 'pending' || topic.topic_leader_status === 'pending'}
                >
                  Chọn file
                </button>
              </label>
              <button
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  topic.topic_teacher_status === 'pending' || topic.topic_leader_status === 'pending'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                type="button"
                onClick={handleUploadFinal}
                disabled={topic.topic_teacher_status === 'pending' || topic.topic_leader_status === 'pending'}
              >
                Tải lên
              </button>
            </div>
            {finalFile && <span className="text-sm text-gray-600 mt-1">{finalFile.name}</span>}
          </div>
        </div>
      </div>
      {/* Giảng viên phản biện */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold text-gray-700">Giảng viên phản biện</h3>
          {topic.topic_teacher_status === 'approved' && topic.topic_leader_status === 'approved' && (
            <button 
              onClick={onViewGrades}
              className="flex items-center bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded transition-colors duration-300 border border-green-300"
              style={{ minWidth: 100, justifyContent: 'center' }}
            >
              <FaEye className="mr-2" /> Xem điểm
            </button>
          )}
        </div>
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <span className="text-gray-400 italic">Chưa có thông tin giảng viên phản biện.</span>
        </div>
      </div>
      {/* Hội đồng phản biện */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold text-gray-700">Hội đồng phản biện</h3>
          {topic.topic_teacher_status === 'approved' && topic.topic_leader_status === 'approved' && (
            <button 
              onClick={onViewCommittee}
              className="flex items-center bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded transition-colors duration-300 border border-green-300"
              style={{ minWidth: 140, justifyContent: 'center' }}
            >
              <FaInfoCircle className="mr-2" /> Thông tin hội đồng
            </button>
          )}
        </div>
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <span className="text-gray-400 italic">Chưa có thông tin hội đồng phản biện.</span>
        </div>
      </div>
    </div>
  );
};

export default RegisteredTopicDetails; 