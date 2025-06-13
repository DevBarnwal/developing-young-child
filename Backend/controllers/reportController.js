const Child = require('../models/Child');
const User = require('../models/User');
const Visit = require('../models/Visit');
const Milestone = require('../models/Milestone');

// @desc    Get report for a specific child
// @route   GET /api/reports/child/:id
// @access  Private
exports.getChildReport = async (req, res) => {
  try {
    const childId = req.params.id;
    
    // Verify child exists
    const child = await Child.findById(childId)
      .populate('parentId', 'name email')
      .populate('volunteerId', 'name email');
      
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Permission check
    if ((req.user.role === 'parent' || req.user.role === 'user') && 
        child.parentId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this child\'s report'
      });
    }

    if (req.user.role === 'volunteer' && 
        child.volunteerId && 
        child.volunteerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this child\'s report'
      });
    }

    // Get milestones for this child
    const milestones = await Milestone.find({ 
      childId, 
      isDeleted: false 
    }).sort({ createdAt: -1 });

    // Calculate milestone progress
    const milestoneStats = {
      total: milestones.length,
      achieved: milestones.filter(m => m.status === 'Achieved').length,
      inProgress: milestones.filter(m => m.status === 'In Progress').length,
      notStarted: milestones.filter(m => m.status === 'Not Started').length,
      concern: milestones.filter(m => m.status === 'Concern').length,
      byDomain: {}
    };

    // Calculate progress by domain
    const domains = ['Motor', 'Cognitive', 'Language', 'Social', 'Emotional', 'Other'];
    domains.forEach(domain => {
      const domainMilestones = milestones.filter(m => m.domain === domain);
      milestoneStats.byDomain[domain] = {
        total: domainMilestones.length,
        achieved: domainMilestones.filter(m => m.status === 'Achieved').length,
        inProgress: domainMilestones.filter(m => m.status === 'In Progress').length,
        notStarted: domainMilestones.filter(m => m.status === 'Not Started').length,
        concern: domainMilestones.filter(m => m.status === 'Concern').length,
        progressPercent: domainMilestones.length > 0 
          ? Math.round((domainMilestones.filter(m => m.status === 'Achieved').length / domainMilestones.length) * 100) 
          : 0
      };
    });

    // Get recent visits for this child
    const visits = await Visit.find({ 
      childId,
      isDeleted: false 
    })
    .populate('volunteerId', 'name email')
    .sort({ visitDate: -1 })
    .limit(10);

    // Generate the report
    const report = {
      child,
      milestoneStats,
      recentMilestones: milestones.slice(0, 10),
      recentVisits: visits,
      visitCount: await Visit.countDocuments({ childId, isDeleted: false }),
      ageAppropriateProgress: calculateAgeAppropriateProgress(child, milestones)
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get summary report for admin dashboard
// @route   GET /api/reports/summary
// @access  Private/Admin
exports.getSummaryReport = async (req, res) => {
  try {
    // Get counts
    const childCount = await Child.countDocuments({ isDeleted: false });
    const volunteerCount = await User.countDocuments({ role: 'volunteer' });
    const parentCount = await User.countDocuments({ role: 'parent' });
    const visitCount = await Visit.countDocuments({ isDeleted: false });
    const milestoneCount = await Milestone.countDocuments({ isDeleted: false });

    // Get milestone progress
    const milestones = await Milestone.find({ isDeleted: false });
    const milestoneStats = {
      total: milestones.length,
      achieved: milestones.filter(m => m.status === 'Achieved').length,
      inProgress: milestones.filter(m => m.status === 'In Progress').length,
      notStarted: milestones.filter(m => m.status === 'Not Started').length,
      concern: milestones.filter(m => m.status === 'Concern').length,
      byDomain: {}
    };

    // Calculate progress by domain
    const domains = ['Motor', 'Cognitive', 'Language', 'Social', 'Emotional', 'Other'];
    domains.forEach(domain => {
      const domainMilestones = milestones.filter(m => m.domain === domain);
      milestoneStats.byDomain[domain] = {
        total: domainMilestones.length,
        achieved: domainMilestones.filter(m => m.status === 'Achieved').length,
        progressPercent: domainMilestones.length > 0 
          ? Math.round((domainMilestones.filter(m => m.status === 'Achieved').length / domainMilestones.length) * 100) 
          : 0
      };
    });

    // Get recent visits
    const recentVisits = await Visit.find({ isDeleted: false })
      .populate('volunteerId', 'name email')
      .populate('childId', 'name dob gender')
      .sort({ visitDate: -1 })
      .limit(10);

    // Generate the report
    const report = {
      counts: {
        children: childCount,
        volunteers: volunteerCount,
        parents: parentCount,
        visits: visitCount,
        milestones: milestoneCount
      },
      milestoneStats,
      recentVisits,
      // Calculate average visits per child
      visitsPerChild: childCount > 0 ? (visitCount / childCount).toFixed(2) : 0,
      // Calculate average children per volunteer
      childrenPerVolunteer: volunteerCount > 0 ? (childCount / volunteerCount).toFixed(2) : 0
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get volunteer performance report
// @route   GET /api/reports/volunteer/:volunteerId
// @access  Private (Admin, Volunteer)
exports.getVolunteerReport = async (req, res) => {
  try {
    const volunteerId = req.params.volunteerId;
    
    // Permission check
    if (req.user.role === 'volunteer' && req.user.id !== volunteerId) {
      return res.status(403).json({
        success: false,
        message: 'Volunteers can only access their own reports'
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

    // Get assigned children
    const assignedChildren = await Child.find({ 
      volunteerId,
      isDeleted: false 
    });

    // Get visits by this volunteer
    const visits = await Visit.find({ 
      volunteerId,
      isDeleted: false 
    })
    .populate('childId', 'name dob gender')
    .sort({ visitDate: -1 });

    // Count visits per month for last 6 months
    const visitsByMonth = {};
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'long' });
      visitsByMonth[monthName] = visits.filter(v => {
        const visitDate = new Date(v.visitDate);
        return visitDate.getMonth() === month.getMonth() && 
               visitDate.getFullYear() === month.getFullYear();
      }).length;
    }

    // Calculate milestones assessed by this volunteer
    const milestoneIds = visits.flatMap(v => 
      v.milestonesAssessed ? v.milestonesAssessed.map(m => m.milestoneId) : []
    );
    
    const assessedMilestones = await Milestone.find({
      _id: { $in: milestoneIds },
      isDeleted: false
    });

    // Generate the report
    const report = {
      volunteer: {
        _id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        ...volunteer.volunteerProfile
      },
      stats: {
        assignedChildren: assignedChildren.length,
        totalVisits: visits.length,
        totalHours: visits.reduce((sum, visit) => sum + (visit.duration || 0) / 60, 0),
        visitsByMonth,
        milestonesAssessed: assessedMilestones.length,
        milestonesAchieved: assessedMilestones.filter(m => m.status === 'Achieved').length
      },
      assignedChildren,
      recentVisits: visits.slice(0, 10)
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Helper function to calculate age-appropriate progress
function calculateAgeAppropriateProgress(child, milestones) {
  // Calculate child's age in months
  const birthDate = new Date(child.dob);
  const today = new Date();
  const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                      (today.getMonth() - birthDate.getMonth());
  
  // Define expected milestones by age range
  const expectedMilestones = {
    // 0-12 months
    infant: {
      Motor: 5,
      Cognitive: 4,
      Language: 3,
      Social: 3,
      Emotional: 2,
      Total: 17
    },
    // 12-36 months
    toddler: {
      Motor: 6,
      Cognitive: 5,
      Language: 6,
      Social: 4,
      Emotional: 4,
      Total: 25
    },
    // 36-60 months
    preschool: {
      Motor: 5,
      Cognitive: 6,
      Language: 7,
      Social: 5,
      Emotional: 5,
      Total: 28
    },
    // 60+ months
    school: {
      Motor: 4,
      Cognitive: 8,
      Language: 8,
      Social: 6,
      Emotional: 6,
      Total: 32
    }
  };

  // Determine child's developmental stage
  let stage;
  if (ageInMonths <= 12) {
    stage = 'infant';
  } else if (ageInMonths <= 36) {
    stage = 'toddler';
  } else if (ageInMonths <= 60) {
    stage = 'preschool';
  } else {
    stage = 'school';
  }

  // Count achieved milestones by domain
  const achievedByDomain = {};
  domains = ['Motor', 'Cognitive', 'Language', 'Social', 'Emotional'];
  domains.forEach(domain => {
    achievedByDomain[domain] = milestones.filter(m => 
      m.domain === domain && m.status === 'Achieved'
    ).length;
  });

  // Calculate progress percentage by domain
  const progress = {};
  let totalAchieved = 0;
  let totalExpected = 0;

  domains.forEach(domain => {
    const expected = expectedMilestones[stage][domain];
    const achieved = achievedByDomain[domain];
    progress[domain] = {
      achieved,
      expected,
      percentage: Math.min(100, Math.round((achieved / expected) * 100))
    };
    totalAchieved += achieved;
    totalExpected += expected;
  });

  // Add overall progress
  progress.Overall = {
    achieved: totalAchieved,
    expected: expectedMilestones[stage].Total,
    percentage: Math.min(100, Math.round((totalAchieved / expectedMilestones[stage].Total) * 100))
  };

  return {
    ageInMonths,
    developmentalStage: stage,
    progress
  };
}
