import React, { useEffect, useState } from 'react';
import { Table, Tag, Modal, Button, Descriptions, Typography, Input, Select, message } from 'antd';
import { CheckCircleTwoTone, TeamOutlined, UserOutlined, BookOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Search } = Input;
const { Option } = Select;

const ThesisHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, topic: null });
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterFaculty, setFilterFaculty] = useState(null);
  const [filterMajor, setFilterMajor] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);

  useEffect(() => {
    fetchFacultiesAndMajors();
  }, []);

  useEffect(() => {
    fetchCompletedTheses();
  }, [searchText, filterFaculty, filterMajor]);

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

  const fetchCompletedTheses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/topics?all=1', {
        params: {
          search: searchText,
          faculty: filterFaculty?.value || '',
          major: filterMajor?.value || ''
        }
      });
      const all = res.data.data || [];
      const completed = all.filter(t => t.status === 'completed' || t.topic_teacher_status === 'completed');
      setData(completed);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (record) => {
    setViewModal({ open: true, topic: record });
    setDetailLoading(true);
    try {
      const res = await axios.get(`/api/topics/${record._id}`);
      setDetail(res.data.data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    { title: 'Tên đề tài', dataIndex: 'topic_title', key: 'topic_title' },
    { title: 'GVHD', dataIndex: 'topic_instructor', key: 'topic_instructor', render: i => i?.user_name || '-' },
    { title: 'Nhóm SV', dataIndex: 'topic_group_student', key: 'topic_group_student', render: arr => arr?.map(sv => sv.user_name).join(', ') },
    { title: 'Ngày hoàn thành', dataIndex: 'updatedAt', key: 'updatedAt', render: d => d ? new Date(d).toLocaleDateString('vi-VN') : '-' },
    { title: 'Trạng thái', key: 'status', render: () => <Tag color="green">Đã hoàn thành</Tag> },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          Xem lại
        </Button>
      ),
    },
  ];

  return (
    <div>
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
      {data.length === 0 && !loading && (
        <div className="text-center text-gray-500 mb-4">Không có đề tài hoàn thành nào.</div>
      )}
      <Table
        columns={columns}
        dataSource={data}
        rowKey={r => r._id}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        open={viewModal.open}
        title={null}
        onCancel={() => { setViewModal({ open: false, topic: null }); setDetail(null); }}
        footer={<Button onClick={() => { setViewModal({ open: false, topic: null }); setDetail(null); }}>Đóng</Button>}
        width={700}
        bodyStyle={{ background: '#f9fafb', borderRadius: 12, boxShadow: '0 2px 8px #00000010', padding: 32 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 40 }} />
          <Typography.Title level={3} style={{ margin: 0, marginTop: 8 }}>
            Chi tiết đề tài đã hoàn thành
          </Typography.Title>
        </div>
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>Đang tải chi tiết...</div>
        ) : detail ? (
          <Descriptions
            bordered
            column={1}
            size="middle"
            labelStyle={{ fontWeight: 600, width: 180, background: '#f4f8f6' }}
            contentStyle={{ minWidth: 300, background: '#fff' }}
          >
            <Descriptions.Item label={<><BookOutlined /> Tên đề tài</>}>{detail.topic_title}</Descriptions.Item>
            <Descriptions.Item label={<><UserOutlined /> GVHD</>}>{detail.topic_instructor?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label={<><TeamOutlined /> Nhóm SV</>}>{(detail.topic_group_student || []).map(sv => sv.user_name).join(', ')}</Descriptions.Item>
            <Descriptions.Item label="Chuyên ngành">{detail.topic_major?.title || '-'}</Descriptions.Item>
            <Descriptions.Item label="Loại đề tài">{detail.topic_category?.title || '-'}</Descriptions.Item>
            <Descriptions.Item label="Số lượng thành viên">{(detail.topic_group_student || []).length}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color="green" style={{ fontWeight: 600, fontSize: 15 }}>
                <CheckCircleTwoTone twoToneColor="#52c41a" /> Đã hoàn thành
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={<><CalendarOutlined /> Ngày tạo</>}>{detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('vi-VN') : '-'}</Descriptions.Item>
            <Descriptions.Item label={<><CalendarOutlined /> Ngày hoàn thành</>}>{detail.updatedAt ? new Date(detail.updatedAt).toLocaleDateString('vi-VN') : '-'}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{detail.topic_description || '-'}</Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ textAlign: 'center', padding: 32 }}>Không lấy được chi tiết đề tài.</div>
        )}
      </Modal>
    </div>
  );
};

export default ThesisHistory; 