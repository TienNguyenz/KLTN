import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Upload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [majors, setMajors] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [openImport, setOpenImport] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, majorsRes, facultiesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/database/collections/User'),
        axios.get('http://localhost:5000/api/database/collections/majors'),
        axios.get('http://localhost:5000/api/database/collections/faculties')
      ]);
      setUsers(usersRes.data);
      setMajors(majorsRes.data);
      setFaculties(facultiesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate data structure
        const requiredFields = ['user_id', 'user_name', 'user_email', 'user_password'];
        const missingFields = requiredFields.filter(field => !jsonData[0]?.hasOwnProperty(field));
        
        if (missingFields.length > 0) {
          setImportError(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
          return;
        }

        // Process and send data to server
        const processedData = jsonData.map(row => ({
          ...row,
          role: selectedRole,
          user_faculty: row.user_faculty || '',
          user_major: row.user_major || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        await axios.post('http://localhost:5000/api/database/collections/User/bulk', processedData);
        setImportSuccess('Import dữ liệu thành công!');
        fetchData();
        setOpenImport(false);
      } catch (error) {
        setImportError('Có lỗi xảy ra khi import file: ' + error.message);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExportExcel = () => {
    const dataToExport = users.map(user => ({
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      role: user.role,
      user_faculty: faculties.find(f => f._id === user.user_faculty)?.faculty_name || '',
      user_major: majors.find(m => m._id === user.user_major)?.major_title || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'users.xlsx');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Quản lý Người dùng
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setOpenImport(true)}
          >
            Import Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã số</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Khoa</TableCell>
              <TableCell>Chuyên ngành</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.user_id}</TableCell>
                <TableCell>{user.user_name}</TableCell>
                <TableCell>{user.user_email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {faculties.find(f => f._id === user.user_faculty)?.faculty_name || ''}
                </TableCell>
                <TableCell>
                  {majors.find(m => m._id === user.user_major)?.major_title || ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openImport} onClose={() => setOpenImport(false)}>
        <DialogTitle>Import Người dùng từ Excel</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="Vai trò"
              >
                <MenuItem value="sinhvien">Sinh viên</MenuItem>
                <MenuItem value="giangvien">Giảng viên</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
            >
              Chọn file Excel
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
              />
            </Button>

            {importError && (
              <Alert severity="error" onClose={() => setImportError('')}>
                {importError}
              </Alert>
            )}

            {importSuccess && (
              <Alert severity="success" onClose={() => setImportSuccess('')}>
                {importSuccess}
              </Alert>
            )}

            <Typography variant="caption" color="textSecondary">
              File Excel cần có các cột: user_id, user_name, user_email, user_password
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImport(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 