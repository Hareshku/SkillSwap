import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import {
  submitContactForm,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats
} from '../controllers/contactController.js';

const router = express.Router();

// Validation rules
const submitContactValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters')
    .trim(),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .trim()
];

const contactIdValidation = [
  param('contactId')
    .isInt({ min: 1 })
    .withMessage('Invalid contact ID')
];

const updateContactValidation = [
  param('contactId')
    .isInt({ min: 1 })
    .withMessage('Invalid contact ID'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'resolved', 'closed'])
    .withMessage('Status must be pending, in_progress, resolved, or closed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('admin_response')
    .optional()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Admin response must be between 1 and 2000 characters')
    .trim()
];

const getAllContactsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'resolved', 'closed'])
    .withMessage('Status must be pending, in_progress, resolved, or closed'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent')
];

// Routes

// Submit contact form (Public route)
router.post('/',
  submitContactValidation,
  validateRequest,
  submitContactForm
);

// Get all contact submissions (Admin only)
router.get('/',
  authenticateToken,
  requireAdmin,
  getAllContactsValidation,
  validateRequest,
  getAllContacts
);

// Get contact statistics (Admin only)
router.get('/stats',
  authenticateToken,
  requireAdmin,
  getContactStats
);

// Get specific contact submission (Admin only)
router.get('/:contactId',
  authenticateToken,
  requireAdmin,
  contactIdValidation,
  validateRequest,
  getContactById
);

// Update contact status and add response (Admin only)
router.put('/:contactId',
  authenticateToken,
  requireAdmin,
  updateContactValidation,
  validateRequest,
  updateContactStatus
);

// Delete contact submission (Admin only)
router.delete('/:contactId',
  authenticateToken,
  requireAdmin,
  contactIdValidation,
  validateRequest,
  deleteContact
);

export default router;