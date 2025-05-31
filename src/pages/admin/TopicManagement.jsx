import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, Modal, Form, message, Tooltip, Badge } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { confirm } = Modal;

const TopicManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [filterMajor, setFilterMajor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data cho các chuyên ngành và trạng thái
  const majors = [
    { value: 'CNTT', label: 'Công nghệ thông tin' },
    { value: 'KTPM', label: 'Kỹ thuật phần mềm' },
    { value: 'HTTT', label: 'Hệ thống thông tin' },
    { value: 'MMT', label: 'Mạng máy tính' },
  ];

  const statuses = [
    { value: 'pending', label: 'Chờ duyệt', color: 'gold' },
    { value: 'waiting', label: 'Chờ sinh viên đăng ký', color: 'blue' },
    { value: 'active', label: 'Đang thực hiện', color: 'green' },
    { value: 'completed', label: 'Đã hoàn thành', color: 'purple' },
    { value: 'rejected', label: 'Từ chối', color: 'red' },
  ];

  const columns = [
    {
      title: 'Mã đề tài',
      dataIndex: 'code',
      key: 'code',
      width: '10%',
    },
    {
      title: 'Tên đề tài',
      dataIndex: 'topic_title',
      key: 'topic_title',
      width: '25%',
    },
    {
      title: 'GVHD',
      dataIndex: 'topic_instructor',
      key: 'topic_instructor',
      width: '15%',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div className="text-xs text-gray-500">{record.topic_instructor_code}</div>
        </div>
      ),
    },
    {
      title: 'Chuyên ngành',
      dataIndex: 'topic_major',
      key: 'topic_major',
      width: '15%',
      filters: majors.map(major => ({
        text: major.label,
        value: major.value,
      })),
      onFilter: (value, record) => record.topic_major === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => {
        const statusInfo = statuses.find(s => s.value === status);
        return (
          <Tag color={statusInfo?.color}>
            {statusInfo?.label || status}
          </Tag>
        );
      },
      filters: statuses.map(status => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.status === 'waiting_admin' && (
            <>
              <Tooltip title="Duyệt">
                <Button 
                  type="link" 
                  icon={<CheckCircleOutlined />} 
                  className="text-green-600"
                  onClick={() => handleApprove(record)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button 
                  type="link" 
                  icon={<CloseCircleOutlined />} 
                  className="text-red-600"
                  onClick={() => handleReject(record)}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/topics');
      setData(res.data);
    } catch (err) {
      message.error('Lỗi khi tải danh sách đề tài');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleViewDetails = (record) => {
    Modal.info({
      title: 'Chi tiết đề tài',
      width: 800,
      content: (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-medium text-gray-500">Mã đề tài</div>
              <div>{record.code}</div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Tên đề tài</div>
              <div>{record.topic_title}</div>
            </div>
            <div>
              <div className="font-medium text-gray-500">GVHD</div>
              <div>{record.topic_instructor} ({record.topic_instructor_code})</div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Chuyên ngành</div>
              <div>{record.topic_major}</div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Loại đề tài</div>
              <div>{record.topic_category}</div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Số SV tối đa</div>
              <div>{record.topic_max_members}</div>
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-500">Mô tả</div>
            <div className="whitespace-pre-line">
              {record.description || 'Chưa có mô tả chi tiết.'}
            </div>
          </div>
          {record.status === 'active' && (
            <div>
              <div className="font-medium text-gray-500 mb-2">Sinh viên thực hiện</div>
              <Table
                size="small"
                pagination={false}
                columns={[
                  { title: 'MSSV', dataIndex: 'studentId', key: 'studentId' },
                  { title: 'Họ tên', dataIndex: 'name', key: 'name' },
                  { title: 'Lớp', dataIndex: 'class', key: 'class' },
                ]}
                dataSource={[
                  { key: '1', studentId: '19110001', name: 'Nguyễn Văn X', class: 'KTPM2019' },
                  { key: '2', studentId: '19110002', name: 'Trần Thị Y', class: 'KTPM2019' },
                ]}
              />
            </div>
          )}
        </div>
      ),
    });
  };

  const handleApprove = (record) => {
    confirm({
      title: 'Xác nhận duyệt đề tài',
      icon: <CheckCircleOutlined className="text-green-600" />,
      content: `Bạn có chắc chắn muốn duyệt đề tài "${record.topic_title}"?`,
      okText: 'Duyệt',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await axios.put(`http://localhost:5000/api/topics/${record._id}/approve-by-admin`);
          message.success('Đã duyệt đề tài thành công!');
          fetchTopics();
        } catch (err) {
          message.error('Lỗi khi duyệt đề tài!');
        }
      },
    });
  };

  const handleReject = (record) => {
    confirm({
      title: 'Xác nhận từ chối đề tài',
      icon: <ExclamationCircleOutlined className="text-red-600" />,
      content: `Bạn có chắc chắn muốn từ chối đề tài "${record.topic_title}"?`,
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        message.success('Đã từ chối đề tài!');
      },
    });
  };

  const handleEdit = (record) => {
    setEditingTopic(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Vui lòng đăng nhập lại');
        return;
      }
      const res = await axios.delete(
        `http://localhost:5000/api/topics/${record.key}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { delete_reason: 'Yêu cầu xóa từ giảng viên' }
        }
      );
      if (res.data?.message?.includes('Đã gửi yêu cầu xóa cho admin')) {
        window.alert('Yêu cầu xóa đã được gửi đến giáo vụ!');
        navigate('/lecturer/topics');
      } else if (res.data?.message?.includes('Xóa đề tài thành công')) {
        window.alert('Xóa đề tài thành công');
        navigate('/lecturer/topics');
      } else {
        window.alert(res.data?.message || 'Thao tác thành công');
        navigate('/lecturer/topics');
      }
    } catch (error) {
      // ... như cũ
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      console.log('Success:', values);
      message.success('Đã cập nhật thông tin đề tài!');
      setIsModalVisible(false);
      form.resetFields();
      setEditingTopic(null);
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản Lý Đề Tài</h1>
          <div className="text-gray-500 text-sm mt-1">
            Tổng số: {data.length} đề tài | Chờ duyệt: {data.filter(item => item.status === 'pending').length} | 
            Đang thực hiện: {data.filter(item => item.status === 'active').length}
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} className="bg-blue-600">
          Thêm đề tài
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4 mb-6">
          <Input
            placeholder="Tìm kiếm theo mã, tên đề tài hoặc GVHD..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            value={filterMajor}
            style={{ width: 200 }}
            onChange={setFilterMajor}
            placeholder="Chọn chuyên ngành"
          >
            <Option value="all">Tất cả chuyên ngành</Option>
            {majors.map(major => (
              <Option key={major.value} value={major.value}>{major.label}</Option>
            ))}
          </Select>
          <Select
            value={filterStatus}
            style={{ width: 200 }}
            onChange={setFilterStatus}
            placeholder="Chọn trạng thái"
          >
            <Option value="all">Tất cả trạng thái</Option>
            {statuses.map(status => (
              <Option key={status.value} value={status.value}>
                <Badge color={status.color} text={status.label} />
              </Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filterStatus === 'all' ? data : data.filter(item => item.status === filterStatus)}
          loading={loading}
          pagination={{
            total: data.length,
            pageSize: 10,
            showTotal: (total) => `Tổng số ${total} đề tài`,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </div>

      <Modal
        title={editingTopic ? "Chỉnh sửa đề tài" : "Thêm đề tài mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingTopic(null);
        }}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ topic_max_members: 2 }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Mã đề tài"
              rules={[{ required: true, message: 'Vui lòng nhập mã đề tài!' }]}
            >
              <Input placeholder="Nhập mã đề tài" />
            </Form.Item>
            
            <Form.Item
              name="topic_title"
              label="Tên đề tài"
              rules={[{ required: true, message: 'Vui lòng nhập tên đề tài!' }]}
            >
              <Input placeholder="Nhập tên đề tài" />
            </Form.Item>

            <Form.Item
              name="topic_instructor"
              label="Giảng viên hướng dẫn"
              rules={[{ required: true, message: 'Vui lòng chọn GVHD!' }]}
            >
              <Select placeholder="Chọn giảng viên hướng dẫn">
                <Option value="Nguyễn Văn A">Nguyễn Văn A</Option>
                <Option value="Trần Thị B">Trần Thị B</Option>
                <Option value="Lê Văn C">Lê Văn C</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="topic_major"
              label="Chuyên ngành"
              rules={[{ required: true, message: 'Vui lòng chọn chuyên ngành!' }]}
            >
              <Select placeholder="Chọn chuyên ngành">
                {majors.map(major => (
                  <Option key={major.value} value={major.value}>{major.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="topic_category"
              label="Loại đề tài"
              rules={[{ required: true, message: 'Vui lòng chọn loại đề tài!' }]}
            >
              <Select placeholder="Chọn loại đề tài">
                <Option value="Nghiên cứu">Nghiên cứu</Option>
                <Option value="Ứng dụng">Ứng dụng</Option>
                <Option value="Triển khai">Triển khai</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="topic_max_members"
              label="Số sinh viên tối đa"
              rules={[{ required: true, message: 'Vui lòng nhập số sinh viên!' }]}
            >
              <Input type="number" min={1} max={3} />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Mô tả đề tài"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả đề tài!' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết về đề tài..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TopicManagement; 