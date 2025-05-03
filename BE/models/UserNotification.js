const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema({
  user_notification_title: String,
  user_notification_sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user_notification_recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user_notification_content: String,
  user_notification_type: Number,
  user_notification_isRead: { type: Boolean, default: false },
  user_notification_topic: String,
}, { timestamps: true, collection: 'UserNotification' });

module.exports = mongoose.model('UserNotification', userNotificationSchema); 