import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message, Space, Tag } from 'antd';
import axios from 'axios';

const DeleteRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/topics');
      const topics = response.data.data || [];
      const deleteRequests = topics.filter(topic => topic.delete_request);
      setRequests(deleteRequests);
    } catch (error) {
      message.error('Lỗi khi tải danh sách yêu cầu xóa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (topicId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/topics/${topicId}/approve-delete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      message.success('Đã duyệt yêu cầu xóa đề tài');
      fetchRequests();
    } catch (error) {
      message.error('Lỗi khi duyệt yêu cầu xóa');
    }
  };

  const handleReject = async () => {
    if (!selectedTopic) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/topics/${selectedTopic._id}/reject-delete`,
        { reject_reason: rejectReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      message.success('Đã từ chối yêu cầu xóa đề tài');
      setRejectModalVisible(false);
      setRejectReason('');
      setSelectedTopic(null);
      fetchRequests();
    } catch (error) {
      message.error('Lỗi khi từ chối yêu cầu xóa');
    }
  };

  const columns = [
    {
      title: 'Tên đề tài',
      dataIndex: 'topic_title',
      key: 'topic_title',
    },
    {
      title: 'Giảng viên',
      dataIndex: 'topic_instructor',
      key: 'topic_instructor',
      render: (instructor) => instructor?.user_name || 'N/A'
    },
    {
      title: 'Lý do xóa',
      dataIndex: 'delete_reason',
      key: 'delete_reason',
      render: (reason) => reason || 'Không có lý do'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => <Tag color="orange">Chờ duyệt</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleApprove(record._id)}>
            Duyệt
          </Button>
          <Button 
            danger 
            onClick={() => {
              setSelectedTopic(record);
              setRejectModalVisible(true);
            }}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Danh sách yêu cầu xóa đề tài</h2>
      <Table 
        columns={columns} 
        dataSource={requests} 
        loading={loading}
        rowKey="_id"
      />

      <Modal
        title="Từ chối yêu cầu xóa"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
          setSelectedTopic(null);
        }}
        okText="Từ chối"
        cancelText="Hủy"
      >
        <p>Nhập lý do từ chối yêu cầu xóa đề tài:</p>
        <Input.TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder="Nhập lý do từ chối..."
        />
      </Modal>
    </div>
  );
};

export default DeleteRequests; 