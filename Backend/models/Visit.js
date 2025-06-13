const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Volunteer ID is required']
    },
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: [true, 'Child ID is required']
    },
    visitDate: {
      type: Date,
      required: [true, 'Visit date is required'],
      default: Date.now
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, 'Visit duration is required']
    },
    location: {
      type: String,
      enum: ['Home', 'Center', 'School', 'Other'],
      required: [true, 'Visit location is required']
    },
    locationDetails: String,
    activitiesConducted: [{
      title: String,
      description: String,
      domain: {
        type: String,
        enum: ['Motor', 'Cognitive', 'Language', 'Social', 'Emotional', 'Other']
      },
      outcome: String,
      duration: Number // in minutes
    }],
    milestonesAssessed: [{
      milestoneId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone'
      },
      status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Achieved', 'Concern']
      },
      notes: String
    }],
    childObservations: {
      mood: {
        type: String,
        enum: ['Happy', 'Engaged', 'Tired', 'Unwell', 'Distressed', 'Other']
      },
      participation: {
        type: String,
        enum: ['Enthusiastic', 'Active', 'Passive', 'Reluctant', 'Refusing']
      },
      notes: String
    },
    parentInteraction: {
      present: {
        type: Boolean,
        default: false
      },
      participation: {
        type: String,
        enum: ['Active', 'Observing', 'Minimal', 'None', 'N/A']
      },
      feedback: String
    },
    homeEnvironment: {
      appropriateSpace: Boolean,
      learningMaterials: Boolean,
      notes: String
    },
    followUpNeeded: {
      type: Boolean,
      default: false
    },
    followUpReason: String,
    followUpAction: String,
    notes: String,
    photos: [String],
    isDeleted: {
      type: Boolean,
      default: false
    },
    statusUpdates: [{
      status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']
      },
      reason: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

const Visit = mongoose.model('Visit', visitSchema);

module.exports = Visit;
