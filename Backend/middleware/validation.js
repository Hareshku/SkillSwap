import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    console.log('Request body:', req.body);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Simple validation request handler (alias for handleValidationErrors)
export const validateRequest = handleValidationErrors;

// User registration validation (simplified signup)
export const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  handleValidationErrors
];

// Profile completion validation
export const validateProfileCompletion = [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('profession')
    .optional()
    .isIn(['student', 'professional', 'freelancer', 'entrepreneur', 'other'])
    .withMessage('Invalid profession'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),

  body('timezone')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Timezone must be between 1 and 50 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),

  body('linkedin_url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),

  body('github_url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid GitHub URL'),

  body('portfolio_url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid portfolio URL'),

  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Profile update validation
export const validateProfileUpdate = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),

  body('linkedin_url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),

  body('github_url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid GitHub URL'),

  body('portfolio_url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid portfolio URL'),

  body('profession')
    .optional()
    .isIn(['student', 'worker', 'freelancer', 'other'])
    .withMessage('Invalid profession'),

  body('degree_level')
    .optional()
    .isIn(['high_school', 'bachelor', 'master', 'phd', 'other'])
    .withMessage('Invalid degree level'),

  body('institute')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Institute name must not exceed 200 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),

  body('timezone')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Timezone must be between 1 and 50 characters'),

  handleValidationErrors
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),

  handleValidationErrors
];

// Post creation validation
export const validatePostCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('skills_to_teach')
    .isArray({ min: 1 })
    .withMessage('At least one skill to teach is required'),

  body('skills_to_learn')
    .isArray({ min: 1 })
    .withMessage('At least one skill to learn is required'),

  body('experience_level')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level'),

  body('preferred_meeting_type')
    .optional()
    .isIn(['online', 'offline', 'both'])
    .withMessage('Invalid meeting type'),

  handleValidationErrors
];

// ID parameter validation
export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID parameter'),

  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors
];

export default {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validatePostCreation,
  validateId,
  validatePagination
};
