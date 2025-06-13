const Activity = require('../models/Activity');

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private (Admin only)
exports.createActivity = async (req, res) => {
  try {
    // Set creator to current user
    req.body.createdBy = req.user.id;

    const activity = await Activity.create(req.body);

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res) => {
  try {
    const query = { isDeleted: false };
    
    // Filter by domain if provided
    if (req.query.domain) {
      query.domain = req.query.domain;
    }
    
    // Filter by language if provided
    if (req.query.language) {
      query.language = req.query.language;
    }
    
    // Filter by tags if provided
    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      query.tags = { $in: tags };
    }
    
    // Filter by difficulty level if provided
    if (req.query.difficultyLevel) {
      query.difficultyLevel = req.query.difficultyLevel;
    }

    // Non-admin users can only see approved activities
    if (req.user.role !== 'admin') {
      query.isApproved = true;
    }

    const activities = await Activity.find(query)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get activities by age group
// @route   GET /api/activities/age/:ageGroup
// @access  Private
exports.getActivitiesByAge = async (req, res) => {
  try {
    const ageInMonths = parseInt(req.params.ageGroup, 10);
    if (isNaN(ageInMonths)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid age group format. Please provide age in months.'
      });
    }

    const query = { 
      isDeleted: false,
      'ageRange.min': { $lte: ageInMonths },
      'ageRange.max': { $gte: ageInMonths }
    };
    
    // Filter by domain if provided
    if (req.query.domain) {
      query.domain = req.query.domain;
    }
    
    // Filter by language if provided
    if (req.query.language) {
      query.language = req.query.language;
    }

    // Non-admin users can only see approved activities
    if (req.user.role !== 'admin') {
      query.isApproved = true;
    }

    const activities = await Activity.find(query)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get activity by ID
// @route   GET /api/activities/:id
// @access  Private
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('createdBy', 'name role');
    
    if (!activity || activity.isDeleted) {
      return res.status(404).json({
        success: false,
        message: `No activity found with id ${req.params.id}`
      });
    }

    // Non-admin users can only see approved activities
    if (req.user.role !== 'admin' && !activity.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'This activity is not approved yet'
      });
    }

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private/Admin
exports.updateActivity = async (req, res) => {
  try {
    let activity = await Activity.findById(req.params.id);
    
    if (!activity || activity.isDeleted) {
      return res.status(404).json({
        success: false,
        message: `No activity found with id ${req.params.id}`
      });
    }

    // Update activity
    activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name role');

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
