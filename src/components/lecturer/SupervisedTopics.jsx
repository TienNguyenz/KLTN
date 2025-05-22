import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Typography, Input, Button } from 'antd';
import { SearchOutlined, FileExcelOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;

const SupervisedTopics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [notifications, setNotifications] = useState([]);

  // Fetch lecturers and categories once
  useEffect(() => {
    axios.get('/api/lecturers').then(res => {
      setLecturers(res.data.data || []);
    }).catch(() => {
      setLecturers([]);
    });
    axios.get('/api/topics/topic-types').then(res => {
      setCategories(res.data.data || res.data || []);
    }).catch(() => {
      // Fallback mock data nếu API lỗi
      setCategories([
        { _id: 'NC', topic_category_title: 'Nghiên cứu' },
        { _id: 'UD', topic_category_title: 'Ứng dụng' },
        { _id: 'PTTK', topic_category_title: 'Phân tích thiết kế' }
      ]);
    });
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        if (!user || !user._id) return; // Đảm bảo đã có user
        // Truyền lecturerId nếu backend yêu cầu
        const response = await axios.get(`/api/topics/supervised-topics?lecturerId=${user._id}`);
        setData(response.data);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [user && user._id]);

  useEffect(() => {
    if (!user || !user._id) return;
    axios.get(`/api/notifications/${user._id}`)
      .then(res => setNotifications(res.data))
      .catch(err => console.error(err));
  }, [user && user._id]);

  // Map topic data to display info
  const mappedData = data.map(topic => {
    const reviewerObj = typeof topic.topic_reviewer === 'object' && topic.topic_reviewer !== null
      ? topic.topic_reviewer
      : lecturers.find(l => l._id === topic.topic_reviewer);
    const instructorObj = typeof topic.topic_instructor === 'object' && topic.topic_instructor !== null
      ? topic.topic_instructor
      : lecturers.find(l => l._id === topic.topic_instructor);
    const categoryObj = typeof topic.topic_category === 'object' && topic.topic_category !== null
      ? topic.topic_category
      : categories.find(c => c._id === topic.topic_category);
    let statusLabel = '';
    if (topic.status === 'pending') statusLabel = 'PENDING';
    else if (topic.status === 'waiting_admin') statusLabel = 'WAITING ADMIN';
    else if (topic.status === 'active') statusLabel = 'ACTIVE';
    else if (topic.status === 'rejected') statusLabel = 'REJECTED';
    return {
      id: topic._id,
      title: topic.topic_title,
      supervisor: instructorObj?.user_name || 'N/A',
      reviewer: reviewerObj?.user_name || 'Chưa có',
      type: categoryObj?.topic_category_title || 'N/A',
      studentCount: topic.topic_group_student?.length || 0,
      lecturer: instructorObj?.user_name || 'N/A',
      status: statusLabel
    };
  });

  const validStatuses = ['WAITING ADMIN', 'ACTIVE'];
  const filteredData = mappedData.filter(item => validStatuses.includes(item.status));

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-4 bg-white shadow-lg rounded-lg" style={{ minWidth: 250 }}>
        <Input
          placeholder={`Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          className="mb-3 w-full"
          prefix={<SearchOutlined className="text-gray-400" />}
        />
        <Space className="flex justify-between">
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="middle"
            className="w-24 bg-blue-500"
          >
            Tìm
          </Button>
          <Button 
            onClick={() => handleReset(clearFilters)} 
            size="middle" 
            className="w-24"
          >
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined 
        style={{ color: filtered ? '#1890ff' : undefined }} 
        className="text-lg"
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const exportToExcel = () => {
    const exportData = mappedData.map(item => ({
      'Tên đề tài': item.title,
      'GVHD': item.supervisor,
      'GVPB': item.reviewer,
      'Loại đề tài': item.type,
      'SVTH': item.studentCount,
      'Giảng viên': item.lecturer,
      'Trạng thái': item.status,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Đề tài hướng dẫn");
    XLSX.writeFile(wb, "de_tai_huong_dan.xlsx");
  };

  const handleTopicClick = (topicId) => {
    navigate(`/lecturer/supervised-topics/${topicId}`);
  };

  const columns = [
    {
      title: 'Tên đề tài',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
      ...getColumnSearchProps('title'),
      render: (text, record) => (
        <a 
          onClick={() => handleTopicClick(record.id)} 
          className="text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          {text}
        </a>
      ),
    },
    {
      title: 'GVHD',
      dataIndex: 'supervisor',
      key: 'supervisor',
      width: '15%',
      ...getColumnSearchProps('supervisor'),
    },
    {
      title: 'GVPB',
      dataIndex: 'reviewer',
      key: 'reviewer',
      width: '15%',
      ...getColumnSearchProps('reviewer'),
    },
    {
      title: 'Loại đề tài',
      dataIndex: 'type',
      key: 'type',
      width: '10%',
      filters: categories.map(c => ({ text: c.topic_category_title, value: c.topic_category_title })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'SVTH',
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: '8%',
      align: 'center',
    },
    {
      title: 'Giảng viên',
      dataIndex: 'lecturer',
      key: 'lecturer',
      width: '15%',
      ...getColumnSearchProps('lecturer'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      align: 'center',
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'WAITING ADMIN', value: 'WAITING ADMIN' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={
          status === 'ACTIVE' ? 'success' :
          status === 'WAITING ADMIN' ? 'warning' : 'default'
        } className="px-3 py-1">
          {status}
        </Tag>
      ),
    },
  ];

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!lecturers.length || !categories.length) return <div className="p-6 text-red-500">Không có dữ liệu phụ trợ (giảng viên/loại đề tài). Kiểm tra lại API hoặc dữ liệu!</div>;
  if (!mappedData.length) return <div className="p-6 text-yellow-600">Không có đề tài nào.</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <Title level={5} className="text-gray-800 m-0">image.png</Title>
        <Button 
          type="primary" 
          icon={<FileExcelOutlined />} 
          onClick={exportToExcel}
          className="bg-blue-500"
        >
          Xuất Excel
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: mappedData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng cộng ${total} đề tài.`,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
          }}
          bordered
          size="middle"
          className="custom-table"
        />
      </div>
      <div className="mt-6">
        {notifications.map(noti => (
          <div key={noti._id} className="text-blue-600 font-semibold">
            {noti.user_notification_content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupervisedTopics;
