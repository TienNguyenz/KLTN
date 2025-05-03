const express = require('express');
const router = express.Router();
const UserNotification = require('../models/UserNotification');

// Lấy tất cả thông báo của user
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await UserNotification.find({
      user_notification_recipient: req.params.userId
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Đánh dấu thông báo là đã đọc
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await UserNotification.findByIdAndUpdate(
      req.params.id,
      { user_notification_isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 