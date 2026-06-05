const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    name: { type: String, required: true, trim: true },
    facultyName: { type: String, trim: true, default: '' },
    credits: { type: Number, default: 0 },
    color: { type: String, default: '#6366f1' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
