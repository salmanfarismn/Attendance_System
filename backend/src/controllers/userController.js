const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'collegeName', 'department', 'semester', 'attendanceTarget', 'theme', 'notificationsEnabled'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

// @desc    Change password
// @route   PUT /api/users/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, changePassword };
