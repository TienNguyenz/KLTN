/* eslint-disable no-undef */
// Route: Xác thực (Authentication)
const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');

// Đăng nhập
router.post('/login', login);
// Đăng ký
router.post('/register', register);

module.exports = router; 