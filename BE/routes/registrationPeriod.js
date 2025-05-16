/* eslint-disable no-undef */
// Route: Đợt đăng ký (Registration Period)
const express = require('express');
const router = express.Router();
const registrationPeriodController = require('../controllers/registrationPeriodController');
const { auth, checkRole } = require('../middleware/auth');

// Lấy tất cả đợt đăng ký
router.get('/', registrationPeriodController.getAllRegistrationPeriods);
// Lấy chi tiết đợt đăng ký
router.get('/:id', registrationPeriodController.getRegistrationPeriodById);

// Các route chỉ dành cho giáo vụ
router.post('/', auth, checkRole(['giaovu']), registrationPeriodController.createRegistrationPeriod);
router.put('/:id', auth, checkRole(['giaovu']), registrationPeriodController.updateRegistrationPeriod);
router.delete('/:id', auth, checkRole(['giaovu']), registrationPeriodController.deleteRegistrationPeriod);

module.exports = router; 