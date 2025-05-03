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
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ThesisApproval = () => {
  const [theses, setTheses] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    status: '',
    comment: ''
  });

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
        // Duyệt đề tài: cập nhật topic_leader_status thành 'approved'
        await axios.put(`http://localhost:5000/api/topics/${selectedThesis._id}/approve-by-admin`);
        alert('Đã duyệt đề tài thành công!');
      } else if (formData.status === 'rejected') {
        // Từ chối đề tài: gọi API reject-by-admin (tự động gửi thông báo)
        await axios.put(`http://localhost:5000/api/topics/${selectedThesis._id}/reject-by-admin`);
        alert('Đã từ chối đề tài và gửi thông báo cho sinh viên, giảng viên!');
      } else {
        alert('Vui lòng chọn trạng thái duyệt!');
        return;
      }
      fetchTheses();
      handleClose();
    } catch (error) {
      console.error('Error updating thesis:', error);
      alert('Có lỗi xảy ra khi cập nhật đề tài. Vui lòng thử lại sau.');
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
                <Typography variant="subtitle1">
                  <strong>Tên đề tài:</strong> {selectedThesis.topic_title}
                </Typography>
                <Typography variant="body2">
                  <strong>GVHD:</strong> {selectedThesis.topic_instructor?.user_name || 'Chưa có GVHD'}
                </Typography>
                <Typography variant="body2">
                  <strong>Loại đề tài:</strong> {selectedThesis.topic_category?.topic_category_title || '-'}
                </Typography>
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
                const response = await axios.put(`http://localhost:5000/api/topics/${selectedThesis._id}/reject-by-admin`);
                if (response.data.message) {
                  alert('Đã từ chối đề tài và gửi thông báo!');
                  handleClose();
                  navigate('/HomeRoleManage');
                }
              } catch (error) {
                alert('Có lỗi khi từ chối đề tài!');
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
                const response = await axios.put(`http://localhost:5000/api/topics/${selectedThesis._id}/approve-by-admin`);
                if (response.data.message) {
                  alert('Đã duyệt đề tài thành công!');
                  handleClose();
                  navigate('/HomeRoleManage');
                }
              } catch (error) {
                alert('Có lỗi khi duyệt đề tài!');
              }
            }}
            variant="contained"
            color="primary"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThesisApproval; 