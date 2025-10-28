import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { param, query } from 'express-validator';
import {
  getAllBadges,
  getUserBadges,
  getUserBadgeProgress,
  toggleBadgeDisplay,
  checkUserBadges,
  getDetailedBadgeProgress
} from '../controllers/badgeController.js';

const router = express.Router();

// Validation rules
const userIdValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID')
];

const badgeIdValidation = [
  param('badgeId')
    .isInt({ min: 1 })
    .withMessage('Invalid badge ID')
];

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

const badgeFilterValidation = [
  query('type')
    .optional()
    .isIn(['skill_sharing', 'community_engagement', 'learning_achievement', 'mentorship', 'consistency', 'special'])
    .withMessage('Invalid badge type'),
  query('rarity')
    .optional()
    .isIn(['common', 'uncommon', 'rare', 'epic', 'legendary'])
    .withMessage('Invalid rarity level')
];

// Routes

// Get all available badges
router.get('/',
  paginationValidation,
  badgeFilterValidation,
  validateRequest,
  getAllBadges
);

// Get user's badges
router.get('/user/:userId',
  userIdValidation,
  validateRequest,
  getUserBadges
);

// Get current user's badges (authenticated)
router.get('/my-badges',
  authenticateToken,
  getUserBadges
);

// Get user's badge progress
router.get('/user/:userId/progress',
  authenticateToken,
  userIdValidation,
  validateRequest,
  getUserBadgeProgress
);

// Check and award badges for a user
router.post('/user/:userId/check',
  authenticateToken,
  userIdValidation,
  validateRequest,
  checkUserBadges
);

// Check badges for current user
router.post('/check',
  authenticateToken,
  checkUserBadges
);

// Get detailed badge progress
router.get('/user/:userId/detailed-progress',
  authenticateToken,
  userIdValidation,
  validateRequest,
  getDetailedBadgeProgress
);

// Get detailed progress for current user
router.get('/detailed-progress',
  authenticateToken,
  getDetailedBadgeProgress
);

// Toggle badge display on profile
router.put('/user/:userId/badge/:badgeId/toggle-display',
  authenticateToken,
  userIdValidation,
  badgeIdValidation,
  validateRequest,
  toggleBadgeDisplay
);

export default router;
