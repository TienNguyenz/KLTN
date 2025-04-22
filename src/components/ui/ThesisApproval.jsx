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

  useEffect(() => {
    fetchTheses();
  }, [page]);

  const fetchTheses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/database/collections/thesis');
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
      await axios.post(`http://localhost:5000/api/database/collections/thesis?id=${selectedThesis._id}&action=update`, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      fetchTheses();
      handleClose();
    } catch (error) {
      console.error('Error updating thesis:', error);
      alert('Có lỗi xảy ra khi cập nhật đề tài. Vui lòng thử lại sau.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success.main';
      case 'rejected':
        return 'error.main';
      case 'pending':
        return 'warning.main';
      default:
        return 'text.primary';
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
                  <TableCell>{thesis.thesis_title}</TableCell>
                  <TableCell>{thesis.supervisor_name}</TableCell>
                  <TableCell>{thesis.thesis_type}</TableCell>
                  <TableCell>{thesis.semester}</TableCell>
                  <TableCell>{formatDate(thesis.createdAt)}</TableCell>
                  <TableCell>{thesis.max_students || 1}</TableCell>
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
                  <strong>Tên đề tài:</strong> {selectedThesis.thesis_title}
                </Typography>
                <Typography variant="body2">
                  <strong>GVHD:</strong> {selectedThesis.supervisor_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Loại đề tài:</strong> {selectedThesis.thesis_type}
                </Typography>
              </>
            )}

            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Trạng thái"
              >
                <MenuItem value="approved">Phê duyệt</MenuItem>
                <MenuItem value="rejected">Từ chối</MenuItem>
                <MenuItem value="pending">Chờ xử lý</MenuItem>
              </Select>
            </FormControl>

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
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThesisApproval; 