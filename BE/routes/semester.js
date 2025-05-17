/* eslint-disable no-undef */
// Route: Học kỳ (Semester)
const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semesterController');

// Lấy tất cả học kỳ
router.get('/', semesterController.getAllSemesters);

// Tạo học kỳ mới
router.post('/', semesterController.createSemester);

// Cập nhật học kỳ
router.put('/:id', semesterController.updateSemester);

// Xóa học kỳ
router.delete('/:id', semesterController.deleteSemester);

module.exports = router; 