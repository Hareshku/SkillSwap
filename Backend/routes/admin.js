import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllReports,
  handleReport,
  getAllPosts,
  moderatePost,
  createAdmin,
  approveUser,
  rejectUser,
  approvePost,
  bulkApprovePosts,
  bulkBlockUsers,
  handleReportDetailed,
  changeUserRole,
  getPendingApprovals,
  getAdminActivity
} from '../controllers/adminController.js';

const router = express.Router();

// Validation rules
const toggleUserStatusValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),
  body('action')
    .isIn(['block', 'unblock'])
    .withMessage('Action must be block or unblock'),
  body('reason')
    .if(body('action').equals('block'))
    .notEmpty()
    .withMessage('Reason is required when blocking a user')
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
];

const handleReportValidation = [
  param('reportId')
    .isInt({ min: 1 })
    .withMessage('Invalid report ID'),
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be approve or reject'),
  body('adminNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Admin notes must not exceed 1000 characters')
];

const moderatePostValidation = [
  param('postId')
    .isInt({ min: 1 })
    .withMessage('Invalid post ID'),
  body('action')
    .isIn(['approve', 'remove'])
    .withMessage('Action must be approve or remove'),
  body('reason')
    .if(body('action').equals('remove'))
    .notEmpty()
    .withMessage('Reason is required when removing a post')
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
];

const createAdminValidation = [
  body('full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
];

const approveUserValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

const rejectUserValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required for rejecting user')
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
];

const approvePostValidation = [
  param('postId')
    .isInt({ min: 1 })
    .withMessage('Invalid post ID'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

const bulkApprovePostsValidation = [
  body('postIds')
    .isArray({ min: 1 })
    .withMessage('Post IDs array is required'),
  body('postIds.*')
    .isInt({ min: 1 })
    .withMessage('Each post ID must be a positive integer'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

const bulkBlockUsersValidation = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('User IDs array is required'),
  body('userIds.*')
    .isInt({ min: 1 })
    .withMessage('Each user ID must be a positive integer'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required for blocking users')
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
];

const changeUserRoleValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),
  body('newRole')
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const userFilterValidation = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
  query('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin')
];

const reportFilterValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'under_review', 'resolved', 'rejected'])
    .withMessage('Invalid status filter'),
  query('reportType')
    .optional()
    .isIn(['harassment', 'spam', 'inappropriate_content', 'fake_profile', 'scam', 'other'])
    .withMessage('Invalid report type filter')
];

const postFilterValidation = [
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'removed'])
    .withMessage('Invalid status filter'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
];

// Apply admin authentication to all routes
router.use(authenticateToken, requireAdmin);

// Routes

// Get dashboard statistics
router.get('/dashboard/stats',
  getDashboardStats
);

// User management routes
router.get('/users',
  paginationValidation,
  userFilterValidation,
  validateRequest,
  getAllUsers
);

router.put('/users/:userId/status',
  toggleUserStatusValidation,
  validateRequest,
  toggleUserStatus
);

// Report management routes
router.get('/reports',
  paginationValidation,
  reportFilterValidation,
  validateRequest,
  getAllReports
);

router.put('/reports/:reportId/handle',
  handleReportValidation,
  validateRequest,
  handleReport
);

// Post management routes
router.get('/posts',
  paginationValidation,
  postFilterValidation,
  validateRequest,
  getAllPosts
);

router.put('/posts/:postId/moderate',
  moderatePostValidation,
  validateRequest,
  moderatePost
);

// Admin management routes
router.post('/create-admin',
  createAdminValidation,
  validateRequest,
  createAdmin
);

// ==================== ENHANCED ADMIN ROUTES ====================

// User approval routes
router.put('/users/:userId/approve',
  approveUserValidation,
  validateRequest,
  approveUser
);

router.put('/users/:userId/reject',
  rejectUserValidation,
  validateRequest,
  rejectUser
);

// Enhanced post management routes
router.put('/posts/:postId/approve',
  approvePostValidation,
  validateRequest,
  approvePost
);

router.put('/posts/bulk-approve',
  bulkApprovePostsValidation,
  validateRequest,
  bulkApprovePosts
);

// Bulk user operations
router.put('/users/bulk-block',
  bulkBlockUsersValidation,
  validateRequest,
  bulkBlockUsers
);

// User role management
router.put('/users/:userId/role',
  changeUserRoleValidation,
  validateRequest,
  changeUserRole
);

// Enhanced report handling
router.put('/reports/:reportId/handle-detailed',
  handleReportValidation,
  validateRequest,
  handleReportDetailed
);

// Pending approvals and activity
router.get('/pending-approvals',
  paginationValidation,
  validateRequest,
  getPendingApprovals
);

router.get('/activity',
  getAdminActivity
);

export default router;
