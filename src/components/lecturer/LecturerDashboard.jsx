import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { 
  FileTextOutlined, 
  TeamOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentTopics, setRecentTopics] = useState([]);
  const [stats, setStats] = useState({
    totalTopics: 0,
    supervisedTopics: 0,
    committeeTopics: 0
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('User object:', user);
        const recentTopicsResponse = await axios.get(`/api/topics/instructor/${user?.id}/all`);
        const topics = recentTopicsResponse.data;

        // Tính toán số lượng
        const totalTopics = topics.length;
        const supervisedTopics = topics.filter(t => t.topic_teacher_status === 'approved').length;
        const committeeTopics = topics.filter(t => t.topic_admin_status === 'approved').length;

        setStats({
          totalTopics,
          supervisedTopics,
          committeeTopics
        });

        setRecentTopics(topics.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
      setLoading(false);
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const recentTopicsColumns = [
    {
      title: 'Tên đề tài',
      dataIndex: 'topic_title',
      key: 'topic_title',
      render: (text, record) => (
        <a onClick={() => navigate(`/lecturer/topics/${record._id}`)} className="text-blue-600 hover:text-blue-800">
          {text}
        </a>
      ),
    },
    {
      title: 'GVHD',
      dataIndex: ['topic_instructor', 'user_name'],
      key: 'topic_instructor',
      render: (text, record) => record.topic_instructor?.user_name || '-',
    },
    {
      title: 'Loại đề tài',
      dataIndex: ['topic_category', 'type_name'],
      key: 'topic_category',
      render: (text, record) => record.topic_category?.type_name || record.topic_category?.topic_category_title || '-',
    },
    {
      title: 'SV thực hiện',
      dataIndex: 'topic_max_members',
      key: 'topic_max_members',
      render: (text) => text || '-',
    },
    {
      title: 'Giảng viên',
      dataIndex: 'topic_teacher_status',
      key: 'topic_teacher_status',
      render: (status) => status === 'approved' ? <Tag color="green">Đã duyệt</Tag> : status === 'pending' ? <Tag color="orange">Chờ duyệt</Tag> : status === 'rejected' ? <Tag color="red">Từ chối</Tag> : status,
    },
    {
      title: 'Giáo vụ',
      dataIndex: 'topic_admin_status',
      key: 'topic_admin_status',
      render: (status) => status === 'approved' ? <Tag color="green">Đã duyệt</Tag> : status === 'pending' ? <Tag color="orange">Chờ duyệt</Tag> : status === 'rejected' ? <Tag color="red">Từ chối</Tag> : status,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Thống kê */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tổng số đề tài"
              value={stats.totalTopics}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đề tài hướng dẫn"
              value={stats.supervisedTopics}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đề tài hội đồng"
              value={stats.committeeTopics}
              prefix={<ClockCircleOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

      {/* Danh sách đề tài gần đây */}
      <Card 
        title="Đề tài gần đây" 
        extra={
          <button 
            onClick={() => navigate('/lecturer/topics')}
            className="text-blue-600 hover:text-blue-800"
          >
            Xem tất cả
          </button>
        }
        className="mb-6"
      >
        <Table
          columns={recentTopicsColumns}
          dataSource={recentTopics}
          loading={loading}
          pagination={false}
          size="middle"
          rowKey="_id"
        />
      </Card>

      {/* Các hành động nhanh */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/lecturer/topics/add')}
            className="text-center"
          >
            <FileTextOutlined className="text-3xl mb-2" />
            <div>Thêm đề tài mới</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/lecturer/proposed-topics')}
            className="text-center"
          >
            <CheckCircleOutlined className="text-3xl mb-2" />
            <div>Duyệt nhóm thực hiện</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/lecturer/supervised-topics')}
            className="text-center"
          >
            <TeamOutlined className="text-3xl mb-2" />
            <div>Xem đề tài hướng dẫn</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/lecturer/committee')}
            className="text-center"
          >
            <ClockCircleOutlined className="text-3xl mb-2" />
            <div>Xem đề tài hội đồng</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LecturerDashboard; 