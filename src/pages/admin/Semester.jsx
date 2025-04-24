import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import moment from 'moment';

const Semester = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const columns = [
    {
      title: 'Năm học',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: '25%',
      render: (date) => moment(date).format('YYYY'),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      width: '25%',
      render: (date) => moment(date).format('YYYY'),
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
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-100"
            icon={<FaEye style={{ color: '#52c41a' }} className="text-lg" />}
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
      name: 'HK1',
      startDate: '2023',
      endDate: '2024',
    },
  ];

  const handleAddSemester = () => {
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      name: record.name,
      startDate: moment(record.startDate),
      endDate: moment(record.endDate),
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa học kỳ ${record.name}?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        // Xử lý xóa học kỳ
        message.success('Đã xóa học kỳ thành công');
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log('Success:', values);
      message.success('Thêm học kỳ mới thành công');
      form.resetFields();
      setIsModalVisible(false);
    });
  };

  const handleEditModalOk = () => {
    editForm.validateFields().then((values) => {
      console.log('Edit Success:', values);
      message.success('Cập nhật học kỳ thành công');
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
        <h1 className="text-2xl font-bold">Học kỳ</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddSemester}
          className="bg-blue-600"
        >
          Tạo học kỳ
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            total: data.length,
            pageSize: 5,
            showTotal: (total) => `Tổng cộng ${total} học kỳ`,
          }}
        />
      </div>

      {/* Modal thêm học kỳ mới */}
      <Modal
        title="Tạo học kỳ mới"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          name="semesterForm"
        >
          <Form.Item
            name="name"
            label="Năm học"
            rules={[{ required: true, message: 'Vui lòng nhập năm học!' }]}
          >
            <Input placeholder="Ví dụ: HK1" />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Thời gian bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
          >
            <DatePicker className="w-full" picker="year" />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Thời gian kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc!' }]}
          >
            <DatePicker className="w-full" picker="year" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal cập nhật học kỳ */}
      <Modal
        title="Cập nhật học kỳ"
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={editForm}
          layout="vertical"
          name="editSemesterForm"
        >
          <Form.Item
            name="name"
            label="Năm học"
            rules={[{ required: true, message: 'Vui lòng nhập năm học!' }]}
          >
            <Input placeholder="Ví dụ: HK1" />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Thời gian bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
          >
            <DatePicker className="w-full" picker="year" />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Thời gian kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc!' }]}
          >
            <DatePicker className="w-full" picker="year" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Semester; 