const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, updateSubject, deleteSubject, getSubjectStats, getSubjectAnalytics } = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/analytics', getSubjectAnalytics);
router.get('/', getSubjects);
router.post('/', createSubject);
router.get('/:id/stats', getSubjectStats);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

module.exports = router;
