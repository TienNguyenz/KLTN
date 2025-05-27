import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Button, Space, Modal, Table, Input, message } from 'antd';
import { FileTextOutlined, EditOutlined, CloseOutlined, ArrowLeftOutlined, EyeOutlined, UserOutlined, CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getCommitteeTopicById } from '../../services/topicService';

const { Title, Text, Paragraph } = Typography;

const CommitteeTopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [majors, setMajors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [facultiesLoading, setFacultiesLoading] = useState(true);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);
  const [selectedStudentForEvaluation, setSelectedStudentForEvaluation] = useState(null);
  const [outlineRejectModal, setOutlineRejectModal] = useState(false);
  const [finalRejectModal, setFinalRejectModal] = useState(false);
  const [outlineRejectReason, setOutlineRejectReason] = useState('');
  const [finalRejectReason, setFinalRejectReason] = useState('');
  const [loadingOutlineAction, setLoadingOutlineAction] = useState(false);
  const [loadingFinalAction, setLoadingFinalAction] = useState(false);

  useEffect(() => {
    const loadTopic = async () => {
      setLoading(true);
      try {
        const response = await getCommitteeTopicById(id);
        if (response.success) {
          setTopic(response.data);
          console.log('DEBUG topic:', response.data);
        } else {
          message.error('Lỗi khi tải chi tiết đề tài hội đồng: ' + response.message);
          setTopic(null);
        }
      } catch (error) {
        message.error('Lỗi khi tải chi tiết đề tài hội đồng!');
        setTopic(null);
      } finally {
        setLoading(false);
      }
    };
    loadTopic();
  }, [id]);

  useEffect(() => {
    // Fetch majors, categories, lecturers
    fetch('/api/majors').then(res => res.json()).then(res => setMajors(res.data || res || []));
    fetch('/api/topics/topic-types').then(res => res.json()).then(res => setCategories(res.data || res || []));
    fetch('/api/lecturers').then(res => res.json()).then(res => setLecturers(res.data || res || []));
  }, []);

  useEffect(() => {
    const loadFaculties = async () => {
      try {
        setFacultiesLoading(true);
        const response = await fetch('http://localhost:5000/api/database/collections/faculties');
        const data = await response.json();
        setFaculties(data.data || []);
      } catch {
        setFaculties([]);
      } finally {
        setFacultiesLoading(false);
      }
    };
    loadFaculties();
  }, []);

  const isDataReady = majors.length > 0 && categories.length > 0 && lecturers.length > 0 && !!topic;

  if (loading || !isDataReady) {
    return <div className="p-6">Đang tải dữ liệu phụ trợ...</div>;
  }

  const getMajorName = (major) => {
    if (!major) return '-';
    if (typeof major === 'object') return major.major_title || major.title || '-';
    if (typeof major === 'string' && major.length > 0 && major.length < 24) return major;
    const found = majors.find(m => String(m._id) === String(major));
    return found ? found.major_title : '-';
  };

  const getCategoryName = (id) => {
    if (!id) return '-';
    if (typeof id === 'object') {
      return id.topic_category_title || id.title || '-';
    }
    const found = categories.find(c => String(c._id) === String(id));
    return found ? found.topic_category_title : '-';
  };

  const handleCancel = () => {
    setIsModalVisible(false);
};

const evaluationColumns = [
  {
    title: 'STT',
    dataIndex: 'stt',
    key: 'stt',
    width: '5%',
    align: 'center',
  },
  {
    title: 'NỘI DUNG',
    dataIndex: 'content',
    key: 'content',
    width: '55%',
  },
  {
    title: 'THANG ĐIỂM',
    dataIndex: 'maxScore',
    key: 'maxScore',
    width: '15%',
    align: 'center',
  },
  {
    title: 'TRỌNG SỐ',
    dataIndex: 'weight',
    key: 'weight',
    width: '10%',
    align: 'center',
  },
  {
    title: 'ĐIỂM',
    dataIndex: 'score',
    key: 'score',
    width: '15%',
    align: 'center',
    render: (score) => (
      <Input 
        type="number" 
        defaultValue={score} 
        min={0} 
        max={10}
        className="w-16 text-center mx-auto"
      />
    ),
  },
];

