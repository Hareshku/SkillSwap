import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import {
  createPost,
  getAllPosts,
  getUserPosts,
  getPostsByUserId,
  getPost,
  updatePost,
  deletePost,
  getRecommendedPosts
} from '../controllers/postController.js';

const router = express.Router();

// Validation rules
const createPostValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('skills_to_learn')
    .isArray({ min: 1 })
    .withMessage('At least one skill to learn is required'),
  body('skills_to_learn.*')
    .isLength({ min: 1, max: 100 })
    .withMessage('Each skill must be between 1 and 100 characters'),
  body('skills_to_teach')
    .isArray({ min: 1 })
    .withMessage('At least one skill to teach is required'),
  body('skills_to_teach.*')
    .isLength({ min: 1, max: 100 })
    .withMessage('Each skill must be between 1 and 100 characters'),
  body('post_type')
    .optional()
    .isIn(['exchange', 'teach', 'learn'])
    .withMessage('Post type must be exchange, teach, or learn'),
  body('availability')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Availability must not exceed 500 characters'),
  body('preferred_meeting_type')
    .optional()
    .isIn(['online', 'in_person', 'both'])
    .withMessage('Preferred meeting type must be online, in_person, or both')
];

const updatePostValidation = [
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('skills_to_learn')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one skill to learn is required'),
  body('skills_to_learn.*')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each skill must be between 1 and 100 characters'),
  body('skills_to_teach')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one skill to teach is required'),
  body('skills_to_teach.*')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each skill must be between 1 and 100 characters'),
  body('post_type')
    .optional()
    .isIn(['exchange', 'teach', 'learn'])
    .withMessage('Post type must be exchange, teach, or learn'),
  body('availability')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Availability must not exceed 500 characters'),
  body('preferred_meeting_type')
    .optional()
    .isIn(['online', 'in_person', 'both'])
    .withMessage('Preferred meeting type must be online, in_person, or both'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'completed'])
    .withMessage('Status must be active, inactive, or completed')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000')
];

const postIdValidation = [
  param('postId')
    .isInt({ min: 1 })
    .withMessage('Post ID must be a valid positive integer')
];

// Routes

// Create a new post
router.post('/',
  authenticateToken,
  createPostValidation,
  validateRequest,
  createPost
);

// Get all posts (for discover page) with filters
router.get('/',
  authenticateToken,
  paginationValidation,
  query('skills')
    .optional()
    .isString()
    .withMessage('Skills filter must be a string'),
  query('post_type')
    .optional()
    .isIn(['exchange', 'teach', 'learn'])
    .withMessage('Post type filter must be exchange, teach, or learn'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search query must be a string'),
  validateRequest,
  getAllPosts
);

// Get recommended posts for current user
router.get('/recommendations',
  authenticateToken,
  getRecommendedPosts
);

// Get current user's posts
router.get('/my-posts',
  authenticateToken,
  paginationValidation,
  validateRequest,
  getUserPosts
);

// Get posts by specific user ID
router.get('/user/:userId',
  authenticateToken,
  param('userId')
    .isInt()
    .withMessage('User ID must be a valid integer'),
  paginationValidation,
  validateRequest,
  getPostsByUserId
);

// Get single post by ID
router.get('/:postId',
  authenticateToken,
  postIdValidation,
  validateRequest,
  getPost
);

// Update post
router.put('/:postId',
  authenticateToken,
  postIdValidation,
  updatePostValidation,
  validateRequest,
  updatePost
);

// Delete post
router.delete('/:postId',
  authenticateToken,
  postIdValidation,
  validateRequest,
  deletePost
);

export default router;
