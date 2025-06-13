const express = require('express');
const router = express.Router();
const {
  createActivity,
  getActivities,
  getActivitiesByAge,
  getActivityById,
  updateActivity
} = require('../controllers/activityController');
const { protect, authorize } = require('../middlewares/auth');

// Apply authentication for all routes
router.use(protect);

// Routes for /api/activities
router.route('/')
  .post(authorize('admin'), createActivity)
  .get(authorize('admin', 'volunteer', 'parent', 'user'), getActivities);

// Get activity by ID
router.route('/:id')
  .get(authorize('admin', 'volunteer', 'parent', 'user'), getActivityById)
  .put(authorize('admin'), updateActivity);

// Get activities by age group
router.route('/age/:ageGroup')
  .get(authorize('admin', 'volunteer', 'parent', 'user'), getActivitiesByAge);

module.exports = router;
