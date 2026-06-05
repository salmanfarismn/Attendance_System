const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
    holidays: [
      {
        date: { type: Date, required: true },
        reason: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Semester', semesterSchema);
