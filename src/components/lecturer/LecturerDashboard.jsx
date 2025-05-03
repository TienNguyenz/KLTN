import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { 
  FileTextOutlined, 
  TeamOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTopics: 0,
    supervisedTopics: 0,
    reviewTopics: 0,
    committeeTopics: 0
  });
  const [recentTopics, setRecentTopics] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Lấy thống kê tổng quan
        const statsResponse = await axios.get(`/api/lecturers/${user?._id}/stats`);
        setStats(statsResponse.data);

        // Lấy danh sách đề tài gần đây
        const recentTopicsResponse = await axios.get(`/api/lecturers/${user?._id}/recent-topics`);
        setRecentTopics(recentTopicsResponse.data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
      setLoading(false);
    };

    if (user?._id) {
    loadData();
    }
  }, [user?._id]);

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
      title: 'Loại',
      dataIndex: 'topic_category',
      key: 'topic_category',
      width: '15%',
      render: (category) => category?.type_name || 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'topic_status',
      key: 'topic_status',
      width: '15%',
      render: (status) => {
        const statusConfig = {
          'PENDING': { color: 'processing', text: 'Chờ duyệt' },
          'APPROVED': { color: 'success', text: 'Đã duyệt' },
          'REJECTED': { color: 'error', text: 'Từ chối' },
          'IN_PROGRESS': { color: 'warning', text: 'Đang thực hiện' },
          'COMPLETED': { color: 'success', text: 'Hoàn thành' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

      {/* Thống kê */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số đề tài"
              value={stats.totalTopics}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đề tài hướng dẫn"
              value={stats.supervisedTopics}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đề tài phản biện"
              value={stats.reviewTopics}
              prefix={<CheckCircleOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
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
            onClick={() => navigate('/lecturer/approve-groups')}
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
            onClick={() => navigate('/lecturer/review-topics')}
            className="text-center"
          >
            <CheckCircleOutlined className="text-3xl mb-2" />
            <div>Xem đề tài phản biện</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LecturerDashboard; 