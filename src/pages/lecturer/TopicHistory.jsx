import React, { useEffect, useState } from 'react';
import { Table, Button } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TopicHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        if (!user || !user.id) return;
        const res = await axios.get(`/api/topics/instructor/${user.id}/all`);
        // Lọc status completed
        setTopics((res.data || []).filter(t => t.status === 'completed'));
      } catch {
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.id) fetchTopics();
  }, [user && user.id]);

  const columns = [
    {
      title: 'Tên đề tài',
      dataIndex: 'topic_title',
      key: 'topic_title',
      render: (text, record) => (
        <a onClick={() => navigate(`/lecturer/supervised-topics/${record._id}`)} className="text-blue-600 hover:text-blue-800 cursor-pointer">{text}</a>
      ),
    },
    {
      title: 'Loại đề tài',
      dataIndex: ['topic_category', 'topic_category_title'],
      key: 'topic_category',
      render: (_, record) => record.topic_category?.topic_category_title || record.topic_category?.type_name || '-',
    },
    {
      title: 'Số SV',
      dataIndex: 'topic_group_student',
      key: 'topic_group_student',
      render: arr => arr?.length || 0,
      align: 'center',
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: date => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => navigate(`/lecturer/supervised-topics/${record._id}`)} type="link">Xem</Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Lịch sử đề tài đã hoàn thành</h1>
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={topics}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10, showTotal: total => `Tổng cộng ${total} đề tài` }}
          bordered
        />
      </div>
    </div>
  );
};

export default TopicHistory; 