import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Button, Space, Modal, Table, Input, message, Tooltip } from 'antd';
import { FileTextOutlined, EditOutlined, CloseOutlined, ArrowLeftOutlined, EyeOutlined, UserOutlined, CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SGULogo from '../../images/SGU-LOGO.png';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [majors, setMajors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [faculties, setFaculties] = useState([]);
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
  const [evaluationFormData, setEvaluationFormData] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [scores, setScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [grading, setGrading] = useState('');
  const [submittingScore, setSubmittingScore] = useState(false);
  const { user } = useAuth();
  const [alreadyScored, setAlreadyScored] = useState(false);

  useEffect(() => {
    const loadTopic = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/topics/${id}`);
        setTopic(response.data.data);
      } catch (error) {
        console.error('Error loading topic:', error);
        message.error('Không thể tải thông tin đề tài');
      } finally {
        setLoading(false);
      }
    };
    loadTopic();
  }, [id]);

  useEffect(() => {
    // Fetch majors, categories, lecturers
    axios.get('/api/majors').then(res => {
      setMajors(res.data.data || res.data || []);
    }).catch(() => setMajors([]));
    axios.get('/api/topics/topic-types').then(res => {
      setCategories(res.data.data || res.data || []);
    }).catch(() => setCategories([]));
    axios.get('/api/lecturers').then(res => {
      setLecturers(res.data.data || res.data || []);
    }).catch(() => setLecturers([]));
  }, []);

  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/database/collections/faculties');
        setFaculties(response.data.data || []);
      } catch {
        setFaculties([]);
      }
    };
    loadFaculties();
  }, []);

  useEffect(() => {
    if (evaluationFormData?.evaluations) {
      let sum = 0;
      evaluationFormData.evaluations.forEach(ev => {
        const score = Number(scores[ev._id] || 0);
        sum += score * ev.weight;
      });
      setTotalScore(sum);
      if (sum >= 8) setGrading('A');
      else if (sum >= 6.5) setGrading('B');
      else if (sum >= 5) setGrading('C');
      else setGrading('D');
    }
  }, [scores, evaluationFormData]);

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

  const getCategoryId = () => {
    if (typeof topic.topic_category === 'object') {
      return topic.topic_category._id ||
        categories.find(
          c => c.title === topic.topic_category.title || c.topic_category_title === topic.topic_category.title
        )?._id;
    }
    return topic.topic_category;
  };

  const handleOpenEvaluationModal = async (student) => {
    setSelectedStudentForEvaluation(student);
    setIsModalVisible(true);
    setEvaluationLoading(true);
    setScores({});
    setTotalScore(0);
    setGrading('');
    try {
      const categoryId = getCategoryId();
      if (!categoryId) {
        message.error('Không xác định được loại đề tài để lấy rubric!');
        setEvaluationLoading(false);
        return;
      }
      const rubricRes = await axios.get(`/api/rubrics?rubric_topic_category=${categoryId}`);
      const rubric = rubricRes.data[0];
      if (!rubric) {
        message.error('Không tìm thấy phiếu đánh giá phù hợp!');
        setEvaluationLoading(false);
        return;
      }
      const facultyId = topic.faculty_id || topic.topic_faculty || (topic.topic_major && topic.topic_major.major_faculty);
      const facultyRes = facultyId ? await axios.get(`/api/user/faculties/${facultyId}`) : null;
      const faculty = facultyRes?.data?.data;
      const evaluationsRes = await axios.get(`/api/evaluations/rubric/${rubric._id}`);
      const evaluations = Array.isArray(evaluationsRes.data)
        ? evaluationsRes.data.sort((a, b) => a.serial - b.serial)
        : [];
      const scoreboardRes = await axios.get(
        `/api/scoreboards?rubric_id=${rubric._id}&topic_id=${topic._id}&student_id=${student._id}&grader=${user.id}`
      );
      // Chỉ disable nếu đã có điểm GVHD
      let scoreboard = null;
      if (Array.isArray(scoreboardRes.data)) {
        scoreboard = scoreboardRes.data.find(s => s.evaluator_type === 'gvhd');
      } else if (scoreboardRes.data?.evaluator_type === 'gvhd') {
        scoreboard = scoreboardRes.data;
      }
      if (scoreboard) {
        // Đã chấm điểm, set scores theo dữ liệu đã chấm
        const prevScores = {};
        (scoreboard.rubric_student_evaluations || []).forEach(ev => {
          prevScores[ev.evaluation_id] = ev.score;
        });
        setScores(prevScores);
        setTotalScore(scoreboard.total_score || 0);
        setGrading(scoreboard.student_grades || '');
        setAlreadyScored(true);
      } else {
        setScores({});
        setTotalScore(0);
        setGrading('');
        setAlreadyScored(false);
      }
      setEvaluationFormData({
        schoolName: 'TRƯỜNG ĐẠI HỌC SÀI GÒN',
        facultyName: faculty?.faculty_name || faculty?.faculty_title || '-',
        rubricName: rubric.rubric_name,
        rubricId: rubric._id,
        rubric_category: rubric.rubric_category,
        evaluations,
      });
    } catch {
      setEvaluationFormData(null);
      message.error('Không thể tải phiếu đánh giá động!');
    }
    setEvaluationLoading(false);
  };

  // Xác định trạng thái đề cương và báo cáo cuối cùng
  const isOutlineApproved = topic.topic_defense_request === 'Đã chấp nhận';
  const isOutlineRejected = topic.topic_defense_request?.startsWith('Từ chối:');
  const isOutlinePending = topic.topic_defense_request && !isOutlineApproved && !isOutlineRejected && topic.topic_defense_request.startsWith('http');
  const isFinalApproved = topic.topic_final_report === 'Đã chấp nhận';
  const isFinalRejected = topic.topic_final_report?.startsWith('Từ chối:');
  const isFinalPending = topic.topic_final_report && !isFinalApproved && !isFinalRejected && topic.topic_final_report.startsWith('http');

  // Hàm duyệt/từ chối đề cương
  const handleApproveOutline = async () => {
    setLoadingOutlineAction(true);
    try {
      if (!window.confirm('Bạn đã tải file về chưa? Sau khi duyệt sẽ không còn xem lại file này!')) {
        setLoadingOutlineAction(false);
        return;
      }
      await axios.put(`/api/topics/${topic._id}/approve-outline`, { status: 'Đã chấp nhận' });
      alert('Đã duyệt đề cương!');
      window.location.reload();
    } catch {
      alert('Lỗi khi duyệt đề cương!');
    }
    setLoadingOutlineAction(false);
  };
  const handleRejectOutline = async () => {
    setLoadingOutlineAction(true);
    try {
      if (!window.confirm('Bạn đã tải file về chưa? Sau khi từ chối sẽ không còn xem lại file này!')) {
        setLoadingOutlineAction(false);
        return;
      }
      await axios.put(`/api/topics/${topic._id}/approve-outline`, { status: `Từ chối: ${outlineRejectReason}` });
      alert('Đã từ chối đề cương!');
      setOutlineRejectModal(false);
      window.location.reload();
    } catch {
      alert('Lỗi khi từ chối đề cương!');
    }
    setLoadingOutlineAction(false);
  };
  // Hàm duyệt/từ chối báo cáo cuối cùng
  const handleApproveFinal = async () => {
    setLoadingFinalAction(true);
    try {
      if (!window.confirm('Bạn đã tải file về chưa? Sau khi duyệt sẽ không còn xem lại file này!')) {
        setLoadingFinalAction(false);
        return;
      }
      await axios.put(`/api/topics/${topic._id}/approve-final`, { status: 'Đã chấp nhận' });
      alert('Đã duyệt báo cáo cuối cùng!');
      window.location.reload();
    } catch {
      alert('Lỗi khi duyệt báo cáo cuối cùng!');
    }
    setLoadingFinalAction(false);
  };
  const handleRejectFinal = async () => {
    setLoadingFinalAction(true);
    try {
      if (!window.confirm('Bạn đã tải file về chưa? Sau khi từ chối sẽ không còn xem lại file này!')) {
        setLoadingFinalAction(false);
        return;
      }
      await axios.put(`/api/topics/${topic._id}/approve-final`, { status: `Từ chối: ${finalRejectReason}` });
      alert('Đã từ chối báo cáo cuối cùng!');
      setFinalRejectModal(false);
      window.location.reload();
    } catch {
      alert('Lỗi khi từ chối báo cáo cuối cùng!');
    }
    setLoadingFinalAction(false);
  };

  const handleViewStudentDetail = async (student) => {
    setSelectedStudentDetail(null);
    setIsStudentDetailModalOpen(true);
    setStudentDetailLoading(true);
    try {
      // Nếu student đã có đủ thông tin thì không cần gọi API
      if (student.email && student.user_id) {
        setSelectedStudentDetail(student);
        // Log dữ liệu user_faculty và faculties
        console.log('user_faculty:', student.user_faculty);
        console.log('faculties:', faculties);
      } else {
        // Gọi API lấy chi tiết sinh viên theo user_id
        const res = await axios.get(`/api/users/${student.user_id}`);
        setSelectedStudentDetail(res.data.data || res.data);
        // Log dữ liệu user_faculty và faculties
        console.log('user_faculty:', (res.data.data || res.data).user_faculty);
        console.log('faculties:', faculties);
      }
    } catch {
      setSelectedStudentDetail(null);
      message.error('Không thể tải thông tin sinh viên');
    }
    setStudentDetailLoading(false);
  };

  const getFacultyTitle = (user_faculty, faculties) => {
    if (!user_faculty) return '-';
    if (typeof user_faculty === 'object') {
      return user_faculty.faculty_title || user_faculty.faculty_name || user_faculty.title || user_faculty.name || '-';
    }
    const found = faculties.find(f => String(f._id) === String(user_faculty));
    return found ? (found.faculty_title || found.faculty_name || found.title || found.name) : '-';
  };

  const handleScoreChange = (id, value, max) => {
    let val = Number(value);
    if (val > max) val = max;
    if (val < 0) val = 0;
    setScores(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmitScore = async () => {
    if (!evaluationFormData || !selectedStudentForEvaluation) return;
    setSubmittingScore(true);
    try {
      const payload = {
        rubric_id: evaluationFormData.rubricId,
        topic_id: topic._id,
        grader: user?.id,
        student_id: selectedStudentForEvaluation._id,
        rubric_student_evaluations: evaluationFormData.evaluations.map(ev => ({
          evaluation_id: ev._id,
          score: Number(scores[ev._id] || 0)
        })),
        total_score: totalScore,
        student_grades: grading,
        evaluator_type: 'gvhd'
      };
      await axios.post('/api/scoreboards', payload);
      message.success('Chấm điểm thành công!');
      setIsModalVisible(false);
      setScores({});
    } catch (err) {
      message.error('Lưu điểm thất bại!');
      console.error('POST /api/scoreboards error:', err);
    }
    setSubmittingScore(false);
  };

  if (!topic) {
    return <div className="p-6">Không tìm thấy thông tin đề tài</div>;
  }

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
            <div className="text-base">{topic.topic_title || '-'}</div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Số lượng thực hiện</div>
              <div className="text-base">{topic.topic_max_members ?? '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Chuyên ngành</div>
              <div className="text-base">{getMajorName(topic.topic_major)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Loại đề tài</div>
              <div className="text-base">{getCategoryName(topic.topic_category)}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Mô tả đề tài</div>
            <div className="text-base whitespace-pre-line border rounded-md p-4 bg-gray-50 min-h-[100px]">
              {topic.topic_description || '-'}
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <Title level={5}>Tài liệu quan trọng</Title>
        <Row gutter={[32, 16]} className="mt-4 flex justify-center">
          {[{
            label: "Đề cương",
            file: topic.topic_defense_request,
            isApproved: isOutlineApproved,
            isRejected: isOutlineRejected,
            isPending: isOutlinePending,
            onApprove: handleApproveOutline,
            onReject: () => setOutlineRejectModal(true),
            loading: loadingOutlineAction,
            rejectModal: outlineRejectModal,
            setRejectModal: setOutlineRejectModal,
            rejectReason: outlineRejectReason,
            setRejectReason: setOutlineRejectReason
          }, {
            label: "Báo cáo cuối cùng",
            file: topic.topic_final_report,
            isApproved: isFinalApproved,
            isRejected: isFinalRejected,
            isPending: isFinalPending,
            onApprove: handleApproveFinal,
            onReject: () => setFinalRejectModal(true),
            loading: loadingFinalAction,
            rejectModal: finalRejectModal,
            setRejectModal: setFinalRejectModal,
            rejectReason: finalRejectReason,
            setRejectReason: setFinalRejectReason
          }].map((doc) => (
            <Col key={doc.label} xs={24} sm={12} md={8} lg={6}>
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
                <div className="font-semibold text-lg mb-2">{doc.label}</div>
                {doc.file && doc.file !== 'Chưa gửi' && !doc.isApproved && !doc.isRejected ? (
                  <>
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#008bc3] font-medium hover:underline hover:text-[#005f7f] transition"
                  >
                    <span>Xem tài liệu</span>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><polyline points="7 11 12 16 17 11"/><line x1="12" y1="4" x2="12" y2="16"/></svg>
                  </a>
                    {doc.isPending && (
                      <Space className="mt-2">
                        <Button type="primary" icon={<CheckOutlined />} loading={doc.loading} onClick={doc.onApprove}>Duyệt</Button>
                        <Button danger icon={<ExclamationCircleOutlined />} onClick={doc.onReject}>Từ chối</Button>
                      </Space>
                    )}
                    {/* Modal nhập lý do từ chối */}
                    <Modal
                      title={`Từ chối ${doc.label}`}
                      open={doc.rejectModal}
                      onOk={doc.label === 'Đề cương' ? handleRejectOutline : handleRejectFinal}
                      onCancel={() => doc.setRejectModal(false)}
                      okText="Xác nhận từ chối"
                      cancelText="Hủy"
                      confirmLoading={doc.loading}
                    >
                      <Input.TextArea
                        rows={3}
                        value={doc.rejectReason}
                        onChange={e => doc.setRejectReason(e.target.value)}
                        placeholder="Nhập lý do từ chối..."
                      />
                    </Modal>
                  </>
                ) : (
                  <>
                    {doc.isApproved && <div className="text-green-600 mt-2">Đã duyệt</div>}
                    {doc.isRejected && <div className="text-red-600 mt-2">Bị từ chối: {doc.file.replace('Từ chối:', '')}</div>}
                    {!doc.file || doc.file === 'Chưa gửi'
                      ? <div className="text-gray-400 flex flex-col items-center">Chưa nộp</div>
                      : null}
                  </>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card>
        <Title level={5}>Nhóm đăng ký</Title>
        {topic.topic_group_student && topic.topic_group_student.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border rounded-lg shadow-sm bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 border text-center">STT</th>
                  <th className="px-4 py-2 border text-center">Thành viên</th>
                  <th className="px-4 py-2 border text-center">Mã số SV</th>
                  <th className="px-4 py-2 border text-center">Chi tiết</th>
                  <th className="px-4 py-2 border text-center">Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {topic.topic_group_student.map((student, index) => (
                  <tr key={student._id || student.user_id || student.id || index} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-2 border text-center font-semibold">{index + 1}</td>
                    <td className="px-4 py-2 border text-center">{student.user_name || student.name || '-'}</td>
                    <td className="px-4 py-2 border text-center">{student.user_id || '-'}</td>
                    <td className="px-4 py-2 border text-center">
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewStudentDetail(student)}
                        className="text-green-600 hover:text-green-800"
                        style={{ fontSize: 18 }}
                      />
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <Tooltip title={isFinalApproved ? "Chấm điểm" : "Chỉ chấm điểm khi đã duyệt báo cáo cuối cùng"}>
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={isFinalApproved ? () => handleOpenEvaluationModal(student) : undefined}
                          className={`text-blue-600 hover:text-blue-800 ${!isFinalApproved ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{ fontSize: 18 }}
                          disabled={!isFinalApproved}
                        />
                      </Tooltip>
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
            <div className="font-bold">{evaluationFormData?.schoolName || '...'}</div>
            <div className="flex justify-center my-2">
              <img src={SGULogo} alt="SGU Logo" style={{ height: 60 }} />
            </div>
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
          <Title level={4} className="mb-8">{evaluationFormData?.rubricName || 'PHIẾU ĐÁNH GIÁ'}</Title>
          <div className="text-left mb-4">
            <Text>Tên đề tài: {topic.topic_title || '-'}</Text>
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
                  <td className="border px-4 py-2">{selectedStudentForEvaluation?.user_name || '-'}</td>
                  <td className="border px-4 py-2">{selectedStudentForEvaluation?.user_id || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {evaluationLoading ? (
            <div>Đang tải phiếu đánh giá...</div>
          ) : evaluationFormData && evaluationFormData.evaluations ? (
          <div>
            <Table
              columns={[
                { title: 'STT', dataIndex: 'serial', key: 'serial', align: 'center', width: '5%' },
                { title: 'NỘI DUNG', dataIndex: 'evaluation_criteria', key: 'evaluation_criteria', width: '55%' },
                { title: 'THANG ĐIỂM', dataIndex: 'grading_scale', key: 'grading_scale', align: 'center', width: '15%' },
                { title: 'TRỌNG SỐ', dataIndex: 'weight', key: 'weight', align: 'center', width: '10%', render: (w) => (typeof w === 'number' ? (w * 100) + '%' : w) },
                { title: 'ĐIỂM', dataIndex: 'score', key: 'score', align: 'center', width: '15%',
                  render: (_, row) => (
                    <Input
                      type="number"
                      min={0}
                      max={row.grading_scale}
                      value={scores[row._id] || ''}
                      onChange={e => handleScoreChange(row._id, e.target.value, row.grading_scale)}
                      className="w-16 text-center mx-auto border-blue-400 focus:border-blue-600 rounded shadow-sm"
                      disabled={alreadyScored}
                    />
                  )
                },
              ]}
              dataSource={evaluationFormData.evaluations.map((item) => ({ ...item, key: item._id }))}
              pagination={false}
              bordered
            />
            <div className="flex flex-col items-end mt-4">
              <div className="text-lg font-semibold mb-2">
                Tổng điểm: <span className="text-blue-600">{totalScore.toFixed(2)}</span> &nbsp;
                <span className="text-green-600">({grading})</span>
              </div>
              <Button
                type="primary"
                size="large"
                disabled={submittingScore || !Object.keys(scores).length || alreadyScored}
                className="bg-gradient-to-r from-blue-500 to-green-400 text-white font-bold rounded-lg shadow"
                onClick={handleSubmitScore}
                loading={submittingScore}
              >
                {alreadyScored ? "Đã chấm điểm" : "Chấm điểm"}
              </Button>
            </div>
          </div>
          ) : (
            <div>Không có tiêu chí đánh giá.</div>
          )}
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
                      console.error('Image load error:', e.target.src);
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-20 h-20 rounded-full border bg-gray-100 flex items-center justify-center"><UserOutlined className="text-4xl text-gray-400" /></div>';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border bg-gray-100 flex items-center justify-center">
                    <UserOutlined className="text-4xl text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedStudentDetail.user_name || '-'}</h3>
                <p className="text-gray-600">MSSV: {selectedStudentDetail.user_id || '-'}</p>
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

export default TopicDetail; 