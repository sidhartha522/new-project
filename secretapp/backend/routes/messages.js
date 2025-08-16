const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/messages/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/conversations', auth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.id;

    const conversations = await Message.find({
      participants: userId
    })
    .populate('participants', 'firstName lastName profilePicture lastActive')
    .populate('lastMessage.sender', 'firstName lastName')
    .sort({ 'lastMessage.timestamp': -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Add unread count and other participant info for each conversation
    const conversationsWithData = conversations.map(conversation => {
      const conversationObj = conversation.toObject();
      conversationObj.unreadCount = conversation.getUnreadCount(userId);
      conversationObj.otherParticipants = conversation.getOtherParticipants(userId);
      
      // Check if conversation is archived or pinned for current user
      conversationObj.isArchived = conversation.isArchived.some(
        archive => archive.userId.toString() === userId
      );
      conversationObj.isPinned = conversation.isPinned.some(
        pin => pin.userId.toString() === userId
      );
      
      return conversationObj;
    });

    const total = await Message.countDocuments({
      participants: userId
    });

    res.json({
      success: true,
      conversations: conversationsWithData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalConversations: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/messages/conversation/:conversationId
 * @desc    Get messages in a conversation
 * @access  Private
 */
router.get('/conversation/:conversationId', auth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    const conversation = await Message.findById(conversationId)
      .populate('participants', 'firstName lastName profilePicture')
      .populate('messages.sender', 'firstName lastName profilePicture')
      .populate('messages.reactions.userId', 'firstName lastName');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get paginated messages (latest first)
    const totalMessages = conversation.messages.length;
    const startIndex = Math.max(0, totalMessages - (page * limit));
    const endIndex = Math.max(0, totalMessages - ((page - 1) * limit));
    
    const messages = conversation.messages
      .slice(startIndex, endIndex)
      .reverse(); // Show oldest to newest in the page

    // Mark messages as read
    await conversation.markAsRead(userId);

    res.json({
      success: true,
      conversation: {
        _id: conversation._id,
        participants: conversation.participants,
        conversationType: conversation.conversationType,
        groupInfo: conversation.groupInfo,
        createdAt: conversation.createdAt
      },
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNextPage: startIndex > 0,
        hasPrevPage: endIndex < totalMessages
      }
    });

  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/messages/send
 * @desc    Send a message
 * @access  Private
 */
router.post('/send', auth, [
  body('recipientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  body('conversationId')
    .optional()
    .isMongoId()
    .withMessage('Invalid conversation ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message content must be between 1 and 5000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'voice'])
    .withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { recipientId, conversationId, content, messageType = 'text', attachments, replyTo } = req.body;
    const senderId = req.user.id;

    let conversation;

    if (conversationId) {
      // Existing conversation
      conversation = await Message.findById(conversationId);
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      if (!conversation.isParticipant(senderId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (recipientId) {
      // New conversation or find existing one
      const recipient = await User.findById(recipientId);
      
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Recipient not found'
        });
      }

      if (recipientId === senderId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot send a message to yourself'
        });
      }

      // Check if sender can message recipient
      const sender = await User.findById(senderId);
      if (!sender.canMessage(recipient)) {
        return res.status(403).json({
          success: false,
          message: 'You are not allowed to message this user'
        });
      }

      // Find existing conversation between users
      conversation = await Message.findOne({
        participants: { $all: [senderId, recipientId] },
        conversationType: 'direct'
      });

      if (!conversation) {
        // Create new conversation
        conversation = new Message({
          participants: [senderId, recipientId],
          conversationType: 'direct',
          messages: [],
          totalMessages: 0
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either recipientId or conversationId is required'
      });
    }

    // Create new message
    const newMessage = {
      sender: senderId,
      content,
      messageType,
      attachments: attachments || [],
      replyTo,
      timestamp: new Date()
    };

    // Add message to conversation
    await conversation.addMessage(newMessage);
    await conversation.populate('messages.sender', 'firstName lastName profilePicture');

    const addedMessage = conversation.messages[conversation.messages.length - 1];

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      conversationId: conversation._id,
      messageData: addedMessage
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/messages/mark-read
 * @desc    Mark messages as read
 * @access  Private
 */
router.post('/mark-read', auth, [
  body('conversationId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid conversation ID is required'),
  body('messageIds')
    .optional()
    .isArray()
    .withMessage('Message IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { conversationId, messageIds = [] } = req.body;
    const userId = req.user.id;

    const conversation = await Message.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await conversation.markAsRead(userId, messageIds);

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/messages/react
 * @desc    Add or remove reaction to a message
 * @access  Private
 */
router.post('/react', auth, [
  body('conversationId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid conversation ID is required'),
  body('messageId')
    .notEmpty()
    .withMessage('Message ID is required'),
  body('emoji')
    .notEmpty()
    .withMessage('Emoji is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { conversationId, messageId, emoji } = req.body;
    const userId = req.user.id;

    const conversation = await Message.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const message = conversation.messages.id(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      reaction => reaction.userId.toString() === userId && reaction.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter(
        reaction => !(reaction.userId.toString() === userId && reaction.emoji === emoji)
      );
    } else {
      // Add reaction
      message.reactions.push({
        userId,
        emoji,
        reactedAt: new Date()
      });
    }

    await conversation.save();

    res.json({
      success: true,
      message: existingReaction ? 'Reaction removed' : 'Reaction added'
    });

  } catch (error) {
    console.error('React to message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/messages/archive
 * @desc    Archive or unarchive a conversation
 * @access  Private
 */
router.post('/archive', auth, [
  body('conversationId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid conversation ID is required'),
  body('archive')
    .isBoolean()
    .withMessage('Archive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { conversationId, archive } = req.body;
    const userId = req.user.id;

    const conversation = await Message.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (archive) {
      // Archive conversation
      const existingArchive = conversation.isArchived.find(
        archive => archive.userId.toString() === userId
      );

      if (!existingArchive) {
        conversation.isArchived.push({
          userId,
          archivedAt: new Date()
        });
      }
    } else {
      // Unarchive conversation
      conversation.isArchived = conversation.isArchived.filter(
        archive => archive.userId.toString() !== userId
      );
    }

    await conversation.save();

    res.json({
      success: true,
      message: archive ? 'Conversation archived' : 'Conversation unarchived'
    });

  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
router.delete('/:messageId', auth, [
  body('conversationId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid conversation ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { messageId } = req.params;
    const { conversationId } = req.body;
    const userId = req.user.id;

    const conversation = await Message.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const message = conversation.messages.id(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Mark message as deleted instead of removing it
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = userId;
    message.content = 'This message was deleted';

    await conversation.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
