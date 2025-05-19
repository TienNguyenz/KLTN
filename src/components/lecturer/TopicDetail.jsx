import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Button, Space, Modal, Table, Input, message } from 'antd';image.png
import { FileTextOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const TopicDetail = () => {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const loadTopic = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/topics/${id}`);
        setTopic(response.data);
      } catch (error) {
        console.error('Error loading topic:', error);
        message.error('Không thể tải thông tin đề tài');
      } finally {
        setLoading(false);
      }
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

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (!topic) {
    return <div className="p-6">Không tìm thấy thông tin đề tài</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="mb-6">
        <div className="space-y-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Tên đề tài</div>
            <div className="text-base">{topic.topic_title}</div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Số lượng thực hiện</div>
              <div className="text-base">{topic.topic_max_members || 1}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Chuyên ngành</div>
              <div className="text-base">{topic.topic_major?.major_title}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Loại đề tài</div>
              <div className="text-base">{topic.topic_category}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Mô tả đề tài</div>
            <div className="text-base whitespace-pre-line border rounded-md p-4 bg-gray-50 min-h-[100px]">
              {topic.topic_description}
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
          <Title level={5} className="m-0">Giảng viên phản biện</Title>
          <EditOutlined className="text-lg cursor-pointer" />
        </div>
        <Text>{topic.topic_reviewer?.user_name || 'Chưa có'}</Text>

        <div className="mt-6">
          <Title level={5}>Nhóm đăng ký</Title>
          {topic.topic_group_student && topic.topic_group_student.length > 0 ? (
            <div className="mt-4">
              {topic.topic_group_student.map((student) => (
                <div key={student._id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <div className="font-medium">{student.user_name}</div>
                    <div className="text-sm text-gray-500">{student.user_id}</div>
                  </div>
                  <Button type="link" onClick={() => showModal(student)}>
                    Đánh giá
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 mt-4">Chưa có sinh viên đăng ký</div>
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
            <Text>Tên đề tài: {topic.topic_title}</Text>
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
                  <td className="border px-4 py-2">{selectedStudent?.user_name}</td>
                  <td className="border px-4 py-2">{selectedStudent?.user_id}</td>
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
    </div>
  );
};

export default TopicDetail; 