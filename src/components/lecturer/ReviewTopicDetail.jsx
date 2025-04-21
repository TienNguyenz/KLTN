import React, { useState } from 'react';
import { Typography, Card, Row, Col, Button, Space, Modal, Table, Input } from 'antd';
import { FileTextOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getReviewTopicById } from '../../data/mockThesisData';

const { Title, Text, Paragraph } = Typography;

const ReviewTopicDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  React.useEffect(() => {
    const loadTopic = async () => {
      const data = await getReviewTopicById(id);
      setTopic(data);
    };
    loadTopic();
  }, [id]);

  const showModal = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (!topic) {
    return null;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="mb-6">
        <div className="space-y-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Tên đề tài</div>
            <div className="text-base">{topic.name}</div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Số lượng thực hiện</div>
              <div className="text-base">{topic.maxStudents || 1}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Chuyên ngành</div>
              <div className="text-base">{topic.major}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Loại đề tài</div>
              <div className="text-base">{topic.type}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Mô tả đề tài</div>
            <div className="text-base whitespace-pre-line border rounded-md p-4 bg-gray-50 min-h-[100px]">
              {topic.description}
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
                <Button type="link" danger disabled>
                  Chưa nộp
                </Button>
              </Space>
            </Card>
          </Col>
          <Col span={8}>
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
          <Col span={8}>
            <Card size="small" className="text-center">
              <Space direction="vertical" className="w-full">
                <FileTextOutlined className="text-2xl" />
                <Text>Báo cáo khóa luận</Text>
                <Button type="link" danger disabled>
                  Chưa nộp
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={5} className="m-0">Giảng viên hướng dẫn</Title>
          <EditOutlined className="text-lg cursor-pointer" />
        </div>
        <Text>{topic.supervisor}</Text>

        <div className="mt-6">
          <Title level={5}>Nhóm thực hiện</Title>
          <table className="min-w-full mt-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">STT</th>
                <th className="px-4 py-2 text-left">Số lượng</th>
                <th className="px-4 py-2 text-left">Thành viên</th>
                <th className="px-4 py-2 text-left">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {topic.groups?.map((member, index) => (
                <tr key={member.id} className="border-b">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2">
                    {member.studentName}
                    <span className="ml-2 text-gray-500">({member.studentId})</span>
                  </td>
                  <td className="px-4 py-2">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={() => showModal(member)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <Text>Tên đề tài: {topic.title}</Text>
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
                  <td className="border px-4 py-2">{selectedStudent?.studentName}</td>
                  <td className="border px-4 py-2">{selectedStudent?.studentId}</td>
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
                  totalScore += score * (parseInt(weight) / 100);
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

export default ReviewTopicDetail; 