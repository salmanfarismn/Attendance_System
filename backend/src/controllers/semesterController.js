const Semester = require('../models/Semester');

// @desc    Get all semesters for user
// @route   GET /api/semesters
const getSemesters = async (req, res, next) => {
  try {
    const semesters = await Semester.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: semesters });
  } catch (err) { next(err); }
};

// @desc    Create semester
// @route   POST /api/semesters
const createSemester = async (req, res, next) => {
  try {
    const { name, startDate, endDate, isActive } = req.body;
    if (isActive) {
      await Semester.updateMany({ userId: req.user.id }, { isActive: false });
    }
    const semester = await Semester.create({ userId: req.user.id, name, startDate, endDate, isActive: isActive || false });
    res.status(201).json({ success: true, data: semester });
  } catch (err) { next(err); }
};

// @desc    Update semester
// @route   PUT /api/semesters/:id
const updateSemester = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (isActive) {
      await Semester.updateMany({ userId: req.user.id }, { isActive: false });
    }
    const semester = await Semester.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
    res.status(200).json({ success: true, data: semester });
  } catch (err) { next(err); }
};

// @desc    Delete semester
// @route   DELETE /api/semesters/:id
const deleteSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
    res.status(200).json({ success: true, message: 'Semester deleted' });
  } catch (err) { next(err); }
};

// @desc    Add holiday to semester
// @route   POST /api/semesters/:id/holidays
const addHoliday = async (req, res, next) => {
  try {
    const { date, reason } = req.body;
    const semester = await Semester.findOne({ _id: req.params.id, userId: req.user.id });
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
    semester.holidays.push({ date, reason });
    await semester.save();
    res.status(200).json({ success: true, data: semester });
  } catch (err) { next(err); }
};

// @desc    Remove holiday from semester
// @route   DELETE /api/semesters/:id/holidays/:holidayId
const removeHoliday = async (req, res, next) => {
  try {
    const semester = await Semester.findOne({ _id: req.params.id, userId: req.user.id });
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
    semester.holidays = semester.holidays.filter((h) => h._id.toString() !== req.params.holidayId);
    await semester.save();
    res.status(200).json({ success: true, data: semester });
  } catch (err) { next(err); }
};

module.exports = { getSemesters, createSemester, updateSemester, deleteSemester, addHoliday, removeHoliday };
