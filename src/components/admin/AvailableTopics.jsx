import React, { useEffect, useState } from 'react';
import { Table, Button, message, Modal, Input, Select } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { FaBook } from 'react-icons/fa';
import { EyeOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

const AvailableTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, topic: null });
  const [searchText, setSearchText] = useState('');
  const [filterFaculty, setFilterFaculty] = useState(null);
  const [filterMajor, setFilterMajor] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);

  useEffect(() => {
    fetchFacultiesAndMajors();
  }, []);

  useEffect(() => {
    fetchTopics();
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

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/topics', {
        params: {
          search: searchText,
          faculty: filterFaculty?.value || '',
          major: filterMajor?.value || '',
          group_empty: true,
          status: 'pending'
        }
      });
      setTopics(res.data.data || res.data || []);
    } catch {
      message.error('Không thể tải danh sách đề tài!');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', render: (_, __, idx) => idx + 1, width: 60 },
    { title: 'Tên đề tài', dataIndex: 'topic_title', key: 'topic_title' },
    { title: 'GVHD', dataIndex: 'topic_instructor', key: 'topic_instructor', render: (giangvien) => giangvien?.user_name || '-' },
    { title: 'Chuyên ngành', dataIndex: 'topic_major', key: 'topic_major', render: (major) => major?.major_title || major?.name || '-' },
    { title: 'Loại đề tài', dataIndex: 'topic_category', key: 'topic_category', render: (cat) => cat?.topic_category_title || cat?.type_name || '-' },
    {
      title: 'Đợt đăng ký',
      dataIndex: 'topic_registration_period',
      key: 'topic_registration_period',
      render: (period) => {
        if (!period) return '-';
        if (typeof period === 'string') return period;
        return `${period.registration_period_semester?.semester || ''} - ${period.registration_period_start ? new Date(period.registration_period_start * 1000).toLocaleDateString('vi-VN') : ''} đến ${period.registration_period_end ? new Date(period.registration_period_end * 1000).toLocaleDateString('vi-VN') : ''}`;
      }
    },
    { title: 'Số SV tối đa', dataIndex: 'topic_max_members', key: 'topic_max_members' },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const period = record.topic_registration_period;
        if (period && typeof period === 'object') {
          return period.block_topic ? (
            <span style={{ color: 'red', fontWeight: 600 }}>Đã khóa</span>
          ) : (
            <span style={{ color: 'green', fontWeight: 600 }}>Đang mở</span>
          );
        }
        return '-';
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => setViewModal({ open: true, topic: record })}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Đề tài sẵn có</h2>
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
        dataSource={topics}
        rowKey={r => r._id}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        open={viewModal.open}
        title="Chi tiết đề tài"
        onCancel={() => setViewModal({ open: false, topic: null })}
        footer={<Button onClick={() => setViewModal({ open: false, topic: null })}>Đóng</Button>}
        width={800}
      >
        {viewModal.topic && (
          <div style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 22, color: '#1976d2', marginBottom: 16 }}>Chi tiết đề tài</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tên đề tài</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  value={viewModal.topic.topic_title || ''}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Mô tả đề tài</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  value={viewModal.topic.topic_description || ''}
                  rows={3}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Giảng viên hướng dẫn</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  value={viewModal.topic.topic_instructor?.user_name || ''}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Chuyên ngành</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  value={viewModal.topic.topic_major?.major_title || ''}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Loại đề tài</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  value={viewModal.topic.topic_category?.topic_category_title || ''}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Số lượng thực hiện</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  value={viewModal.topic.topic_max_members || ''}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Đợt đăng ký</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  value={viewModal.topic.topic_registration_period && typeof viewModal.topic.topic_registration_period === 'object'
                    ? `${viewModal.topic.topic_registration_period.registration_period_semester?.semester || ''} - ${viewModal.topic.topic_registration_period.registration_period_start ? new Date(viewModal.topic.topic_registration_period.registration_period_start * 1000).toLocaleDateString('vi-VN') : ''} đến ${viewModal.topic.topic_registration_period.registration_period_end ? new Date(viewModal.topic.topic_registration_period.registration_period_end * 1000).toLocaleDateString('vi-VN') : ''}`
                    : ''}
                  disabled
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-500 mb-1">Nhóm thực hiện</label>
              <table className="w-full border border-gray-200 rounded mt-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1">STT</th>
                    <th className="border px-2 py-1">Họ tên</th>
                    <th className="border px-2 py-1">MSSV</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewModal.topic.topic_group_student || []).map((sv, idx) => (
                    <tr key={sv._id}>
                      <td className="border px-2 py-1 text-center">{idx + 1}</td>
                      <td className="border px-2 py-1">{sv.user_name}</td>
                      <td className="border px-2 py-1">{sv.user_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AvailableTopics; 