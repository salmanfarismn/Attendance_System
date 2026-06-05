const express = require('express');
const router = express.Router();
const { getSemesters, createSemester, updateSemester, deleteSemester, addHoliday, removeHoliday } = require('../controllers/semesterController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getSemesters);
router.post('/', createSemester);
router.put('/:id', updateSemester);
router.delete('/:id', deleteSemester);
router.post('/:id/holidays', addHoliday);
router.delete('/:id/holidays/:holidayId', removeHoliday);

module.exports = router;
