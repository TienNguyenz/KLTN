import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, DatePicker, Select, Switch, message, Input, Space } from 'antd';
import { PlusOutlined, SearchOutlined, ExclamationCircleFilled, CheckCircleFilled } from '@ant-design/icons';
import { FaEdit, FaTrash } from 'react-icons/fa';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  // Kiểm tra authentication
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      navigate('/login');
      return false;
    }
    return true;
  };

  // Cấu hình axios
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Fetch registrations data
  const fetchRegistrations = async () => {
    if (!checkAuth()) return;
    
    try {
      setLoading(true);
      const response = await api.get('/registrationperiods');
      
      if (!response.data) {
        throw new Error('Invalid response data');
      }

      const registrationsWithDetails = response.data.map(registration => ({
        ...registration,
        key: registration._id,
        semester: registration.registration_period_semester?.semester || 'N/A',
        academicYear: registration.registration_period_semester ? 
          `${moment(registration.registration_period_semester.school_year_start).format('YYYY')} - ${moment(registration.registration_period_semester.school_year_end).format('YYYY')}` 
          : 'N/A',
      }));
      setRegistrations(registrationsWithDetails);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        navigate('/login');
      } else {
        message.error('Lỗi khi tải danh sách đợt đăng ký: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch semesters for dropdown
  const fetchSemesters = async () => {
    if (!checkAuth()) return;
    
    try {
      const response = await api.get('/semesters');
      if (!response.data) {
        throw new Error('Invalid response data');
      }
      setSemesters(response.data);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        navigate('/login');
      } else {
        message.error('Lỗi khi tải danh sách học kỳ: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  useEffect(() => {
    fetchRegistrations();
    fetchSemesters();
  }, []);

  // Validate dates
  const validateDates = async (_, value) => {
    if (!value) return Promise.resolve();

    const currentForm = isModalVisible ? form : editForm;
    const semesterId = currentForm.getFieldValue('registration_period_semester');
    if (!semesterId) {
      return Promise.reject('Vui lòng chọn học kỳ trước!');
    }

    const selectedSemester = semesters.find(s => s._id === semesterId);
    if (!selectedSemester) {
      return Promise.reject('Vui lòng chọn học kỳ trước!');
    }

    const selectedDate = moment(value, 'DD-MM-YYYY').startOf('day');
    const semesterEnd = moment(selectedSemester.school_year_end, 'YYYY-MM-DD').startOf('day');

    // Validate ngày bắt đầu
    if (_.field.includes('registration_period_start')) {
      if (selectedDate.isAfter(semesterEnd)) {
        return Promise.reject(`Thời gian bắt đầu đăng ký không được sau ${semesterEnd.format('DD/MM/YYYY')}`);
      }
      const endDate = currentForm.getFieldValue('registration_period_end');
      if (endDate) {
        const endMoment = moment(endDate, 'DD-MM-YYYY').startOf('day');
        if (selectedDate.isAfter(endMoment)) {
          return Promise.reject('Thời gian bắt đầu đăng ký phải trước thời gian kết thúc đăng ký');
        }
      }
    }

    // Validate ngày kết thúc
    if (_.field.includes('registration_period_end')) {
      if (selectedDate.isAfter(semesterEnd)) {
        return Promise.reject(`Thời gian kết thúc đăng ký không được sau ${semesterEnd.format('DD/MM/YYYY')}`);
      }
      const startDate = currentForm.getFieldValue('registration_period_start');
      if (startDate) {
        const startMoment = moment(startDate, 'DD-MM-YYYY').startOf('day');
        if (selectedDate.isBefore(startMoment)) {
          return Promise.reject('Thời gian kết thúc đăng ký phải sau thời gian bắt đầu đăng ký');
        }
      }
    }

    return Promise.resolve();
  };

  // Handle semester change
  const handleSemesterChange = (semesterId) => {
    const selectedSemester = semesters.find(s => s._id === semesterId);
    if (selectedSemester) {
      const currentForm = isModalVisible ? form : editForm;
      
      // Reset date fields when semester changes
      currentForm.setFieldsValue({
        registration_period_start: null,
        registration_period_end: null
      });

      // Clear any existing errors
      currentForm.setFields([
        {
          name: 'registration_period_start',
          errors: []
        },
        {
          name: 'registration_period_end',
          errors: []
        }
      ]);

      // Hiển thị thông tin về thời gian học kỳ
      message.info(
        `Thời gian học kỳ: ${moment(selectedSemester.school_year_start).format('DD/MM/YYYY')} - ${moment(selectedSemester.school_year_end).format('DD/MM/YYYY')}`
      );
    }
  };

  const showDeleteConfirm = (record) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đợt đăng ký của ${record.semester} không?`)) {
      handleDelete(record);
    }
  };

  const handleDelete = async (record) => {
    try {
      await api.delete(`/registrationperiods/${record._id}`);
      message.success('Xóa đợt đăng ký thành công!');
      fetchRegistrations();
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Lỗi khi xóa đợt đăng ký');
      }
      throw error; // Re-throw for Modal
    }
  };

  const columns = [
    {
      title: 'Học kì',
      dataIndex: 'semester',
      key: 'semester',
      width: '15%',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return (
          String(record.semester).toLowerCase().includes(value.toLowerCase()) ||
          String(record.academicYear).toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: 'Năm học',
      dataIndex: 'academicYear',
      key: 'academicYear',
      width: '20%',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'registration_period_start',
      key: 'registration_period_start',
      width: '20%',
      render: (timestamp) => moment(timestamp * 1000).format('DD-MM-YYYY'),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'registration_period_end',
      key: 'registration_period_end',
      width: '20%',
      render: (timestamp) => moment(timestamp * 1000).format('DD-MM-YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'registration_period_status',
      key: 'registration_period_status',
      width: '15%',
      filteredValue: [filterStatus],
      onFilter: (value, record) => {
        if (value === 'all') return true;
        return record.registration_period_status === (value === 'open');
      },
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status ? 'Mở' : 'Đóng'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space.Compact className="flex">
          <Button 
            type="text" 
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-100"
            onClick={() => handleEdit(record)}
            icon={<FaEdit style={{ color: '#4096ff' }} className="text-lg" />}
          />
          <Button 
            type="text" 
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100"
            onClick={() => showDeleteConfirm(record)}
            icon={<FaTrash style={{ color: '#ff4d4f' }} className="text-lg" />}
          />
        </Space.Compact>
      ),
    },
  ];

  const handleAddRegistration = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      registration_period_semester: record.registration_period_semester._id,
      registration_period_start: moment(record.registration_period_start * 1000),
      registration_period_end: moment(record.registration_period_end * 1000),
      registration_period_status: record.registration_period_status,
      block_topic: record.block_topic,
    });
    setIsEditModalVisible(true);
  };

  const handleModalOk = () => {
    if (!checkAuth()) return;

    form.validateFields().then(async (values) => {
      try {
        const payload = {
          registration_period_semester: values.registration_period_semester,
          registration_period_start: moment(values.registration_period_start).unix(),
          registration_period_end: moment(values.registration_period_end).unix(),
          registration_period_status: values.registration_period_status,
          block_topic: values.block_topic || false,
        };
        
        const response = await api.post('/registrationperiods', payload);
        if (!response.data) {
          throw new Error('Invalid response data');
        }
        
        message.success('Thêm đợt đăng ký mới thành công!');
      form.resetFields();
      setIsModalVisible(false);
        fetchRegistrations();
      } catch (error) {
        console.error('Error adding registration period:', error);
        if (error.response?.status === 401) {
          message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
          navigate('/login');
        } else {
          message.error('Lỗi khi thêm đợt đăng ký mới: ' + (error.response?.data?.message || error.message));
        }
      }
    });
  };

  const handleEditModalOk = () => {
    if (!checkAuth()) return;

    editForm.validateFields().then(async (values) => {
      try {
        const payload = {
          registration_period_semester: values.registration_period_semester,
          registration_period_start: moment(values.registration_period_start).unix(),
          registration_period_end: moment(values.registration_period_end).unix(),
          registration_period_status: values.registration_period_status,
          block_topic: values.block_topic,
        };
        
        const response = await api.put(`/registrationperiods/${editingRecord._id}`, payload);
        if (!response.data) {
          throw new Error('Invalid response data');
        }

        message.success('Cập nhật đợt đăng ký thành công!');
      editForm.resetFields();
      setIsEditModalVisible(false);
      setEditingRecord(null);
        fetchRegistrations();
      } catch (error) {
        console.error('Error updating registration period:', error);
        if (error.response?.status === 401) {
          message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
          navigate('/login');
        } else {
          message.error('Lỗi khi cập nhật đợt đăng ký: ' + (error.response?.data?.message || error.message));
        }
      }
    });
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleEditModalCancel = () => {
    editForm.resetFields();
    setIsEditModalVisible(false);
    setEditingRecord(null);
  };

  // Form rules
  const dateValidationRules = (fieldName) => [
    {
      required: true,
      message: `Vui lòng chọn ${fieldName}!`
    },
    {
      validator: validateDates
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Đợt đăng ký</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddRegistration}
          className="bg-blue-600"
        >
          Mở đợt đăng ký mới
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <Space className="flex justify-between">
            <Input
              placeholder="Tìm kiếm theo học kỳ hoặc năm học..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              defaultValue="all"
              style={{ width: 200 }}
              onChange={value => setFilterStatus(value)}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="open">Đang mở</Select.Option>
              <Select.Option value="closed">Đã đóng</Select.Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={registrations}
          loading={loading}
          pagination={{
            total: registrations.length,
            pageSize: 10,
            showTotal: (total) => `Tổng cộng ${total} đợt đăng ký`,
          }}
        />
      </div>

      {/* Modal thêm mới */}
      <Modal
        title="Mở đợt đăng ký mới"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Tạo"
        cancelText="Hủy"
        width={600}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          name="registrationForm"
          initialValues={{
            registration_period_status: true,
            block_topic: false
          }}
        >
          <Form.Item
            name="registration_period_semester"
            label="Học kỳ"
            rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
          >
            <Select 
              placeholder="Vui lòng chọn"
              showSearch
              optionFilterProp="children"
              onChange={handleSemesterChange}
            >
              {semesters.map(semester => (
                <Select.Option key={semester._id} value={semester._id}>
                  {`${semester.semester} (${moment(semester.school_year_start).format('YYYY')} - ${moment(semester.school_year_end).format('YYYY')})`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="registration_period_start"
              label="Thời gian bắt đầu"
              rules={dateValidationRules('Thời gian bắt đầu')}
            >
              <DatePicker 
                className="w-full" 
                format="DD-MM-YYYY"
                placeholder="Thời gian bắt đầu"
                showTime={false}
              />
            </Form.Item>

            <Form.Item
              name="registration_period_end"
              label="Thời gian kết thúc"
              rules={dateValidationRules('Thời gian kết thúc')}
            >
              <DatePicker 
                className="w-full" 
                format="DD-MM-YYYY"
                placeholder="Thời gian kết thúc"
                showTime={false}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="registration_period_status"
            label="Trạng thái đợt đăng ký"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Mở" 
              unCheckedChildren="Đóng"
              defaultChecked
            />
          </Form.Item>

          <Form.Item
            name="block_topic"
            label="Khóa đề tài"
            valuePropName="checked"
            tooltip="Khi bật, sinh viên sẽ không thể đăng ký đề tài mới"
          >
            <Switch 
              checkedChildren="Có" 
              unCheckedChildren="Không"
              defaultChecked={false}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa đợt đăng ký"
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        okText="Cập nhật"
        cancelText="Hủy"
        width={600}
        centered
      >
        <Form
          form={editForm}
          layout="vertical"
          name="editRegistrationForm"
        >
          <Form.Item
            name="registration_period_semester"
            label="Học kỳ"
            rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
          >
            <Select 
              placeholder="Vui lòng chọn"
              showSearch
              optionFilterProp="children"
              onChange={handleSemesterChange}
            >
              {semesters.map(semester => (
                <Select.Option key={semester._id} value={semester._id}>
                  {`${semester.semester} (${moment(semester.school_year_start).format('YYYY')} - ${moment(semester.school_year_end).format('YYYY')})`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="registration_period_start"
              label="Thời gian bắt đầu"
              rules={dateValidationRules('Thời gian bắt đầu')}
            >
              <DatePicker 
                className="w-full" 
                format="DD-MM-YYYY"
                placeholder="Thời gian bắt đầu"
                showTime={false}
              />
            </Form.Item>

            <Form.Item
              name="registration_period_end"
              label="Thời gian kết thúc"
              rules={dateValidationRules('Thời gian kết thúc')}
            >
              <DatePicker 
                className="w-full" 
                format="DD-MM-YYYY"
                placeholder="Thời gian kết thúc"
                showTime={false}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="registration_period_status"
            label="Trạng thái đợt đăng ký"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Mở" 
              unCheckedChildren="Đóng"
            />
          </Form.Item>

          <Form.Item
            name="block_topic"
            label="Khóa đề tài"
            valuePropName="checked"
            tooltip="Khi bật, sinh viên sẽ không thể đăng ký đề tài mới"
          >
            <Switch 
              checkedChildren="Có" 
              unCheckedChildren="Không"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Registration; 