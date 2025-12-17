const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message_id: { type: String, required: true, unique: true },
  userid: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'system'], default: 'info' },
  isRead: { type: Boolean, default: false },
  for: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.model('Notification', NotificationSchema, 'notifications');