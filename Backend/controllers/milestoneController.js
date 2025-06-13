const Milestone = require('../models/Milestone');
const Child = require('../models/Child');

// @desc    Create a new milestone entry
// @route   POST /api/milestones
// @access  Private (Admin, Volunteer)
exports.createMilestone = async (req, res) => {
  try {
    // Set assessor to current user if not provided
    if (!req.body.assessedBy) {
      req.body.assessedBy = req.user.id;
    }

    // Verify child exists
    const child = await Child.findById(req.body.childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Permission check for volunteers
    if (req.user.role === 'volunteer' && 
        child.volunteerId && 
        child.volunteerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add milestones for this child'
      });
    }

    // If parent is making entry, ensure they are the child's parent
    if ((req.user.role === 'parent' || req.user.role === 'user') && 
        child.parentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add milestones for this child'
      });
    }

    const milestone = await Milestone.create(req.body);

    // Return created milestone
    res.status(201).json({
      success: true,
      data: milestone
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get milestone by ID
// @route   GET /api/milestones/:id
// @access  Private
exports.getMilestoneById = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id)
      .populate('childId', 'name dob gender')
      .populate('assessedBy', 'name role');
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: `No milestone found with id ${req.params.id}`
      });
    }

    // Fetch child to check permissions
    const child = await Child.findById(milestone.childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Associated child not found'
      });
    }

    // Permission check
    if ((req.user.role === 'parent' || req.user.role === 'user') && 
        child.parentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this milestone'
      });
    }

    if (req.user.role === 'volunteer' && 
        child.volunteerId && 
        child.volunteerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this milestone'
      });
    }

    res.status(200).json({
      success: true,
      data: milestone
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all milestones for a child
// @route   GET /api/milestones/child/:childId
// @access  Private
exports.getMilestonesByChild = async (req, res) => {
  try {
    const childId = req.params.childId;
    
    // Verify child exists
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Permission check
    if ((req.user.role === 'parent' || req.user.role === 'user') && 
        child.parentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this child\'s milestones'
      });
    }

    if (req.user.role === 'volunteer' && 
        child.volunteerId && 
        child.volunteerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this child\'s milestones'
      });
    }

    // Build query
    let query = { childId, isDeleted: false };
    
    // Filter by domain if provided
    if (req.query.domain) {
      query.domain = req.query.domain;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const milestones = await Milestone.find(query)
      .populate('assessedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: milestones.length,
      data: milestones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private
exports.updateMilestone = async (req, res) => {
  try {
    let milestone = await Milestone.findById(req.params.id);
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: `No milestone found with id ${req.params.id}`
      });
    }

    // Verify child exists
    const child = await Child.findById(milestone.childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Associated child not found'
      });
    }

    // Permission check for parents
    if ((req.user.role === 'parent' || req.user.role === 'user') && 
        child.parentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this milestone'
      });
    }

    // Permission check for volunteers
    if (req.user.role === 'volunteer' && 
        child.volunteerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this milestone'
      });
    }

    // Parents can only update limited fields
    if (req.user.role === 'parent' || req.user.role === 'user') {
      const allowedUpdates = ['notes', 'mediaURL', 'activities'];
      Object.keys(req.body).forEach(key => {
        if (!allowedUpdates.includes(key)) {
          delete req.body[key];
        }
      });
    }

    // Update and return milestone
    milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('childId', 'name dob gender')
     .populate('assessedBy', 'name role');

    res.status(200).json({
      success: true,
      data: milestone
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
