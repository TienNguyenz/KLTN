import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  FormHelperText,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { Modal } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const CouncilManagement = () => {
  const [councils, setCouncils] = useState([]);
  const [majors, setMajors] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCouncil, setSelectedCouncil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    assembly_name: '',
    assembly_major: '',
    chairman: '',
    secretary: '',
    members: '',
  });
  const [errors, setErrors] = useState({});
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [filteredLecturers, setFilteredLecturers] = useState([]);
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchFaculties(),
        fetchLecturers(),
        fetchCouncils()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/database/collections/faculties');
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  const fetchMajors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/database/collections/majors');
      console.log('Majors data:', response.data);
      setMajors(response.data);
    } catch (error) {
      console.error('Error fetching majors:', error);
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/database/collections/User');
      const lecturersList = response.data.filter(user => user.role === 'giangvien');
      setLecturers(lecturersList);
    } catch (error) {
      console.error('Error fetching lecturers:', error);
    }
  };

  const fetchCouncils = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/database/collections/assemblies');
      console.log('Fetch councils response:', response.data);
      setCouncils(response.data);
    } catch (error) {
      console.error('Error fetching councils:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config,
        stack: error.stack
      });
      
      // Hiển thị thông báo lỗi chi tiết
      const errorMessage = error.response?.data?.message || error.message;
      const errorDetails = error.response?.data?.error || '';
      const errorField = error.response?.data?.field || '';
      const errorValue = error.response?.data?.value || '';
      
      alert(`Có lỗi xảy ra khi tải danh sách hội đồng:\n${errorMessage}\n${errorDetails}\nField: ${errorField}\nValue: ${errorValue}`);
    }
  };

  const handleOpen = (council = null) => {
    if (council) {
      setIsEdit(true);
      setSelectedCouncil(council);
      setFormData({
        assembly_name: council.assembly_name,
        assembly_major: council.assembly_major,
        chairman: council.chairman,
        secretary: council.secretary,
        members: council.members || '',
      });
      // Lọc giảng viên theo khoa của hội đồng đang sửa
      const selectedMajor = majors.find(m => m._id === council.assembly_major);
      const facultyId = selectedMajor?.major_faculty;
      setFilteredLecturers(
        lecturers.filter(
          gv => gv.user_faculty === facultyId
        )
      );
    } else {
      setIsEdit(false);
      setSelectedCouncil(null);
      setFormData({
        assembly_name: '',
        assembly_major: '',
        chairman: '',
        secretary: '',
        members: '',
      });
      setFilteredLecturers([]);
    }
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      assembly_name: '',
      assembly_major: '',
      chairman: '',
      secretary: '',
      members: '',
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'assembly_major' ? { chairman: '', secretary: '', members: '' } : {})
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'assembly_major') {
      setFilteredLecturers(
        lecturers.filter(
          gv => gv.user_faculty === value || gv.user_faculty === (typeof value === 'object' ? value.$oid : value)
        )
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.assembly_name) newErrors.assembly_name = 'Vui lòng nhập tên hội đồng';
    if (!formData.assembly_major) newErrors.assembly_major = 'Vui lòng chọn chuyên ngành';
    if (!formData.chairman) newErrors.chairman = 'Vui lòng chọn chủ tịch hội đồng';
    if (!formData.secretary) newErrors.secretary = 'Vui lòng chọn thư ký';
    if (formData.members.length === 0) {
      newErrors.members = 'Vui lòng chọn ít nhất một thành viên';
    }
    if (formData.chairman === formData.secretary) {
      newErrors.secretary = 'Thư ký không được trùng với chủ tịch hội đồng';
    }
    if (formData.members.includes(formData.chairman) || formData.members.includes(formData.secretary)) {
      newErrors.members = 'Thành viên không được trùng với chủ tịch hoặc thư ký';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const now = new Date().toISOString();
      const payload = {
        assembly_name: formData.assembly_name,
        assembly_major: formData.assembly_major,
        chairman: formData.chairman,
        secretary: formData.secretary,
        members: formData.members,
        createdAt: now,
        updatedAt: now
      };

      console.log('Payload:', payload);

      if (isEdit) {
        await axios.put(`http://localhost:5000/api/database/collections/assemblies/${selectedCouncil._id}`, payload);
        setSuccessMessage('Cập nhật hội đồng thành công!');
        setIsSuccessModalVisible(true);
      } else {
        await axios.post('http://localhost:5000/api/database/collections/assemblies', payload);
        setSuccessMessage('Thêm hội đồng thành công!');
        setIsSuccessModalVisible(true);
      }
      fetchCouncils();
      handleClose();
    } catch (error) {
      console.error('Error saving council:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config,
        stack: error.stack
      });
      
      // Hiển thị thông báo lỗi chi tiết
      const errorMessage = error.response?.data?.message || error.message;
      const errorDetails = error.response?.data?.error || '';
      const errorField = error.response?.data?.field || '';
      const errorValue = error.response?.data?.value || '';
      
      alert(`Có lỗi xảy ra khi lưu hội đồng:\n${errorMessage}\n${errorDetails}\nField: ${errorField}\nValue: ${errorValue}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hội đồng này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/database/collections/assemblies/${id}`);
        setSuccessMessage('Xóa hội đồng thành công!');
        setIsSuccessModalVisible(true);
        fetchCouncils();
      } catch (error) {
        console.error('Error deleting council:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          config: error.config,
          stack: error.stack
        });
        
        // Hiển thị thông báo lỗi chi tiết
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = error.response?.data?.error || '';
        const errorField = error.response?.data?.field || '';
        const errorValue = error.response?.data?.value || '';
        
        alert(`Có lỗi xảy ra khi xóa hội đồng:\n${errorMessage}\n${errorDetails}\nField: ${errorField}\nValue: ${errorValue}`);
      }
    }
  };

  const getLecturerInfo = (lecturerId) => {
    const lecturer = lecturers.find(l => l._id === lecturerId);
    return lecturer ? `${lecturer.user_id} - ${lecturer.user_name}` : 'Không tìm thấy';
  };

  return (
    <Box sx={{ p: 3 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography>Đang tải dữ liệu...</Typography>
        </Box>
      ) : (
        <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Quản lý Hội đồng
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm Hội đồng
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên Hội đồng</TableCell>
                  <TableCell>Khoa</TableCell>
              <TableCell>Chủ tịch</TableCell>
              <TableCell>Thư ký</TableCell>
              <TableCell>Thành viên</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {councils.map((council) => (
              <TableRow key={council._id}>
                    <TableCell>{council.assembly_name}</TableCell>
                    <TableCell>
                      {faculties.find(f => (f._id.$oid || f._id) === council.assembly_major)?.faculty_title || 'Không xác định'}
                    </TableCell>
                    <TableCell>{getLecturerInfo(council.chairman)}</TableCell>
                    <TableCell>{getLecturerInfo(council.secretary)}</TableCell>
                <TableCell>
                      {council.members.map((memberId, index) => (
                    <Chip
                      key={index}
                          label={getLecturerInfo(memberId)}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <Button
                      type="text"
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-100"
                    onClick={() => handleOpen(council)}
                      sx={{ minWidth: 'auto', p: 1 }}
                  >
                      <FaEdit style={{ color: '#4096ff' }} className="text-lg" />
                    </Button>
                    <Button
                      type="text"
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100"
                    onClick={() => handleDelete(council._id)}
                      sx={{ minWidth: 'auto', p: 1, ml: 1 }}
                  >
                      <FaTrash style={{ color: '#ff4d4f' }} className="text-lg" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEdit ? 'Chỉnh sửa Hội đồng' : 'Thêm Hội đồng mới'}
        </DialogTitle>
        <DialogContent>
              <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
                  label="Tên hội đồng"
                  name="assembly_name"
                  value={formData.assembly_name}
              onChange={handleChange}
              required
                  error={!!errors.assembly_name}
                  helperText={errors.assembly_name}
                />

                <FormControl fullWidth error={!!errors.assembly_major}>
                  <InputLabel>Khoa</InputLabel>
                  <Select
                    name="assembly_major"
                    value={formData.assembly_major}
                    onChange={handleChange}
                    label="Khoa"
                    required
                  >
                    {faculties.map((faculty) => (
                      <MenuItem key={faculty._id.$oid || faculty._id} value={faculty._id.$oid || faculty._id}>
                        {faculty.faculty_title}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.assembly_major && <FormHelperText>{errors.assembly_major}</FormHelperText>}
                </FormControl>

                <Autocomplete
                  options={filteredLecturers}
                  getOptionLabel={(lecturer) => `${lecturer.user_id} - ${lecturer.user_name}`}
                  value={filteredLecturers.find(l => l._id === formData.chairman) || null}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      chairman: newValue?._id || ''
                    }));
                    setErrors(prev => ({ ...prev, chairman: '' }));
                  }}
                  renderInput={(params) => (
            <TextField
                      {...params}
                      label="Chủ tịch hội đồng"
              required
                      error={!!errors.chairman}
                      helperText={errors.chairman}
                    />
                  )}
                />

                <Autocomplete
                  options={filteredLecturers.filter(l => l._id !== formData.chairman)}
                  getOptionLabel={(lecturer) => `${lecturer.user_id} - ${lecturer.user_name}`}
                  value={filteredLecturers.find(l => l._id === formData.secretary) || null}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      secretary: newValue?._id || ''
                    }));
                    setErrors(prev => ({ ...prev, secretary: '' }));
                  }}
                  renderInput={(params) => (
            <TextField
                      {...params}
                      label="Thư ký hội đồng"
              required
                      error={!!errors.secretary}
                      helperText={errors.secretary}
                    />
                  )}
                />

                <Autocomplete
                  options={filteredLecturers.filter(l => 
                    l._id !== formData.chairman && 
                    l._id !== formData.secretary
                  )}
                  getOptionLabel={(lecturer) => `${lecturer.user_id} - ${lecturer.user_name}`}
                  value={filteredLecturers.find(l => l._id === formData.members) || null}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      members: newValue?._id || ''
                    }));
                    setErrors(prev => ({ ...prev, members: '' }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Chọn thành viên"
                      placeholder="Tìm theo mã số hoặc tên giảng viên"
                      error={!!errors.members}
                      helperText={errors.members}
                    />
                  )}
                />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">
                {isEdit ? 'Cập nhật' : 'Tạo hội đồng'}
          </Button>
        </DialogActions>
      </Dialog>

      <Modal
        title="Thông báo"
        open={isSuccessModalVisible}
        onOk={() => setIsSuccessModalVisible(false)}
        okText="Đóng"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <div className="text-center py-4">
          <CheckCircleFilled style={{ fontSize: '48px', color: '#52c41a' }} />
          <p className="mt-4 text-lg">{successMessage}</p>
        </div>
      </Modal>
        </>
      )}
    </Box>
  );
};

export default CouncilManagement;
