// UserNotification Schema: Quản lý thông báo người dùng
const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema({
  user_notification_title: {
    type: String,
    required: [true, 'Tiêu đề thông báo là bắt buộc'],
    trim: true
  },
  user_notification_sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người gửi là bắt buộc']
  },
  user_notification_recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người nhận là bắt buộc']
  },
  user_notification_content: {
    type: String,
    trim: true
  },
  user_notification_type: {
    type: Number,
    min: 0
  },
  user_notification_isRead: {
    type: Boolean,
    default: false
  },
  user_notification_topic: {
    type: String,
    trim: true
  }
}, { timestamps: true, collection: 'UserNotification' });

module.exports = mongoose.model('UserNotification', userNotificationSchema); 