const express = require('express');
const router = express.Router();
const {
  getChildReport,
  getSummaryReport,
  getVolunteerReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/auth');

// Apply authentication for all routes
router.use(protect);

// Get child report
router.get('/child/:id', authorize('admin', 'volunteer', 'parent', 'user'), getChildReport);

// Get admin summary report
router.get('/summary', authorize('admin'), getSummaryReport);

// Get volunteer report
router.get('/volunteer/:volunteerId', authorize('admin', 'volunteer'), getVolunteerReport);

module.exports = router;
