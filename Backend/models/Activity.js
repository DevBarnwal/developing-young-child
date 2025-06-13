const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Activity title is required']
    },
    description: {
      type: String,
      required: [true, 'Activity description is required']
    },
    domain: {
      type: String,
      enum: ['Motor', 'Cognitive', 'Language', 'Social', 'Emotional', 'Other'],
      required: [true, 'Development domain is required']
    },
    ageRange: {
      min: {
        type: Number, // in months
        required: [true, 'Minimum age is required']
      },
      max: {
        type: Number, // in months
        required: [true, 'Maximum age is required']
      }
    },
    materials: [String],
    steps: [String],
    duration: {
      type: Number, // in minutes
      default: 15
    },
    difficultyLevel: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    language: {
      type: String,
      default: 'English'
    },
    tags: [String],
    benefitsDescription: String,
    mediaURL: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required']
    },
    isApproved: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
activitySchema.index({ domain: 1, 'ageRange.min': 1, 'ageRange.max': 1, language: 1 });
activitySchema.index({ tags: 1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
