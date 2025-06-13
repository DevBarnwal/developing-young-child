const express = require('express');
const router = express.Router();
const {
  createMilestone,
  getMilestoneById,
  getMilestonesByChild,
  updateMilestone
} = require('../controllers/milestoneController');
const { protect, authorize } = require('../middlewares/auth');

// Apply authorization for all routes
router.use(protect);

// Routes for /api/milestones
router.route('/')
  .post(authorize('admin', 'volunteer', 'parent', 'user'), createMilestone);

// Get milestones by child ID
router.route('/child/:childId')
  .get(authorize('admin', 'volunteer', 'parent', 'user'), getMilestonesByChild);

// Routes for specific milestone
router.route('/:id')
  .get(authorize('admin', 'volunteer', 'parent', 'user'), getMilestoneById)
  .put(authorize('admin', 'volunteer', 'parent', 'user'), updateMilestone);

module.exports = router;
