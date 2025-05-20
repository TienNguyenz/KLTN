import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Typography, Input, Button, message } from 'antd';
import { SearchOutlined, FileExcelOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { getCommitteeTopics } from '../../services/topicService';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;

const CommitteeTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const userId = user?._id || user?.id;

        if (!userId) {
          message.error('Không tìm thấy thông tin người dùng');
          setLoading(false);
          return;
        }

        const data = await getCommitteeTopics(userId);
        setTopics(data);

      } catch (error) {
        console.error('An unexpected error occurred in fetchTopics:', error);
        message.error('Đã xảy ra lỗi không mong muốn khi tải đề tài.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [user]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

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

  const exportToExcel = () => {
    const exportData = topics.map(item => ({
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
    XLSX.utils.book_append_sheet(wb, ws, "Đề tài hội đồng");
    XLSX.writeFile(wb, "de_tai_hoi_dong.xlsx");
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
          onClick={() => navigate(`/lecturer/committee-topics/${record.id}`)} 
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
        <Title level={5} className="text-gray-800 m-0">Đề tài hội đồng</Title>
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
          dataSource={topics}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: topics.length,
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

export default CommitteeTopics; 