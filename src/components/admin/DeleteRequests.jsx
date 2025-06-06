import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message, Space, Tag, Select } from 'antd';
import axios from 'axios';
import { FaEye } from 'react-icons/fa';

const { Search } = Input;
const { Option } = Select;

const DeleteRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailTopic, setDetailTopic] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterFaculty, setFilterFaculty] = useState(null);
  const [filterMajor, setFilterMajor] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);

  const fetchFacultiesAndMajors = async () => {
    try {
      const [facultiesRes, majorsRes] = await Promise.all([
        axios.get('/api/database/collections/faculties'),
        axios.get('/api/database/collections/majors')
      ]);
      setFaculties(facultiesRes.data.data);
      setMajors(majorsRes.data.data);
    } catch {
      message.error('Không thể tải dữ liệu khoa và chuyên ngành');
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/topics', {
        params: {
          search: searchText,
          faculty: filterFaculty?.value || '',
          major: filterMajor?.value || ''
        }
      });
      const topics = response.data.data || [];
      const deleteRequests = topics.filter(topic => topic.delete_request);
      setRequests(deleteRequests);
    } catch {
      message.error('Lỗi khi tải danh sách yêu cầu xóa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultiesAndMajors();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [searchText, filterFaculty, filterMajor]);

  const handleApprove = async (topicId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`/api/topics/${topicId}/approve-delete`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      message.success('Duyệt xóa thành công!');
      fetchRequests();
    } catch {
      message.error('Duyệt xóa thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (topicId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`/api/topics/${topicId}/reject-delete`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      message.success('Từ chối xóa thành công!');
      fetchRequests();
    } catch {
      message.error('Từ chối xóa thất bại!');
    } finally {
      setLoading(false);
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
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm theo tên đề tài"
          allowClear
          onSearch={value => setSearchText(value)}
          style={{ width: 300 }}
        />
        <Select
          style={{ width: 200 }}
          placeholder="Chọn khoa"
          allowClear
          labelInValue
          onChange={option => {
            setFilterFaculty(option);
            setFilterMajor(null);
          }}
          value={filterFaculty}
        >
          {faculties.map(faculty => (
            <Option key={faculty._id} value={faculty._id}>
              {faculty.faculty_title || faculty.faculty_name || faculty.name || faculty.title || faculty._id}
            </Option>
          ))}
        </Select>
        <Select
          style={{ width: 200 }}
          placeholder="Chọn chuyên ngành"
          allowClear
          disabled={!filterFaculty}
          labelInValue
          onChange={option => setFilterMajor(option)}
          value={filterMajor}
        >
          {majors.filter(major => major.major_faculty === (filterFaculty?.value || filterFaculty)).map(major => (
            <Option key={major._id} value={major._id}>
              {major.major_title}
            </Option>
          ))}
        </Select>
      </div>
      <Table 
        columns={columns} 
        dataSource={requests} 
        loading={loading}
        rowKey="_id"
      />

      <Modal
        title="Từ chối yêu cầu xóa"
        open={rejectModalVisible}
        onOk={() => handleReject(selectedTopic._id)}
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