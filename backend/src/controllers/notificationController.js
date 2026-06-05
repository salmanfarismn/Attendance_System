const Notification = require('../models/Notification');

// @desc    Get notifications
// @route   GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (err) { next(err); }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { read: true });
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (err) { next(err); }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
