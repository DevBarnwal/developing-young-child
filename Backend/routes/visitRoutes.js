const express = require('express');
const router = express.Router();
const {
  createVisit,
  getVisitsByChild,
  getVisitsByVolunteer,
  getVisitById,
  updateVisit
} = require('../controllers/visitController');
const { protect, authorize } = require('../middlewares/auth');

// Apply authentication for all routes
router.use(protect);

// Routes for /api/visits
router.route('/')
  .post(authorize('admin', 'volunteer'), createVisit);

// Routes for specific visit
router.route('/:id')
  .get(authorize('admin', 'volunteer', 'parent', 'user'), getVisitById)
  .put(authorize('admin', 'volunteer'), updateVisit);

// Get visits by child
router.route('/child/:childId')
  .get(authorize('admin', 'volunteer', 'parent', 'user'), getVisitsByChild);

// Get visits by volunteer
router.route('/volunteer/:volunteerId')
  .get(authorize('admin', 'volunteer'), getVisitsByVolunteer);

module.exports = router;