const evaluationData = [
  {
      key: '1', stt: 1, content: 'Ý tưởng và Khả năng áp dụng thực tế của ứng dụng', maxScore: 10, weight: '10%', score: 10,
    },
    { key: '2', stt: 2, content: 'Độ tận tâm/phức tạp của công việc', maxScore: 10, weight: '10%', score: 9 },
    { key: '3', stt: 3, content: 'Mức độ hoàn chỉnh', maxScore: 10, weight: '10%', score: 8 },
    { key: '4', stt: 4, content: 'Tính năng của ứng dụng', maxScore: 10, weight: '10%', score: 0 },
    { key: '5', stt: 5, content: 'Giao diện của ứng dụng', maxScore: 10, weight: '10%', score: 0 },
    { key: '6', stt: 6, content: 'Độ khó của đề tài', maxScore: 10, weight: '10%', score: 0 },
    { key: '7', stt: 7, content: 'Tài liệu hướng dẫn sử dụng/cài đặt', maxScore: 10, weight: '10%', score: 0 },
    { key: '8', stt: 8, content: 'Trình bày báo cáo', maxScore: 10, weight: '10%', score: 0 },
    { key: '9', stt: 9, content: 'Trả lời câu hỏi', maxScore: 10, weight: '10%', score: 0 },
    { key: '10', stt: 10, content: 'Điểm thưởng', maxScore: 10, weight: '10%', score: 0 },
  ];

  // Hàm xem chi tiết sinh viên
  const handleViewStudentDetail = async (student) => {
    console.log('DEBUG student object:', student);
    setIsStudentDetailModalOpen(true);
    setStudentDetailLoading(true);
    try {
      if (facultiesLoading) {
        await new Promise(resolve => {
          const checkFaculties = setInterval(() => {
            if (!facultiesLoading) {
              clearInterval(checkFaculties);
              resolve();
            }
          }, 100);
        });
      }
      const response = await fetch(`http://localhost:5000/api/database/collections/users?user_id=${student.user_id}`);
      const data = await response.json();
      const user = data.data[0];
      if (user) {
        if (user.user_avatar) {
          if (user.user_avatar.startsWith('/uploads')) {
            user.user_avatar = `http://localhost:5000${user.user_avatar}`;
          } else if (!user.user_avatar.startsWith('http')) {
            user.user_avatar = `http://localhost:5000/uploads/${user.user_avatar}`;
          }
        }
        setSelectedStudentDetail(user);
      } else {
        // Map lại các trường cơ bản từ object student (groups)
        setSelectedStudentDetail({
          user_name: student.user_name || student.studentName || '-',
          user_id: student.user_id || student.studentId || '-',
          email: student.email || '-',
          user_phone: student.user_phone || '-',
          user_date_of_birth: student.user_date_of_birth || '-',
          user_CCCD: student.user_CCCD || '-',
          user_permanent_address: student.user_permanent_address || '-',
          user_temporary_address: student.user_temporary_address || '-',
          user_major: student.user_major || '-',
          user_status: student.user_status || '-',
          user_average_grade: student.user_average_grade || '-',
          user_transcript: student.user_transcript || '',
        });
      }
    } catch {
      setSelectedStudentDetail({
        user_name: student.user_name || student.studentName || '-',
        user_id: student.user_id || student.studentId || '-',
        email: student.email || '-',
        user_phone: student.user_phone || '-',
        user_date_of_birth: student.user_date_of_birth || '-',
        user_CCCD: student.user_CCCD || '-',
        user_permanent_address: student.user_permanent_address || '-',
        user_temporary_address: student.user_temporary_address || '-',
        user_major: student.user_major || '-',
        user_status: student.user_status || '-',
        user_average_grade: student.user_average_grade || '-',
        user_transcript: student.user_transcript || '',
      });
    } finally {
      setStudentDetailLoading(false);
    }
  };

  const extractObjectId = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object') {
      if (obj.$oid) return obj.$oid;
      if (obj._id) return obj._id;
      if (obj.id) return obj.id;
    }
    return '';
  };

  const getFacultyTitle = (user_faculty, faculties) => {
    if (!user_faculty || !Array.isArray(faculties) || faculties.length === 0) return 'Chưa cập nhật';
    if (typeof user_faculty === 'object' && user_faculty.faculty_title) {
      return user_faculty.faculty_title;
    }
    if (!user_faculty || user_faculty === '') return 'Chưa cập nhật';
    const idStr = extractObjectId(user_faculty);
    if (!idStr) return 'Chưa cập nhật';
    const found = faculties.find(f => extractObjectId(f._id) === idStr);
    return found ? found.faculty_title : 'Chưa cập nhật';
  };

  const handleOpenEvaluationModal = (student) => {
    setSelectedStudentForEvaluation(student);
    setIsModalVisible(true);
  };

  // Xác định trạng thái đề cương và báo cáo cuối cùng
  const isOutlineApproved = topic.topic_defense_request === 'Đã chấp nhận';
  const isOutlineRejected = topic.topic_defense_request?.startsWith('Từ chối:');
  const isOutlinePending = topic.topic_defense_request && !isOutlineApproved && !isOutlineRejected && topic.topic_defense_request.startsWith('http');
  const isFinalApproved = topic.topic_final_report === 'Đã chấp nhận';
  const isFinalRejected = topic.topic_final_report?.startsWith('Từ chối:');
  const isFinalPending = topic.topic_final_report && !isFinalApproved && !isFinalRejected && topic.topic_final_report.startsWith('http');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-2">
          Quay lại
        </Button>
      </div>
      <Card className="mb-6">
        <div className="space-y-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Tên đề tài</div>
            <div className="text-base">{topic.topic_title || topic.title || '-'}</div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Số lượng thực hiện</div>
              <div className="text-base">{topic.topic_max_members ?? topic.maxMembers ?? '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Chuyên ngành</div>
              <div className="text-base">{getMajorName(topic.topic_major || topic.major)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Loại đề tài</div>
              <div className="text-base">{getCategoryName(topic.topic_category || topic.category)}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Mô tả đề tài</div>
            <div className="text-base whitespace-pre-line border rounded-md p-4 bg-gray-50 min-h-[100px]">
              {topic.topic_description || topic.description || '-'}
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <Title level={5}>Tài liệu quan trọng</Title>
        <Row gutter={[32, 16]} className="mt-4 flex justify-center">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              size="small"
              className="text-center transition-all duration-300 hover:shadow-xl hover:border-[#008bc3] rounded-xl"
              style={{
                border: '1.5px solid #e5e7eb',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
              bodyStyle={{ padding: 32 }}
            >
              <FileTextOutlined className="text-4xl mb-2 text-[#008bc3]" />
              <div className="font-semibold text-lg mb-2">Báo cáo cuối cùng</div>
              {topic.topic_final_report_file ? (
                <a
                  href={topic.topic_final_report_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#008bc3] font-medium hover:underline hover:text-[#005f7f] transition"
                >
                  <span>Xem tài liệu</span>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><polyline points="7 11 12 16 17 11"/><line x1="12" y1="4" x2="12" y2="16"/></svg>
                </a>
              ) : (
                <div className="text-gray-400 flex flex-col items-center">Chưa nộp</div>
              )}
            </Card>
          </Col>
        </Row>
      </Card>

      <Card>
        <Title level={5}>Nhóm đăng ký</Title>
        {topic.groups && topic.groups.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border rounded-lg shadow-sm bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 border text-center">STT</th>
                  <th className="px-4 py-2 border text-center">Số lượng</th>
                  <th className="px-4 py-2 border text-center">Thành viên</th>
                  <th className="px-4 py-2 border text-center">Mã số SV</th>
                  <th className="px-4 py-2 border text-center">Chi tiết</th>
                  <th className="px-4 py-2 border text-center">Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {topic.groups.map((student, idx) => (
                  <tr key={student.id || idx} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-2 border text-center font-semibold">{idx + 1}</td>
                    <td className="px-4 py-2 border text-center">1</td>
                    <td className="px-4 py-2 border text-center">{student.studentName || '-'}</td>
                    <td className="px-4 py-2 border text-center">{student.studentId || '-'}</td>
                    <td className="px-4 py-2 border text-center">
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewStudentDetail({ ...student, user_name: student.studentName, user_id: student.studentId })}
                        className="text-green-600 hover:text-green-800"
                        style={{ fontSize: 18 }}
                      />
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEvaluationModal({ ...student, user_name: student.studentName, user_id: student.studentId })}
                        className="text-blue-600 hover:text-blue-800"
                        style={{ fontSize: 18 }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 mt-4">Chưa có sinh viên đăng ký</div>
        )}
      </Card>

      <Modal
        title={
          <div className="text-center">
            <div className="font-bold">TRƯỜNG ĐẠI HỌC XXX THÀNH PHỐ HỒ CHÍ MINH</div>
            <div>KHOA CÔNG NGHỆ THÔNG TIN</div>
            <div className="absolute right-4 top-4 cursor-pointer" onClick={handleCancel}>
              <CloseOutlined />
            </div>
          </div>
        }
        open={isModalVisible}
        footer={null}
        onCancel={handleCancel}
        width={1000}
        className="evaluation-modal"
      >
        <div className="text-center mb-8">
          <div className="text-right mb-4">
            <Text>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
            <div>Độc lập - Tự do - Hạnh phúc</div>
          </div>
          <Title level={4} className="mb-8">PHIẾU ĐÁNH GIÁ KHÓA LUẬN TỐT NGHIỆP</Title>
          <div className="text-left mb-4">
            <Text>Tên đề tài: {topic.topic_title || topic.title || '-'}</Text>
          </div>
          <div className="text-left mb-8">
            <Text>Sinh viên thực hiện:</Text>
            <table className="w-full mt-2 border-collapse">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Tên sinh viên</th>
                  <th className="border px-4 py-2">Mã số sinh viên</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">{selectedStudentForEvaluation?.studentName || selectedStudentForEvaluation?.name || '-'}</td>
                  <td className="border px-4 py-2">{selectedStudentForEvaluation?.studentId || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Table
            columns={evaluationColumns}
            dataSource={evaluationData}
            pagination={false}
            bordered
          />
        </div>
      </Modal>

      <Modal
        title="Thông tin sinh viên"
        open={isStudentDetailModalOpen}
        onCancel={() => setIsStudentDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {studentDetailLoading ? (
          <div>Đang tải thông tin sinh viên...</div>
        ) : selectedStudentDetail ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                {selectedStudentDetail.user_avatar ? (
                  <img
                    src={`http://localhost:5000${selectedStudentDetail.user_avatar}`}
                    alt="avatar"
                    className="w-20 h-20 rounded-full border object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-20 h-20 rounded-full border bg-gray-100 flex items-center justify-center"><span class="anticon"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="user" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M858.5 763.6a374 374 0 0 0-81.6-119.3a374.1 374.1 0 0 0-119.3-81.6c-39.8-16.7-82-25.3-125.6-25.3s-85.8 8.6-125.6 25.3a374.1 374.1 0 0 0-119.3 81.6a374 374 0 0 0-81.6 119.3A373.6 373.6 0 0 0 120 888c0 4.4 3.6 8 8 8h768c4.4 0 8-3.6 8-8c0-44.2-8.6-86.4-25.5-125.6zM512 576c70.7 0 128-57.3 128-128s-57.3-128-128-128s-128 57.3-128 128s57.3 128 128 128z"></path></svg></span></div>';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border bg-gray-100 flex items-center justify-center">
                    <UserOutlined className="text-4xl text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedStudentDetail.user_name || selectedStudentDetail.studentName || selectedStudentDetail.name || '-'}</h3>
                <p className="text-gray-600">MSSV: {selectedStudentDetail.user_id || selectedStudentDetail.studentId || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><b>Email:</b> {selectedStudentDetail.email || '-'}</div>
              <div><b>Số điện thoại:</b> {selectedStudentDetail.user_phone || '-'}</div>
              <div><b>Ngày sinh:</b> {selectedStudentDetail.user_date_of_birth || '-'}</div>
              <div><b>CCCD:</b> {selectedStudentDetail.user_CCCD || '-'}</div>
              <div className="col-span-2"><b>Địa chỉ thường trú:</b> {selectedStudentDetail.user_permanent_address || '-'}</div>
              <div className="col-span-2"><b>Địa chỉ tạm trú:</b> {selectedStudentDetail.user_temporary_address || '-'}</div>
              <div><b>Khoa:</b> {getFacultyTitle(selectedStudentDetail.user_faculty, faculties)}</div>
              <div><b>Ngành:</b> {selectedStudentDetail?.user_major?.major_title || selectedStudentDetail?.user_major || '-'}</div>
              <div><b>Điểm TB:</b> {selectedStudentDetail.user_average_grade || '-'}</div>
              <div><b>Trạng thái:</b> {selectedStudentDetail.user_status || '-'}</div>
            </div>
            {selectedStudentDetail.user_transcript && (
              <div className="mt-4">
                <b>Bảng điểm:</b>
                <a 
                  href={selectedStudentDetail.user_transcript}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Xem bảng điểm
                </a>
              </div>
            )}
          </div>
        ) : (
          <div>Không tìm thấy thông tin sinh viên</div>
        )}
      </Modal>
    </div>
  );
};

export default CommitteeTopicDetail; 