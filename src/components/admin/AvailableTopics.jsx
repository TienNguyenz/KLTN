import React, { useEffect, useState } from 'react';
import { Table, Button, message } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import { FaBook } from 'react-icons/fa';

const AvailableTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get('/api/topics')
      .then(res => {
        const allTopics = res.data.data || res.data || [];
        console.log('All topics:', allTopics);
        const filtered = allTopics.filter(
          t =>
            Array.isArray(t.topic_group_student)
              ? t.topic_group_student.filter(Boolean).length === 0
              : !t.topic_group_student || t.topic_group_student.length === 0
        );
        console.log('Filtered topics:', filtered);
        setTopics(filtered);
      })
      .catch(() => message.error('Không thể tải danh sách đề tài!'))
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = (topicId) => {
    axios.post('/api/topics/register', { topicId })
      .then(() => message.success('Đăng ký thành công!'))
      .catch(() => message.error('Đăng ký thất bại!'));
  };

  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', render: (_, __, idx) => idx + 1, width: 60 },
    { title: 'Tên đề tài', dataIndex: 'topic_title', key: 'topic_title' },
    { title: 'GVHD', dataIndex: 'topic_instructor', key: 'topic_instructor', render: (giangvien) => giangvien?.user_name || '-' },
    { title: 'Chuyên ngành', dataIndex: 'topic_major', key: 'topic_major', render: (major) => major?.major_title || '-' },
    { title: 'Loại đề tài', dataIndex: 'topic_category', key: 'topic_category', render: (cat) => cat?.topic_category_title || '-' },
    { title: 'Học kỳ', dataIndex: 'topic_registration_period', key: 'topic_registration_period', render: (sem) => sem?.semester || '-' },
    { title: 'Số SV tối đa', dataIndex: 'topic_max_members', key: 'topic_max_members' },
    { title: 'Số SV hiện tại', dataIndex: 'topic_group_student', key: 'topic_group_student', render: (arr) => arr?.length || 0 },
    { title: 'Mô tả', dataIndex: 'topic_description', key: 'topic_description', ellipsis: true },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => status || '-' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          disabled={record.topic_group_student?.length >= record.topic_max_members}
          onClick={() => handleRegister(record._id)}
        >
          Chọn
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Đề tài sẵn có</h2>
      <Table
        columns={columns}
        dataSource={topics}
        rowKey={r => r._id}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AvailableTopics; 