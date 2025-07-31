import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import {
  getPersonalizedRecommendations,
  getSkillBasedRecommendations,
  getTrendingRecommendations,
  trackRecommendationInteraction,
  getRecommendationAnalytics,
  submitRecommendationFeedback
} from '../controllers/recommendationController.js';

const router = express.Router();

// Validation middleware for pagination
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Validation for recommendation filters
const recommendationFilters = [
  query('skillFilter')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Skill filter must be between 1 and 100 characters'),
  query('experienceLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Experience level must be beginner, intermediate, advanced, or expert'),
  query('meetingType')
    .optional()
    .isIn(['online', 'offline', 'both'])
    .withMessage('Meeting type must be online, offline, or both')
];

// Get personalized recommendations for the current user
router.get('/personalized',
  authenticateToken,
  paginationValidation,
  recommendationFilters,
  validateRequest,
  getPersonalizedRecommendations
);

// Get skill-based recommendations for a specific skill
router.get('/skill/:skill',
  authenticateToken,
  param('skill')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Skill must be between 1 and 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20'),
  validateRequest,
  getSkillBasedRecommendations
);

// Get trending skills and popular posts
router.get('/trending',
  authenticateToken,
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20'),
  validateRequest,
  getTrendingRecommendations
);

// Track recommendation interaction (for analytics and improving recommendations)
router.post('/track',
  authenticateToken,
  body('postId')
    .isInt({ min: 1 })
    .withMessage('Post ID must be a positive integer'),
  body('action')
    .isIn(['view', 'click', 'contact', 'like', 'connection_request'])
    .withMessage('Action must be view, click, contact, like, or connection_request'),
  body('matchScore')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Match score must be between 0 and 1'),
  body('recommendationType')
    .optional()
    .isIn(['personalized', 'skill_based', 'trending'])
    .withMessage('Recommendation type must be personalized, skill_based, or trending'),
  validateRequest,
  trackRecommendationInteraction
);

// Get recommendation analytics (admin only)
router.get('/analytics',
  authenticateToken,
  query('timeframe')
    .optional()
    .isIn(['7d', '30d', '90d'])
    .withMessage('Timeframe must be 7d, 30d, or 90d'),
  query('action')
    .optional()
    .isIn(['view', 'click', 'contact', 'like', 'connection_request'])
    .withMessage('Action must be view, click, contact, like, or connection_request'),
  validateRequest,
  getRecommendationAnalytics
);

// Submit feedback for a recommendation
router.post('/feedback',
  authenticateToken,
  body('postId')
    .isInt({ min: 1 })
    .withMessage('Post ID must be a positive integer'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters'),
  validateRequest,
  submitRecommendationFeedback
);

export default router;
