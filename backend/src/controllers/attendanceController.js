const AttendanceRecord = require('../models/AttendanceRecord');
const Subject = require('../models/Subject');
const Notification = require('../models/Notification');
const {
  calcPercentage, getAttendanceWeight, classesNeededToReach,
  classesCanMiss, predictAttendance, getHealthStatus, generateInsights
} = require('../utils/predictionEngine');

// @desc    Get attendance records (with filters)
// @route   GET /api/attendance
const getAttendance = async (req, res, next) => {
  try {
    const { semesterId, subjectId, startDate, endDate, month, year } = req.query;
    const query = { userId: req.user.id };
    if (semesterId) query.semesterId = semesterId;
    if (subjectId)  query.subjectId  = subjectId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate)   query.date.$lte = new Date(endDate);
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 0, 23, 59, 59);
      query.date  = { $gte: start, $lte: end };
    }
    const records = await AttendanceRecord.find(query)
      .populate('subjectId',  'name color')
      .populate('semesterId', 'name')
      .sort({ date: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (err) { next(err); }
};

// @desc    Add attendance record
// @route   POST /api/attendance
const addAttendance = async (req, res, next) => {
  try {
    const { subjectId, semesterId, date, status, leaveType, note } = req.body;

    // Build duplicate check — if no subject, check userId + date only
    const dupQuery = { userId: req.user.id, date: new Date(date) };
    if (subjectId) dupQuery.subjectId = subjectId;
    else           dupQuery.subjectId = null;

    const existing = await AttendanceRecord.findOne(dupQuery);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: subjectId
          ? 'Attendance already marked for this subject on this date'
          : 'Daily attendance already marked for this date',
      });
    }

    const record = await AttendanceRecord.create({
      userId: req.user.id,
      subjectId: subjectId || null,
      semesterId: semesterId || null,
      date,
      status,
      leaveType: leaveType || null,
      note: note || '',
    });

    await checkAndCreateNotifications(req.user, semesterId);
    const populated = await record.populate('subjectId', 'name color');
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
const updateAttendance = async (req, res, next) => {
  try {
    const record = await AttendanceRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('subjectId', 'name color');
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, data: record });
  } catch (err) { next(err); }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
const deleteAttendance = async (req, res, next) => {
  try {
    const record = await AttendanceRecord.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, message: 'Attendance deleted' });
  } catch (err) { next(err); }
};

// @desc    Get overall attendance stats
// @route   GET /api/attendance/stats
const getStats = async (req, res, next) => {
  try {
    const { semesterId } = req.query;
    const target = req.user.attendanceTarget || 75;
    const query  = { userId: req.user.id };
    if (semesterId) query.semesterId = semesterId;

    const records = await AttendanceRecord.find(query).populate('subjectId', 'name color');

    const total    = records.length;
    let attended   = records.reduce((acc, r) => acc + getAttendanceWeight(r.status), 0);
    attended       = parseFloat(attended.toFixed(1));
    const absent   = parseFloat((total - attended).toFixed(1));
    const percentage = calcPercentage(attended, total);
    const needed   = classesNeededToReach(attended, total, target);
    const canMiss  = classesCanMiss(attended, total, target);
    const health   = getHealthStatus(percentage, target);
    const buffer   = canMiss;

    // Per-subject stats (only for records that have a subject)
    const subjectMap = {};
    records.forEach((r) => {
      if (!r.subjectId) return; // skip daily (no-subject) records for subject breakdown
      const sid = r.subjectId._id?.toString();
      if (!sid) return;
      if (!subjectMap[sid]) subjectMap[sid] = { subject: r.subjectId, total: 0, attended: 0 };
      subjectMap[sid].total++;
      subjectMap[sid].attended += getAttendanceWeight(r.status);
    });
    const subjectStats = Object.values(subjectMap).map((s) => ({
      ...s,
      attended:   parseFloat(s.attended.toFixed(1)),
      percentage: calcPercentage(parseFloat(s.attended.toFixed(1)), s.total),
      name:       s.subject?.name,
    }));

    const insights = generateInsights(attended, total, target, subjectStats);

    // Monthly breakdown
    const monthlyMap = {};
    records.forEach((r) => {
      const d   = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, total: 0, attended: 0 };
      monthlyMap[key].total++;
      monthlyMap[key].attended += getAttendanceWeight(r.status);
    });
    const monthlyTrend = Object.values(monthlyMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({
        ...m,
        attended:   parseFloat(m.attended.toFixed(1)),
        percentage: calcPercentage(parseFloat(m.attended.toFixed(1)), m.total),
      }));

    res.status(200).json({
      success: true,
      data: { total, attended, absent, percentage, needed, canMiss, buffer, health, target, subjectStats, insights, monthlyTrend },
    });
  } catch (err) { next(err); }
};

