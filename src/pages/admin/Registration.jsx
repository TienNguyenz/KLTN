import React, { useState } from 'react';
import { Table, Button, Modal, Form, DatePicker, Select, Switch, message, Input, Space } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { FaEdit, FaTrash } from 'react-icons/fa';
import moment from 'moment';

const { RangePicker } = DatePicker;

const Registration = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
      dataIndex: 'startDate',
      key: 'startDate',
      width: '20%',
      render: (date) => moment(date).format('DD-MM-YYYY'),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      width: '20%',
      render: (date) => moment(date).format('DD-MM-YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      filteredValue: [filterStatus],
      onFilter: (value, record) => {
        if (value === 'all') return true;
        return record.status === (value === 'open');
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
            onClick={() => handleDelete(record)}
            icon={<FaTrash style={{ color: '#ff4d4f' }} className="text-lg" />}
          />
        </Space.Compact>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      semester: 'HK1',
      academicYear: '2023 - 2024',
      startDate: '2023-12-25',
      endDate: '2024-01-31',
      status: true,
    },
  ];

  const handleAddRegistration = () => {
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      semester: record.semester,
      startDate: moment(record.startDate),
      endDate: moment(record.endDate),
      status: record.status,
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa đợt đăng ký này?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        message.success('Đã xóa đợt đăng ký thành công');
      },
    });
  };

  const validateDates = (_, value) => {
    const form = _.field.split('.')[0] === 'startDate' ? form : editForm;
    const otherFieldName = _.field.split('.')[0] === 'startDate' ? 'endDate' : 'startDate';
    const otherValue = form.getFieldValue(otherFieldName);

    if (!value || !otherValue) {
      return Promise.resolve();
    }

    if (_.field.split('.')[0] === 'startDate' && value.isAfter(otherValue)) {
      return Promise.reject('Thời gian bắt đầu phải trước thời gian kết thúc!');
    }

    if (_.field.split('.')[0] === 'endDate' && value.isBefore(otherValue)) {
      return Promise.reject('Thời gian kết thúc phải sau thời gian bắt đầu!');
    }

    return Promise.resolve();
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log('Success:', values);
      message.success('Thêm đợt đăng ký mới thành công');
      form.resetFields();
      setIsModalVisible(false);
    });
  };

  const handleEditModalOk = () => {
    editForm.validateFields().then((values) => {
      console.log('Edit Success:', values);
      message.success('Cập nhật đợt đăng ký thành công');
      editForm.resetFields();
      setIsEditModalVisible(false);
      setEditingRecord(null);
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
          dataSource={data}
          pagination={{
            total: data.length,
            pageSize: 5,
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
      >
        <Form
          form={form}
          layout="vertical"
          name="registrationForm"
          initialValues={{
            status: true
          }}
        >
          <Form.Item
            name="semester"
            label="Học kỳ"
            rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
          >
            <Select placeholder="Vui lòng chọn">
              <Select.Option value="HK1">HK1</Select.Option>
              <Select.Option value="HK2">HK2</Select.Option>
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="startDate"
              label="Thời gian bắt đầu"
              rules={[
                { required: true, message: 'Vui lòng chọn thời gian bắt đầu!' },
                { validator: validateDates }
              ]}
            >
              <DatePicker 
                className="w-full" 
                format="DD-MM-YYYY"
                placeholder="Thời gian bắt đầu"
              />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="Thời gian kết thúc"
              rules={[
                { required: true, message: 'Vui lòng chọn thời gian kết thúc!' },
                { validator: validateDates }
              ]}
            >
              <DatePicker 
                className="w-full" 
                format="DD-MM-YYYY"
                placeholder="Thời gian kết thúc"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label="Trạng thái đợt đăng ký"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Mở" 
              unCheckedChildren="Đóng"
              defaultChecked
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
      >
        <Form
          form={editForm}
          layout="vertical"
          name="editRegistrationForm"
        >
          <Form.Item
            name="semester"
            label="Học kỳ"
            rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
          >
            <Select placeholder="Vui lòng chọn">
              <Select.Option value="HK1">HK1</Select.Option>
              <Select.Option value="HK2">HK2</Select.Option>
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="startDate"
              label="Thời gian bắt đầu"
              rules={[
                { required: true, message: 'Vui lòng chọn thời gian bắt đầu!' },
                { validator: validateDates }
              ]}
            >
              <DatePicker 
                className="w-full" 
                format="DD-MM-YYYY"
                placeholder="Thời gian bắt đầu"
              />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="Thời gian kết thúc"
              rules={[
                { required: true, message: 'Vui lòng chọn thời gian kết thúc!' },
                { validator: validateDates }
              ]}
            >
              <DatePicker 
                className="w-full" 
                format="DD-MM-YYYY"
                placeholder="Thời gian kết thúc"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label="Trạng thái đợt đăng ký"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Mở" 
              unCheckedChildren="Đóng"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Registration; 