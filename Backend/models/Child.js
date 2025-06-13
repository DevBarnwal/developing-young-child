const mongoose = require('mongoose');

const childSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide child name']
    },
    dob: {
      type: Date,
      required: [true, 'Please provide date of birth']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Please provide gender']
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide parent ID']
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    healthInfo: {
      bloodGroup: String,
      allergies: [String],
      conditions: [String],
      medications: [String]
    },
    educationLevel: {
      type: String,
      enum: ['None', 'Preschool', 'Elementary', 'Special Education', 'Other']
    },
    developmentalMilestones: [
      {
        domain: {
          type: String,
          enum: ['Motor', 'Cognitive', 'Language', 'Social', 'Emotional', 'Other']
        },
        milestone: {
          type: String,
          required: true
        },
        achievedDate: Date,
        status: {
          type: String,
          enum: ['Not Started', 'In Progress', 'Achieved', 'Concern'],
          default: 'Not Started'
        },
        notes: String,
        assessedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ],
    preferredLanguage: {
      type: String,
      default: 'English'
    },
    specialNeeds: [String],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    lastVisitDate: Date,
    notes: [
      {
        content: String,
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Pre-save middleware to calculate age automatically
childSchema.pre('save', function(next) {
  if (this.dob) {
    const dobDate = new Date(this.dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (
      today.getMonth() < dobDate.getMonth() ||
      (today.getMonth() === dobDate.getMonth() && today.getDate() < dobDate.getDate())
    ) {
      age--;
    }
    
    this.age = age;
  }
  next();
});

// Virtual for age calculation
childSchema.virtual('age').get(function() {
  if (!this.dob) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  
  return age;
});

// Enable virtuals when converting to JSON
childSchema.set('toJSON', { virtuals: true });
childSchema.set('toObject', { virtuals: true });

const Child = mongoose.model('Child', childSchema);

module.exports = Child;