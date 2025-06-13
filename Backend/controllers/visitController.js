const Visit = require('../models/Visit');
const Child = require('../models/Child');
const User = require('../models/User');

// @desc    Create a new visit record
// @route   POST /api/visits
// @access  Private (Admin, Volunteer)
exports.createVisit = async (req, res) => {
  try {
    // Set volunteer to current user if volunteer
    if (req.user.role === 'volunteer' && !req.body.volunteerId) {
      req.body.volunteerId = req.user.id;
    }

    // Verify child exists
    const child = await Child.findById(req.body.childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Verify volunteer exists
    const volunteer = await User.findById(req.body.volunteerId);
    if (!volunteer || (volunteer.role !== 'volunteer' && volunteer.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Valid volunteer not found'
      });
    }

    // Permission check for volunteers
    if (req.user.role === 'volunteer' && 
        req.user.id !== req.body.volunteerId &&
        req.user.id !== child.volunteerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create visit records for this child/volunteer'
      });
    }

    // Create the visit record
    const visit = await Visit.create(req.body);
    
    // Update child's last visit date
    await Child.findByIdAndUpdate(
      req.body.childId,
      { lastVisitDate: req.body.visitDate || Date.now() }
    );

    res.status(201).json({
      success: true,
      data: visit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all visits for a child
// @route   GET /api/visits/child/:childId
// @access  Private
exports.getVisitsByChild = async (req, res) => {
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
    if (req.user.role === 'parent' && 
        child.parentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view visits for this child'
      });
    }

    if (req.user.role === 'volunteer' && 
        child.volunteerId && 
        child.volunteerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view visits for this child'
      });
    }

    // Build query
    const query = { 
      childId, 
      isDeleted: false 
    };
    
    // Date filtering
    if (req.query.startDate) {
      query.visitDate = { $gte: new Date(req.query.startDate) };
    }
    
    if (req.query.endDate) {
      query.visitDate = query.visitDate || {};
      query.visitDate.$lte = new Date(req.query.endDate);
    }

    const visits = await Visit.find(query)
      .populate('volunteerId', 'name email')
      .populate('milestonesAssessed.milestoneId')
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all visits by a volunteer
// @route   GET /api/visits/volunteer/:volunteerId
// @access  Private (Admin, Volunteer)
exports.getVisitsByVolunteer = async (req, res) => {
  try {
    const volunteerId = req.params.volunteerId;
    
    // Permission check for volunteers
    if (req.user.role === 'volunteer' && req.user.id !== volunteerId) {
      return res.status(403).json({
        success: false,
        message: 'Volunteers can only view their own visits'
      });
    }

    // Verify volunteer exists
    const volunteer = await User.findById(volunteerId);
    if (!volunteer || (volunteer.role !== 'volunteer' && volunteer.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Build query
    const query = { 
      volunteerId, 
      isDeleted: false 
    };
    
    // Date filtering
    if (req.query.startDate) {
      query.visitDate = { $gte: new Date(req.query.startDate) };
    }
    
    if (req.query.endDate) {
      query.visitDate = query.visitDate || {};
      query.visitDate.$lte = new Date(req.query.endDate);
    }

    const visits = await Visit.find(query)
      .populate('childId', 'name dob gender')
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get visit by ID
// @route   GET /api/visits/:id
// @access  Private
exports.getVisitById = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('volunteerId', 'name email')
      .populate('childId', 'name dob gender parentId volunteerId')
      .populate('milestonesAssessed.milestoneId');
    
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: `No visit found with id ${req.params.id}`
      });
    }

    // Get child for permission checking
    const child = await Child.findById(visit.childId);
    
    // Permission check
    if (req.user.role === 'parent' && 
        child.parentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this visit'
      });
    }

    if (req.user.role === 'volunteer' && 
        visit.volunteerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this visit'
      });
    }

    res.status(200).json({
      success: true,
      data: visit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update visit
// @route   PUT /api/visits/:id
// @access  Private (Admin, Volunteer who created the visit)
exports.updateVisit = async (req, res) => {
  try {
    let visit = await Visit.findById(req.params.id);
    
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: `No visit found with id ${req.params.id}`
      });
    }

    // Permission check - only the volunteer who created the visit or admin can update
    if (req.user.role === 'volunteer' && 
        visit.volunteerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this visit'
      });
    }

    // Update and return visit
    visit = await Visit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('volunteerId', 'name email')
    .populate('childId', 'name dob gender')
    .populate('milestonesAssessed.milestoneId');

    res.status(200).json({
      success: true,
      data: visit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
