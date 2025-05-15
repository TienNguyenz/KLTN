import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Space } from 'antd';
import { PlusOutlined, ExclamationCircleFilled, CheckCircleFilled } from '@ant-design/icons';
import { FaEdit, FaTrash } from 'react-icons/fa';
import moment from 'moment';
import axios from 'axios';

const Semester = () => {
  const [semesters, setSemesters] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch semesters data
  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/semesters');
      setSemesters(response.data.map(semester => ({
        ...semester,
        key: semester._id
      })));
    } catch (error) {
      message.error('Lỗi khi tải danh sách học kỳ');
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const showDeleteConfirm = (record) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${record.semester}?`)) {
      axios.delete(`http://localhost:5000/api/semesters/${record._id}`)
        .then(() => {
          setSuccessMessage('Xóa học kỳ thành công!');
          setIsSuccessModalVisible(true);
          fetchSemesters();
        })
        .catch((error) => {
          if (error.response) {
            message.error(error.response.data.message || 'Lỗi khi xóa học kỳ');
          } else if (error.request) {
            message.error('Không thể kết nối đến server');
          } else {
            message.error('Lỗi khi xóa học kỳ');
          }
        });
    }
  };

  const columns = [
    {
      title: 'Học kỳ',
      dataIndex: 'semester',
      key: 'semester',
      width: '25%',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'school_year_start',
      key: 'school_year_start',
      width: '25%',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'school_year_end',
      key: 'school_year_end',
      width: '25%',
      render: (date) => moment(date).format('DD/MM/YYYY'),
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

  const handleAddSemester = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      semester: record.semester,
      school_year_start: moment(record.school_year_start),
      school_year_end: moment(record.school_year_end),
    });
    setIsEditModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const payload = {
          semester: values.semester,
          school_year_start: values.school_year_start.toDate(),
          school_year_end: values.school_year_end.toDate(),
        };
        
        await axios.post('http://localhost:5000/api/semesters', payload);
        setSuccessMessage('Thêm học kỳ mới thành công!');
        setIsSuccessModalVisible(true);
      form.resetFields();
      setIsModalVisible(false);
        fetchSemesters();
      } catch (error) {
        if (error.response?.data?.message) {
          message.error(error.response.data.message);
        } else {
          message.error('Lỗi khi thêm học kỳ mới');
        }
        console.error('Error adding semester:', error);
      }
    });
  };

  const handleEditModalOk = () => {
    editForm.validateFields().then(async (values) => {
      try {
        const payload = {
          semester: values.semester,
          school_year_start: values.school_year_start.toDate(),
          school_year_end: values.school_year_end.toDate(),
        };
        
        await axios.put(`http://localhost:5000/api/semesters/${editingRecord._id}`, payload);
        setSuccessMessage('Cập nhật học kỳ thành công!');
        setIsSuccessModalVisible(true);
      editForm.resetFields();
      setIsEditModalVisible(false);
      setEditingRecord(null);
        fetchSemesters();
      } catch (error) {
        if (error.response?.data?.message) {
          message.error(error.response.data.message);
        } else {
          message.error('Lỗi khi cập nhật học kỳ');
        }
        console.error('Error updating semester:', error);
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
          dataSource={semesters}
          loading={loading}
          pagination={{
            total: semesters.length,
            pageSize: 10,
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
            name="semester"
            label="Học kỳ"
            rules={[{ required: true, message: 'Vui lòng nhập tên học kỳ!' }]}
          >
            <Input placeholder="Ví dụ: Học kỳ 1" />
          </Form.Item>
          <Form.Item
            name="school_year_start"
            label="Thời gian bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
          >
            <DatePicker 
              className="w-full" 
              format="DD/MM/YYYY"
              changeOnBlur
              showToday={false}
              allowClear
              inputReadOnly={false}
              placeholder="Nhập hoặc chọn ngày"
            />
          </Form.Item>
          <Form.Item
            name="school_year_end"
            label="Thời gian kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc!' }]}
          >
            <DatePicker 
              className="w-full" 
              format="DD/MM/YYYY"
              changeOnBlur
              showToday={false}
              allowClear
              inputReadOnly={false}
              placeholder="Nhập hoặc chọn ngày"
            />
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
            name="semester"
            label="Học kỳ"
            rules={[{ required: true, message: 'Vui lòng nhập tên học kỳ!' }]}
          >
            <Input placeholder="Ví dụ: Học kỳ 1" />
          </Form.Item>
          <Form.Item
            name="school_year_start"
            label="Thời gian bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
          >
            <DatePicker 
              className="w-full" 
              format="DD/MM/YYYY"
              changeOnBlur
              showToday={false}
              allowClear
              inputReadOnly={false}
              placeholder="Nhập hoặc chọn ngày"
            />
          </Form.Item>
          <Form.Item
            name="school_year_end"
            label="Thời gian kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc!' }]}
          >
            <DatePicker 
              className="w-full" 
              format="DD/MM/YYYY"
              changeOnBlur
              showToday={false}
              allowClear
              inputReadOnly={false}
              placeholder="Nhập hoặc chọn ngày"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thông báo thành công */}
      <Modal
        title="Thông báo"
        open={isSuccessModalVisible}
        onOk={() => {
          setIsSuccessModalVisible(false);
          fetchSemesters();
        }}
        onCancel={() => {
          setIsSuccessModalVisible(false);
          fetchSemesters();
        }}
        okText="Đóng"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CheckCircleFilled style={{ fontSize: '48px', color: '#52c41a' }} />
          <p style={{ marginTop: '20px', fontSize: '16px' }}>{successMessage}</p>
        </div>
      </Modal>
    </div>
  );
};

export default Semester; 