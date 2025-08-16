const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/connections/send-request
 * @desc    Send a connection request
 * @access  Private
 */
router.post('/send-request', auth, [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId } = req.body;
    const requesterId = req.user.id;

    if (userId === requesterId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a connection request to yourself'
      });
    }

    const [requester, recipient] = await Promise.all([
      User.findById(requesterId),
      User.findById(userId)
    ]);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if connection already exists
    const existingConnection = requester.connections.find(
      conn => conn.userId.toString() === userId
    );

    if (existingConnection) {
      const status = existingConnection.status;
      if (status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'You are already connected to this user'
        });
      } else if (status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Connection request already sent'
        });
      }
    }

    // Add connection request to both users
    requester.connections.push({
      userId: userId,
      status: 'pending',
      connectedAt: new Date()
    });

    recipient.connections.push({
      userId: requesterId,
      status: 'pending',
      connectedAt: new Date()
    });

    await Promise.all([requester.save(), recipient.save()]);

    res.json({
      success: true,
      message: 'Connection request sent successfully'
    });

  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/connections/respond-request
 * @desc    Accept or decline a connection request
 * @access  Private
 */
router.post('/respond-request', auth, [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('action')
    .isIn(['accept', 'decline'])
    .withMessage('Action must be either accept or decline')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId, action } = req.body;
    const recipientId = req.user.id;

    const [recipient, requester] = await Promise.all([
      User.findById(recipientId),
      User.findById(userId)
    ]);

    if (!requester) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the connection request
    const recipientConnection = recipient.connections.find(
      conn => conn.userId.toString() === userId && conn.status === 'pending'
    );

    const requesterConnection = requester.connections.find(
      conn => conn.userId.toString() === recipientId && conn.status === 'pending'
    );

    if (!recipientConnection || !requesterConnection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    if (action === 'accept') {
      // Accept the connection
      recipientConnection.status = 'accepted';
      requesterConnection.status = 'accepted';
      
      await Promise.all([recipient.save(), requester.save()]);

      res.json({
        success: true,
        message: 'Connection request accepted'
      });
    } else {
      // Decline the connection - remove from both users
      recipient.connections = recipient.connections.filter(
        conn => !(conn.userId.toString() === userId && conn.status === 'pending')
      );
      
      requester.connections = requester.connections.filter(
        conn => !(conn.userId.toString() === recipientId && conn.status === 'pending')
      );

      await Promise.all([recipient.save(), requester.save()]);

      res.json({
        success: true,
        message: 'Connection request declined'
      });
    }

  } catch (error) {
    console.error('Respond to connection request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/connections
 * @desc    Get user's connections
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { status = 'accepted' } = req.query;
    
    const user = await User.findById(req.user.id)
      .populate({
        path: 'connections.userId',
        select: 'firstName lastName profilePicture headline location profileTypes lastActive'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const filteredConnections = user.connections
      .filter(conn => conn.status === status)
      .map(conn => ({
        _id: conn._id,
        user: conn.userId,
        status: conn.status,
        connectedAt: conn.connectedAt
      }))
      .sort((a, b) => b.connectedAt - a.connectedAt);

    res.json({
      success: true,
      connections: filteredConnections,
      total: filteredConnections.length
    });

  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/connections/requests
 * @desc    Get pending connection requests
 * @access  Private
 */
router.get('/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'connections.userId',
        select: 'firstName lastName profilePicture headline location profileTypes'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const pendingRequests = user.connections
      .filter(conn => conn.status === 'pending')
      .map(conn => ({
        _id: conn._id,
        user: conn.userId,
        requestedAt: conn.connectedAt
      }))
      .sort((a, b) => b.requestedAt - a.requestedAt);

    res.json({
      success: true,
      requests: pendingRequests,
      total: pendingRequests.length
    });

  } catch (error) {
    console.error('Get connection requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/connections/:userId
 * @desc    Remove a connection
 * @access  Private
 */
router.delete('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const [currentUser, otherUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove connection from both users
    currentUser.connections = currentUser.connections.filter(
      conn => conn.userId.toString() !== userId
    );

    otherUser.connections = otherUser.connections.filter(
      conn => conn.userId.toString() !== currentUserId
    );

    await Promise.all([currentUser.save(), otherUser.save()]);

    res.json({
      success: true,
      message: 'Connection removed successfully'
    });

  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/connections/follow
 * @desc    Follow a user
 * @access  Private
 */
router.post('/follow', auth, [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId } = req.body;
    const followerId = req.user.id;

    if (userId === followerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const [follower, following] = await Promise.all([
      User.findById(followerId),
      User.findById(userId)
    ]);

    if (!following) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const isAlreadyFollowing = follower.following.includes(userId);
    const isAlreadyFollower = following.followers.includes(followerId);

    if (isAlreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Add to following/followers lists
    follower.following.push(userId);
    following.followers.push(followerId);

    await Promise.all([follower.save(), following.save()]);

    res.json({
      success: true,
      message: 'User followed successfully'
    });

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/connections/unfollow
 * @desc    Unfollow a user
 * @access  Private
 */
router.post('/unfollow', auth, [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId } = req.body;
    const followerId = req.user.id;

    const [follower, following] = await Promise.all([
      User.findById(followerId),
      User.findById(userId)
    ]);

    if (!following) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove from following/followers lists
    follower.following = follower.following.filter(
      id => id.toString() !== userId
    );
    
    following.followers = following.followers.filter(
      id => id.toString() !== followerId
    );

    await Promise.all([follower.save(), following.save()]);

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });

  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/connections/mutual/:userId
 * @desc    Get mutual connections with another user
 * @access  Private
 */
router.get('/mutual/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const [currentUser, otherUser] = await Promise.all([
      User.findById(currentUserId).populate('connections.userId', 'firstName lastName profilePicture'),
      User.findById(userId).populate('connections.userId', 'firstName lastName profilePicture')
    ]);

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get accepted connections for both users
    const currentUserConnections = currentUser.connections
      .filter(conn => conn.status === 'accepted')
      .map(conn => conn.userId._id.toString());

    const otherUserConnections = otherUser.connections
      .filter(conn => conn.status === 'accepted')
      .map(conn => conn.userId._id.toString());

    // Find mutual connections
    const mutualConnectionIds = currentUserConnections.filter(
      id => otherUserConnections.includes(id)
    );

    const mutualConnections = currentUser.connections
      .filter(conn => 
        conn.status === 'accepted' && 
        mutualConnectionIds.includes(conn.userId._id.toString())
      )
      .map(conn => conn.userId);

    res.json({
      success: true,
      mutualConnections,
      total: mutualConnections.length
    });

  } catch (error) {
    console.error('Get mutual connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
