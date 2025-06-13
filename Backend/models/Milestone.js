const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: [true, 'Child ID is required']
    },
    domain: {
      type: String,
      enum: ['Motor', 'Cognitive', 'Language', 'Social', 'Emotional', 'Other'],
      required: [true, 'Development domain is required']
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required']
    },
    description: String,
    expectedAgeRange: {
      min: Number, // in months
      max: Number  // in months
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Achieved', 'Concern'],
      default: 'Not Started'
    },
    achievedDate: Date,
    notes: String,
    mediaURL: [String],
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assessor ID is required']
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    activities: [{
      title: String,
      description: String,
      completed: {
        type: Boolean,
        default: false
      },
      completedDate: Date
    }]
  },
  {
    timestamps: true
  }
);

// Index for faster queries on childId
milestoneSchema.index({ childId: 1, domain: 1, status: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = Milestone;
