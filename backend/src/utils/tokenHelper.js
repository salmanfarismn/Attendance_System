const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user,
  });
};

module.exports = { generateToken, sendTokenResponse };
