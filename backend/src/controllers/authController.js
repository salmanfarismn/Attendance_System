const { body } = require('express-validator');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/tokenHelper');
const validate = require('../middleware/validate');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, collegeName, department, semester } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, collegeName, department, semester });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const userObj = user.toJSON();
    sendTokenResponse(userObj, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { register, login, logout, getMe, registerValidators, loginValidators };
