const express = require('express');
const router = express.Router();
const {
  getAttendance, addAttendance, updateAttendance, deleteAttendance,
  getStats, getCalendar, getPrediction, exportAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getStats);
router.get('/calendar', getCalendar);
router.get('/prediction', getPrediction);
router.get('/export', exportAttendance);
router.get('/', getAttendance);
router.post('/', addAttendance);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

module.exports = router;
