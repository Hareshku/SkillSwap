import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import {
  createReview,
  getUserReviews,
  getUserRating,
  getReviewsByUser,
  updateReview,
  deleteReview,
  canReviewUser
} from '../controllers/reviewController.js';

const router = express.Router();

// Validation rules
const createReviewValidation = [
  body('reviewee_id')
    .isInt({ min: 1 })
    .withMessage('Valid reviewee ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Feedback must be between 10 and 1000 characters'),
  body('exchange_type')
    .isIn(['teaching', 'learning', 'mutual_exchange'])
    .withMessage('Exchange type must be teaching, learning, or mutual_exchange'),
  body('skills_exchanged')
    .optional()
    .isArray()
    .withMessage('Skills exchanged must be an array'),
  body('communication_rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  body('knowledge_rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Knowledge rating must be between 1 and 5'),
  body('punctuality_rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Punctuality rating must be between 1 and 5'),
  body('would_recommend')
    .optional()
    .isBoolean()
    .withMessage('Would recommend must be a boolean'),
  body('meeting_id')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      if (!Number.isInteger(Number(value)) || Number(value) < 1) {
        throw new Error('Meeting ID must be a positive integer');
      }
      return true;
    })
];

const updateReviewValidation = [
  param('reviewId')
    .isInt({ min: 1 })
    .withMessage('Valid review ID is required'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Feedback must be between 10 and 1000 characters'),
  body('skills_exchanged')
    .optional()
    .isArray()
    .withMessage('Skills exchanged must be an array'),
  body('communication_rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  body('knowledge_rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Knowledge rating must be between 1 and 5'),
  body('punctuality_rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Punctuality rating must be between 1 and 5'),
  body('would_recommend')
    .optional()
    .isBoolean()
    .withMessage('Would recommend must be a boolean')
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

const userIdValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required')
];

// Routes

// Create a new review
router.post('/',
  authenticateToken,
  createReviewValidation,
  validateRequest,
  createReview
);

// Get reviews for a specific user (public)
router.get('/user/:userId',
  userIdValidation,
  paginationValidation,
  validateRequest,
  getUserReviews
);

// Get rating statistics for a specific user (public)
router.get('/user/:userId/rating',
  userIdValidation,
  validateRequest,
  getUserRating
);

// Get reviews given by current user
router.get('/my-reviews',
  authenticateToken,
  paginationValidation,
  validateRequest,
  getReviewsByUser
);

// Check if current user can review another user
router.get('/can-review/:userId',
  authenticateToken,
  userIdValidation,
  validateRequest,
  canReviewUser
);

// Update a review
router.put('/:reviewId',
  authenticateToken,
  updateReviewValidation,
  validateRequest,
  updateReview
);

// Delete a review
router.delete('/:reviewId',
  authenticateToken,
  param('reviewId').isInt({ min: 1 }).withMessage('Valid review ID is required'),
  validateRequest,
  deleteReview
);

export default router;