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
  Checkbox,
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
  const [students, setStudents] = useState([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignTopics, setAssignTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [assignCouncil, setAssignCouncil] = useState(null);

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
      const majors = Array.isArray(response.data.data) ? response.data.data : [];
      setMajors(majors);
    } catch (error) {
      console.error('Error fetching majors:', error);
    }
  };

  const fetchLecturers = async () => {
    const res = await axios.get('http://localhost:5000/api/database/collections/User');
    const lecturers = Array.isArray(res.data.data) ? res.data.data : [];
    setLecturers(lecturers.filter(user => user.role === 'giangvien'));
  };

  const fetchCouncils = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/database/collections/assemblies');
      console.log('Fetch councils response:', response.data);
      const councils = Array.isArray(response.data.data) ? response.data.data : [];
      setCouncils(councils);
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
      const validMajorIds = majors.map(m => String(m._id?.$oid || m._id));
      const selectedMajorId = validMajorIds.includes(String(council.assembly_major))
        ? council.assembly_major
        : '';
      setFormData({
        assembly_name: council.assembly_name,
        assembly_major: selectedMajorId,
        chairman: council.chairman,
        secretary: council.secretary,
        members: council.members || '',
      });
      const selectedMajor = majors.find(m => String(m._id?.$oid || m._id) === String(selectedMajorId));
      const facultyId = selectedMajor?.major_faculty;
      setFilteredLecturers(
        lecturers.filter(
          gv => String(gv.user_faculty) === String(facultyId)
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

  const handleChange = (e, value) => {
    // Nếu là Autocomplete chuyên ngành
    if (e && e.target && e.target.name === 'assembly_major') {
      const selectedMajorId = value || e.target.value;
      // Lọc giảng viên theo chuyên ngành
      setFilteredLecturers(
        lecturers.filter(gv => String(gv.user_major) === String(selectedMajorId))
      );
      setFormData(prev => ({
        ...prev,
        assembly_major: selectedMajorId,
        chairman: '',
        secretary: '',
        members: '',
      }));
      setErrors(prev => ({ ...prev, assembly_major: '' }));
      return;
    }
    // Các trường khác giữ nguyên
    const { name, value: val } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: val,
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
        members: Array.isArray(formData.members)
          ? formData.members
          : formData.members
            ? [formData.members]
            : [],
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

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await axios.get('http://localhost:5000/api/database/collections/Student');
      const students = Array.isArray(res.data.data) ? res.data.data : [];
      setStudents(students);
      console.log('Students:', students);
    };
    fetchStudents();
  }, []);

  console.log('Students:', students);
  console.log('Lecturers:', lecturers);
  console.log('Councils:', councils);

  // Lấy danh sách đề tài theo chuyên ngành khi mở dialog gán đề tài
  useEffect(() => {
    const fetchTopicsByMajor = async () => {
      if (!assignCouncil) return;
      try {
        // Lấy tất cả đề tài, filter theo major và chưa gán hội đồng
        const res = await axios.get('http://localhost:5000/api/database/collections/Topic');
        let topics = Array.isArray(res.data.data) ? res.data.data : [];
        
        console.log('All topics:', topics);
        console.log('Council major:', assignCouncil.assembly_major);
        console.log('Majors:', majors);
        
        topics = topics.filter(t => {
          console.log('Topic:', t.topic_title);
          console.log('Topic major:', t.topic_major);
          console.log('Council major:', assignCouncil.assembly_major);
          // Xử lý cả 2 trường hợp: topic_major là string ID hoặc object
          let topicMajorId;
          if (typeof t.topic_major === 'object' && t.topic_major !== null) {
            topicMajorId = t.topic_major._id;
          } else {
            topicMajorId = t.topic_major;
          }
          console.log('Is match:', String(topicMajorId) === String(assignCouncil.assembly_major));
          console.log('Topic assembly:', t.topic_assembly);
          return String(topicMajorId) === String(assignCouncil.assembly_major) && (!t.topic_assembly || t.topic_assembly === '' || t.topic_assembly === null);
        });
        
        console.log('Filtered topics:', topics);
        setAssignTopics(topics);
      } catch (error) {
        console.error('Error fetching topics:', error.response?.data || error.message);
        setAssignTopics([]);
      }
    };
    fetchTopicsByMajor();
  }, [assignCouncil]);

  const handleOpenAssignDialog = (council) => {
    setAssignCouncil(council);
    setIsAssignDialogOpen(true);
  };
  const handleCloseAssignDialog = () => {
    setIsAssignDialogOpen(false);
    setSelectedTopics([]);
    setAssignCouncil(null);
  };
  const handleToggleTopic = (topicId) => {
    setSelectedTopics(prev => prev.includes(topicId)
      ? prev.filter(id => id !== topicId)
      : [...prev, topicId]
    );
  };
  const handleConfirmAssign = async () => {
    if (!assignCouncil || selectedTopics.length === 0) return;
    try {
      // Gọi API cập nhật từng đề tài, set topic_assembly = assignCouncil._id
      await Promise.all(selectedTopics.map(topicId => {
        const topic = assignTopics.find(t => t._id === topicId || t._id?.$oid === topicId);
        let realId = topic?._id;
        if (typeof realId === 'object' && realId !== null && realId.$oid) {
          realId = realId.$oid;
        }
        console.log('PUT Topic realId:', realId, 'topic:', topic);
        return axios.put(`http://localhost:5000/api/database/collections/Topic/${realId}`, {
          topic_assembly: assignCouncil._id
        });
      }));
      setIsAssignDialogOpen(false);
      setSelectedTopics([]);
      setAssignCouncil(null);
      alert('Gán đề tài cho hội đồng thành công!');
      fetchCouncils();
    } catch {
      alert('Có lỗi khi gán đề tài cho hội đồng!');
    }
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
                      {(() => {
                        // Xử lý cả 2 trường hợp: assembly_major là string ID hoặc object
                        let assemblyMajorId;
                        if (typeof council.assembly_major === 'object' && council.assembly_major !== null) {
                          assemblyMajorId = council.assembly_major._id;
                        } else {
                          assemblyMajorId = council.assembly_major;
                        }
                        const foundMajor = majors.find(m => String(m._id?.$oid || m._id) === String(assemblyMajorId));
                        return foundMajor?.major_title || 'Không xác định';
                      })()}
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
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
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
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-purple-100"
                      onClick={() => handleOpenAssignDialog(council)}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" fill="#8e24aa"/><path d="M7 8h10M7 12h10M7 16h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                    </Button>
                    <Button
                      type="text"
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100"
                      onClick={() => handleDelete(council._id)}
                      sx={{ minWidth: 'auto', p: 1 }}
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
                  <Autocomplete
                    options={majors}
                    getOptionLabel={(option) => option.major_title || ''}
                    value={majors.find(m => String(m._id?.$oid || m._id) === String(formData.assembly_major)) || null}
                    onChange={(event, newValue) => {
                      handleChange({ target: { name: 'assembly_major', value: newValue ? (newValue._id?.$oid || newValue._id) : '' } }, newValue ? (newValue._id?.$oid || newValue._id) : '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Chuyên ngành"
                        required
                        error={!!errors.assembly_major}
                        helperText={errors.assembly_major}
                      />
                    )}
                  />
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
          {isEdit && (
            <Button onClick={handleOpenAssignDialog} variant="outlined" color="secondary">
              Gán đề tài
            </Button>
          )}
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

      {/* Dialog gán đề tài cho hội đồng */}
      <Dialog open={isAssignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 22, textAlign: 'left', pb: 0 }}>Gán đề tài cho hội đồng</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 420, background: '#fafbfc', borderRadius: 3, boxShadow: 3, overflow: 'hidden', m: 2 }}>
            {/* Sơ đồ hội đồng bên trái */}
            <Box sx={{ flex: 1, minWidth: 240, maxWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: { md: '1px solid #eee' }, py: 4, px: 2, background: '#fff', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, fontSize: 18 }}>Phân công hội đồng</Typography>
              {assignCouncil && (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box sx={{ background: 'linear-gradient(90deg,#1976d2,#2196f3)', color: '#fff', px: 2, py: 1.5, borderRadius: 2, fontWeight: 700, minWidth: 180, textAlign: 'center', fontSize: 17, boxShadow: 2 }}>
                      {getLecturerInfo(assignCouncil.chairman)}<br/>
                      <span style={{ fontSize: 14, fontWeight: 400 }}>Chủ tịch</span>
                    </Box>
                    <Box sx={{ background: 'linear-gradient(90deg,#0288d1,#26c6da)', color: '#fff', px: 2, py: 1.5, borderRadius: 2, fontWeight: 700, minWidth: 180, textAlign: 'center', fontSize: 17, boxShadow: 2 }}>
                      {getLecturerInfo(assignCouncil.secretary)}<br/>
                      <span style={{ fontSize: 14, fontWeight: 400 }}>Thư ký</span>
                    </Box>
                    {assignCouncil.members && assignCouncil.members.length > 0 && (
                      <Box sx={{ background: 'linear-gradient(90deg,#512da8,#7c43bd)', color: '#fff', px: 2, py: 1.5, borderRadius: 2, fontWeight: 700, minWidth: 180, textAlign: 'center', fontSize: 17, boxShadow: 2 }}>
                        {assignCouncil.members.map((m, idx) => (
                          <span key={m}>{getLecturerInfo(m)}{idx < assignCouncil.members.length - 1 ? <br/> : null}</span>
                        ))}<br/>
                        <span style={{ fontSize: 14, fontWeight: 400 }}>Ủy viên</span>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>
            {/* Bảng đề tài bên phải */}
            <Box sx={{ flex: 2, pl: { md: 4 }, width: '100%', py: 4, pr: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, fontSize: 18 }}>Đề tài</Typography>
              <TableContainer sx={{ background: '#fff', borderRadius: 2, boxShadow: 1, maxWidth: '100%', overflowX: 'auto' }}>
                <Table size="medium" sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ width: 40 }}></TableCell>
                      <TableCell sx={{ fontWeight: 700, maxWidth: 160, fontSize: 16, whiteSpace: 'normal', wordBreak: 'break-word' }}>Tên đề tài</TableCell>
                      <TableCell sx={{ fontWeight: 700, maxWidth: 120, fontSize: 16, whiteSpace: 'normal', wordBreak: 'break-word' }}>Chuyên ngành</TableCell>
                      <TableCell sx={{ fontWeight: 700, maxWidth: 140, fontSize: 16, whiteSpace: 'normal', wordBreak: 'break-word' }}>GVHD</TableCell>
                      <TableCell sx={{ fontWeight: 700, maxWidth: 140, fontSize: 16, whiteSpace: 'normal', wordBreak: 'break-word' }}>GVPB</TableCell>
                      <TableCell sx={{ fontWeight: 700, maxWidth: 100, fontSize: 16, whiteSpace: 'normal', wordBreak: 'break-word' }}>Loại đề tài</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignTopics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">Không tìm thấy đề tài</TableCell>
                      </TableRow>
                    ) : assignTopics.map(topic => (
                      <TableRow key={topic._id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedTopics.includes(topic._id)}
                            onChange={() => handleToggleTopic(topic._id)}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 15, py: 1.5, px: 2, maxWidth: 160, whiteSpace: 'normal', wordBreak: 'break-word' }}>{topic.topic_title}</TableCell>
                        <TableCell sx={{ fontSize: 15, py: 1.5, px: 2, maxWidth: 120, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {(() => {
                            let topicMajorId;
                            if (typeof topic.topic_major === 'object' && topic.topic_major !== null) {
                              topicMajorId = topic.topic_major._id;
                            } else {
                              topicMajorId = topic.topic_major;
                            }
                            const foundMajor = majors.find(m => String(m._id?.$oid || m._id) === String(topicMajorId));
                            return foundMajor?.major_title || '';
                          })()}
                        </TableCell>
                        <TableCell sx={{ fontSize: 15, py: 1.5, px: 2, maxWidth: 140, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {(() => {
                            if (!topic.topic_instructor) return '';
                            if (typeof topic.topic_instructor === 'object' && topic.topic_instructor !== null) {
                              return `${topic.topic_instructor.user_id || ''} - ${topic.topic_instructor.user_name || ''}`;
                            }
                            const instructor = lecturers.find(l => l._id === topic.topic_instructor);
                            return instructor ? `${instructor.user_id} - ${instructor.user_name}` : '';
                          })()}
                        </TableCell>
                        <TableCell sx={{ fontSize: 15, py: 1.5, px: 2, maxWidth: 140, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {(() => {
                            if (!topic.topic_reviewer) return '';
                            if (typeof topic.topic_reviewer === 'object' && topic.topic_reviewer !== null) {
                              return `${topic.topic_reviewer.user_id || ''} - ${topic.topic_reviewer.user_name || ''}`;
                            }
                            const reviewer = lecturers.find(l => l._id === topic.topic_reviewer);
                            return reviewer ? `${reviewer.user_id} - ${reviewer.user_name}` : '';
                          })()}
                        </TableCell>
                        <TableCell sx={{ fontSize: 15, py: 1.5, px: 2, maxWidth: 100, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {(() => {
                            return typeof topic.topic_category === 'object' 
                              ? topic.topic_category.topic_category_title 
                              : topic.topic_category || '';
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirmAssign}
                  disabled={selectedTopics.length === 0}
                  sx={{ minWidth: 200, fontWeight: 700, fontSize: 18, borderRadius: 2, boxShadow: 2, py: 1.5 }}
                >
                  XÁC NHẬN
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
        </>
      )}
    </Box>
  );
};

export default CouncilManagement;
