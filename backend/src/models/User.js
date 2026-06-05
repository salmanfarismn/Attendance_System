const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    collegeName: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    semester: { type: String, trim: true, default: '' },
    attendanceTarget: { type: Number, default: 75, min: 1, max: 100 },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    notificationsEnabled: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

// Mongoose 7+ async hooks: do NOT call next() — just use async/await and return
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
