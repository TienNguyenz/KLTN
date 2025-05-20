import React, { useState } from 'react';
import { Typography, Card, Row, Col, Button, Space, Modal, Table, Input, message } from 'antd';
import { FileTextOutlined, EditOutlined, CloseOutlined, ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getReviewTopicById } from '../../services/topicService';

const { Title, Text, Paragraph } = Typography;

const ReviewTopicDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);

  React.useEffect(() => {
    fetchTopic();
  }, [id]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const response = await getReviewTopicById(id);
      if (response.success) {
        setTopic(response.data);
      } else {
        message.error('Không thể tải thông tin đề tài phản biện');
      }
    } catch (error) {
      console.error('Error fetching review topic:', error);
      message.error('Có lỗi xảy ra khi tải thông tin đề tài phản biện');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
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

  if (loading) {
    return <div className="p-6">Đang tải thông tin đề tài phản biện...</div>;
  }

  if (!topic) {
    return <div className="p-6">Không tìm thấy thông tin đề tài phản biện.</div>;
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
            <div className="text-base">{topic.name || '-'}</div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Số lượng thực hiện</div>
              <div className="text-base">{topic.maxStudents ?? '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Chuyên ngành</div>
              <div className="text-base">{topic.major || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Loại đề tài</div>
              <div className="text-base">{topic.type || '-'}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Mô tả đề tài</div>
            <div className="text-base whitespace-pre-line border rounded-md p-4 bg-gray-50 min-h-[100px]">
              {topic.description || '-'}
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <Title level={5}>Tài liệu quan trọng</Title>
        <Row gutter={[24, 16]} className="mt-4">
          <Col span={8}>
            <Card size="small" className="text-center">
              <Space direction="vertical" className="w-full">
                <FileTextOutlined className="text-2xl" />
                <Text>Đơn xin bảo vệ</Text>
                <Button type="link" danger disabled={!topic.topic_defense_request}>
                  {topic.topic_defense_request ? 'Xem tài liệu' : 'Chưa nộp'}
                </Button>
              </Space>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="text-center">
              <Space direction="vertical" className="w-full">
                <FileTextOutlined className="text-2xl" />
                <Text>Đơn xin hướng dẫn</Text>
                <Button type="link" danger disabled={!topic.topic_advisor_request}>
                  {topic.topic_advisor_request ? 'Xem tài liệu' : 'Chưa nộp'}
                </Button>
              </Space>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="text-center">
              <Space direction="vertical" className="w-full">
                <FileTextOutlined className="text-2xl" />
                <Text>Báo cáo khóa luận</Text>
                <Button type="link" danger disabled={!topic.topic_final_report}>
                  {topic.topic_final_report ? 'Xem tài liệu' : 'Chưa nộp'}
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={5} className="m-0">Giảng viên phản biện</Title>
        </div>
        <Text>{topic.reviewer || '-'}</Text>

        <div className="mt-6">
          <Title level={5}>Nhóm thực hiện</Title>
          {topic.groups && topic.groups.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border rounded-lg shadow-sm bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="px-4 py-2 border text-center">STT</th>
                    <th className="px-4 py-2 border text-center">Thành viên</th>
                    <th className="px-4 py-2 border text-center">Mã số SV</th>
                    <th className="px-4 py-2 border text-center">Đánh giá</th>
                    <th className="px-4 py-2 border text-center">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {topic.groups.map((member, idx) => (
                    <tr key={member.id || member._id || idx} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-2 border text-center font-semibold">{idx + 1}</td>
                      <td className="px-4 py-2 border text-center">{member.name || member.user_name || '-'}</td>
                      <td className="px-4 py-2 border text-center">{member.studentId || member.user_id || '-'}</td>
                      <td className="px-4 py-2 border text-center">
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => showModal(member)}
                          className="text-blue-600 hover:text-blue-800"
                          style={{ fontSize: 18 }}
                        />
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <Button
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewStudentDetail(member)}
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
            <div className="text-gray-500 mt-4">Chưa có nhóm thực hiện đăng ký</div>
          )}
        </div>
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
            <Text>Tên đề tài: {topic.name || topic.title || '-'}</Text>
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
                  <td className="border px-4 py-2">{selectedStudent?.studentName || selectedStudent?.name || selectedStudent?.user_name || '-'}</td>
                  <td className="border px-4 py-2">{selectedStudent?.studentId || selectedStudent?.user_id || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-left">
            <Title level={5}>ĐIỂM CHI TIẾT</Title>
            <Table
              columns={evaluationColumns}
              dataSource={evaluationData}
              pagination={false}
              bordered
              className="mt-4"
              summary={pageData => {
                let totalScore = 0;
                pageData.forEach(({ score, weight }) => {
                  totalScore += (score || 0) * (parseInt(weight) / 100);
                });

                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2} align="right">
                      <strong>Tổng điểm:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={3} align="left">
                      <strong>{totalScore.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Chi tiết sinh viên"
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
    render: (score, record, index) => (
      <Input 
        type="number" 
        defaultValue={score} 
        min={0} 
        max={record.maxScore || 10}
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
    score: 0,
  },
  {
    key: '2',
    stt: 2,
    content: 'Độ tận tâm/phức tạp của công việc',
    maxScore: 10,
    weight: '10%',
    score: 0,
  },
  {
    key: '3',
    stt: 3,
    content: 'Mức độ hoàn chỉnh',
    maxScore: 10,
    weight: '10%',
    score: 0,
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

export default ReviewTopicDetail; 