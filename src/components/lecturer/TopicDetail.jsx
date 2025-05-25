import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Button, Space, Modal, Table, Input, message } from 'antd';
import { FileTextOutlined, EditOutlined, CloseOutlined, ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);

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
      console.log('Majors:', res.data.data || res.data || []);
    }).catch(() => setMajors([]));
    axios.get('/api/topics/topic-types').then(res => {
      setCategories(res.data.data || res.data || []);
      console.log('Categories:', res.data.data || res.data || []);
    }).catch(() => setCategories([]));
    axios.get('/api/lecturers').then(res => {
      setLecturers(res.data.data || res.data || []);
      console.log('Lecturers:', res.data.data || res.data || []);
    }).catch(() => setLecturers([]));
  }, []);

  const isDataReady = majors.length > 0 && categories.length > 0 && lecturers.length > 0 && !!topic;

  if (loading || !isDataReady) {
    return <div className="p-6">Đang tải dữ liệu phụ trợ...</div>;
  }

  // Log nhóm đăng ký
  console.log('topic_group_student:', topic.topic_group_student);

  const getMajorName = (id) => {
    if (!id) return '-';
    if (typeof id === 'object') {
      return id.major_title || id.title || '-';
    }
    const found = majors.find(m => String(m._id) === String(id));
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

  const handleViewStudentDetail = async (student) => {
    setIsStudentDetailModalOpen(true);
    setStudentDetailLoading(true);
    try {
      // Sử dụng dữ liệu có sẵn từ topic_group_student
      const studentDetail = {
        user_name: student.user_name || student.name,
        user_id: student.user_id,
        user_avatar: student.user_avatar,
        user_date_of_birth: student.user_date_of_birth,
        user_CCCD: student.user_CCCD,
        email: student.email,
        user_phone: student.user_phone,
        user_permanent_address: student.user_permanent_address,
        user_temporary_address: student.user_temporary_address,
        user_faculty: student.user_faculty?.faculty_title || student.user_faculty,
        user_major: student.user_major?.major_title || student.user_major,
        user_status: student.user_status,
        user_average_grade: student.user_average_grade,
        user_transcript: student.user_transcript
      };
      setSelectedStudentDetail(studentDetail);
    } catch (error) {
      console.error('Error processing student details:', error);
      setSelectedStudentDetail({});
    } finally {
      setStudentDetailLoading(false);
    }
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
      key: '1',
      stt: 1,
      content: 'Ý tưởng và Khả năng áp dụng thực tế của ứng dụng',
      maxScore: 10,
      weight: '10%',
      score: 10,
    },
    {
      key: '2',
      stt: 2,
      content: 'Độ tận tâm/phức tạp của công việc',
      maxScore: 10,
      weight: '10%',
      score: 9,
    },
    {
      key: '3',
      stt: 3,
      content: 'Mức độ hoàn chỉnh',
      maxScore: 10,
      weight: '10%',
      score: 8,
    },
    {
      key: '4',
      stt: 4,
      content: 'Tính năng của ứng dụng',
      maxScore: 10,
      weight: '10%',
      score: 0,
    },
    {
      key: '5',
      stt: 5,
      content: 'Giao diện của ứng dụng',
      maxScore: 10,
      weight: '10%',
      score: 0,
    },
    {
      key: '6',
      stt: 6,
      content: 'Độ khó của đề tài',
      maxScore: 10,
      weight: '10%',
      score: 0,
    },
    {
      key: '7',
      stt: 7,
      content: 'Tài liệu hướng dẫn sử dụng/cài đặt',
      maxScore: 10,
      weight: '10%',
      score: 0,
    },
    {
      key: '8',
      stt: 8,
      content: 'Trình bày báo cáo',
      maxScore: 10,
      weight: '10%',
      score: 0,
    },
    {
      key: '9',
      stt: 9,
      content: 'Trả lời câu hỏi',
      maxScore: 10,
      weight: '10%',
      score: 0,
    },
    {
      key: '10',
      stt: 10,
      content: 'Điểm thưởng',
      maxScore: 10,
      weight: '10%',
      score: 0,
    },
  ];

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
        <Row gutter={[24, 16]} className="mt-4">
          <Col span={8} offset={8}>
            <Card size="small" className="text-center">
              <Space direction="vertical" className="w-full">
                <FileTextOutlined className="text-2xl" />
                <Text>Đơn xin hướng dẫn</Text>
                <Button type="link" danger disabled>
                  Chưa nộp
                </Button>
              </Space>
            </Card>
          </Col>
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
                  <th className="px-4 py-2 border text-center">Số lượng</th>
                  <th className="px-4 py-2 border text-center">Thành viên</th>
                  <th className="px-4 py-2 border text-center">Mã số SV</th>
                  <th className="px-4 py-2 border text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {topic.topic_group_student.map((student, idx) => (
                  <tr key={student._id || student.user_id || student.id || idx} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-2 border text-center font-semibold">{idx + 1}</td>
                    <td className="px-4 py-2 border text-center">1</td>
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
                  <td className="border px-4 py-2">{selectedStudentDetail?.user_name || '-'}</td>
                  <td className="border px-4 py-2">{selectedStudentDetail?.user_id || '-'}</td>
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
        title="Chi tiết sinh viên"
        open={isStudentDetailModalOpen}
        onCancel={() => setIsStudentDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {console.log('selectedStudentDetail:', selectedStudentDetail)}
        {studentDetailLoading ? (
          <div>Đang tải thông tin sinh viên...</div>
        ) : selectedStudentDetail ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <img
                src={selectedStudentDetail.user_avatar || '/default-avatar.png'}
                alt="avatar"
                className="w-20 h-20 rounded-full border object-cover"
              />
              <div>
                <div className="font-bold text-lg">{selectedStudentDetail.user_name || '-'}</div>
                <div className="text-gray-500">{selectedStudentDetail.user_id || '-'}</div>
              </div>
            </div>
            <div><b>Ngày sinh:</b> {selectedStudentDetail.user_date_of_birth || '-'}</div>
            <div><b>CCCD:</b> {selectedStudentDetail.user_CCCD || '-'}</div>
            <div><b>Email:</b> {selectedStudentDetail.email || '-'}</div>
            <div><b>Số điện thoại:</b> {selectedStudentDetail.user_phone || '-'}</div>
            <div><b>Địa chỉ thường trú:</b> {selectedStudentDetail.user_permanent_address || '-'}</div>
            <div><b>Địa chỉ tạm trú:</b> {selectedStudentDetail.user_temporary_address || '-'}</div>
            <div><b>Khoa:</b> {selectedStudentDetail.user_faculty || '-'}</div>
            <div><b>Chuyên ngành:</b> {selectedStudentDetail.user_major || '-'}</div>
            <div><b>Trạng thái:</b> {selectedStudentDetail.user_status || '-'}</div>
            <div><b>Điểm TB:</b> {selectedStudentDetail.user_average_grade || '-'}</div>
            <div>
              <b>Bảng điểm:</b>{' '}
              {selectedStudentDetail.user_transcript ? (
                <a href={selectedStudentDetail.user_transcript} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Xem bảng điểm
                </a>
              ) : (
                '-'
              )}
            </div>
          </div>
        ) : (
          <div>Không tìm thấy thông tin sinh viên.</div>
        )}
      </Modal>
    </div>
  );
};

export default TopicDetail; 