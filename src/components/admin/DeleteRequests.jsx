import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message, Space, Tag } from 'antd';
import axios from 'axios';
import { FaEye } from 'react-icons/fa';

const DeleteRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailTopic, setDetailTopic] = useState(null);

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

  const handleViewDetail = (topic) => {
    setDetailTopic(topic);
    setDetailModalVisible(true);
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
          <Button
            icon={<FaEye style={{ color: '#4096ff' }} />}
            type="text"
            onClick={() => handleViewDetail(record)}
          />
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

      <Modal
        title="Chi tiết đề tài"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {detailTopic && (
          <div style={{ padding: 24, background: '#f9fafb', borderRadius: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 24, color: '#1976d2', marginBottom: 12, letterSpacing: 1 }}>{detailTopic.topic_title}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: '#555' }}>GVHD: </span>
                <span style={{ color: '#222' }}>{detailTopic.topic_instructor?.user_name || '-'}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: '#555' }}>Chuyên ngành: </span>
                <span style={{ color: '#222' }}>{detailTopic.topic_major?.major_title || '-'}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: '#555' }}>Loại đề tài: </span>
                <span style={{ color: '#222' }}>{detailTopic.topic_category?.topic_category_title || '-'}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: '#555' }}>Học kỳ: </span>
                <span style={{ color: '#222' }}>{detailTopic.topic_registration_period?.semester || detailTopic.topic_registration_period?.title || '-'}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: '#555' }}>Số SV tối đa: </span>
                <span style={{ color: '#222' }}>{detailTopic.topic_max_members}</span>
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <span style={{ fontWeight: 600, color: '#555' }}>Mô tả:</span>
              <div style={{ color: '#333', background: '#fff', borderRadius: 8, padding: 12, marginTop: 6, minHeight: 60, whiteSpace: 'pre-line', boxShadow: '0 1px 4px #e0e7ef' }}>
                {detailTopic.topic_description || '-'}
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <span style={{ fontWeight: 600, color: '#555' }}>Danh sách sinh viên:</span>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {(detailTopic.topic_group_student || []).map((sv, idx) => (
                  <li key={sv._id} style={{ padding: '4px 0', borderBottom: '1px solid #eee' }}>
                    <b>{idx + 1}.</b> {sv.user_name} ({sv.user_id})
                  </li>
                ))}
                {(!detailTopic.topic_group_student || detailTopic.topic_group_student.length === 0) && <li>Không có sinh viên</li>}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeleteRequests; 