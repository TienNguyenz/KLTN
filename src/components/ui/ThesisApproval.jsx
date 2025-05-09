import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MuiAlert from '@mui/material/Alert';

const ThesisApproval = ({ setSelected }) => {
  const [theses, setTheses] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    status: '',
    comment: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const rowsPerPage = 5;

  const statusMap = {
    approved: 'Đã duyệt',
    pending: 'Chờ duyệt',
    rejected: 'Từ chối',
    in_progress: 'Đang thực hiện',
    completed: 'Đã hoàn thành',
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchTheses();
  }, [page]);

  const fetchTheses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/topics/admin/pending-topics');
      const data = response.data;
      setTheses(data);
      setTotalPages(Math.ceil(data.length / rowsPerPage));
    } catch (error) {
      console.error('Error fetching theses:', error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleOpen = (thesis) => {
    setSelectedThesis(thesis);
    setFormData({
      status: thesis.status || '',
      comment: thesis.comment || ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedThesis(null);
    setFormData({
      status: '',
      comment: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (formData.status === 'approved') {
        await axios.put(`http://localhost:5000/api/topics/${selectedThesis._id}/approve-by-admin`, { comment: formData.comment });
        setSnackbar({ open: true, message: 'Đã duyệt đề tài thành công!', severity: 'success' });
      } else if (formData.status === 'rejected') {
        await axios.put(`http://localhost:5000/api/topics/${selectedThesis._id}/reject-by-admin`, { comment: formData.comment });
        setSnackbar({ open: true, message: 'Đã từ chối đề tài và gửi thông báo cho sinh viên, giảng viên!', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Vui lòng chọn trạng thái duyệt!', severity: 'warning' });
        return;
      }
      fetchTheses();
      handleClose();
      setTimeout(() => setSelected("topic-list"), 500);
    } catch (error) {
      console.error('Error updating thesis:', error);
      setSnackbar({ open: true, message: 'Có lỗi xảy ra khi cập nhật đề tài. Vui lòng thử lại sau.', severity: 'error' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Đề tài chờ xét duyệt
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên đề tài</TableCell>
              <TableCell>GVHD</TableCell>
              <TableCell>Loại đề tài</TableCell>
              <TableCell>Học kì</TableCell>
              <TableCell>Thời gian tạo</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Giáo vụ</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {theses
              .slice((page - 1) * rowsPerPage, page * rowsPerPage)
              .map((thesis, index) => (
                <TableRow key={thesis._id}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{thesis.topic_title}</TableCell>
                  <TableCell>{thesis.topic_instructor?.user_name || 'Chưa có GVHD'}</TableCell>
                  <TableCell>{thesis.topic_category?.topic_category_title || '-'}</TableCell>
                  <TableCell>{thesis.topic_registration_period || '-'}</TableCell>
                  <TableCell>{formatDate(thesis.createdAt)}</TableCell>
                  <TableCell>{thesis.topic_max_members || 1}</TableCell>
                  <TableCell>{thesis.academic_staff || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(thesis)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Xét duyệt đề tài</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedThesis && (
              <>
                {/* Thông tin chung */}
                <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#f9fafb' }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700, mb: 1 }}>
                    Thông tin đề tài
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ minWidth: 250 }}>
                      <strong>Tên đề tài:</strong>
                      <div style={{ marginLeft: 8 }}>{selectedThesis.topic_title}</div>
                    </Box>
                    <Box sx={{ minWidth: 200 }}>
                      <strong>GVHD:</strong>
                      <div style={{ marginLeft: 8 }}>{selectedThesis.topic_instructor?.user_name || '-'}</div>
                    </Box>
                    <Box sx={{ minWidth: 200 }}>
                      <strong>Loại đề tài:</strong>
                      <div style={{ marginLeft: 8 }}>{selectedThesis.topic_category?.topic_category_title || '-'}</div>
                    </Box>
                    <Box sx={{ minWidth: 200 }}>
                      <strong>Chuyên ngành:</strong>
                      <div style={{ marginLeft: 8 }}>{selectedThesis.topic_major?.major_title || '-'}</div>
                    </Box>
                    <Box sx={{ minWidth: 120 }}>
                      <strong>Học kỳ:</strong>
                      <div style={{ marginLeft: 8 }}>{selectedThesis.topic_registration_period || '-'}</div>
                    </Box>
                    <Box sx={{ minWidth: 120 }}>
                      <strong>Số lượng SV:</strong>
                      <div style={{ marginLeft: 8 }}>{selectedThesis.topic_max_members || 1}</div>
                    </Box>
                    <Box sx={{ minWidth: 200 }}>
                      <strong>Thời gian tạo:</strong>
                      <div style={{ marginLeft: 8 }}>{selectedThesis.createdAt ? new Date(selectedThesis.createdAt).toLocaleString('vi-VN') : '-'}</div>
                    </Box>
                  </Box>
                </Box>

                {/* Mô tả chi tiết */}
                <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#f0f4ff' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                    Mô tả chi tiết
                </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#333' }}>
                    {selectedThesis.topic_description}
                </Typography>
                </Box>

                {/* Danh sách sinh viên */}
                <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#f9fafb' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                    Danh sách sinh viên
                </Typography>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                    <thead>
                      <tr style={{ background: '#f0f4ff' }}>
                        <th style={{ border: '1px solid #e0e0e0', padding: 6, fontWeight: 600 }}>STT</th>
                        <th style={{ border: '1px solid #e0e0e0', padding: 6, fontWeight: 600 }}>Họ tên</th>
                        <th style={{ border: '1px solid #e0e0e0', padding: 6, fontWeight: 600 }}>MSSV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedThesis.topic_group_student || []).map((sv, idx) => (
                        <tr key={sv._id}>
                          <td style={{ border: '1px solid #e0e0e0', padding: 6, textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #e0e0e0', padding: 6 }}>{sv.user_name}</td>
                          <td style={{ border: '1px solid #e0e0e0', padding: 6 }}>{sv.user_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </>
            )}

            <TextField
              fullWidth
              label="Nhận xét"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              try {
                const response = await axios.put(`http://localhost:5000/api/topics/${selectedThesis._id}/reject-by-admin`, { comment: formData.comment });
                if (response.data.message) {
                  setSnackbar({ open: true, message: 'Đã từ chối đề tài và gửi thông báo cho sinh viên, giảng viên!', severity: 'error' });
                  handleClose();
                  setTimeout(() => setSelected("topic-list"), 500);
                }
              } catch (error) {
                setSnackbar({ open: true, message: 'Có lỗi khi từ chối đề tài!', severity: 'error' });
              }
            }}
            variant="outlined"
            color="secondary"
            style={{ marginRight: 8 }}
          >
            Từ chối
          </Button>
          <Button
            onClick={async () => {
              try {
                const response = await axios.put(`http://localhost:5000/api/topics/${selectedThesis._id}/approve-by-admin`, { comment: formData.comment });
                if (response.data.message) {
                  setSnackbar({ open: true, message: 'Đã duyệt đề tài thành công!', severity: 'success' });
                  handleClose();
                  setTimeout(() => setSelected("topic-list"), 500);
                }
              } catch (error) {
                setSnackbar({ open: true, message: 'Có lỗi khi duyệt đề tài!', severity: 'error' });
              }
            }}
            variant="contained"
            color="primary"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert elevation={6} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default ThesisApproval; 