// @desc    Calendar view
// @route   GET /api/attendance/calendar
const getCalendar = async (req, res, next) => {
  try {
    const { semesterId, month, year } = req.query;
    const query = { userId: req.user.id };
    if (semesterId) query.semesterId = semesterId;
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 0, 23, 59, 59);
      query.date  = { $gte: start, $lte: end };
    }
    const records = await AttendanceRecord.find(query).populate('subjectId', 'name color');
    const calendarMap = {};
    records.forEach((r) => {
      const dateKey = new Date(r.date).toISOString().split('T')[0];
      if (!calendarMap[dateKey]) calendarMap[dateKey] = [];
      calendarMap[dateKey].push(r);
    });
    res.status(200).json({ success: true, data: calendarMap });
  } catch (err) { next(err); }
};

// @desc    Attendance prediction
// @route   GET /api/attendance/prediction
const getPrediction = async (req, res, next) => {
  try {
    const { semesterId, plannedPresent = 0, plannedAbsent = 0 } = req.query;
    const target = req.user.attendanceTarget || 75;
    const query  = { userId: req.user.id };
    if (semesterId) query.semesterId = semesterId;
    const records  = await AttendanceRecord.find(query);
    const total    = records.length;
    let attended   = records.reduce((acc, r) => acc + getAttendanceWeight(r.status), 0);
    attended       = parseFloat(attended.toFixed(1));
    const currentPct  = calcPercentage(attended, total);
    const needed      = classesNeededToReach(attended, total, target);
    const canMiss     = classesCanMiss(attended, total, target);
    const projectedPct = predictAttendance(attended, total, Number(plannedPresent), Number(plannedAbsent));
    res.status(200).json({
      success: true,
      data: { currentPct, needed, canMiss, projectedPct, attended, total, target },
    });
  } catch (err) { next(err); }
};

// @desc    Export attendance
// @route   GET /api/attendance/export
const exportAttendance = async (req, res, next) => {
  try {
    const { format = 'json', semesterId } = req.query;
    const query = { userId: req.user.id };
    if (semesterId) query.semesterId = semesterId;
    const records = await AttendanceRecord.find(query)
      .populate('subjectId',  'name')
      .populate('semesterId', 'name')
      .lean();

    if (format === 'csv') {
      const csvData = records.map((r) => ({
        date:      new Date(r.date).toISOString().split('T')[0],
        subject:   r.subjectId?.name || 'Daily',
        semester:  r.semesterId?.name || '—',
        status:    r.status,
        leaveType: r.leaveType || '',
        note:      r.note || '',
      }));
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
      const headers = Object.keys(csvData[0] || {}).join(',');
      const rows    = csvData.map((row) => Object.values(row).map((v) => `"${v}"`).join(','));
      return res.send([headers, ...rows].join('\n'));
    }
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.json');
    res.status(200).json({ success: true, data: records });
  } catch (err) { next(err); }
};

// Internal helper: auto-create notifications on low attendance
const checkAndCreateNotifications = async (user, semesterId) => {
  try {
    const target  = user.attendanceTarget || 75;
    const query   = { userId: user._id };
    if (semesterId) query.semesterId = semesterId;
    const records  = await AttendanceRecord.find(query);
    const total    = records.length;
    let attended   = records.reduce((acc, r) => acc + getAttendanceWeight(r.status), 0);
    const pct      = calcPercentage(attended, total);
    if (pct < 65) {
      await Notification.create({ userId: user._id, message: `🚨 Critical! Your attendance is ${pct}%. Immediate action required!`, type: 'critical' });
    } else if (pct < target) {
      await Notification.create({ userId: user._id, message: `⚠️ Warning! Your attendance is ${pct}%. Below ${target}% threshold.`, type: 'warning' });
    }
  } catch { /* silent fail */ }
};

module.exports = {
  getAttendance, addAttendance, updateAttendance, deleteAttendance,
  getStats, getCalendar, getPrediction, exportAttendance,
};
