const Child = require('../models/Child');
const User = require('../models/User');

// @desc    Create a new child profile
// @route   POST /api/children
// @access  Private (Admin, Parent, Volunteer)
exports.createChild = async (req, res) => {
  try {
    // If user is parent, set parentId to their id
    if (req.user.role === 'parent' || req.user.role === 'user') {
      req.body.parentId = req.user.id;
    } else if (!req.body.parentId) {
      return res.status(400).json({
        success: false,
        message: 'Parent ID is required'
      });
    }

    // Verify if parentId is valid
    const parent = await User.findById(req.body.parentId);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // If volunteerId is provided, verify it exists
    if (req.body.volunteerId) {
      const volunteer = await User.findById(req.body.volunteerId);
      if (!volunteer || (volunteer.role !== 'volunteer' && volunteer.role !== 'admin')) {
        return res.status(404).json({
          success: false,
          message: 'Valid volunteer not found'
        });
      }
    }

    const child = await Child.create(req.body);

    res.status(201).json({
      success: true,
      data: child
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all children (filtered by role)
// @route   GET /api/children
// @access  Private
exports.getChildren = async (req, res) => {
  try {
    let query = {};
    
    // Apply role-based filtering
    if (req.user.role === 'parent' || req.user.role === 'user') {
      // Parents can only see their own children
      query.parentId = req.user.id;
    } else if (req.user.role === 'volunteer') {
      // Volunteers can only see children assigned to them
      query.volunteerId = req.user.id;
    }
    
    // Handle query parameters
    if (req.query.isActive) {
      query.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.age) {
      // Filter by age range
      const ageFilter = JSON.parse(req.query.age);
      query.dob = {
        $lte: new Date(new Date().setFullYear(new Date().getFullYear() - ageFilter.min)),
        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - ageFilter.max - 1))
      };
    }

    // Exclude deleted children unless explicitly requested by admin
    if (!(req.user.role === 'admin' && req.query.includeDeleted === 'true')) {
      query.isDeleted = { $ne: true };
    }

    // Execute query with population
    const children = await Child.find(query)
      .populate('parentId', 'name email')
      .populate('volunteerId', 'name email');
    
    res.status(200).json({
      success: true,
      count: children.length,
      data: children
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get child by ID
// @route   GET /api/children/:id
// @access  Private
exports.getChildById = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id)
      .populate('parentId', 'name email')
      .populate('volunteerId', 'name email')
      .populate('developmentalMilestones.assessedBy', 'name role');
    
    if (!child) {
      return res.status(404).json({
        success: false,
        message: `No child found with id ${req.params.id}`
      });
    }
    
    // Permission check
    if (
      (req.user.role === 'parent' || req.user.role === 'user') && 
      child.parentId && 
      child.parentId._id && 
      child.parentId._id.toString() !== req.user.id ||
      (req.user.role === 'volunteer' && 
      (!child.volunteerId || child.volunteerId._id.toString() !== req.user.id))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this child\'s information'
      });
    }

    res.status(200).json({
      success: true,
      data: child
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update child
// @route   PUT /api/children/:id
// @access  Private
exports.updateChild = async (req, res) => {
  try {
    let child = await Child.findById(req.params.id);
    
    if (!child) {
      return res.status(404).json({
        success: false,
        message: `No child found with id ${req.params.id}`
      });
    }
    
    // Permission check
    if (
      (req.user.role === 'parent' || req.user.role === 'user') && 
      child.parentId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this child'
      });
    }

    // Only admins and volunteers can change volunteer assignment
    if (req.body.volunteerId && req.user.role !== 'admin' && req.user.role !== 'volunteer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update volunteer assignment'
      });
    }

    // Verify volunteerId if provided
    if (req.body.volunteerId) {
      const volunteer = await User.findById(req.body.volunteerId);
      if (!volunteer || (volunteer.role !== 'volunteer' && volunteer.role !== 'admin')) {
        return res.status(400).json({
          success: false,
          message: 'Valid volunteer not found'
        });
      }
    }
    
    child = await Child.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: child
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete child (soft delete)
// @route   DELETE /api/children/:id
// @access  Private/Admin
exports.deleteChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    
    if (!child) {
      return res.status(404).json({
        success: false,
        message: `No child found with id ${req.params.id}`
      });
    }

    // For safety, we do a soft delete
    child.isDeleted = true;
    await child.save();
    
    res.status(200).json({
      success: true,
      message: 'Child deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
