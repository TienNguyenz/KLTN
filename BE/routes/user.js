/* eslint-disable no-undef */
// Route: Người dùng (User)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Major = require('../models/Major');
const auth = require('../middleware/auth').auth;
const userController = require('../controllers/userController');
const Faculty = require('../models/Faculty');
// const TopicType = require('../models/TopicType'); // Không cần thiết nữa

// Lấy danh sách giảng viên
router.get('/instructors', async (req, res) => {
  try {
    const { facultyId } = req.query;
    let query = { role: 'giangvien' };
    if (facultyId) query.user_faculty = facultyId;
    const instructors = await User.find(query);
    res.json({ success: true, data: instructors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách sinh viên
router.get('/students', async (req, res) => {
  try {
    const { facultyId } = req.query;
    let query = { role: 'sinhvien' };
    if (facultyId) query.user_faculty = facultyId;
    const students = await User.find(query);
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách chuyên ngành
router.get('/majors', async (req, res) => {
  try {
    const { facultyId } = req.query;
    let query = {};
    if (facultyId) query.major_faculty = facultyId;
    const majors = await Major.find(query);
    res.json({ success: true, data: majors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Đã xóa route /topic-types ở đây để tránh trùng lặp

// Route cho thông tin sinh viên
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

// Route cho thông tin giảng viên
router.get('/lecturer/profile', auth, userController.getProfileGV);
router.put('/lecturer/profile', auth, userController.updateProfileGV);

// API import user hàng loạt
router.post('/database/collections/User/bulk', async (req, res) => {
  try {
    let users = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'Dữ liệu gửi lên phải là một mảng user!' });
    }
    for (let user of users) {
      if (user.user_faculty && typeof user.user_faculty === 'string' && user.user_faculty.length < 30) {
        const faculty = await Faculty.findOne({ faculty_title: user.user_faculty });
        if (!faculty) {
          return res.status(400).json({ success: false, message: `Không tìm thấy khoa: ${user.user_faculty}` });
        }
        user.user_faculty = faculty._id;
      }
      if (user.user_major && typeof user.user_major === 'string' && user.user_major.length < 30) {
        const major = await Major.findOne({ major_title: user.user_major });
        if (!major) {
          return res.status(400).json({ success: false, message: `Không tìm thấy chuyên ngành: ${user.user_major}` });
        }
        user.user_major = major._id;
      }
      if (!user.user_date_of_birth || typeof user.user_date_of_birth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(user.user_date_of_birth)) {
        return res.status(400).json({ success: false, message: `Thiếu hoặc sai định dạng ngày sinh (yyyy-mm-dd) cho user: ${user.user_id || user.email || user.user_name}` });
      }
      if (!user.password) {
        const parts = user.user_date_of_birth.split('-');
        user.password = `${parts[2]}${parts[1]}${parts[0]}`;
      }
    }
    const result = await User.insertMany(users, { ordered: false });
    res.status(200).json({ success: true, message: `Import thành công! Đã thêm ${result.length} user.` });
  } catch (err) {
    if (err && err.writeErrors && err.writeErrors.length > 0) {
      const firstError = err.writeErrors[0];
      const errmsg = firstError.errmsg || (firstError.err && firstError.err.errmsg) || '';
      let userMsg = 'Import thất bại!';
      if (errmsg.includes('duplicate key error')) {
        let match = errmsg.match(/email: "(.+?)"/);
        if (match) {
          userMsg = `Email đã tồn tại: ${match[1]}`;
        } else {
          match = errmsg.match(/user_id: "(.+?)"/);
          if (match) {
            userMsg = `Mã số đã tồn tại: ${match[1]}`;
          } else {
            match = errmsg.match(/user_CCCD: "(.+?)"/);
            if (match) {
              userMsg = `CCCD đã tồn tại: ${match[1]}`;
            } else {
              match = errmsg.match(/user_phone: "(.+?)"/);
              if (match) {
                userMsg = `Số điện thoại đã tồn tại: ${match[1]}`;
              } else {
                userMsg = errmsg;
              }
            }
          }
        }
      } else if (errmsg) {
        userMsg = errmsg;
      }
      return res.status(400).json({ success: false, message: userMsg });
    }
    res.status(500).json({ success: false, message: 'Import thất bại!', error: err.message });
  }
});

// Xuất danh sách tên khoa
router.get('/export/faculties', async (req, res) => {
  try {
    const faculties = await Faculty.find({}, { faculty_title: 1, _id: 0 });
    res.json({ success: true, data: faculties.map(f => f.faculty_title) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách khoa', error: err.message });
  }
});

// Xuất danh sách tên chuyên ngành
router.get('/export/majors', async (req, res) => {
  try {
    const majors = await Major.find({}, { major_title: 1, _id: 0 });
    res.json({ success: true, data: majors.map(m => m.major_title) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách chuyên ngành', error: err.message });
  }
});

// Lấy danh sách giảng viên theo chuyên ngành (major)
router.get('/lecturers', async (req, res) => {
  try {
    const { majorId } = req.query;
    let query = { role: 'giangvien' };
    if (majorId) query.user_major = majorId;
    const lecturers = await User.find(query).populate('user_major', 'major_title');
    res.json({ success: true, data: lecturers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy bảng điểm (transcript) của sinh viên
router.get('/transcript', async (req, res) => {
  const { studentId } = req.query;
  if (!studentId) return res.status(400).json({ success: false, message: 'Thiếu studentId' });
  const user = await User.findById(studentId);
  if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên' });
  if (!user.user_transcript) return res.status(404).json({ success: false, message: 'Chưa có bảng điểm' });
  res.json({ success: true, data: { user_transcript: user.user_transcript } });
});

// Lấy chi tiết sinh viên theo _id (route riêng biệt)
router.get('/student/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('user_faculty', 'faculty_title')
      .populate('user_major', 'major_title')
      .select('-password -__v'); // Exclude sensitive fields
      
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy sinh viên' 
      });
    }

    if (user.role !== 'sinhvien') {
      return res.status(400).json({ 
        success: false, 
        message: 'Người dùng không phải là sinh viên' 
      });
    }

    res.json({ 
      success: true, 
      data: user 
    });
  } catch (err) {
    console.error('Error fetching student details:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: err.message 
    });
  }
});

// Lấy chi tiết user theo _id (đặt sau các route cụ thể)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -__v'); // Exclude sensitive fields
      
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy user' 
      });
    }
    
    res.json({ 
      success: true,
      data: user 
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: err.message 
    });
  }
});

// New route to check user ID existence by userId and role
router.get('/check-user-id', async (req, res) => {
  try {
    const userId = req.query.user_id;
    const role = req.query.role;

    if (!userId || !role) {
      return res.status(400).json({ success: false, message: 'Missing userId or role query parameters' });
    }

    // Find user by userId and role
    const user = await User.findOne({ user_id: userId, role: role });

    // Return data as an array (for frontend compatibility with length check)
    res.json({ success: true, data: user ? [user] : [] });

  } catch (err) {
    console.error('Error checking user ID existence:', err);
    res.status(500).json({ success: false, message: 'Server error checking user ID', error: err.message });
  }
});

module.exports = router; 