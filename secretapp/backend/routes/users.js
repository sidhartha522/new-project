const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { auth, profileOwnership, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users/profile/:id
 * @desc    Get user profile by ID
 * @access  Public/Private (depends on privacy settings)
 */
router.get('/profile/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user?.id;

    const user = await User.findById(id)
      .populate('connections.userId', 'firstName lastName profilePicture headline')
      .populate('followers', 'firstName lastName profilePicture headline')
      .populate('following', 'firstName lastName profilePicture headline')
      .select('-password -passwordResetToken -emailVerificationToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check privacy settings
    if (user.privacySettings.profileVisibility === 'private' && 
        (!requesterId || requesterId !== id)) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    if (user.privacySettings.profileVisibility === 'connections' && 
        requesterId && requesterId !== id) {
      const isConnected = user.connections.some(conn => 
        conn.userId._id.toString() === requesterId && conn.status === 'accepted'
      );
      
      if (!isConnected) {
        return res.status(403).json({
          success: false,
          message: 'This profile is only visible to connections'
        });
      }
    }

    // Track profile view if different user
    if (requesterId && requesterId !== id) {
      const existingView = user.profileViews.viewers.find(
        viewer => viewer.userId.toString() === requesterId
      );
      
      if (!existingView) {
        user.profileViews.count += 1;
        user.profileViews.viewers.push({
          userId: requesterId,
          viewedAt: new Date()
        });
        await user.save();
      }
    }

    // Remove sensitive information based on privacy settings
    const userResponse = user.toObject();
    if (!user.privacySettings.contactInfoVisible && requesterId !== id) {
      delete userResponse.phoneNumber;
      delete userResponse.email;
    }

    res.json({
      success: true,
      user: userResponse,
      profileCompletion: user.getProfileCompletion()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('headline')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Headline must be maximum 120 characters'),
  body('about')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('About section must be maximum 2000 characters'),
  body('profileTypes')
    .optional()
    .isArray({ min: 1, max: 3 })
    .withMessage('Please select 1-3 profile types')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const updates = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'firstName', 'lastName', 'headline', 'about', 'profilePicture', 
      'coverPhoto', 'profileTypes', 'profileTypeData', 'skills', 
      'education', 'experience', 'location', 'phoneNumber', 'privacySettings'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse,
      profileCompletion: user.getProfileCompletion()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/users/search
 * @desc    Search users
 * @access  Public
 */
router.get('/search', [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('profileType')
    .optional()
    .isIn(['Manufacturer', 'Retailer', 'Distributor', 'Contract Manufacturer', 'Student', 'Entrepreneur', 'Service Provider'])
    .withMessage('Invalid profile type'),
  query('location')
    .optional()
    .trim(),
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

    const { q, profileType, location, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = {
      $and: [
        {
          $or: [
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
            { headline: { $regex: q, $options: 'i' } },
            { 'skills.name': { $regex: q, $options: 'i' } }
          ]
        },
        { 'privacySettings.profileVisibility': { $ne: 'private' } }
      ]
    };

    // Add filters
    if (profileType) {
      searchQuery.$and.push({ profileTypes: profileType });
    }

    if (location) {
      searchQuery.$and.push({
        $or: [
          { 'location.city': { $regex: location, $options: 'i' } },
          { 'location.state': { $regex: location, $options: 'i' } },
          { 'location.country': { $regex: location, $options: 'i' } }
        ]
      });
    }

    const users = await User.find(searchQuery)
      .select('firstName lastName profilePicture headline location profileTypes')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ lastActive: -1 });

    const total = await User.countDocuments(searchQuery);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/users/suggestions
 * @desc    Get user suggestions for connections
 * @access  Private
 */
router.get('/suggestions', auth, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const connectedUserIds = user.connections
      .filter(conn => conn.status === 'accepted')
      .map(conn => conn.userId);
    
    // Exclude self and already connected users
    const excludeIds = [user._id, ...connectedUserIds];

    // Find users with similar profile types or location
    const suggestions = await User.find({
      _id: { $nin: excludeIds },
      $or: [
        { profileTypes: { $in: user.profileTypes } },
        { 'location.city': user.location.city },
        { 'skills.name': { $in: user.skills.map(s => s.name) } }
      ],
      'privacySettings.profileVisibility': { $ne: 'private' }
    })
    .select('firstName lastName profilePicture headline location profileTypes')
    .limit(parseInt(limit))
    .sort({ lastActive: -1 });

    res.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/users/endorse-skill
 * @desc    Endorse a user's skill
 * @access  Private
 */
router.post('/endorse-skill', auth, [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('skillName')
    .notEmpty()
    .withMessage('Skill name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId, skillName } = req.body;
    const endorserId = req.user.id;

    if (userId === endorserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot endorse your own skills'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skill = user.skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if already endorsed
    const existingEndorsement = skill.endorsements.find(
      e => e.userId.toString() === endorserId
    );

    if (existingEndorsement) {
      return res.status(400).json({
        success: false,
        message: 'You have already endorsed this skill'
      });
    }

    skill.endorsements.push({
      userId: endorserId,
      endorsedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Skill endorsed successfully'
    });

  } catch (error) {
    console.error('Endorse skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/users/profile-analytics/:id
 * @desc    Get profile analytics
 * @access  Private (profile owner only)
 */
router.get('/profile-analytics/:id', auth, profileOwnership, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('profileViews.viewers.userId', 'firstName lastName profilePicture');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const analytics = {
      profileViews: {
        total: user.profileViews.count,
        thisWeek: user.profileViews.viewers.filter(
          view => view.viewedAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        recentViewers: user.profileViews.viewers
          .sort((a, b) => b.viewedAt - a.viewedAt)
          .slice(0, 10)
      },
      connections: {
        total: user.connections.filter(c => c.status === 'accepted').length,
        pending: user.connections.filter(c => c.status === 'pending').length
      },
      followers: user.followers.length,
      following: user.following.length,
      profileCompletion: user.getProfileCompletion()
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Get profile analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
