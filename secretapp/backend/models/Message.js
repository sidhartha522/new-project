const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      trim: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'voice', 'video_call', 'voice_call'],
      default: 'text'
    },
    
    // Media attachments
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'document', 'video', 'audio']
      },
      url: String,
      filename: String,
      fileSize: Number,
      mimeType: String
    }],
    
    // Message status
    readBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    deliveredTo: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      deliveredAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Message reactions
    reactions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: String,
      reactedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Message editing
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    originalContent: String,
    
    // Message deletion
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Reply to another message
    replyTo: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId
      },
      content: String,
      sender: String
    },
    
    // Forward information
    forwardedFrom: {
      originalSender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      originalMessageId: {
        type: mongoose.Schema.Types.ObjectId
      }
    },
    
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Conversation metadata
  conversationType: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  
  // Group chat specific fields
  groupInfo: {
    name: String,
    description: String,
    avatar: String,
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Conversation settings
  settings: {
    muteNotifications: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      mutedUntil: Date
    }],
    
    customNotificationSound: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      soundUrl: String
    }],
    
    backgroundColor: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      color: String
    }]
  },
  
  // Quick access
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    messageType: String
  },
  
  // Conversation status
  isArchived: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    archivedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  isPinned: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pinnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Conversation analytics
  totalMessages: {
    type: Number,
    default: 0
  },
  
  messagesByUser: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ participants: 1, 'lastMessage.timestamp': -1 });
messageSchema.index({ 'messages.sender': 1, 'messages.timestamp': -1 });
messageSchema.index({ 'messages.readBy.userId': 1 });

// Virtual for unread message count per user
messageSchema.methods.getUnreadCount = function(userId) {
  return this.messages.filter(message => {
    return message.sender.toString() !== userId.toString() && 
           !message.readBy.some(read => read.userId.toString() === userId.toString());
  }).length;
};

// Method to mark messages as read
messageSchema.methods.markAsRead = function(userId, messageIds = []) {
  const messagesToUpdate = messageIds.length > 0 
    ? this.messages.filter(msg => messageIds.includes(msg._id.toString()))
    : this.messages.filter(msg => 
        msg.sender.toString() !== userId.toString() &&
        !msg.readBy.some(read => read.userId.toString() === userId.toString())
      );
  
  messagesToUpdate.forEach(message => {
    if (!message.readBy.some(read => read.userId.toString() === userId.toString())) {
      message.readBy.push({ userId, readAt: new Date() });
    }
  });
  
  return this.save();
};

// Method to add a new message
messageSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.lastMessage = {
    content: messageData.content,
    sender: messageData.sender,
    timestamp: messageData.timestamp || new Date(),
    messageType: messageData.messageType || 'text'
  };
  this.totalMessages = this.messages.length;
  
  // Update message count by user
  const userMessageCount = this.messagesByUser.find(
    item => item.userId.toString() === messageData.sender.toString()
  );
  
  if (userMessageCount) {
    userMessageCount.count += 1;
  } else {
    this.messagesByUser.push({
      userId: messageData.sender,
      count: 1
    });
  }
  
  return this.save();
};

// Method to check if user is participant
messageSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => 
    participant.toString() === userId.toString()
  );
};

// Method to get other participants (excluding current user)
messageSchema.methods.getOtherParticipants = function(userId) {
  return this.participants.filter(participant => 
    participant.toString() !== userId.toString()
  );
};

// Pre-save middleware to update message counts
messageSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.totalMessages = this.messages.length;
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);
