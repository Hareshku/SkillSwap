import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, query } from 'express-validator';
import {
  getPersonalizedRecommendations,
  trackRecommendationInteraction,
  getRecommendationAnalytics
} from '../controllers/recommendationController.js';

const router = express.Router();

// Validation rules
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

const trackInteractionValidation = [
  body('postId')
    .isInt({ min: 1 })
    .withMessage('Invalid post ID'),
  body('interactionType')
    .isIn(['view', 'click', 'contact', 'schedule', 'like', 'dismiss'])
    .withMessage('Invalid interaction type')
];

// Routes

// Get personalized recommendations for the authenticated user
router.get('/',
  authenticateToken,
  paginationValidation,
  validateRequest,
  getPersonalizedRecommendations
);

// Track user interaction with recommended posts
router.post('/track',
  authenticateToken,
  trackInteractionValidation,
  validateRequest,
  trackRecommendationInteraction
);

// Get recommendation analytics (admin only)
router.get('/analytics',
  authenticateToken,
  requireAdmin,
  getRecommendationAnalytics
);

export default router;