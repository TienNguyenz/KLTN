const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Major = require('../models/Major');
const auth = require('../middleware/auth').auth;
const userController = require('../controllers/userController');
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

module.exports = router; 