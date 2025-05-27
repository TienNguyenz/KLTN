import React, { useState, useEffect } from 'react';
import { FaBook, FaUserGraduate, FaUsers, FaInfoCircle, FaEye, FaCheckCircle, FaTimesCircle, FaFileAlt, FaFilePdf, FaTimes, FaUserTie, FaUserEdit, FaFileUpload } from 'react-icons/fa';
import axios from 'axios';

const RegisteredTopicDetails = ({ topic, onViewGrades }) => {
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
  const [isUploadingOutline, setIsUploadingOutline] = useState(false);
  const [isUploadingFinal, setIsUploadingFinal] = useState(false);
  const [modalUpload, setModalUpload] = useState({ open: false, type: '', message: '' });
  const [modalConfirm, setModalConfirm] = useState({ open: false });
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);
  const [lecturersList, setLecturersList] = useState([]);
  const [majorsList, setMajorsList] = useState([]);
  const [assembliesList, setAssembliesList] = useState([]);
  const [outlineOriginalName, setOutlineOriginalName] = useState('');

  // Kiểm tra xem user hiện tại có phải là trưởng nhóm không (so sánh user_id)
  const leaderId = topic.topic_group_student && topic.topic_group_student.length > 0
    ? topic.topic_group_student[0].user_id
    : null;
  const isLeader = leaderId === user.user_id;

  const handleOutlineFileChange = (e) => setOutlineFile(e.target.files[0] || null);
  const handleFinalFileChange = (e) => setFinalFile(e.target.files[0] || null);

  const handleUpload = async (type) => {
    let file, label;
    if (type === 'defense_request') {
      file = outlineFile;
      label = 'Đề cương';
    } else {
      file = finalFile;
      label = 'Báo cáo cuối cùng';
    }
    if (!file) {
      setModalUpload({ open: true, type: 'error', message: `Vui lòng chọn file ${label}.` });
      return;
    }
    // Kiểm tra đuôi file để xác định có phải Word không
    const isWord = file.name.endsWith('.doc') || file.name.endsWith('.docx');
    if (type === 'defense_request') setIsUploadingOutline(true);
    else setIsUploadingFinal(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      let uploadUrl = '';
      if (type === 'defense_request') uploadUrl = `/api/topics/${topic._id}/upload-defense-request`;
      else uploadUrl = `/api/topics/${topic._id}/upload-final`;
      // Hiện overlay chỉ khi là file Word
      if (isWord) {
        if (type === 'defense_request') setIsUploadingOutline(true);
        else setIsUploadingFinal(true);
      }
      const res = await axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Lưu lại tên file gốc vừa upload
      if (type === 'defense_request') setOutlineOriginalName(res.data.originalName || file.name);
      setModalUpload({ open: true, type: 'success', message: `Upload ${label} thành công!` });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setModalUpload({ open: true, type: 'error', message: `Upload ${label} thất bại!\n${err?.response?.data?.message || err.message}` });
      setTimeout(() => window.location.reload(), 2500);
    } finally {
      if (type === 'defense_request') setIsUploadingOutline(false);
      else setIsUploadingFinal(false);
    }
  };

  const handleCancelRegistration = () => {
    if (!isLeader) {
      setModalUpload({ open: true, type: 'error', message: 'Chỉ trưởng nhóm mới có quyền hủy đề tài.' });
      return;
    }
    setModalConfirm({ open: true });
  };

  const doCancelRegistration = async () => {
    setModalConfirm({ open: false });
    try {
      const res = await fetch(`/api/topics/${topic._id}/cancel-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: topic.topic_group_student[0]._id })
      });
      const data = await res.json();
      if (res.ok) {
        setModalUpload({ open: true, type: 'success', message: 'Hủy đăng ký đề tài thành công!' });
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setModalUpload({ open: true, type: 'error', message: data.message || 'Có lỗi xảy ra khi hủy đăng ký!' });
      }
    } catch {
      setModalUpload({ open: true, type: 'error', message: 'Có lỗi xảy ra khi hủy đăng ký!' });
    }
  };

  // ======= UTILS =======
  const getNameById = (list, id, field = 'user_name') => {
    if (!id) return '---';
    const found = list.find(item => String(item._id) === String(id));
    return found ? found[field] || found.user_name || found.major_title || found.major_name : id;
  };

  // ======= DATA FETCHING =======
  useEffect(() => {
    if (!isCommitteeModalOpen) return;
    const fetchAll = async () => {
      try {
        const [lecturersRes, majorsRes, assembliesRes] = await Promise.all([
          fetch('/api/lecturers').then(r => r.json()),
          fetch('/api/majors').then(r => r.json()),
          fetch('/api/database/collections/assemblies').then(r => r.json())
        ]);
        setLecturersList(lecturersRes.data || lecturersRes);
        setMajorsList(majorsRes.data || majorsRes);
        setAssembliesList(assembliesRes.data || assembliesRes);
      } catch {}
    };
    fetchAll();
  }, [isCommitteeModalOpen]);

  // ======= ASSEMBLY OBJECT RESOLVER =======
  const resolveAssembly = () => {
    if (!topic.topic_assembly) return null;
    if (typeof topic.topic_assembly === 'object' && topic.topic_assembly.assembly_name) {
      const found = assembliesList.find(a => String(a._id) === String(topic.topic_assembly._id));
      return found || topic.topic_assembly;
    }
    return assembliesList.find(a => String(a._id) === String(topic.topic_assembly));
  };

  // Xác định trạng thái đề cương
  const isOutlineApproved = topic.topic_defense_request === 'Đã chấp nhận';
  const isOutlineRejected = topic.topic_defense_request?.startsWith('Từ chối:');
  const isOutlinePending = topic.topic_defense_request && !isOutlineApproved && !isOutlineRejected && topic.topic_defense_request.startsWith('http');

  // Xác định trạng thái báo cáo cuối cùng
  const isFinalApproved = topic.topic_final_report === 'Đã chấp nhận';
  const isFinalRejected = topic.topic_final_report?.startsWith('Từ chối:');
  const isFinalPending = topic.topic_final_report && !isFinalApproved && !isFinalRejected && topic.topic_final_report.startsWith('http');

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
      {/* Thanh tiến độ các bước */}
      {topic.topic_teacher_status === 'approved' && (
        <div className="mt-2 mb-8">
          <div className="flex items-center justify-center gap-0 md:gap-8">
            {/* Bước 1: Đơn xin hướng dẫn */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${'approved' === topic.topic_teacher_status ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-200 border-gray-300 text-gray-500'}`}>1</div>
              <span className={`mt-2 text-sm ${'approved' === topic.topic_teacher_status ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>Đơn xin hướng dẫn</span>
            </div>
            {/* Line */}
            <div className={`flex-1 h-1 ${topic.topic_defense_request === 'Đã chấp nhận' ? 'bg-green-500' : 'bg-gray-300'} mx-2 md:mx-4`} style={{ minWidth: 40 }}></div>
            {/* Bước 2: Đề cương */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${topic.topic_defense_request === 'Đã chấp nhận' ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-200 border-gray-300 text-gray-500'}`}>2</div>
              <span className={`mt-2 text-sm ${topic.topic_defense_request === 'Đã chấp nhận' ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>Đề cương</span>
            </div>
            {/* Line */}
            <div className={`flex-1 h-1 ${topic.topic_final_report === 'Đã chấp nhận' ? 'bg-green-500' : 'bg-gray-300'} mx-2 md:mx-4`} style={{ minWidth: 40 }}></div>
            {/* Bước 3: Báo cáo */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${topic.topic_final_report === 'Đã chấp nhận' ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-200 border-gray-300 text-gray-500'}`}>3</div>
              <span className={`mt-2 text-sm ${topic.topic_final_report === 'Đã chấp nhận' ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>Báo cáo</span>
            </div>
          </div>
        </div>
      )}
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
        <h3 className="text-md font-semibold text-gray-700 mb-2">NHÓM </h3>
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
      {topic.topic_teacher_status === 'approved' && (
        <div className="mt-8">
          <h3 className="text-md font-semibold text-gray-700 mb-2">Tài liệu quan trọng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Đề cương (Outline) */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex flex-col items-center">
              <span className="font-medium mb-2 text-blue-700 flex items-center gap-2">
                <FaFilePdf className="text-2xl text-red-600" /> Đề cương
                <a
                  href="/templates/outline_template.docx"
                  download
                  className="ml-2 text-blue-500 hover:text-blue-700 text-base flex items-center"
                  title="Tải file mẫu đề cương"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5V13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2.6a.5.5 0 0 1 1 0V13a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-2.6a.5.5 0 0 1 .5-.5z"/>
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                  </svg>
                  <span className="ml-1 underline">Tải mẫu</span>
                </a>
              </span>
              {/* Trạng thái đề cương */}
              <div className="w-full mb-3">
                {isOutlineApproved && (
                  <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                    <FaCheckCircle className="text-xl" />
                    <span>Đề cương đã được duyệt</span>
                  </div>
                )}
                {isOutlineRejected && (
                  <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                    <FaTimesCircle className="text-xl" />
                    <span>Đề cương bị từ chối: {topic.topic_defense_request.replace('Từ chối:', '')}</span>
                  </div>
                )}
                {isOutlinePending && (
                  <div className="flex items-center justify-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded">
                    <FaInfoCircle className="text-xl" />
                    <span>Đề cương đang chờ duyệt...</span>
                  </div>
                )}
              </div>
              {/* Link file nếu đang chờ duyệt */}
              {isOutlinePending && (
                <a
                  href={topic.topic_defense_request}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-900 flex items-center gap-2 bg-green-50 px-4 py-2 rounded mb-3"
                >
                  <FaFileAlt className="text-xl" />
                  <span className="underline">
                    {outlineOriginalName || topic.topic_defense_request_original_name || (topic.topic_defense_request.split('/').pop() || 'Xem file')}
                  </span>
                </a>
              )}
              {/* Nếu chưa nộp hoặc bị từ chối thì cho phép upload lại */}
              {isLeader && !isOutlineApproved && (!isOutlinePending || isOutlineRejected) && (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="flex gap-2 w-full justify-center">
                    <label className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded text-sm transition-colors cursor-pointer flex items-center gap-2">
                      <FaFileAlt />
                  Chọn file
                <input
                  type="file"
                  className="hidden"
                        accept=".pdf,.doc,.docx"
                  onChange={handleOutlineFileChange}
                />
                </label>
                <button
                      className={`px-4 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                        isUploadingOutline 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                  type="button"
                      onClick={() => handleUpload('defense_request')}
                      disabled={isUploadingOutline}
                >
                      {isUploadingOutline ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <FaFileUpload />
                  Tải lên
                        </>
                      )}
                </button>
              </div>
                  {outlineFile && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                      <FaFileAlt />
                      <span>{outlineFile.name}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 text-center">
                    Hỗ trợ PDF, DOC, DOCX. File Word sẽ tự động chuyển sang PDF khi upload.
                  </p>
                </div>
              )}
            </div>
            {/* Báo cáo cuối cùng */}
            {isOutlineApproved ? (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex flex-col items-center">
              <span className="font-medium mb-2 text-blue-700 flex items-center gap-2">
                <FaFilePdf className="text-2xl text-red-600" /> Báo cáo cuối cùng
              </span>
                {/* Trạng thái báo cáo cuối cùng */}
                <div className="w-full mb-3">
                  {isFinalApproved && (
                    <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                      <FaCheckCircle className="text-xl" />
                      <span>Báo cáo đã được duyệt</span>
                    </div>
                  )}
                  {isFinalRejected && (
                    <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                      <FaTimesCircle className="text-xl" />
                      <span>Báo cáo bị từ chối: {topic.topic_final_report.replace('Từ chối:', '')}</span>
                    </div>
                  )}
                  {isFinalPending && (
                    <div className="flex items-center justify-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded">
                      <FaInfoCircle className="text-xl" />
                      <span>Báo cáo đang chờ duyệt...</span>
                    </div>
                  )}
                </div>
                {/* Link file nếu đang chờ duyệt hoặc đã duyệt */}
                {(isFinalPending || isFinalApproved) && topic.topic_final_report_file && (
                  <a
                    href={topic.topic_final_report_file}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="text-green-700 hover:text-green-900 flex items-center gap-2 bg-green-50 px-4 py-2 rounded mb-3"
                >
                    <FaFileAlt className="text-xl" />
                    <span className="underline">
                      {topic.topic_final_report_original_name || (topic.topic_final_report_file.split('/').pop() || 'Xem file')}
                    </span>
                </a>
                )}
                {/* Nếu chưa nộp hoặc bị từ chối thì cho phép upload lại */}
                {isLeader && (!isFinalApproved && (!isFinalPending || isFinalRejected)) && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="flex gap-2 w-full justify-center">
                      <label className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded text-sm transition-colors cursor-pointer flex items-center gap-2">
                        <FaFileAlt />
                  Chọn file
                <input
                  type="file"
                  className="hidden"
                          accept=".pdf,.doc,.docx"
                  onChange={handleFinalFileChange}
                  />
                </label>
                <button
                        className={`px-4 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                          isUploadingFinal 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  type="button"
                  onClick={() => handleUpload('final')}
                        disabled={isUploadingFinal}
                      >
                        {isUploadingFinal ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Đang tải...
                          </>
                        ) : (
                          <>
                            <FaFileUpload />
                  Tải lên
                          </>
                        )}
                </button>
                    </div>
                    {finalFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                        <FaFileAlt />
                        <span>{finalFile.name}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 text-center">
                      Hỗ trợ PDF, DOC, DOCX. File Word sẽ tự động chuyển sang PDF khi upload.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex flex-col items-center text-gray-500 italic">
                Cần được duyệt đề cương trước khi nộp báo cáo cuối cùng.
            </div>
            )}
          </div>
        </div>
      )}
      {/* Hội đồng phản biện */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold text-gray-700">Hội đồng phản biện</h3>
          {topic.topic_teacher_status === 'approved' && topic.topic_leader_status === 'approved' && (
            <button 
              onClick={() => setIsCommitteeModalOpen(true)}
              className="flex items-center bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded transition-colors duration-300 border border-green-300"
              style={{ minWidth: 140, justifyContent: 'center' }}
            >
              <FaInfoCircle className="mr-2" /> Thông tin hội đồng
            </button>
          )}
        </div>
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          {topic.topic_assembly && topic.topic_assembly.assembly_name ? (
            <span className="text-gray-800 font-semibold">{topic.topic_assembly.assembly_name}</span>
          ) : (
            <span className="text-gray-400 italic">Chưa có thông tin hội đồng phản biện.</span>
          )}
        </div>
      </div>
      {/* Overlay loading khi upload */}
      {(isUploadingOutline && outlineFile && (outlineFile.name.endsWith('.doc') || outlineFile.name.endsWith('.docx'))) || (isUploadingFinal && finalFile && (finalFile.name.endsWith('.doc') || finalFile.name.endsWith('.docx'))) ? (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.3)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:32,borderRadius:12,boxShadow:'0 2px 8px #0002',display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
            <svg className="animate-spin" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" stroke="#008bc3" strokeWidth="4" fill="none" strokeDasharray="80" strokeDashoffset="60"/></svg>
            <div style={{fontWeight:600,color:'#008bc3',fontSize:18}}>Đang chuyển file Word sang PDF, vui lòng chờ...</div>
          </div>
        </div>
      ) : null}
      {/* Modal thông báo upload */}
      {modalUpload.open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center min-w-[320px] max-w-[90vw]">
            <div className={`text-3xl mb-2 ${modalUpload.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{modalUpload.type === 'success' ? '✔️' : '❌'}</div>
            <div className="text-lg font-semibold mb-2 text-center whitespace-pre-line">{modalUpload.message}</div>
            <button
              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => { setModalUpload({ ...modalUpload, open: false }); window.location.reload(); }}
            >Đóng</button>
          </div>
        </div>
      )}
      {modalConfirm.open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center min-w-[320px] max-w-[90vw]">
            <div className="text-3xl mb-2 text-orange-500">⚠️</div>
            <div className="text-lg font-semibold mb-2 text-center">Bạn có chắc chắn muốn hủy đăng ký đề tài này?</div>
            <div className="flex gap-4 mt-2">
              <button className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400" onClick={() => setModalConfirm({ open: false })}>Không</button>
              <button className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={doCancelRegistration}>Có, hủy đề tài</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal thông tin hội đồng */}
      {isCommitteeModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[350px] max-w-[95vw] relative border border-blue-200">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={() => setIsCommitteeModalOpen(false)}><FaTimes size={22} /></button>
            <h2 className="text-2xl font-bold mb-5 text-blue-700 text-center">Thông tin hội đồng</h2>
            {(!lecturersList.length || !majorsList.length || !assembliesList.length) ? (
              <div className="text-center py-8 text-blue-600 font-semibold">Đang tải dữ liệu hội đồng...</div>
            ) : (() => {
              const assembly = resolveAssembly();
              if (!topic.topic_assembly) return <div className="text-gray-500 italic">Không có thông tin hội đồng.</div>;
              if (!assembly) return <div className="text-red-500 italic">Không tìm thấy hội đồng.</div>;
              return (
                <>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="font-semibold text-gray-700 min-w-[120px]">Tên hội đồng:</span>
                    <span className="text-lg text-blue-900 font-bold">{assembly.assembly_name}</span>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="font-semibold text-gray-700 min-w-[120px]">Chuyên ngành:</span>
                    <span>{getNameById(majorsList, assembly.assembly_major, 'major_title')}</span>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <FaUserTie className="text-blue-500" />
                    <span className="font-semibold text-gray-700 min-w-[120px]">Chủ tịch:</span>
                    <span>{getNameById(lecturersList, assembly.chairman)}</span>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <FaUserEdit className="text-green-500" />
                    <span className="font-semibold text-gray-700 min-w-[120px]">Thư ký:</span>
                    <span>{getNameById(lecturersList, assembly.secretary)}</span>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <FaUsers className="text-purple-500" />
                    <span className="font-semibold text-gray-700 min-w-[120px]">Ủy viên:</span>
                    <span>{Array.isArray(assembly.members) && assembly.members.length > 0
                      ? assembly.members.map(id => getNameById(lecturersList, id)).join(', ')
                      : '---'}</span>
                  </div>
                  <hr className="my-4" />
                  <h3 className="font-semibold text-md mb-2 text-blue-700">Phiếu đánh giá</h3>
                  {assembly.rubric && assembly.rubric.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full mb-2 border rounded-lg shadow">
                        <thead>
                          <tr className="bg-blue-50">
                            <th className="border px-2 py-1 text-left">Tiêu chí</th>
                            <th className="border px-2 py-1 text-center">Điểm</th>
                            <th className="border px-2 py-1 text-left">Nhận xét</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assembly.rubric.map((r, idx) => (
                            <tr key={idx} className="hover:bg-blue-50">
                              <td className="border px-2 py-1">{r.criteria}</td>
                              <td className="border px-2 py-1 text-center">{r.score}</td>
                              <td className="border px-2 py-1">{r.comment}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic mb-2">Chưa có phiếu đánh giá.</div>
                  )}
                  <div className="mb-2"><b>Tổng điểm:</b> {assembly.totalScore ?? <span className="italic text-gray-500">Chưa có</span>}</div>
                  <div className="mb-2"><b>Nhận xét chung:</b> {assembly.comment ?? <span className="italic text-gray-500">Chưa có</span>}</div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredTopicDetails; 