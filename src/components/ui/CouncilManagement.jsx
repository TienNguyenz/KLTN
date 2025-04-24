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
    members: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchMajors(),
        fetchLecturers(),
        fetchCouncils()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoading(false);
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
      setCouncils(response.data);
    } catch (error) {
      console.error('Error fetching councils:', error);
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
        members: council.members || [],
      });
    } else {
      setIsEdit(false);
      setSelectedCouncil(null);
      setFormData({
        assembly_name: '',
        assembly_major: '',
        chairman: '',
        secretary: '',
        members: [],
      });
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
      members: [],
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
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
        updatedAt: now
    };

      if (isEdit) {
        await axios.post(`http://localhost:5000/api/database/collections/assemblies?id=${selectedCouncil._id}&action=update`, payload);
      } else {
        await axios.post(`http://localhost:5000/api/database/collections/assemblies?action=insert`, {
          ...payload,
          createdAt: now
        });
      }
      fetchCouncils();
      handleClose();
    } catch (error) {
      console.error('Error saving council:', error);
      alert('Có lỗi xảy ra khi lưu hội đồng. Vui lòng thử lại sau.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hội đồng này?')) {
      try {
        await axios.post(`http://localhost:5000/api/database/collections/assemblies?id=${id}&action=delete`);
        fetchCouncils();
      } catch (error) {
        console.error('Error deleting council:', error);
        alert('Có lỗi xảy ra khi xóa hội đồng. Vui lòng thử lại sau.');
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
                  <TableCell>Chuyên ngành</TableCell>
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
                      {majors.find(m => m._id === council.assembly_major)?.major_title || 'Không xác định'}
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
                  <InputLabel>Chuyên ngành</InputLabel>
                  <Select
                    name="assembly_major"
                    value={formData.assembly_major}
                    onChange={handleChange}
                    label="Chuyên ngành"
                    required
                  >
                    {majors.map((major) => (
                      <MenuItem key={major._id} value={major._id}>
                        {major.major_title} ({major.major_faculty})
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.assembly_major && <FormHelperText>{errors.assembly_major}</FormHelperText>}
                </FormControl>

                <Autocomplete
                  options={lecturers}
                  getOptionLabel={(lecturer) => `${lecturer.user_id} - ${lecturer.user_name}`}
                  value={lecturers.find(l => l._id === formData.chairman) || null}
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
                  options={lecturers.filter(l => l._id !== formData.chairman)}
                  getOptionLabel={(lecturer) => `${lecturer.user_id} - ${lecturer.user_name}`}
                  value={lecturers.find(l => l._id === formData.secretary) || null}
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
                  multiple
                  options={lecturers.filter(l => 
                    l._id !== formData.chairman && 
                    l._id !== formData.secretary
                  )}
                  getOptionLabel={(lecturer) => `${lecturer.user_id} - ${lecturer.user_name}`}
                  value={formData.members.map(id => 
                    lecturers.find(l => l._id === id)
                  ).filter(Boolean)}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      members: newValue.map(lecturer => lecturer._id)
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
        </>
      )}
    </Box>
  );
};

export default CouncilManagement; 