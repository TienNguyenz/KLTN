/* eslint-disable no-undef */
// Route: Xác thực (Authentication)
const express = require('express');
const router = express.Router();
const { login, register, forgotPassword, verifyCode, resetPassword } = require('../controllers/authController');

// Đăng nhập
router.post('/login', login);
// Đăng ký
router.post('/register', register);
// Quên mật khẩu
router.post('/forgot-password', forgotPassword);
// Xác thực mã
router.post('/verify-code', verifyCode);
// Đặt lại mật khẩu
router.post('/reset-password', resetPassword);

module.exports = router; 