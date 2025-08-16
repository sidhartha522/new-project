const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', auth, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 3000 })
    .withMessage('Post content must be between 1 and 3000 characters'),
  body('visibility')
    .optional()
    .isIn(['public', 'connections', 'private'])
    .withMessage('Invalid visibility setting'),
  body('postType')
    .optional()
    .isIn(['text', 'image', 'video', 'article', 'poll', 'event'])
    .withMessage('Invalid post type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      content,
      media,
      visibility = 'public',
      postType = 'text',
      article,
      poll,
      event,
      allowComments = true,
      allowShares = true
    } = req.body;

    const post = new Post({
      author: req.user.id,
      content,
      media: media || {},
      visibility,
      postType,
      article,
      poll,
      event,
      allowComments,
      allowShares
    });

    await post.save();
    await post.populate('author', 'firstName lastName profilePicture headline');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/posts/feed
 * @desc    Get user's personalized feed
 * @access  Private
 */
router.get('/feed', auth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get connected user IDs for personalized feed
    const connectedUserIds = user.connections
      .filter(conn => conn.status === 'accepted')
      .map(conn => conn.userId);
    
    const followingIds = user.following;
    const relevantUserIds = [...new Set([...connectedUserIds, ...followingIds, user._id])];

    // Build query for feed posts
    const feedQuery = {
      $or: [
        // Posts from connected users and following
        {
          author: { $in: relevantUserIds },
          visibility: { $in: ['public', 'connections'] }
        },
        // Public posts from users with similar profile types
        {
          visibility: 'public',
          author: { $ne: user._id }
        }
      ],
      moderationStatus: 'active'
    };

    const posts = await Post.find(feedQuery)
      .populate('author', 'firstName lastName profilePicture headline profileTypes')
      .populate('comments.userId', 'firstName lastName profilePicture')
      .populate('likes.userId', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add engagement data for current user
    const postsWithEngagement = posts.map(post => {
      const postObj = post.toObject();
      postObj.isLikedByUser = post.isLikedBy(user._id);
      postObj.isSharedByUser = post.isSharedBy(user._id);
      postObj.likeCount = post.likeCount;
      postObj.commentCount = post.commentCount;
      postObj.shareCount = post.shareCount;
      return postObj;
    });

    const total = await Post.countDocuments(feedQuery);

    res.json({
      success: true,
      posts: postsWithEngagement,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/posts/:id
 * @desc    Get a specific post
 * @access  Public/Private (depends on visibility)
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName profilePicture headline')
      .populate('comments.userId', 'firstName lastName profilePicture')
      .populate('likes.userId', 'firstName lastName profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can view this post
    if (post.visibility === 'private' && 
        (!req.user || req.user.id !== post.author._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'This post is private'
      });
    }

    if (post.visibility === 'connections' && req.user) {
      const author = await User.findById(post.author._id);
      const isConnected = author.connections.some(conn => 
        conn.userId.toString() === req.user.id && conn.status === 'accepted'
      );
      
      if (!isConnected && req.user.id !== post.author._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'This post is only visible to connections'
        });
      }
    }

    // Track view if user is authenticated and not the author
    if (req.user && req.user.id !== post.author._id.toString()) {
      const existingView = post.views.viewers.find(
        viewer => viewer.userId.toString() === req.user.id
      );
      
      if (!existingView) {
        post.views.count += 1;
        post.views.viewers.push({
          userId: req.user.id,
          viewedAt: new Date()
        });
        await post.save();
      }
    }

    const postObj = post.toObject();
    if (req.user) {
      postObj.isLikedByUser = post.isLikedBy(req.user.id);
      postObj.isSharedByUser = post.isSharedBy(req.user.id);
    }
    postObj.likeCount = post.likeCount;
    postObj.commentCount = post.commentCount;
    postObj.shareCount = post.shareCount;

    res.json({
      success: true,
      post: postObj
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/posts/:id/like
 * @desc    Like/unlike a post
 * @access  Private
 */
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingLike = post.likes.find(
      like => like.userId.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike the post
      post.likes = post.likes.filter(
        like => like.userId.toString() !== req.user.id
      );
      await post.save();
      
      res.json({
        success: true,
        message: 'Post unliked',
        liked: false,
        likeCount: post.likeCount
      });
    } else {
      // Like the post
      post.likes.push({
        userId: req.user.id,
        likedAt: new Date()
      });
      await post.save();
      
      res.json({
        success: true,
        message: 'Post liked',
        liked: true,
        likeCount: post.likeCount
      });
    }

  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/posts/:id/comment
 * @desc    Add a comment to a post
 * @access  Private
 */
router.post('/:id/comment', auth, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (!post.allowComments) {
      return res.status(403).json({
        success: false,
        message: 'Comments are disabled for this post'
      });
    }

    const newComment = {
      userId: req.user.id,
      content: req.body.content,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();
    
    await post.populate('comments.userId', 'firstName lastName profilePicture');

    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: addedComment,
      commentCount: post.commentCount
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/posts/:id/share
 * @desc    Share a post
 * @access  Private
 */
router.post('/:id/share', auth, [
  body('shareComment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Share comment must be maximum 500 characters'),
  body('shareType')
    .optional()
    .isIn(['direct', 'with_comment'])
    .withMessage('Invalid share type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (!post.allowShares) {
      return res.status(403).json({
        success: false,
        message: 'Sharing is disabled for this post'
      });
    }

    const { shareComment, shareType = 'direct' } = req.body;

    // Check if already shared
    const existingShare = post.shares.find(
      share => share.userId.toString() === req.user.id
    );

    if (existingShare) {
      return res.status(400).json({
        success: false,
        message: 'You have already shared this post'
      });
    }

    post.shares.push({
      userId: req.user.id,
      shareType,
      shareComment,
      sharedAt: new Date()
    });

    await post.save();

    res.json({
      success: true,
      message: 'Post shared successfully',
      shareCount: post.shareCount
    });

  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private (author only)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/posts/user/:userId
 * @desc    Get posts by a specific user
 * @access  Public/Private (depends on privacy settings)
 */
router.get('/user/:userId', optionalAuth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Check user privacy settings
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Determine post visibility based on relationship
    let visibilityFilter = ['public'];
    
    if (req.user && req.user.id === userId) {
      // Own posts - show all
      visibilityFilter = ['public', 'connections', 'private'];
    } else if (req.user) {
      // Check if connected
      const isConnected = user.connections.some(conn => 
        conn.userId.toString() === req.user.id && conn.status === 'accepted'
      );
      
      if (isConnected) {
        visibilityFilter = ['public', 'connections'];
      }
    }

    const posts = await Post.find({
      author: userId,
      visibility: { $in: visibilityFilter },
      moderationStatus: 'active'
    })
    .populate('author', 'firstName lastName profilePicture headline')
    .populate('comments.userId', 'firstName lastName profilePicture')
    .populate('likes.userId', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Post.countDocuments({
      author: userId,
      visibility: { $in: visibilityFilter },
      moderationStatus: 'active'
    });

    const postsWithEngagement = posts.map(post => {
      const postObj = post.toObject();
      if (req.user) {
        postObj.isLikedByUser = post.isLikedBy(req.user.id);
        postObj.isSharedByUser = post.isSharedBy(req.user.id);
      }
      postObj.likeCount = post.likeCount;
      postObj.commentCount = post.commentCount;
      postObj.shareCount = post.shareCount;
      return postObj;
    });

    res.json({
      success: true,
      posts: postsWithEngagement,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
