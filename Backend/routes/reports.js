import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import {
  createReport,
  getUserReports,
  getReport,
  updateReport,
  cancelReport,
  getReportStats
} from '../controllers/reportController.js';

const router = express.Router();

// Validation rules
const createReportValidation = [
  body('reportedUserId')
    .optional()
    .isUUID()
    .withMessage('Invalid reported user ID'),
  body('reportedPostId')
    .optional()
    .isUUID()
    .withMessage('Invalid reported post ID'),
  body('reportType')
    .notEmpty()
    .withMessage('Report type is required')
    .isIn(['harassment', 'spam', 'inappropriate_content', 'fake_profile', 'scam', 'other'])
    .withMessage('Invalid report type'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('evidence')
    .optional()
    .isArray()
    .withMessage('Evidence must be an array'),
  body('evidence.*')
    .optional()
    .isURL()
    .withMessage('Each evidence item must be a valid URL')
];

const updateReportValidation = [
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('evidence')
    .optional()
    .isArray()
    .withMessage('Evidence must be an array'),
  body('evidence.*')
    .optional()
    .isURL()
    .withMessage('Each evidence item must be a valid URL')
];

const reportIdValidation = [
  param('reportId')
    .isUUID()
    .withMessage('Invalid report ID')
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

// Custom validation to ensure either reportedUserId or reportedPostId is provided
const validateReportTarget = (req, res, next) => {
  const { reportedUserId, reportedPostId } = req.body;
  
  if (!reportedUserId && !reportedPostId) {
    return res.status(400).json({
      success: false,
      message: 'Either reported user ID or reported post ID must be provided'
    });
  }
  
  if (reportedUserId && reportedPostId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot report both user and post in the same report'
    });
  }
  
  next();
};

// Routes

// Create a new report
router.post('/',
  authenticateToken,
  createReportValidation,
  validateRequest,
  validateReportTarget,
  createReport
);

// Get user's reports
router.get('/',
  authenticateToken,
  paginationValidation,
  validateRequest,
  getUserReports
);

// Get report statistics for current user
router.get('/stats',
  authenticateToken,
  getReportStats
);

// Get single report by ID
router.get('/:reportId',
  authenticateToken,
  reportIdValidation,
  validateRequest,
  getReport
);

// Update report (add additional information)
router.put('/:reportId',
  authenticateToken,
  reportIdValidation,
  updateReportValidation,
  validateRequest,
  updateReport
);

// Cancel report
router.delete('/:reportId',
  authenticateToken,
  reportIdValidation,
  validateRequest,
  cancelReport
);

export default router;
