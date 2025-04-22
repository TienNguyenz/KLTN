import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Space, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleFilled, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import StudentForm from './Form_Add_Student';
import axios from 'axios';

const { Search } = Input;

const majorsByDepartment = {
  "Công nghệ thông tin": [
    "Khoa học máy tính",
    "Kỹ thuật phần mềm",
    "Hệ thống Thông tin",
  ],
  "Quản trị kinh doanh": [
    "Quản trị Logistics",
    "Quản trị Makerting",
    "Digital Markerting",
    "Quản trị nhân sự",
  ],
};

const Students = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/database/collections/User", {
        params: { 
          role: 'sinhvien',
          search: searchText,
          faculty: selectedFaculty,
          major: selectedMajor
        }
      });
      const students = res.data.filter(user => user.role === 'sinhvien');
      setStudents(students);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchStudents();
  }, [selectedFaculty, selectedMajor, searchText]);

  const availableMajors = majorsByDepartment[selectedFaculty] || [];

  const columns = [
    {
      title: 'Mã SV',
      dataIndex: 'user_id',
      key: 'user_id',
    },
    {
      title: 'Họ tên',
      dataIndex: 'user_name',
      key: 'user_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'SĐT',
      dataIndex: 'user_phone',
      key: 'user_phone',
    },
    {
      title: 'CCCD',
      dataIndex: 'user_CCCD',
      key: 'user_CCCD',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'user_date_of_birth',
      key: 'user_date_of_birth',
    },
    {
      title: 'Khoa',
      dataIndex: 'user_faculty',
      key: 'user_faculty',
    },
    {
      title: 'Chuyên ngành',
      dataIndex: 'user_major',
      key: 'user_major',
    },
    {
      title: 'Địa chỉ thường trú',
      dataIndex: 'user_permanent_address',
      key: 'user_permanent_address',
    },
    {
      title: 'Địa chỉ tạm trú',
      dataIndex: 'user_temporary_address',
      key: 'user_temporary_address',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Chỉnh sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
  };

  const handleDelete = async (studentId) => {
    const confirm = window.confirm("Bạn có chắc muốn xoá sinh viên này không?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/${studentId}`);
      fetchStudents();
    } catch (err) {
      console.error("Lỗi khi xoá sinh viên:", err);
    }
  };

  const handleSuccess = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
    fetchStudents();
  };

  const validateForm = async () => {
    const newErrors = {};
    const changedFields = Object.keys(formData);

    // Validate họ tên nếu đã thay đổi
    if (changedFields.includes('user_name')) {
      if (!formData.user_name?.trim()) {
        newErrors.user_name = 'Họ tên không được để trống';
      } else if (/[\d!@#$%^&*(),.?":{}|<>]/.test(formData.user_name)) {
        newErrors.user_name = 'Họ tên không được chứa số hoặc ký tự đặc biệt';
      }
    }

    // Validate email nếu đã thay đổi
    if (changedFields.includes('email')) {
      if (!formData.email?.trim()) {
        newErrors.email = 'Email không được để trống';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      } else {
        // Kiểm tra email trùng
        try {
          const response = await axios.get(`http://localhost:5000/api/database/collections/User`, {
            params: {
              email: formData.email,
              excludeId: selectedStudent?._id // Loại trừ ID hiện tại khi kiểm tra
            }
          });
          const existingUser = response.data.find(user => user.email === formData.email && user._id !== selectedStudent?._id);
          if (existingUser) {
            newErrors.email = 'Email đã được sử dụng';
          }
        } catch (error) {
          console.error('Error checking email:', error);
        }
      }
    }

    // Validate mã số nếu đã thay đổi
    if (changedFields.includes('user_id')) {
      if (!formData.user_id?.trim()) {
        newErrors.user_id = 'Mã số không được để trống';
      } else {
        // Kiểm tra mã số trùng
        try {
          const response = await axios.get(`http://localhost:5000/api/database/collections/User`, {
            params: {
              user_id: formData.user_id,
              excludeId: selectedStudent?._id // Loại trừ ID hiện tại khi kiểm tra
            }
          });
          const existingUser = response.data.find(user => user.user_id === formData.user_id && user._id !== selectedStudent?._id);
          if (existingUser) {
            newErrors.user_id = 'Mã số đã tồn tại';
          }
        } catch (error) {
          console.error('Error checking user ID:', error);
        }
      }
    }

    // Validate CCCD nếu đã thay đổi
    if (changedFields.includes('user_CCCD')) {
      if (!formData.user_CCCD?.trim()) {
        newErrors.user_CCCD = 'CCCD không được để trống';
      } else if (!/^\d{12}$/.test(formData.user_CCCD)) {
        newErrors.user_CCCD = 'CCCD phải có 12 chữ số';
      }
    }

    // Validate số điện thoại nếu đã thay đổi
    if (changedFields.includes('user_phone')) {
      if (!formData.user_phone?.trim()) {
        newErrors.user_phone = 'Số điện thoại không được để trống';
      } else if (!/^\d{10}$/.test(formData.user_phone)) {
        newErrors.user_phone = 'Số điện thoại phải có 10 chữ số';
      }
    }

    // Validate địa chỉ nếu đã thay đổi
    if (changedFields.includes('user_permanent_address') && !formData.user_permanent_address?.trim()) {
      newErrors.user_permanent_address = 'Địa chỉ không được để trống';
    }

    // Validate ngày sinh nếu đã thay đổi
    if (changedFields.includes('user_date_of_birth') && !formData.user_date_of_birth) {
      newErrors.user_date_of_birth = 'Ngày sinh không được để trống';
    }

    // Validate khoa nếu đã thay đổi
    if (changedFields.includes('user_faculty') && !formData.user_faculty) {
      newErrors.user_faculty = 'Vui lòng chọn khoa';
    }

    // Validate chuyên ngành nếu đã thay đổi
    if (changedFields.includes('user_major') && !formData.user_major) {
      newErrors.user_major = 'Vui lòng chọn chuyên ngành';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    // Chỉ cập nhật formData nếu giá trị thay đổi
    if (selectedStudent[field] !== value) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      // Nếu giá trị giống ban đầu, xóa khỏi formData
      const newFormData = { ...formData };
      delete newFormData[field];
      setFormData(newFormData);
    }
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post('http://localhost:5000/api/database/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Không thể tải lên ảnh. Vui lòng thử lại.');
      return null;
    }
  };

  const handleUpdate = async () => {
    console.log('handleUpdate called');
    // Nếu không có trường nào thay đổi, không cần validate và update
    if (Object.keys(formData).length === 0) {
      console.log('No changes detected');
      setIsModalVisible(false);
      return;
    }

    console.log('Validating form...');
    if (!await validateForm()) {
      console.log('Validation failed');
      message.error('Vui lòng kiểm tra lại thông tin!');
      return;
    }

    console.log('Showing confirmation dialog...');
    setIsConfirmModalVisible(true);
  };

  const handleConfirmUpdate = async () => {
    console.log('Dialog confirmed');
    setIsSubmitting(true);
    try {
      let user_avatar = formData.user_avatar;
      if (formData.avatarFile) {
        user_avatar = await handleImageUpload(formData.avatarFile);
        if (!user_avatar) {
          setIsSubmitting(false);
          return;
        }
      }

      // Giữ lại các trường dữ liệu cũ nếu không có thay đổi
      const updatedData = {
        ...selectedStudent, // Giữ lại tất cả dữ liệu cũ
        ...formData, // Cập nhật các trường đã thay đổi
        user_avatar: user_avatar || selectedStudent.user_avatar, // Sử dụng user_avatar mới hoặc giữ lại user_avatar cũ
        role: 'sinhvien' // Đảm bảo role không bị thay đổi
      };

      console.log('Sending update request with data:', updatedData);
      const response = await axios.put(`http://localhost:5000/api/database/collections/User/${selectedStudent._id}`, updatedData);
      console.log('Update response:', response.data);
      
      if (response.data) {
        setIsSuccessModalVisible(true);
        handleSuccess();
      } else {
        throw new Error('Không nhận được phản hồi từ server');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      setErrorMessage(error.response?.data?.message || 'Cập nhật thông tin sinh viên thất bại!');
      setIsErrorModalVisible(true);
    } finally {
      setIsSubmitting(false);
      setIsConfirmModalVisible(false);
    }
  };

  return (
    <div className="p-4 relative">
      <h1 className="text-2xl font-bold mb-4">Danh sách Sinh viên</h1>
      <div className="flex gap-4 mb-4">
        <Search
          placeholder="Tìm kiếm theo tên hoặc mã số"
          onSearch={(value) => setSearchText(value)}
          style={{ width: 300 }}
        />
        <Select
          style={{ width: 200 }}
          placeholder="-- Chọn Khoa --"
          onChange={(value) => setSelectedFaculty(value)}
        >
          <Select.Option value="">-- Chọn Khoa --</Select.Option>
          {Object.keys(majorsByDepartment).map((dep, idx) => (
            <Select.Option key={idx} value={dep}>
              {dep}
            </Select.Option>
          ))}
        </Select>
        <Select
          style={{ width: 200 }}
          placeholder="-- Chọn chuyên ngành --"
          onChange={(value) => setSelectedMajor(value)}
          disabled={availableMajors.length === 0}
        >
          <Select.Option value="">-- Chọn chuyên ngành --</Select.Option>
          {availableMajors.map((m, idx) => (
            <Select.Option key={idx} value={m}>
              {m}
            </Select.Option>
          ))}
        </Select>
        <Button
          type="primary"
          onClick={() => {
            setSelectedStudent(null);
            setIsModalVisible(true);
          }}
        >
          Thêm sinh viên
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={students}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />

      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-6">
              <div className="relative group">
                <div className="w-24 h-24 bg-gray-200 rounded-full mr-6 flex items-center justify-center overflow-hidden">
                  {(formData.avatar || selectedStudent?.avatar) ? (
                    <img 
                      src={formData.avatar || selectedStudent?.avatar}
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{selectedStudent?.user_name?.charAt(0)}</span>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleInputChange('avatar', reader.result);
                          handleInputChange('avatarFile', file);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <span className="text-white text-sm">Thay đổi</span>
                </label>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{selectedStudent?.user_name || 'Thêm sinh viên mới'}</h2>
                <div className="text-gray-600">
                  <span>Mã số: {selectedStudent?.user_id}</span>
                  <span className="mx-2">|</span>
                  <span>Vai trò: STUDENT</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Thông tin tài khoản</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.user_name ? 'border-red-500' : ''
                    }`}
                    defaultValue={selectedStudent?.user_name}
                    onChange={(e) => handleInputChange('user_name', e.target.value)}
                  />
                  {errors.user_name && (
                    <span className="text-red-500 text-sm">{errors.user_name}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    defaultValue={selectedStudent?.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-sm">{errors.email}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã số <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.user_id ? 'border-red-500' : ''
                    }`}
                    defaultValue={selectedStudent?.user_id}
                    onChange={(e) => handleInputChange('user_id', e.target.value)}
                  />
                  {errors.user_id && (
                    <span className="text-red-500 text-sm">{errors.user_id}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CCCD <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.user_CCCD ? 'border-red-500' : ''
                    }`}
                    defaultValue={selectedStudent?.user_CCCD}
                    onChange={(e) => handleInputChange('user_CCCD', e.target.value)}
                  />
                  {errors.user_CCCD && (
                    <span className="text-red-500 text-sm">{errors.user_CCCD}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.user_phone ? 'border-red-500' : ''
                    }`}
                    defaultValue={selectedStudent?.user_phone}
                    onChange={(e) => handleInputChange('user_phone', e.target.value)}
                  />
                  {errors.user_phone && (
                    <span className="text-red-500 text-sm">{errors.user_phone}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ thường trú <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.user_permanent_address ? 'border-red-500' : ''
                    }`}
                    defaultValue={selectedStudent?.user_permanent_address}
                    onChange={(e) => handleInputChange('user_permanent_address', e.target.value)}
                  />
                  {errors.user_permanent_address && (
                    <span className="text-red-500 text-sm">{errors.user_permanent_address}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ tạm trú
                  </label>
                  <input
                    type="text"
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.user_temporary_address ? 'border-red-500' : ''
                    }`}
                    defaultValue={selectedStudent?.user_temporary_address}
                    onChange={(e) => handleInputChange('user_temporary_address', e.target.value)}
                  />
                  {errors.user_temporary_address && (
                    <span className="text-red-500 text-sm">{errors.user_temporary_address}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.user_date_of_birth ? 'border-red-500' : ''
                    }`}
                    defaultValue={selectedStudent?.user_date_of_birth}
                    onChange={(e) => handleInputChange('user_date_of_birth', e.target.value)}
                  />
                  {errors.user_date_of_birth && (
                    <span className="text-red-500 text-sm">{errors.user_date_of_birth}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khoa <span className="text-red-500">*</span>
                  </label>
                  <Select
                    className={`w-full ${errors.user_faculty ? 'border-red-500' : ''}`}
                    defaultValue={selectedStudent?.user_faculty}
                    onChange={(value) => {
                      setSelectedFaculty(value);
                      handleInputChange('user_faculty', value);
                    }}
                  >
                    {Object.keys(majorsByDepartment).map((dep) => (
                      <Select.Option key={dep} value={dep}>
                        {dep}
                      </Select.Option>
                    ))}
                  </Select>
                  {errors.user_faculty && (
                    <span className="text-red-500 text-sm">{errors.user_faculty}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chuyên ngành <span className="text-red-500">*</span>
                  </label>
                  <Select
                    className={`w-full ${errors.user_major ? 'border-red-500' : ''}`}
                    defaultValue={selectedStudent?.user_major}
                    disabled={!selectedFaculty}
                    onChange={(value) => handleInputChange('user_major', value)}
                  >
                    {availableMajors.map((major) => (
                      <Select.Option key={major} value={major}>
                        {major}
                      </Select.Option>
                    ))}
                  </Select>
                  {errors.user_major && (
                    <span className="text-red-500 text-sm">{errors.user_major}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
              onClick={() => {
                  setIsModalVisible(false);
                setSelectedStudent(null);
                  setFormData({});
                  setErrors({});
                }}
              >
                Đóng
              </Button>
              <Button 
                type="primary" 
                onClick={handleUpdate}
                loading={isSubmitting}
              >
                Cập nhật
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog xác nhận */}
      <Modal
        title="Xác nhận thay đổi"
        open={isConfirmModalVisible}
        onOk={handleConfirmUpdate}
        onCancel={() => setIsConfirmModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          style: {
            backgroundColor: '#1890ff',
            borderColor: '#1890ff'
          }
        }}
        cancelButtonProps={{
          style: {
            borderColor: '#d9d9d9',
            color: '#000000d9'
          }
        }}
        width={500}
        centered
      >
        <div className="py-4">
          <p className="text-gray-600">Bạn có chắc chắn muốn cập nhật thông tin của sinh viên:</p>
          <p className="font-semibold mt-2">{selectedStudent?.user_name}</p>
          <p className="text-gray-500 text-sm mt-1">Mã số: {selectedStudent?.user_id}</p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 text-sm">
              Lưu ý: Hành động này sẽ cập nhật thông tin trong cơ sở dữ liệu.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal thông báo thành công */}
      <Modal
        title="Thông báo"
        open={isSuccessModalVisible}
        onOk={() => {
          setIsSuccessModalVisible(false);
          setIsModalVisible(false);
        }}
        okText="Đóng"
        centered
      >
        <div className="text-center py-4">
          <CheckCircleFilled style={{ fontSize: '48px', color: '#52c41a' }} />
          <p className="mt-4 text-lg">Cập nhật thông tin sinh viên thành công!</p>
        </div>
      </Modal>

      {/* Modal thông báo lỗi */}
      <Modal
        title="Thông báo lỗi"
        open={isErrorModalVisible}
        onOk={() => setIsErrorModalVisible(false)}
        okText="Đóng"
        centered
      >
        <div className="text-center py-4">
          <CloseCircleFilled style={{ fontSize: '48px', color: '#ff4d4f' }} />
          <p className="mt-4 text-lg">{errorMessage}</p>
        </div>
      </Modal>
    </div>
  );
};

export default Students; 