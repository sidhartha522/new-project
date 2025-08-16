const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 3000,
    trim: true
  },
  media: {
    images: [{
      url: String,
      caption: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    videos: [{
      url: String,
      caption: String,
      thumbnail: String,
      duration: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    documents: [{
      url: String,
      filename: String,
      fileType: String,
      fileSize: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  hashtags: [String],
  mentions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  }],
  
  // Engagement
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true
    },
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    replies: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: 500,
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  shares: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    shareType: {
      type: String,
      enum: ['direct', 'with_comment'],
      default: 'direct'
    },
    shareComment: String
  }],

  // Post Settings
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  
  allowComments: {
    type: Boolean,
    default: true
  },
  
  allowShares: {
    type: Boolean,
    default: true
  },

  // Post Type
  postType: {
    type: String,
    enum: ['text', 'image', 'video', 'article', 'poll', 'event'],
    default: 'text'
  },

  // Article specific fields
  article: {
    title: String,
    summary: String,
    readTime: Number, // in minutes
    coverImage: String
  },

  // Poll specific fields
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    expiresAt: Date,
    allowMultipleChoices: {
      type: Boolean,
      default: false
    }
  },

  // Event specific fields
  event: {
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    location: {
      type: String,
      address: String,
      city: String,
      country: String
    },
    eventType: {
      type: String,
      enum: ['online', 'offline', 'hybrid']
    },
    attendees: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['going', 'interested', 'not_going'],
        default: 'interested'
      },
      respondedAt: {
        type: Date,
        default: Date.now
      }
    }],
    maxAttendees: Number
  },

  // Moderation
  isReported: {
    type: Boolean,
    default: false
  },
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'inappropriate_content', 'copyright', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  moderationStatus: {
    type: String,
    enum: ['active', 'under_review', 'hidden', 'removed'],
    default: 'active'
  },

  // Analytics
  views: {
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

  // SEO and Discovery
  tags: [String], // for better searchability
  
  // Original post reference (for shares)
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  
  isShare: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ 'mentions.userId': 1 });
postSchema.index({ content: 'text', 'article.title': 'text', 'article.summary': 'text' });

// Virtual for engagement count
postSchema.virtual('engagementCount').get(function() {
  return this.likes.length + this.comments.length + this.shares.length;
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for share count
postSchema.virtual('shareCount').get(function() {
  return this.shares.length;
});

// Method to check if user has liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.userId.toString() === userId.toString());
};

// Method to check if user has shared the post
postSchema.methods.isSharedBy = function(userId) {
  return this.shares.some(share => share.userId.toString() === userId.toString());
};

// Method to get trending score (for feed algorithm)
postSchema.methods.getTrendingScore = function() {
  const now = new Date();
  const ageInHours = (now - this.createdAt) / (1000 * 60 * 60);
  const engagementScore = this.engagementCount;
  const viewScore = this.views.count / 10;
  
  // Reduce score based on age (newer posts get higher scores)
  const ageMultiplier = Math.max(0.1, 1 - (ageInHours / 24));
  
  return (engagementScore * 10 + viewScore) * ageMultiplier;
};

// Pre-save middleware to extract hashtags and mentions
postSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Extract hashtags
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const hashtags = this.content.match(hashtagRegex) || [];
    this.hashtags = [...new Set(hashtags.map(tag => tag.toLowerCase()))];
    
    // Extract mentions would be handled in the frontend/API layer
    // as it requires user validation
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
