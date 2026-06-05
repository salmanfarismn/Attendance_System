const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, registerValidators, loginValidators } = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.post('/register', registerValidators, validate, register);
router.post('/login', loginValidators, validate, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
