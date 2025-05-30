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
  const [topicDetails, setTopicDetails] = useState([]);
  const [isAssignDetailsOpen, setIsAssignDetailsOpen] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [topicsPerPage] = useState(10); // Number of topics per page

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
    setCurrentPage(1); // Reset to first page on close
  };
  const handleToggleTopic = (topicId) => {
    setSelectedTopics(prev => prev.includes(topicId)
      ? prev.filter(id => id !== topicId)
      : [...prev, topicId]
    );
  };
  const handleOpenAssignDetails = () => {
    // Tạo mảng chi tiết cho từng đề tài đã chọn
    setTopicDetails(selectedTopics.map(topicId => ({
      topicId,
      room: '',
      date: '',
      timeStart: '',
      timeEnd: ''
    })));
    setIsAssignDetailsOpen(true); // mở modal nhập chi tiết
  };
  const handleConfirmAssignDetails = async () => {
    // Validate tất cả ngày
    for (const detail of topicDetails) {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(detail.date)) {
        alert('Ngày phải đúng định dạng dd/mm/yyyy!');
        return;
      }
    }
    // Validate trùng phòng/ngày/thời gian
    try {
      // Lấy tất cả đề tài đã gán
      const res = await axios.get('http://localhost:5000/api/database/collections/Topic');
      const allTopics = Array.isArray(res.data.data) ? res.data.data : [];
      // Duyệt từng đề tài chuẩn bị gán
      for (const detail of topicDetails) {
        // Chuyển dd/mm/yyyy thành yyyy-mm-dd
        let dateStr = detail.date;
        if (dateStr && dateStr.includes('/')) {
          const [dd, mm, yyyy] = dateStr.split('/');
          dateStr = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        }
        // Lọc các đề tài đã gán cùng phòng, cùng ngày (trừ chính đề tài đang sửa)
        const sameRoomDate = allTopics.filter(t =>
          t.topic_room === detail.room &&
          t.topic_date === dateStr &&
          t._id !== detail.topicId // tránh so với chính nó
        );
        // Kiểm tra overlap thời gian
        for (const t of sameRoomDate) {
          // Nếu không có time thì bỏ qua
          if (!t.topic_time_start || !t.topic_time_end || !detail.timeStart || !detail.timeEnd) continue;
          // So sánh dạng HH:mm
          const s1 = detail.timeStart;
          const e1 = detail.timeEnd;
          const s2 = t.topic_time_start;
          const e2 = t.topic_time_end;
          // Nếu overlap thì báo lỗi
          if (!(e1 <= s2 || s1 >= e2)) {
            alert(`Phòng ${detail.room} ngày ${detail.date} đã có hội đồng khác hoặc đề tài khác chấm trong khung giờ này!`);
            return;
          }
        }
      }
      // Nếu qua hết thì cho phép lưu
      await Promise.all(topicDetails.map(detail => {
        let dateStr = detail.date;
        if (dateStr && dateStr.includes('/')) {
          const [dd, mm, yyyy] = dateStr.split('/');
          dateStr = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        }
        return axios.put(`/api/topics/${detail.topicId}`, {
          topic_assembly: assignCouncil._id,
          topic_room: detail.room,
          topic_time_start: detail.timeStart,
          topic_time_end: detail.timeEnd,
          topic_date: dateStr
        });
      }));
      alert('Gán đề tài thành công!');
      setIsSuccessModalVisible(true);
      setIsAssignDetailsOpen(false); // Close the details modal
      setSelectedTopics([]); // Clear selected topics
    } catch {
      alert('Có lỗi khi gán đề tài!');
    }
  };

  const updateDetail = (idx, field, value) => {
    setTopicDetails(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  // Pagination logic
  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = assignTopics.slice(indexOfFirstTopic, indexOfLastTopic);
  const totalPages = Math.ceil(assignTopics.length / topicsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, mt: 2 }}>
                    {/* Chủ tịch */}
                    <Box sx={{
                      minWidth: 220,
                      px: 3, py: 2,
                      borderRadius: 3,
                      background: '#6C63FF',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 18,
                      textAlign: 'center',
                      boxShadow: 3,
                      position: 'relative'
                    }}>
                      {getLecturerInfo(assignCouncil.chairman)}
                      <div style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: -16,
                        transform: 'translateX(-50%)',
                        width: 0, height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '16px solid #6C63FF',
                        zIndex: 2
                      }} />
                      <Typography sx={{ fontSize: 14, fontWeight: 400, mt: 1 }}>Chủ tịch</Typography>
                    </Box>
                    {/* Đường nối */}
                    <div style={{
                      width: 2, height: 24, background: '#bdbdbd', margin: '0 auto', zIndex: 1
                    }} />
                    {/* Thư ký */}
                    <Box sx={{
                      minWidth: 220,
                      px: 3, py: 2,
                      borderRadius: 3,
                      background: '#4FC3F7',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 18,
                      textAlign: 'center',
                      boxShadow: 3,
                      position: 'relative'
                    }}>
                      {getLecturerInfo(assignCouncil.secretary)}
                      <div style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: -16,
                        transform: 'translateX(-50%)',
                        width: 0, height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '16px solid #4FC3F7',
                        zIndex: 2
                      }} />
                      <Typography sx={{ fontSize: 14, fontWeight: 400, mt: 1 }}>Thư ký</Typography>
                    </Box>
                    {/* Đường nối */}
                    <div style={{
                      width: 2, height: 24, background: '#bdbdbd', margin: '0 auto', zIndex: 1
                    }} />
                    {/* Ủy viên */}
                    {assignCouncil.members && assignCouncil.members.length > 0 && (
                      <Box sx={{
                        minWidth: 220,
                        px: 3, py: 2,
                        borderRadius: 3,
                        background: '#9575CD',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 18,
                        textAlign: 'center',
                        boxShadow: 3
                      }}>
                        {assignCouncil.members.map((m, idx) => (
                          <span key={m}>{getLecturerInfo(m)}{idx < assignCouncil.members.length - 1 ? <br /> : null}</span>
                        ))}
                        <Typography sx={{ fontSize: 14, fontWeight: 400, mt: 1 }}>Thành Viên</Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>
            {/* Bảng đề tài bên phải */}
            <Box sx={{ flex: 2, pl: { md: 4 }, width: '100%', py: 4, pr: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, fontSize: 18 }}>
                Đề tài
                {assignCouncil && majors.length > 0 && (
                  <span style={{ fontWeight: 400, fontSize: 16, color: '#666', marginLeft: 8 }}>
                    (chuyên ngành: {
                      majors.find(m => String(m._id) === String(assignCouncil.assembly_major))?.major_title || '---'
                    })
                  </span>
                )}
              </Typography>
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
                    {currentTopics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">Không tìm thấy đề tài</TableCell>
                      </TableRow>
                    ) : currentTopics.map(topic => (
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
            </Box>
          </Box>
        </DialogContent>
        {/* Pagination Controls */}
        {assignTopics.length > topicsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, pb: 1 }}>
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              sx={{ mr: 1 }}
            >Trước</Button>
            {/* Simple page number display - can be enhanced with Mui Pagination component */}
            <Typography variant="body2" sx={{ mx: 1, display: 'flex', alignItems: 'center' }}>
              Trang {currentPage} / {totalPages}
            </Typography>
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              sx={{ ml: 1 }}
            >Sau</Button>
          </Box>
        )}
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenAssignDetails}
            disabled={selectedTopics.length === 0}
            sx={{ minWidth: 200, fontWeight: 700, fontSize: 18, borderRadius: 2, boxShadow: 2, py: 1.5 }}
          >
            XÁC NHẬN
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal nhập chi tiết cho từng đề tài */}
      <Dialog open={isAssignDetailsOpen} onClose={() => setIsAssignDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 22, textAlign: 'left', pb: 0 }}>Nhập chi tiết cho từng đề tài</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 420, background: '#fafbfc', borderRadius: 3, boxShadow: 3, overflow: 'hidden', m: 2 }}>
            {/* Bảng đề tài bên phải */}
            <Box sx={{ flex: 2, pl: { md: 4 }, width: '100%', py: 4, pr: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, fontSize: 18 }}>
                Đề tài
              </Typography>
              <TableContainer sx={{ background: '#fff', borderRadius: 2, boxShadow: 1, maxWidth: '100%', overflowX: 'auto' }}>
                <Table size="medium" sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: 16, background: '#f5f7fa' }}></TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 16, textAlign: 'center', background: '#f5f7fa' }}>Tên đề tài</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 16, textAlign: 'center', background: '#f5f7fa' }}>Phòng</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 16, textAlign: 'center', background: '#f5f7fa' }}>Ngày</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 16, textAlign: 'center', background: '#f5f7fa' }}>Giờ bắt đầu</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 16, textAlign: 'center', background: '#f5f7fa' }}>Giờ kết thúc</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topicDetails.map((detail, idx) => (
                      <TableRow key={detail.topicId} sx={{ '&:hover': { background: '#f0f7ff' }, height: 56 }}>
                        <TableCell padding="checkbox" sx={{ textAlign: 'center' }}>
                          <Checkbox
                            checked={selectedTopics.includes(detail.topicId)}
                            onChange={() => handleToggleTopic(detail.topicId)}
                            sx={{ p: 0 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 15, py: 1, px: 2, textAlign: 'center', whiteSpace: 'normal', wordBreak: 'break-word', minWidth: 120 }}>{
                          (() => {
                            const topic = assignTopics.find(t => (t._id === detail.topicId || t._id?.$oid === detail.topicId));
                            return topic ? topic.topic_title : detail.topicId;
                          })()
                        }</TableCell>
                        <TableCell sx={{ py: 1, px: 2, textAlign: 'center', minWidth: 100 }}>
                          <TextField
                            value={detail.room}
                            onChange={e => updateDetail(idx, 'room', e.target.value)}
                            placeholder="Nhập phòng"
                            size="small"
                            variant="outlined"
                            sx={{ minWidth: 90, borderRadius: 2 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1, px: 2, textAlign: 'center', minWidth: 220 }}>
                          <TextField
                            type="text"
                            value={detail.date}
                            onChange={e => updateDetail(idx, 'date', e.target.value)}
                            placeholder="dd/mm/yyyy"
                            size="small"
                            variant="outlined"
                            sx={{ minWidth: 1, borderRadius: 2 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1, px: 2, textAlign: 'center', minWidth: 140 }}>
                          <TextField
                            type="time"
                            value={detail.timeStart}
                            onChange={e => updateDetail(idx, 'timeStart', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            placeholder="Giờ bắt đầu"
                            size="small"
                            variant="outlined"
                            sx={{ minWidth: 120, borderRadius: 2 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1, px: 2, textAlign: 'center', minWidth: 140 }}>
                          <TextField
                            type="time"
                            value={detail.timeEnd}
                            onChange={e => updateDetail(idx, 'timeEnd', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            placeholder="Giờ kết thúc"
                            size="small"
                            variant="outlined"
                            sx={{ minWidth: 120, borderRadius: 2 }}
                          />
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
                  onClick={handleConfirmAssignDetails}
                  disabled={topicDetails.length === 0}
                  sx={{ minWidth: 220, fontWeight: 700, fontSize: 20, borderRadius: 3, boxShadow: 2, py: 1.8, letterSpacing: 1 }}
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
