import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Space, Input, Select, message, DatePicker, Alert } from 'antd';
import { ExclamationCircleFilled, CheckCircleFilled, CloseCircleFilled, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import StudentForm from '../../components/ui/Form_Add_Student';
import axios from 'axios';
import dayjs from 'dayjs';
import { FaEdit, FaTrash } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const { Search } = Input;

const disabledDate = (current) => {
  if (!current) return false;
  const year = current.year();
  const nowYear = new Date().getFullYear();
  return year > nowYear - 18;
};

const VIETNAMESE_TO_FIELD = {
  'Mã số': 'user_id',
  'Họ tên': 'user_name',
  'Email': 'email',
  'CCCD': 'user_CCCD',
  'Số điện thoại': 'user_phone',
  'Địa chỉ thường trú': 'user_permanent_address',
  'Địa chỉ tạm trú': 'user_temporary_address',
  'Ngày sinh': 'user_date_of_birth',
  'Khoa': 'user_faculty',
  'Chuyên ngành': 'user_major',
};

const API_BASE_URL = 'http://localhost:5000/api';
const MIN_STUDENT_AGE = 18;
const RANDOM_ID_DIGITS = 4; // For student ID
const MAX_ID_GENERATION_ATTEMPTS = 100;

const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
  phone: /^0\d{9}$/,
  cccd: /^\d{12}$/,
  name: /^[^0-9!@#$%^&*(),.?":{}|<>]+$/
};

const generateFacultyCode = (facultyTitle) => {
  if (!facultyTitle) return null;
  const titleWithoutPrefix = facultyTitle.replace(/^(Khoa )/i, '').trim();
  if (!titleWithoutPrefix) return null;
  return titleWithoutPrefix.split(/\s+/)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
};

const generateRandomNumberString = (digits) => {
  return Array(digits).fill(0)
    .map(() => Math.floor(Math.random() * 10))
    .join('');
};

const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const api = {
  checkUserIdExists: async (userId, role) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/database/users/check-user-id`, {
        params: { user_id: userId, role }
      });
      return response.data.exists;
    } catch (error) {
      console.error('Error checking user ID existence:', error);
      return true;
    }
  },
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await axios.post(`${API_BASE_URL}/database/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Không thể tải lên ảnh. Vui lòng thử lại.');
      return null;
    }
  },
  deleteImage: async (filename) => {
    try {
      await axios.delete(`${API_BASE_URL}/database/uploads/${filename}`);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
};

const validateStudent = {
  name: (name) => {
    if (!name?.trim()) return 'Họ tên không được để trống';
    if (!VALIDATION_PATTERNS.name.test(name)) return 'Họ tên không được chứa số hoặc ký tự đặc biệt';
    return null;
  },
  email: (email) => {
    if (!email?.trim()) return 'Email không được để trống';
    if (!VALIDATION_PATTERNS.email.test(email)) return 'Email không hợp lệ (Chỉ chấp nhận @gmail.com)';
    return null;
  },
  phone: (phone) => {
    if (!phone?.trim()) return 'Số điện thoại không được để trống';
    if (!VALIDATION_PATTERNS.phone.test(phone)) return 'Số điện thoại không hợp lệ (phải 10 số, bắt đầu bằng 0)';
    return null;
  },
  cccd: (cccd) => {
    if (!cccd?.trim()) return 'CCCD không được để trống';
    if (!VALIDATION_PATTERNS.cccd.test(cccd)) return 'CCCD phải có 12 chữ số';
    return null;
  },
  age: (birthDate) => {
    const age = calculateAge(birthDate);
    if (age < MIN_STUDENT_AGE) return `Sinh viên phải từ ${MIN_STUDENT_AGE} tuổi trở lên`;
    return null;
  }
};

const Students = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [filterMajor, setFilterMajor] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [students, setStudents] = useState([]);
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
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const fetchFacultiesAndMajors = async () => {
    try {
      const [facultiesRes, majorsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/database/collections/faculties"),
        axios.get("http://localhost:5000/api/database/collections/majors")
      ]);
      console.log('API faculties response:', facultiesRes.data);
      console.log('API majors response:', majorsRes.data);
      setFaculties(facultiesRes.data.data);
      setMajors(majorsRes.data.data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu khoa và chuyên ngành:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/database/collections/User", {
        params: { 
          role: 'sinhvien',
          search: searchText
        }
      });
      console.log('API response for students:', res.data);
      console.log('faculties:', faculties);
      console.log('majors:', majors);
      const studentsArray = res.data.data;
      const filteredStudents = studentsArray
        .filter(user => user.role === 'sinhvien')
        .filter(student => {
          // Lọc theo text tìm kiếm
          if (searchText) {
            const searchLower = searchText.toLowerCase();
            if (!student.user_name?.toLowerCase().includes(searchLower) &&
                !student.user_id?.toLowerCase().includes(searchLower)) {
              return false;
            }
          }

          // Lọc theo khoa
          if (filterFaculty) {
            const faculty = faculties.find(f => String(f._id) === String(student.user_faculty));
            if (faculty?.faculty_title !== filterFaculty) {
              return false;
            }
          }

          // Lọc theo chuyên ngành
          if (filterMajor) {
            const major = majors.find(m => String(m._id) === String(student.user_major));
            if (major?.major_title !== filterMajor) {
              return false;
            }
          }

          return true;
        });

      setStudents(filteredStudents);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu sinh viên:", err);
    }
  };

  React.useEffect(() => {
    fetchFacultiesAndMajors();
  }, []);

  React.useEffect(() => {
    if (faculties.length > 0 && majors.length > 0) {
    fetchStudents();
    }
  }, [searchText, filterFaculty, filterMajor, faculties, majors]);

  useEffect(() => {
    if (importSuccess) {
      const timer = setTimeout(() => setImportSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [importSuccess]);

  useEffect(() => {
    if (importError) {
      const timer = setTimeout(() => setImportError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [importError]);

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
      dataIndex: 'user_faculty',
      key: 'user_faculty',
      render: (facultyId) => {
        const faculty = faculties.find(f => f._id === facultyId);
        return faculty ? faculty.faculty_title : 'Chưa có khoa';
      }
    },
    {
      title: 'Chuyên ngành',
      dataIndex: 'user_major',
      key: 'user_major',
      render: (majorId) => {
        const major = majors.find(m => m._id === majorId);
        return major ? major.major_title : 'Chưa có chuyên ngành';
      }
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

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
    setSelectedFaculty(student.user_faculty);
  };

  const handleDelete = async (student) => {
    try {
        // Hiển thị dialog xác nhận
        const confirmed = window.confirm('Bạn có chắc chắn muốn xóa sinh viên này không?');
        if (!confirmed) {
            return;
        }

        // Gọi API xóa user
        const response = await axios.delete(`http://localhost:5000/api/database/collections/User/${student._id}`);
        
        if (response.data) {
            // Cập nhật lại danh sách sinh viên
            setStudents(students.filter(s => s._id !== student._id));
            
            // Hiển thị thông báo thành công
            setSuccessMessage('Xóa sinh viên thành công!');
            setShowSuccessModal(true);
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        setErrorMessage('Có lỗi xảy ra khi xóa sinh viên');
        setShowErrorModal(true);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'user_faculty') {
      setFormData(prev => {
        // Lấy danh sách chuyên ngành thuộc khoa mới
        const majorsOfFaculty = majors.filter(m => m.major_faculty === value);
        // Nếu chuyên ngành hiện tại không thuộc khoa mới, reset về rỗng
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

      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Không thể tải lên ảnh. Vui lòng thử lại.');
      return null;
    }
  };

  const handleUpdate = async () => {
    setErrors({});
    const newErrors = {};

    if (!selectedStudent) {
      // Validate new student
      if (!formData.user_faculty) {
        newErrors.user_faculty = 'Vui lòng chọn khoa để tạo mã sinh viên';
      } else {
        const facultyCode = generateFacultyCode(faculties.find(f => f._id === formData.user_faculty)?.faculty_title);
        if (!facultyCode) {
          newErrors.user_faculty = 'Không tìm thấy mã khoa để tạo mã sinh viên';
        } else {
          let generatedId = '';
          let isUnique = false;
          for (let i = 0; i < MAX_ID_GENERATION_ATTEMPTS; i++) {
            generatedId = facultyCode + generateRandomNumberString(RANDOM_ID_DIGITS);
            isUnique = !(await api.checkUserIdExists(generatedId, 'sinhvien'));
            if (isUnique) break;
          }
          if (isUnique) {
            setFormData(prev => ({ ...prev, user_id: generatedId }));
          } else {
            newErrors.user_id = 'Không thể tạo mã sinh viên duy nhất sau nhiều lần thử. Vui lòng thử lại.';
          }
        }
      }
      // Validate other fields
      newErrors.user_name = validateStudent.name(formData.user_name);
      newErrors.email = validateStudent.email(formData.email);
      newErrors.user_phone = validateStudent.phone(formData.user_phone);
      newErrors.user_CCCD = validateStudent.cccd(formData.user_CCCD);
      newErrors.user_date_of_birth = validateStudent.age(formData.user_date_of_birth);
      if (!formData.user_permanent_address?.trim()) {
        newErrors.user_permanent_address = 'Địa chỉ thường trú không được để trống';
      }
      if (!formData.user_faculty) {
        newErrors.user_faculty = 'Vui lòng chọn khoa';
      }
      if (!formData.user_major) {
        newErrors.user_major = 'Vui lòng chọn chuyên ngành';
      }
    } else {
      // Validate edited student
      const changedFields = Object.keys(formData);
      for (const field of changedFields) {
        switch (field) {
          case 'user_name':
            newErrors.user_name = validateStudent.name(formData.user_name);
            break;
          case 'email':
            newErrors.email = validateStudent.email(formData.email);
            break;
          case 'user_phone':
            newErrors.user_phone = validateStudent.phone(formData.user_phone);
            break;
          case 'user_CCCD':
            newErrors.user_CCCD = validateStudent.cccd(formData.user_CCCD);
            break;
          case 'user_date_of_birth':
            newErrors.user_date_of_birth = validateStudent.age(formData.user_date_of_birth);
            break;
          // ... other validations
        }
      }
    }
    // Remove null errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([, value]) => value !== null)
    );
    if (Object.keys(filteredErrors).length > 0) {
      setErrors(filteredErrors);
      message.error('Vui lòng kiểm tra lại thông tin!');
      return;
    }
    setIsConfirmModalVisible(true);
  };

  const handleConfirmUpdate = async () => {
    console.log('Dialog confirmed');
    setIsSubmitting(true);
    try {
      // Validate age
      const today = new Date();
      const birthDateStr = formData.user_date_of_birth || selectedStudent?.user_date_of_birth;
      const birthDate = birthDateStr ? new Date(birthDateStr) : null;
      
      if (!birthDate) {
        throw new Error('Vui lòng chọn ngày sinh');
      }

      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      if (calculatedAge < 18) {
        throw new Error('Sinh viên phải từ 18 tuổi trở lên');
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
      if (!selectedStudent) {
        // For new student, both faculty and major are required
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

        // Chuẩn bị dữ liệu gửi lên server
        const newStudent = {
          ...formData,
          role: 'sinhvien',
          user_status: 'active',
          password: formattedPassword,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        // Gửi request tạo mới
        const response = await axios.post('http://localhost:5000/api/database/collections/User', newStudent);
        if (response.data) {
          setIsSuccessModalVisible(true);
          fetchStudents();
        }
      } else {
        // For updating existing student
        const oldAvatar = selectedStudent.user_avatar;
        const updatedData = {
          ...selectedStudent,
          ...formData,
          user_faculty: formData.user_faculty || selectedStudent.user_faculty,
          user_major: formData.user_major || selectedStudent.user_major,
          user_avatar: user_avatar || selectedStudent.user_avatar,
          role: 'sinhvien',
          password: formattedPassword
        };

        // Remove faculty_name and major_name before sending to server
        delete updatedData.faculty_name;
        delete updatedData.major_name;

        console.log('Sending update request with data:', updatedData);
        const response = await axios.put(
          `http://localhost:5000/api/database/collections/User/${selectedStudent._id}`,
          updatedData
        );
        console.log('Update response:', response.data);
        
        if (response.data) {
          // Xóa file avatar cũ nếu có và khác file mới
          if (oldAvatar && oldAvatar !== user_avatar) {
            const filename = oldAvatar.split('/').pop();
            await api.deleteImage(filename);
          }
            setIsSuccessModalVisible(true);
            fetchStudents();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Ưu tiên lấy message chi tiết từ backend nếu có
      const errorMessage = error.response?.data?.message
        || error.message
        || (selectedStudent ? 'Cập nhật thông tin sinh viên thất bại!' : 'Thêm sinh viên mới thất bại!');
      setErrorMessage(errorMessage);
      setIsErrorModalVisible(true);
    } finally {
      setIsSubmitting(false);
      setIsConfirmModalVisible(false);
    }
  };

  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        let jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Nếu là cột tiếng Việt, map sang trường chuẩn
        if (jsonData.length > 0) {
          const firstRow = jsonData[0];
          const isVietnamese = Object.keys(firstRow).some(key => VIETNAMESE_TO_FIELD[key]);
          if (isVietnamese) {
            jsonData = jsonData.map(row => {
              const mapped = {};
              Object.entries(row).forEach(([k, v]) => {
                const field = VIETNAMESE_TO_FIELD[k] || k;
                mapped[field] = v;
              });
              return mapped;
            });
          }
        }

        // Lấy danh sách MSSV đã có (trong hệ thống và trong batch)
        const existingIds = new Set(students.map(s => s.user_id));
        const batchIds = new Set();

        // Tự động sinh MSSV nếu thiếu
        for (let i = 0; i < jsonData.length; i++) {
          let row = jsonData[i];
          if (!row.user_id || String(row.user_id).trim() === '') {
            // Tìm mã khoa: có thể là _id hoặc faculty_title
            let faculty = faculties.find(f => f._id === row.user_faculty) || faculties.find(f => f.faculty_title === row.user_faculty);
            if (!faculty) {
              setImportError(`Không tìm thấy khoa cho dòng ${i + 2} (giá trị: ${row.user_faculty || 'trống'})`);
              return;
            }
            let facultyCode = generateFacultyCode(faculty.faculty_title);
            if (!facultyCode) {
              setImportError(`Không thể sinh mã khoa cho dòng ${i + 2} (giá trị: ${faculty.faculty_title})`);
              return;
            }
            let newId = '';
            let attempt = 0;
            do {
              newId = facultyCode + generateRandomNumberString(4);
              attempt++;
            } while ((existingIds.has(newId) || batchIds.has(newId)) && attempt < 200);
            row.user_id = newId;
          }
          batchIds.add(row.user_id);
        }

        // Validate data structure
        const requiredFields = ['user_id', 'user_name', 'email', 'user_CCCD', 'user_phone', 'user_permanent_address', 'user_date_of_birth', 'user_faculty', 'user_major'];
        const missingFields = requiredFields.filter(field => !Object.prototype.hasOwnProperty.call(jsonData[0] || {}, field));
        if (missingFields.length > 0) {
          setImportError(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
          return;
        }

        // Xử lý dữ liệu và gửi lên server
        const processedData = jsonData.map(row => {
          const processedRow = { ...row };
          // Xử lý ngày sinh
          if (processedRow.user_date_of_birth) {
            let date = dayjs(processedRow.user_date_of_birth, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
            if (date.isValid()) {
              processedRow.user_date_of_birth = date.format('YYYY-MM-DD');
            } else {
              console.warn(`Could not parse date: ${row.user_date_of_birth}`);
              delete processedRow.user_date_of_birth;
            }
          }
          return {
            ...processedRow,
            role: 'sinhvien',
            user_status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        });

        await axios.post('http://localhost:5000/api/database/collections/User/bulk', processedData);
        setImportSuccess('Import dữ liệu sinh viên thành công!');
        fetchStudents();
      } catch (error) {
        const msg = error.response?.data?.message || error.message || "Có lỗi xảy ra khi import file";
        setImportError(msg);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExportExcel = () => {
    try {
      // Chuẩn bị dữ liệu để xuất
      const exportData = students.map(student => ({
        'Mã số': student.user_id,
        'Họ tên': student.user_name,
        'Email': student.email,
        'CCCD': student.user_CCCD,
        'Số điện thoại': student.user_phone,
        'Địa chỉ thường trú': student.user_permanent_address,
        'Địa chỉ tạm trú': student.user_temporary_address,
        'Ngày sinh': student.user_date_of_birth
          ? dayjs(student.user_date_of_birth).format('DD/MM/YYYY')
          : '',
        'Khoa': faculties.find(f => f._id === student.user_faculty)?.faculty_title || '',
        'Chuyên ngành': majors.find(m => m._id === student.user_major)?.major_title || ''
      }));

      // Tạo worksheet từ dữ liệu
      const ws = XLSX.utils.json_to_sheet(exportData, { cellStyles: true });

      // Tự động căn chỉnh độ rộng cột
      const colWidths = Object.keys(exportData[0] || {}).map(key => {
        const maxLen = Math.max(
          key.length,
          ...exportData.map(row => (row[key] ? row[key].toString().length : 0))
        );
        return { wch: Math.min(Math.max(maxLen + 2, 10), 30) };
      });
      ws['!cols'] = colWidths;

      // In đậm dòng tiêu đề, căn giữa tiêu đề, wrap text cho tất cả các ô
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
        if (cell && !cell.s) cell.s = {};
        if (cell) {
          cell.s = {
            font: { bold: true },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          };
        }
      }
      // Căn trái nội dung, wrap text, border cho các ô còn lại
      for (let R = 1; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
          if (cell) {
            cell.s = {
              alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
              border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              }
            };
          }
        }
      }

      // Tạo workbook và thêm worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách sinh viên');

      // Xuất file Excel
      XLSX.writeFile(wb, 'Danh_sach_sinh_vien.xlsx');
      message.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      message.error('Có lỗi xảy ra khi xuất file Excel');
    }
  };

  return (
    <div className="p-4 relative">
      <h1 className="text-2xl font-bold mb-4">Danh sách Sinh viên</h1>
      <div className="flex gap-4 mb-4">
        <Search
          placeholder="Tìm theo MSSV hoặc họ tên"
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
          {faculties.map((faculty) => (
            <Select.Option key={faculty._id} value={faculty.faculty_title}>
              {faculty.faculty_title}
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
          {majors
            .filter((major) => {
              const faculty = faculties.find(f => f.faculty_title === filterFaculty);
              return faculty && major.major_faculty === faculty._id;
            })
            .map((major) => (
              <Select.Option key={major._id} value={major.major_title}>
                {major.major_title}
              </Select.Option>
            ))}
        </Select>
        <Button
          type="primary"
          onClick={() => {
            setSelectedStudent(null);
            setIsModalVisible(true);
            setSelectedFaculty(''); // Reset khi thêm mới
          }}
        >
          Thêm sinh viên
        </Button>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx,.xls';
            input.onchange = handleImportExcel;
            input.click();
          }}
        >
          Import Excel
        </Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExportExcel}
        >
          Export Excel
        </Button>
      </div>

      {importError && (
        <div className="mb-4">
          <Alert
            message="Lỗi"
            description={importError}
            type="error"
            showIcon
            closable
            onClose={() => setImportError('')}
          />
        </div>
      )}

      {importSuccess && (
        <div className="mb-4">
          <Alert
            message="Thành công"
            description={importSuccess}
            type="success"
            showIcon
            closable
            onClose={() => setImportSuccess('')}
          />
        </div>
      )}

      <Table
        columns={columns}
        dataSource={students.map(student => ({
          ...student,
          key: student._id
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
                  {(formData.user_avatar || selectedStudent?.user_avatar) ? (
                    <img 
                      src={formData.user_avatar ? formData.user_avatar : `http://localhost:5000${selectedStudent.user_avatar}`}
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{selectedStudent?.user_name?.charAt(0) || formData.user_name?.charAt(0)}</span>
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
                    value={formData.user_name || selectedStudent?.user_name || ''}
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
                    value={formData.email || selectedStudent?.email || ''}
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
                    value={formData.user_id || selectedStudent?.user_id || ''}
                    onChange={(e) => handleInputChange('user_id', e.target.value)}
                    disabled={!selectedStudent} // Disable input when adding new
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
                    value={formData.user_CCCD || selectedStudent?.user_CCCD || ''}
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
                    value={formData.user_phone || selectedStudent?.user_phone || ''}
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
                    value={formData.user_permanent_address || selectedStudent?.user_permanent_address || ''}
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
                    value={formData.user_temporary_address || selectedStudent?.user_temporary_address || ''}
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
                    value={formData.user_date_of_birth ? dayjs(formData.user_date_of_birth) : (selectedStudent?.user_date_of_birth ? dayjs(selectedStudent.user_date_of_birth) : (selectedStudent === null ? dayjs().subtract(18, 'year') : null))}
                    onChange={(date) => {
                      const formattedDate = date ? date.format('YYYY-MM-DD') : null;
                      handleInputChange('user_date_of_birth', formattedDate);
                    }}
                    format="DD/MM/YYYY"
                    disabledDate={disabledDate}
                    placeholder="Chọn ngày sinh"
                    style={{ width: '100%' }}
                    showToday={false}
                    placement="bottomLeft"
                    picker="date"
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
                    value={formData.user_faculty || selectedStudent?.user_faculty}
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
                    value={formData.user_major || selectedStudent?.user_major}
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
                {selectedStudent ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog xác nhận */}
      <Modal
        title={selectedStudent ? "Xác nhận cập nhật" : "Xác nhận thêm mới"}
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
          {selectedStudent ? (
            <>
              <p className="text-gray-600">Bạn có chắc chắn muốn cập nhật thông tin của sinh viên:</p>
              <p className="font-semibold mt-2">{selectedStudent.user_name}</p>
              <p className="text-gray-500 text-sm mt-1">Mã số: {selectedStudent.user_id}</p>
            </>
          ) : (
            <>
              <p className="text-gray-600">Bạn có chắc chắn muốn thêm sinh viên mới với thông tin:</p>
              <p className="font-semibold mt-2">Họ tên: {formData.user_name}</p>
              <p className="text-gray-500 text-sm mt-1">Mã số: {formData.user_id}</p>
            </>
          )}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 text-sm">
              {selectedStudent 
                ? "Lưu ý: Hành động này sẽ cập nhật thông tin trong cơ sở dữ liệu."
                : "Lưu ý: Hành động này sẽ thêm sinh viên mới vào cơ sở dữ liệu."
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
          setFormData({});
          setErrors({});
          setSelectedFaculty('');
        }}
        okText="Đóng"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <div className="text-center py-4">
          <CheckCircleFilled style={{ fontSize: '48px', color: '#52c41a' }} />
          <p className="mt-4 text-lg">
            {selectedStudent ? 'Cập nhật thông tin sinh viên thành công!' : 'Thêm sinh viên mới thành công!'}
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
    </div>
  );
};

export default Students; 