const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, deleteUser, updateUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');

// Use protection middleware for all routes
router.use(protect);

// Admin only routes
router.get('/', authorize('admin'), getAllUsers);
router.route('/:id')
  .get(authorize('admin'), getUserById)
  .put(authorize('admin', 'volunteer', 'parent', 'user'), updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;
