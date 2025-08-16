const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 120
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  
  // Location Information
  location: {
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    }
  },

  // Profile Information
  profilePicture: {
    type: String,
    default: null
  },
  coverPhoto: {
    type: String,
    default: null
  },
  headline: {
    type: String,
    maxlength: 120,
    trim: true
  },
  about: {
    type: String,
    maxlength: 2000,
    trim: true
  },

  // Profile Types (max 3)
  profileTypes: {
    type: [{
      type: String,
      enum: [
        'Manufacturer',
        'Retailer', 
        'Distributor',
        'Contract Manufacturer',
        'Student',
        'Entrepreneur',
        'Service Provider'
      ]
    }],
    validate: {
      validator: function(arr) {
        return arr.length <= 3 && arr.length > 0;
      },
      message: 'You can select 1-3 profile types maximum'
    }
  },

  // Profile Type Specific Data
  profileTypeData: {
    manufacturer: {
      productionCapacity: String,
      certifications: [String],
      productCategories: [String],
      yearsInOperation: Number
    },
    retailer: {
      storeLocations: [String],
      salesChannels: [String],
      targetMarket: String,
      annualRevenue: String
    },
    distributor: {
      coverageArea: [String],
      productCategories: [String],
      clientTypes: [String],
      logisticsCapability: String
    },
    contractManufacturer: {
      manufacturingServices: [String],
      minimumOrderQuantity: String,
      leadTime: String,
      qualityCertifications: [String]
    },
    student: {
      institution: String,
      major: String,
      graduationYear: Number,
      lookingFor: [String], // internship, job, etc.
      gpa: Number
    },
    entrepreneur: {
      companyName: String,
      companyStage: String,
      industry: String,
      fundingStatus: String,
      teamSize: Number
    },
    serviceProvider: {
      serviceCategories: [String],
      pricingModel: String,
      availability: String,
      experienceYears: Number,
      certifications: [String]
    }
  },

  // Professional Information
  skills: [{
    name: String,
    endorsements: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      endorsedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],

  education: [{
    institution: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      required: true
    },
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number,
    grade: String,
    activities: String,
    description: String
  }],

  experience: [{
    company: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    },
    location: String,
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    },
    description: String,
    skills: [String]
  }],

  // Social Features
  connections: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],

  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Privacy Settings
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public'
    },
    contactInfoVisible: {
      type: Boolean,
      default: true
    },
    lastSeenVisible: {
      type: Boolean,
      default: true
    },
    allowMessagesFrom: {
      type: String,
      enum: ['everyone', 'connections', 'none'],
      default: 'everyone'
    }
  },

  // Activity Tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  profileViews: {
    count: {
      type: Number,
      default: 0
    },
    viewers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Account Settings
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    connectionRequests: {
      type: Boolean,
      default: true
    },
    messages: {
      type: Boolean,
      default: true
    },
    postEngagement: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ 'location.city': 1, 'location.country': 1 });
userSchema.index({ profileTypes: 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ firstName: 'text', lastName: 'text', headline: 'text' });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to get profile completion percentage
userSchema.methods.getProfileCompletion = function() {
  let completedFields = 0;
  const totalFields = 10;

  if (this.profilePicture) completedFields++;
  if (this.headline) completedFields++;
  if (this.about) completedFields++;
  if (this.skills.length > 0) completedFields++;
  if (this.education.length > 0) completedFields++;
  if (this.experience.length > 0) completedFields++;
  if (this.profileTypes.length > 0) completedFields++;
  if (this.location.city && this.location.state && this.location.country) completedFields++;
  if (this.phoneNumber) completedFields++;
  if (this.isEmailVerified) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
};

// Method to check if user can message another user
userSchema.methods.canMessage = function(targetUser) {
  if (targetUser.privacySettings.allowMessagesFrom === 'everyone') {
    return true;
  }
  if (targetUser.privacySettings.allowMessagesFrom === 'connections') {
    return this.connections.some(conn => 
      conn.userId.toString() === targetUser._id.toString() && conn.status === 'accepted'
    );
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
