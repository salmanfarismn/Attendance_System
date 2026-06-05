const mongoose = require('mongoose');
const { NOTIFICATION_TYPE } = require('../config/constants');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPE), default: 'info' },
    read: { type: Boolean, default: false },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
