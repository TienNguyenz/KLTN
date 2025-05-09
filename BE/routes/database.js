const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Topic = require('../models/Topic');
const multer = require('multer');
const path = require('path');

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Thư mục lưu file
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Tên file = timestamp + extension
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  },
  fileFilter: function (req, file, cb) {
    // Chỉ chấp nhận file ảnh
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
    cb(null, true);
  }
});

// Route upload ảnh
router.post('/upload', upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }
    // Trả về đường dẫn file
    res.json({ url: `/uploads/${req.file.filename}` });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route để xem tất cả collections
router.get('/collections', async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        res.json(collectionNames);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route để xem dữ liệu của một collection cụ thể
router.get('/collections/:name', async (req, res) => {
    try {
        const collectionName = req.params.name;
        if (collectionName === 'Topic') {
            const data = await Topic.find({})
                .populate('topic_instructor', 'user_name')
                .populate('topic_category', 'topic_category_title')
                .populate('topic_major', 'major_title')
                .populate('topic_group_student', 'user_name user_id');
            return res.json(data);
        }
        const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Kiểm tra email đã tồn tại
router.get('/users/check-email', async (req, res) => {
    try {
        const { email, excludeId } = req.query;
        
        // Tạo query để kiểm tra email, loại trừ user hiện tại nếu có excludeId
        const query = { email };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existingUser = await User.findOne(query);
        res.json({ exists: !!existingUser });
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({ message: error.message });
    }
});

// Kiểm tra user_id đã tồn tại
router.get('/users/check-user-id', async (req, res) => {
    try {
        const { userId, excludeId } = req.query;
        
        // Tạo query để kiểm tra user_id, loại trừ user hiện tại nếu có excludeId
        const query = { user_id: userId };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existingUser = await User.findOne(query);
        res.json({ exists: !!existingUser });
    } catch (error) {
        console.error('Error checking user ID:', error);
        res.status(500).json({ message: error.message });
    }
});

// Cập nhật thông tin user
router.put('/collections/User/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        
        console.log('Updating user:', userId);
        console.log('Update data:', updateData);

        // Tìm và cập nhật user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true } // Trả về document sau khi cập nhật
        );

        if (!updatedUser) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }

        console.log('User updated successfully:', updatedUser);
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ 
            message: 'Lỗi khi cập nhật thông tin user',
            error: error.message 
        });
    }
});

// Xóa user
router.delete('/collections/User/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        console.log('Deleting user:', userId);

        // Tìm và xóa user
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }

        console.log('User deleted successfully:', deletedUser);
        res.json({ message: 'Xóa user thành công', user: deletedUser });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            message: 'Lỗi khi xóa user',
            error: error.message 
        });
    }
});

module.exports = router; 