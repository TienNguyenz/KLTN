import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Typography, Input, Button } from 'antd';
import { SearchOutlined, FileExcelOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { getSupervisedTopics } from '../../data/mockThesisData';

const { Title } = Typography;

const SupervisedTopics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  useEffect(() => {
    setLoading(true);
    // Lấy dữ liệu từ mockData
    const topics = getSupervisedTopics();
    setData(topics);
    setLoading(false);
  }, []);

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
    const exportData = data.map(item => ({
      'Tên đề tài': item.title,
      'GVHD': item.supervisor,
      'GVPB': item.reviewer,
      'Loại đề tài': item.type,
      'SVTH': item.studentId,
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
      filters: [
        { text: 'Ứng dụng', value: 'Ứng dụng' },
        { text: 'Nghiên cứu', value: 'Nghiên cứu' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'SVTH',
      dataIndex: 'studentId',
      key: 'studentId',
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
        { text: 'REGISTERED', value: 'REGISTERED' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'processing'} className="px-3 py-1">
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <Title level={5} className="text-gray-800 m-0">Đề tài của tôi</Title>
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
          dataSource={data}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data.length,
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
    </div>
  );
};

export default SupervisedTopics;
