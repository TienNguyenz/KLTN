import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Typography, Input, Button, message, Modal, Spin } from 'antd';
import { SearchOutlined, FileExcelOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { getCommitteeTopics } from '../../services/topicService';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

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
  const [councilModal, setCouncilModal] = useState({ open: false, loading: false, data: null });
  const [users, setUsers] = useState([]);
  const [majors, setMajors] = useState([]);
  const [faculties, setFaculties] = useState([]);

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

  useEffect(() => {
    axios.get('/api/database/collections/User').then(res => {
      setUsers(res.data.data || []);
    });
    axios.get('/api/database/collections/majors').then(res => {
      setMajors(res.data.data || []);
    });
    axios.get('/api/database/collections/faculties').then(res => {
      setFaculties(res.data.data || []);
    });
  }, []);

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

  const handleShowCouncil = async (assemblyId) => {
    setCouncilModal({ open: true, loading: true, data: null });
    try {
      const res = await axios.get(`/api/database/collections/assemblies`);
      const councils = res.data.data || [];
      const found = councils.find(c => String(c._id) === String(assemblyId));
      setCouncilModal({ open: true, loading: false, data: found });
    } catch {
      setCouncilModal({ open: true, loading: false, data: null });
    }
  };

  const getUserName = (id) => {
    const user = users.find(u => String(u._id) === String(id));
    return user ? `${user.user_id} - ${user.user_name}` : id;
  };

  const getFacultyTitle = (user_faculty) => {
    if (!user_faculty) return '-';
    if (typeof user_faculty === 'object') {
      return user_faculty.faculty_title || user_faculty.faculty_name || user_faculty.title || user_faculty.name || '-';
    }
    const found = faculties.find(f => String(f._id) === String(user_faculty));
    return found ? (found.faculty_title || found.faculty_name || found.title || found.name) : '-';
  };

  const getMajorTitle = (user_major) => {
    if (!user_major) return '-';
    if (typeof user_major === 'object') {
      return user_major.major_title || user_major.title || '-';
    }
    const found = majors.find(m => String(m._id) === String(user_major));
    return found ? (found.major_title || found.title) : '-';
  };

  const columns = [
    {
      title: 'Tên đề tài',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
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
      title: 'Tên hội đồng',
      dataIndex: 'assembly',
      key: 'assembly',
      width: '18%',
      render: (text, record) => (
        <a
          className="text-purple-700 hover:underline cursor-pointer"
          onClick={() => handleShowCouncil(record.assemblyId)}
        >
          {text || '[Chưa có]'}
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
      dataIndex: 'students',
      key: 'students',
      width: '8%',
      align: 'center',
      render: students => students ? students.length : 0,
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
      <Modal
        open={councilModal.open}
        onCancel={() => setCouncilModal({ open: false, loading: false, data: null })}
        footer={null}
        title="Thông tin hội đồng"
        width={500}
      >
        {councilModal.loading ? (
          <div className="flex justify-center items-center py-8"><Spin /></div>
        ) : councilModal.data ? (
          <div>
            <div className="mb-2"><b>Tên hội đồng:</b> {councilModal.data.assembly_name}</div>
            <div className="mb-2"><b>Chủ tịch:</b> {getUserName(councilModal.data.chairman)}</div>
            <div className="mb-2"><b>Thư ký:</b> {getUserName(councilModal.data.secretary)}</div>
            <div className="mb-2">
              <b>Thành viên:</b>
              <div>
                {Array.isArray(councilModal.data.members) && councilModal.data.members.length > 0
                  ? councilModal.data.members.map((id, idx) => {
                      let user = users.find(u => String(u._id) === String(id) || String(u.user_id) === String(id) || String(u.id) === String(id));
                      if (!user && typeof id === 'object') user = id;
                      const userId = user?.user_id || user?.studentId || user?.id || id;
                      const userName = user?.user_name || user?.studentName || user?.name || '-';
                      const faculty = getFacultyTitle(user?.user_faculty);
                      const major = getMajorTitle(user?.user_major);
                      return (
                        <div key={idx} style={{ marginBottom: 6 }}>
                          <span className="font-semibold">{userId} - {userName}</span>
                          <br />
                          <span className="text-xs text-gray-500">(Khoa: {faculty}, Ngành: {major})</span>
                        </div>
                      );
                    })
                  : <span className="italic text-gray-400">-</span>
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="text-red-500">Không tìm thấy thông tin hội đồng</div>
        )}
      </Modal>
    </div>
  );
};

export default CommitteeTopics; 