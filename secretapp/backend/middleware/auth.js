const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies JWT token and adds user to request object
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists'
      });
    }

    // Add user to request object
    req.user = decoded.user;
    req.userProfile = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

/**
 * Optional auth middleware
 * Adds user to request if token is present and valid, but doesn't fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.user.id).select('-password');
      
      if (user) {
        req.user = decoded.user;
        req.userProfile = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Admin middleware
 * Checks if user has admin privileges
 */
const adminAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in admin authentication'
    });
  }
};

/**
 * Profile ownership middleware
 * Checks if the authenticated user owns the profile or is an admin
 */
const profileOwnership = async (req, res, next) => {
  try {
    const profileId = req.params.userId || req.params.id;
    
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Check if user owns the profile or is an admin
    if (req.user.id !== profileId && !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own profile'
      });
    }

    next();
  } catch (error) {
    console.error('Profile ownership middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in profile ownership check'
    });
  }
};

/**
 * Rate limiting middleware for sensitive operations
 */
const sensitiveOperationLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.ip + req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (attempts.has(key)) {
      const userAttempts = attempts.get(key).filter(time => time > windowStart);
      attempts.set(key, userAttempts);
    }
    
    const currentAttempts = attempts.get(key) || [];
    
    if (currentAttempts.length >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.'
      });
    }
    
    currentAttempts.push(now);
    attempts.set(key, currentAttempts);
    
    next();
  };
};

module.exports = {
  auth,
  optionalAuth,
  adminAuth,
  profileOwnership,
  sensitiveOperationLimit
};
