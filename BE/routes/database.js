/* eslint-disable no-undef */
// Route: Tiện ích database (upload, kiểm tra, quản trị)
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Topic = require('../models/Topic');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
    cb(null, true);
  }
});

// Upload ảnh
router.post('/upload', upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file được upload' });
    }
    res.json({ success: true, url: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xem tất cả collections
router.get('/collections', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    res.json({ success: true, data: collectionNames });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Xem dữ liệu của một collection cụ thể
router.get('/collections/:name', async (req, res) => {
  try {
    const collectionName = req.params.name;
    if (collectionName === 'Topic') {
      const data = await Topic.find({})
        .populate('topic_instructor', 'user_name')
        .populate('topic_category', 'topic_category_title')
        .populate('topic_major', 'major_title')
        .populate('topic_group_student', 'user_name user_id')
        .populate('topic_assembly', 'assembly_name');
      return res.json({ success: true, data });
    }
    const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Kiểm tra email đã tồn tại
router.get('/users/check-email', async (req, res) => {
  try {
    const { email, excludeId } = req.query;
    const query = { email };
    if (excludeId) query._id = { $ne: excludeId };
    const existingUser = await User.findOne(query);
    res.json({ success: true, exists: !!existingUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Kiểm tra user_id đã tồn tại
router.get('/users/check-user-id', async (req, res) => {
  try {
    const { userId, excludeId } = req.query;
    const query = { user_id: userId };
    if (excludeId) query._id = { $ne: excludeId };
    const existingUser = await User.findOne(query);
    res.json({ success: true, exists: !!existingUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật thông tin user
router.put('/collections/User/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng' });
    }
    if (error.code === 11000 && error.keyPattern && error.keyPattern.user_id) {
      return res.status(400).json({ success: false, message: 'Mã số đã được sử dụng bởi một tài khoản khác!' });
    }
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi cập nhật thông tin user' });
  }
});

// Xóa user
router.delete('/collections/User/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }
    res.json({ success: true, message: 'Xóa user thành công', user: deletedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa user', error: error.message });
  }
});

// Xóa file upload (avatar cũ)
router.delete('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy file hoặc đã bị xóa!' });
    }
    res.json({ success: true, message: 'Xóa file thành công!' });
  });
});

// Đổi mật khẩu với kiểm tra current password
router.put('/collections/User/:id/change-password', async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Thiếu mật khẩu hiện tại hoặc mật khẩu mới.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user.' });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đổi mật khẩu.' });
  }
});

// Thêm mới user (sinh viên/giảng viên)
router.post('/collections/User', async (req, res) => {
  try {
    const userData = req.body;
    // Kiểm tra trùng email hoặc user_id
    const existingUser = await User.findOne({ $or: [{ email: userData.email }, { user_id: userData.user_id }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email hoặc mã số đã tồn tại!' });
    }
    const newUser = new User(userData);
    await newUser.save();
    res.json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật document theo id cho collection Topic
router.put('/collections/Topic/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    // Ép kiểu topic_assembly về ObjectId nếu là string
    if (update.topic_assembly && typeof update.topic_assembly === 'string') {
      update.topic_assembly = new mongoose.Types.ObjectId(update.topic_assembly);
    }
    // Tìm theo cả string và ObjectId
    let query = { _id: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [ { _id: id }, { _id: new mongoose.Types.ObjectId(id) } ] };
    }
    const updated = await Topic.findOneAndUpdate(query, { $set: update }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật đề tài', error: err.message });
  }
});

module.exports = router; 