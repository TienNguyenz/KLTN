import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Space, Input, Select, message, DatePicker } from 'antd';
import { ExclamationCircleFilled, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import LecturerForm from './Form_Add_Lecturer';
import axios from 'axios';
import dayjs from 'dayjs';
import { FaEdit, FaTrash } from 'react-icons/fa';

const { Search } = Input;

const majorsByDepartment = {
  "Khoa Công nghệ thông tin": [
    "Khoa học máy tính",
    "Kỹ thuật phần mềm",
    "Hệ thống Thông tin",
  ],
  "Khoa Quản trị kinh doanh": [
    "Quản trị Logistics",
    "Quản trị Makerting",
    "Digital Markerting",
    "Quản trị nhân sự",
  ],
};

const disabledDate = (current) => {
  // Không cho chọn ngày trong tương lai
  if (current && current > new Date()) {
    return true;
  }
  
  // Tính tuổi
  let calculatedAge = new Date().getFullYear() - current.year();
  const monthDiff = new Date().getMonth() - current.month();
  const dayDiff = new Date().getDate() - current.date();
  
  // Kiểm tra nếu chưa đủ 22 tuổi
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    calculatedAge--;
  }
  
  return calculatedAge < 22;
};

const LecturerList = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [filterMajor, setFilterMajor] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [lecturers, setLecturers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('year');

  const fetchFacultiesAndMajors = async () => {
    try {
      const [facultiesRes, majorsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/database/collections/faculties"),
        axios.get("http://localhost:5000/api/database/collections/majors")
      ]);
      setFaculties(facultiesRes.data);
      setMajors(majorsRes.data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu khoa và chuyên ngành:", err);
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/database/collections/User", {
        params: { 
          role: 'giangvien',
          search: searchText
        }
      });
      const filteredLecturers = res.data
        .filter(user => user.role === 'giangvien')
        .filter(lecturer => {
          // Lọc theo text tìm kiếm
          if (searchText) {
            const searchLower = searchText.toLowerCase();
            if (!lecturer.user_name?.toLowerCase().includes(searchLower) &&
                !lecturer.user_id?.toLowerCase().includes(searchLower)) {
              return false;
            }
          }

          // Lọc theo khoa
          if (filterFaculty) {
            const faculty = faculties.find(f => f._id === lecturer.user_faculty);
            if (faculty?.faculty_title !== filterFaculty) {
              return false;
            }
          }

          // Lọc theo chuyên ngành
          if (filterMajor) {
            const major = majors.find(m => m._id === lecturer.user_major);
            if (major?.major_title !== filterMajor) {
              return false;
            }
          }

          return true;
        })
        .map(lecturer => {
          // Tìm tên khoa
          const faculty = faculties.find(f => f._id === lecturer.user_faculty);
          // Tìm tên chuyên ngành
          const major = majors.find(m => m._id === lecturer.user_major);
          
          return {
            ...lecturer,
            faculty_name: faculty ? faculty.faculty_title : 'Chưa có khoa',
            major_name: major ? major.major_title : 'Chưa có chuyên ngành'
          };
        });
      setLecturers(filteredLecturers);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu giảng viên:", err);
    }
  };

  useEffect(() => {
    fetchFacultiesAndMajors();
  }, []);

  useEffect(() => {
    if (faculties.length > 0 && majors.length > 0) {
    fetchLecturers();
    }
  }, [searchText, filterFaculty, filterMajor, faculties, majors]);

  const columns = [
    {
      title: 'Mã GV',
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
      title: 'Ngày sinh',
      dataIndex: 'user_date_of_birth',
      key: 'user_date_of_birth',
      render: (date) => {
        if (!date) return '';
        try {
          const [year, month, day] = date.split('-');
          return `${day}/${month}/${year}`;
        } catch {
          return date;
        }
      }
    },
    {
      title: 'Khoa',
      dataIndex: 'faculty_name',
      key: 'faculty_name',
    },
    {
      title: 'Chuyên ngành',
      dataIndex: 'major_name',
      key: 'major_name',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-100"
            icon={<FaEdit style={{ color: '#4096ff' }} className="text-lg" />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100"
            icon={<FaTrash style={{ color: '#ff4d4f' }} className="text-lg" />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (lecturer) => {
    setSelectedLecturer(lecturer);
    setIsModalVisible(true);
    setSelectedFaculty(lecturer.user_faculty);
  };

  const handleDelete = async (lecturer) => {
    try {
      // Hiển thị dialog xác nhận
      const confirmed = window.confirm('Bạn có chắc chắn muốn xóa giảng viên này không?');
      if (!confirmed) {
        return;
      }

      // Gọi API xóa user
      const response = await axios.delete(`http://localhost:5000/api/database/collections/User/${lecturer._id}`);
      
      if (response.data) {
        // Cập nhật lại danh sách giảng viên
        setLecturers(lecturers.filter(l => l._id !== lecturer._id));
        
        // Hiển thị thông báo thành công
        setSuccessMessage('Xóa giảng viên thành công!');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error deleting lecturer:', error);
      setErrorMessage('Có lỗi xảy ra khi xóa giảng viên');
      setShowErrorModal(true);
    }
  };

  const handleSuccess = () => {
    setIsModalVisible(false);
    fetchLecturers();
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
              excludeId: selectedLecturer?._id // Loại trừ ID hiện tại khi kiểm tra
            }
          });
          const existingUser = response.data.find(user => user.email === formData.email && user._id !== selectedLecturer?._id);
          if (existingUser) {
            if (existingUser.role === 'sinhvien') {
              newErrors.email = 'Email này đã được sử dụng bởi một sinh viên';
            } else if (existingUser.role === 'giangvien') {
              newErrors.email = 'Email này đã được sử dụng bởi một giảng viên';
            } else {
              newErrors.email = 'Email này đã được sử dụng';
            }
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
              excludeId: selectedLecturer?._id // Loại trừ ID hiện tại khi kiểm tra
            }
          });
          const existingUser = response.data.find(user => user.user_id === formData.user_id && user._id !== selectedLecturer?._id);
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
    if (field === 'user_faculty') {
      setFormData(prev => {
        const majorsOfFaculty = majors.filter(m => m.major_faculty === value);
        const shouldResetMajor = !majorsOfFaculty.some(m => m._id === prev.user_major);
        return {
          ...prev,
          [field]: value,
          user_major: shouldResetMajor ? '' : prev.user_major
        };
      });
      setSelectedFaculty(value);
    } else if (field === 'user_major') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
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

      console.log('Image upload response:', response.data);
      if (response.data && response.data.url) {
        return response.data.url; // Server trả về /uploads/filename
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Không thể tải lên ảnh. Vui lòng thử lại.');
      return null;
    }
  };

  const handleUpdate = async () => {
    setIsConfirmModalVisible(true);
  };

  const handleConfirmUpdate = async () => {
    setIsSubmitting(true);
    try {
      // Nếu không có trường nào thay đổi khi chỉnh sửa
      if (selectedLecturer && Object.keys(formData).length === 0) {
        setSuccessMessage('Cập nhật thông tin giảng viên thành công!');
        setIsSuccessModalVisible(true);
        setIsSubmitting(false);
        setIsConfirmModalVisible(false);
        return;
      }

      // Validate age
      const today = new Date();
      const birthDateStr = formData.user_date_of_birth || selectedLecturer?.user_date_of_birth;
      const birthDate = birthDateStr ? new Date(birthDateStr) : null;
      
      if (!birthDate) {
        throw new Error('Vui lòng chọn ngày sinh');
      }

      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      if (calculatedAge < 22) {
        throw new Error('Giảng viên phải từ 22 tuổi trở lên');
      }

      // Format password from YYYY-MM-DD to DDMMYYYY
      const dateToUse = birthDateStr;
      const formattedPassword = dateToUse ? 
        dateToUse.split('-').reverse().join('') : 
        null;

      if (!formattedPassword) {
        throw new Error('Không thể tạo mật khẩu từ ngày sinh');
      }

      let user_avatar = formData.user_avatar;
      if (formData.avatarFile) {
        user_avatar = await handleImageUpload(formData.avatarFile);
        if (!user_avatar) {
          setIsSubmitting(false);
          return;
        }
      }

      // Validate faculty and major selection
      if (!selectedLecturer) {
        // For new lecturer, both faculty and major are required
        if (!formData.user_faculty) {
          throw new Error('Vui lòng chọn khoa');
        }

        if (!formData.user_major) {
          throw new Error('Vui lòng chọn chuyên ngành');
        }

        // Verify that faculty exists
        const selectedFacultyExists = faculties.some(f => f._id === formData.user_faculty);
        if (!selectedFacultyExists) {
          throw new Error('Khoa đã chọn không tồn tại');
        }

        // Verify that major exists and belongs to selected faculty
        const selectedMajorExists = majors.some(m => 
          m._id === formData.user_major && 
          m.major_faculty === formData.user_faculty
        );
        if (!selectedMajorExists) {
          throw new Error('Chuyên ngành đã chọn không tồn tại hoặc không thuộc khoa đã chọn');
        }
      } else {
        // For updating existing lecturer
        const currentFacultyId = formData.user_faculty || selectedLecturer.user_faculty;

        // If changing major, verify it belongs to the current faculty
        if (formData.user_major && formData.user_major !== selectedLecturer.user_major) {
          const majorBelongsToFaculty = majors.some(m => 
            m._id === formData.user_major && 
            m.major_faculty === currentFacultyId
          );
          if (!majorBelongsToFaculty) {
            throw new Error('Chuyên ngành đã chọn không thuộc khoa hiện tại');
          }
        }

        // If changing faculty, must also select a valid major for that faculty
        if (formData.user_faculty && formData.user_faculty !== selectedLecturer.user_faculty) {
          if (!formData.user_major) {
            throw new Error('Vui lòng chọn chuyên ngành cho khoa mới');
          }
          const majorBelongsToNewFaculty = majors.some(m => 
            m._id === formData.user_major && 
            m.major_faculty === formData.user_faculty
          );
          if (!majorBelongsToNewFaculty) {
            throw new Error('Vui lòng chọn chuyên ngành thuộc khoa mới');
          }
        }
      }

      if (selectedLecturer) {
        // Updating existing lecturer
        const updatedData = {
          ...selectedLecturer,
          ...formData,
          user_faculty: formData.user_faculty || selectedLecturer.user_faculty,
          user_major: formData.user_major || selectedLecturer.user_major,
          user_avatar: user_avatar || selectedLecturer.user_avatar,
          role: 'giangvien',
          password: formattedPassword
        };

        // Remove faculty_name and major_name before sending to server
        delete updatedData.faculty_name;
        delete updatedData.major_name;

        console.log('Sending update request with data:', updatedData);
        const response = await axios.put(
          `http://localhost:5000/api/database/collections/User/${selectedLecturer._id}`,
          updatedData
        );
        console.log('Update response:', response.data);
        
        if (response.data) {
          console.log('API update thành công, response:', response.data);
          setIsSuccessModalVisible(true);
        }
      } else {
        // Adding new lecturer
        const newLecturerData = {
          user_name: formData.user_name,
          email: formData.email,
          user_id: formData.user_id,
          password: formattedPassword,
          user_CCCD: formData.user_CCCD || '',
          user_phone: formData.user_phone || '',
          user_permanent_address: formData.user_permanent_address || '',
          user_temporary_address: formData.user_temporary_address || '',
          user_date_of_birth: formData.user_date_of_birth || '',
          user_faculty: formData.user_faculty,
          user_major: formData.user_major,
          user_avatar: user_avatar || '',
          role: 'giangvien',
          user_status: 'active',
          user_department: formData.user_faculty || ''
        };

        // Validate required fields
        const requiredFields = ['user_name', 'email', 'user_id', 'password', 'user_faculty', 'user_major', 'user_date_of_birth'];
        const missingFields = requiredFields.filter(field => !newLecturerData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        console.log('Sending create request with data:', newLecturerData);
        try {
          const response = await axios.post(
            'http://localhost:5000/api/auth/register',
            newLecturerData,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('Create response:', response.data);

          if (response.data) {
            console.log('API update thành công, response:', response.data);
            setIsSuccessModalVisible(true);
          }
        } catch (error) {
          console.error('Registration error:', error.response?.data || error);
          const errorMessage = error.response?.data?.message || 'Lỗi khi đăng ký giảng viên mới';
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Ưu tiên lấy message chi tiết từ backend nếu có
      const errorMessage = error.response?.data?.message
        || error.message
        || (selectedLecturer ? 'Cập nhật thông tin giảng viên thất bại!' : 'Thêm giảng viên mới thất bại!');
      setErrorMessage(errorMessage);
      setIsErrorModalVisible(true);
    } finally {
      setIsSubmitting(false);
      setIsConfirmModalVisible(false);
    }
  };

  return (
    <div className="p-4 relative">
      <h1 className="text-2xl font-bold mb-4">Danh sách Giảng viên</h1>
      <div className="flex gap-4 mb-4">
        <Search
          placeholder="Tìm theo MSGV hoặc họ tên"
          onSearch={(value) => setSearchText(value)}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />
        <Select
          style={{ width: 200 }}
          placeholder="-- Chọn Khoa --"
          onChange={(value) => {
            setFilterFaculty(value);
            setFilterMajor(''); // Reset major when faculty changes
          }}
          allowClear
        >
          {Object.keys(majorsByDepartment).map((dep, idx) => (
            <Select.Option key={idx} value={dep}>
              {dep}
            </Select.Option>
          ))}
        </Select>
        <Select
          style={{ width: 200 }}
          placeholder="-- Chọn Chuyên ngành --"
          onChange={(value) => setFilterMajor(value)}
          disabled={!filterFaculty}
          allowClear
        >
          {majorsByDepartment[filterFaculty]?.map((major) => (
            <Select.Option key={major} value={major}>
              {major}
            </Select.Option>
          ))}
        </Select>
        <Button
          type="primary"
          onClick={() => {
            setSelectedLecturer(null);
            setIsModalVisible(true);
            setSelectedFaculty(''); // Reset khi thêm mới
          }}
        >
          Thêm giảng viên
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={lecturers.map(lecturer => ({
          ...lecturer,
          key: lecturer._id,
          faculty_name: faculties.find(f => f._id === lecturer.user_faculty)?.faculty_title || '',
          major_name: majors.find(m => m._id === lecturer.user_major)?.major_title || '',
        }))}
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
                  {(formData.user_avatar || selectedLecturer?.user_avatar) ? (
                    <img 
                      src={formData.user_avatar ? formData.user_avatar : `http://localhost:5000${selectedLecturer.user_avatar}`}
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{selectedLecturer?.user_name?.charAt(0) || formData.user_name?.charAt(0)}</span>
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
                          handleInputChange('user_avatar', reader.result);
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
                <h2 className="text-xl font-semibold">{selectedLecturer?.user_name || 'Thêm giảng viên mới'}</h2>
                <div className="text-gray-600">
                  <span>Mã số: {selectedLecturer?.user_id}</span>
                  <span className="mx-2">|</span>
                  <span>Vai trò: LECTURER</span>
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
                    value={formData.user_name || selectedLecturer?.user_name || ''}
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
                    value={formData.email || selectedLecturer?.email || ''}
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
                    value={formData.user_id || selectedLecturer?.user_id || ''}
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
                    value={formData.user_CCCD || selectedLecturer?.user_CCCD || ''}
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
                    value={formData.user_phone || selectedLecturer?.user_phone || ''}
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
                    value={formData.user_permanent_address || selectedLecturer?.user_permanent_address || ''}
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
                    value={formData.user_temporary_address || selectedLecturer?.user_temporary_address || ''}
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
                  <DatePicker
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.user_date_of_birth ? 'border-red-500' : ''
                    }`}
                    value={formData.user_date_of_birth ? dayjs(formData.user_date_of_birth) : (selectedLecturer?.user_date_of_birth ? dayjs(selectedLecturer.user_date_of_birth) : null)}
                    onChange={(date, dateString) => handleInputChange('user_date_of_birth', dateString)}
                    format="YYYY-MM-DD"
                    disabledDate={disabledDate}
                    placeholder="Chọn ngày sinh"
                    style={{ width: '100%' }}
                    showToday={false}
                    placement="bottomLeft"
                    picker="date"
                    mode={datePickerMode}
                    onPanelChange={(_, mode) => {
                      setDatePickerMode(mode);
                    }}
                    prevIcon={<span>←</span>}
                    nextIcon={<span>→</span>}
                    superPrevIcon={<span>⇐</span>}
                    superNextIcon={<span>⇒</span>}
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
                    value={formData.user_faculty || selectedLecturer?.user_faculty}
                    onChange={(value) => handleInputChange('user_faculty', value)}
                  >
                    {faculties.map((faculty) => (
                      <Select.Option key={faculty._id} value={faculty._id}>
                        {faculty.faculty_title}
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
                    value={formData.user_major || selectedLecturer?.user_major || ''}
                    disabled={!selectedFaculty}
                    onChange={(value) => handleInputChange('user_major', value)}
                  >
                    {majors
                      .filter(major => major.major_faculty === selectedFaculty)
                      .map((major) => (
                        <Select.Option key={major._id} value={major._id}>
                          {major.major_title}
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
                setSelectedLecturer(null);
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
                {selectedLecturer ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog xác nhận */}
      <Modal
        title={selectedLecturer ? "Xác nhận cập nhật" : "Xác nhận thêm mới"}
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
          {selectedLecturer ? (
            <>
              <p className="text-gray-600">Bạn có chắc chắn muốn cập nhật thông tin của giảng viên:</p>
              <p className="font-semibold mt-2">{selectedLecturer.user_name}</p>
              <p className="text-gray-500 text-sm mt-1">Mã số: {selectedLecturer.user_id}</p>
            </>
          ) : (
            <>
              <p className="text-gray-600">Bạn có chắc chắn muốn thêm giảng viên mới với thông tin:</p>
              <p className="font-semibold mt-2">Họ tên: {formData.user_name}</p>
              <p className="text-gray-500 text-sm mt-1">Mã số: {formData.user_id}</p>
            </>
          )}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 text-sm">
              {selectedLecturer 
                ? "Lưu ý: Hành động này sẽ cập nhật thông tin trong cơ sở dữ liệu."
                : "Lưu ý: Hành động này sẽ thêm giảng viên mới vào cơ sở dữ liệu."
              }
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
          setSelectedLecturer(null);
          setFormData({});
          setErrors({});
          setFilterFaculty('');
          setFilterMajor('');
          fetchLecturers();
        }}
        okText="Đóng"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <div className="text-center py-4">
          <CheckCircleFilled style={{ fontSize: '48px', color: '#52c41a' }} />
          <p className="mt-4 text-lg">
            {'Cập nhật thông tin giảng viên thành công!'}
          </p>
        </div>
      </Modal>

      {/* Modal thông báo lỗi */}
      <Modal
        title="Thông báo lỗi"
        open={isErrorModalVisible}
        onOk={() => setIsErrorModalVisible(false)}
        okText="Đóng"
        cancelButtonProps={{ style: { display: 'none' } }}
        closable={false}
        centered
      >
        <div className="text-center py-4">
          <CloseCircleFilled style={{ fontSize: '48px', color: '#ff4d4f' }} />
          <p className="mt-4 text-lg">{errorMessage}</p>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        title="Thông báo"
        open={showSuccessModal}
        onOk={() => setShowSuccessModal(false)}
        onCancel={() => setShowSuccessModal(false)}
      >
        <p>{successMessage}</p>
      </Modal>

      {/* Error Modal */}
      <Modal
        title="Lỗi"
        open={showErrorModal}
        onOk={() => setShowErrorModal(false)}
        onCancel={() => setShowErrorModal(false)}
      >
        <p>{errorMessage}</p>
      </Modal>

      {console.log('isSuccessModalVisible:', isSuccessModalVisible)}
    </div>
  );
};

export default LecturerList; 