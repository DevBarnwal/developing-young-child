const express = require('express');
const router = express.Router();
const {
  createChild,
  getChildren,
  getChildById,
  updateChild,
  deleteChild
} = require('../controllers/childController');
const { protect, authorize } = require('../middlewares/auth');

// Apply authorization for all routes
router.use(protect);

// Routes for /api/children
router.route('/')
  .post(authorize('admin', 'volunteer', 'parent', 'user'), createChild)
  .get(authorize('admin', 'volunteer', 'parent', 'user'), getChildren);

// Routes for specific child
router.route('/:id')
  .get(authorize('admin', 'volunteer', 'parent', 'user'), getChildById)
  .put(authorize('admin', 'volunteer', 'parent', 'user'), updateChild)
  .delete(authorize('admin'), deleteChild);

module.exports = router;