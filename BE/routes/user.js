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
    const instructors = await User.find({ role: 'giangvien' });
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy danh sách sinh viên
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'sinhvien' });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy danh sách chuyên ngành
router.get('/majors', async (req, res) => {
  try {
    const majors = await Major.find();
    res.json(majors);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      console.error('Import lỗi: Dữ liệu gửi lên không phải mảng user!');
      return res.status(400).json({ message: 'Dữ liệu gửi lên phải là một mảng user!' });
    }

    // Map tên khoa/chuyên ngành sang ObjectId nếu cần
    for (let user of users) {
      // Map Khoa
      if (user.user_faculty && typeof user.user_faculty === 'string' && user.user_faculty.length < 30) {
        const faculty = await Faculty.findOne({ faculty_title: user.user_faculty });
        if (!faculty) {
          console.error('Import lỗi: Không tìm thấy khoa:', user.user_faculty);
          return res.status(400).json({ message: `Không tìm thấy khoa: ${user.user_faculty}` });
        }
        user.user_faculty = faculty._id;
      }
      // Map Chuyên ngành
      if (user.user_major && typeof user.user_major === 'string' && user.user_major.length < 30) {
        const major = await Major.findOne({ major_title: user.user_major });
        if (!major) {
          console.error('Import lỗi: Không tìm thấy chuyên ngành:', user.user_major);
          return res.status(400).json({ message: `Không tìm thấy chuyên ngành: ${user.user_major}` });
        }
        user.user_major = major._id;
      }
      // Bắt buộc phải có ngày sinh đúng định dạng yyyy-mm-dd
      if (!user.user_date_of_birth || typeof user.user_date_of_birth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(user.user_date_of_birth)) {
        console.error('Import lỗi: Thiếu hoặc sai định dạng ngày sinh cho user:', user.user_id || user.email || user.user_name);
        return res.status(400).json({ message: `Thiếu hoặc sai định dạng ngày sinh (yyyy-mm-dd) cho user: ${user.user_id || user.email || user.user_name}` });
      }
      // Nếu thiếu password, tự động sinh password từ ngày sinh (ddmmyyyy)
      if (!user.password) {
        const parts = user.user_date_of_birth.split('-');
        user.password = `${parts[2]}${parts[1]}${parts[0]}`;
      }
    }

    const result = await User.insertMany(users, { ordered: false });
    console.log('Số user insert thành công:', result.length);
    res.status(200).json({ message: `Import thành công! Đã thêm ${result.length} user.` });
  } catch (err) {
    if (err && err.writeErrors && err.writeErrors.length > 0) {
      // Lấy lỗi đầu tiên để báo cho FE
      const firstError = err.writeErrors[0];
      const errmsg = firstError.errmsg || (firstError.err && firstError.err.errmsg) || '';
      console.error('firstError.errmsg:', errmsg);
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
      console.error('Import user lỗi trả về FE:', userMsg);
      return res.status(400).json({ message: userMsg });
    }
    console.error('Import user lỗi:', err);
    res.status(500).json({ message: 'Import thất bại!', error: err.message });
  }
});

// Xuất danh sách tên khoa
router.get('/export/faculties', async (req, res) => {
  try {
    const faculties = await Faculty.find({}, { faculty_title: 1, _id: 0 });
    res.json(faculties.map(f => f.faculty_title));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách khoa', error: err.message });
  }
});

// Xuất danh sách tên chuyên ngành
router.get('/export/majors', async (req, res) => {
  try {
    const majors = await Major.find({}, { major_title: 1, _id: 0 });
    res.json(majors.map(m => m.major_title));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách chuyên ngành', error: err.message });
  }
});

module.exports = router; 