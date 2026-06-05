const Subject = require('../models/Subject');
const AttendanceRecord = require('../models/AttendanceRecord');
const { calcPercentage, getAttendanceWeight } = require('../utils/predictionEngine');
const { ATTENDANCE_STATUS } = require('../config/constants');

// @desc    Get all subjects
// @route   GET /api/subjects
const getSubjects = async (req, res, next) => {
  try {
    const { semesterId } = req.query;
    const query = { userId: req.user.id };
    if (semesterId) query.semesterId = semesterId;
    const subjects = await Subject.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, data: subjects });
  } catch (err) { next(err); }
};

// @desc    Create subject
// @route   POST /api/subjects
const createSubject = async (req, res, next) => {
  try {
    const { name, semesterId, facultyName, credits, color } = req.body;
    const subject = await Subject.create({ userId: req.user.id, semesterId, name, facultyName, credits, color });
    res.status(201).json({ success: true, data: subject });
  } catch (err) { next(err); }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, data: subject });
  } catch (err) { next(err); }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    await AttendanceRecord.deleteMany({ subjectId: req.params.id });
    res.status(200).json({ success: true, message: 'Subject deleted' });
  } catch (err) { next(err); }
};

// @desc    Get subject stats
// @route   GET /api/subjects/:id/stats
const getSubjectStats = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user.id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    const records = await AttendanceRecord.find({ subjectId: req.params.id, userId: req.user.id });
    const total = records.length;
    let attended = 0;
    let missed = 0;
    records.forEach((r) => {
      const w = getAttendanceWeight(r.status);
      attended += w;
      if (w < 1) missed += (1 - w);
    });
    attended = parseFloat(attended.toFixed(1));
    missed = parseFloat(missed.toFixed(1));
    const percentage = calcPercentage(attended, total);
    res.status(200).json({ success: true, data: { subject, total, attended, missed, percentage } });
  } catch (err) { next(err); }
};

// @desc    Get analytics across all subjects
// @route   GET /api/subjects/analytics
const getSubjectAnalytics = async (req, res, next) => {
  try {
    const { semesterId } = req.query;
    const query = { userId: req.user.id };
    if (semesterId) query.semesterId = semesterId;
    const subjects = await Subject.find(query);
    const analytics = await Promise.all(
      subjects.map(async (subject) => {
        const records = await AttendanceRecord.find({ subjectId: subject._id, userId: req.user.id });
        const total = records.length;
        let attended = records.reduce((acc, r) => acc + getAttendanceWeight(r.status), 0);
        attended = parseFloat(attended.toFixed(1));
        const percentage = calcPercentage(attended, total);
        return { subject, total, attended, percentage };
      })
    );
    analytics.sort((a, b) => b.percentage - a.percentage);
    const highest = analytics[0] || null;
    const lowest = analytics[analytics.length - 1] || null;
    const target = req.user.attendanceTarget || 75;
    const atRisk = analytics.filter((s) => s.percentage < target);
    res.status(200).json({ success: true, data: { analytics, highest, lowest, atRisk } });
  } catch (err) { next(err); }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject, getSubjectStats, getSubjectAnalytics };
