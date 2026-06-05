const mongoose = require('mongoose');
const { ATTENDANCE_STATUS, LEAVE_TYPE } = require('../config/constants');

const attendanceRecordSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
    // Both subjectId and semesterId are now optional — daily attendance works without them
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject',  default: null },
    semesterId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Semester', default: null },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: true,
    },
    leaveType: {
      type: String,
      enum: [...Object.values(LEAVE_TYPE), null],
      default: null,
    },
    note: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Unique per user + date + subject (null subject = daily record for that date)
// Use sparse so multiple null-subject records don't conflict
attendanceRecordSchema.index({ userId: 1, date: 1, subjectId: 1 }, { unique: true, sparse: true });
attendanceRecordSchema.index({ userId: 1, semesterId: 1, date: 1 });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
