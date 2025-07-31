import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import {
  scheduleMeeting,
  getUserMeetings,
  getMeeting,
  updateMeeting,
  cancelMeeting,
  acceptMeeting,
  declineMeeting,
  completeMeeting
} from '../controllers/meetingController.js';

const router = express.Router();

// Validation rules
const scheduleMeetingValidation = [
  body('participantId')
    .isInt({ min: 1 })
    .withMessage('Invalid participant ID'),
  body('title')
    .notEmpty()
    .withMessage('Meeting title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('scheduledAt')
    .isISO8601()
    .withMessage('Invalid scheduled date/time')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      if (scheduledDate <= now) {
        throw new Error('Scheduled time must be in the future');
      }
      return true;
    }),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('meetingType')
    .optional()
    .isIn(['online', 'offline'])
    .withMessage('Meeting type must be online or offline'),
  body('meetingLink')
    .optional()
    .isURL()
    .withMessage('Meeting link must be a valid URL'),
  body('agenda')
    .optional()
    .isArray()
    .withMessage('Agenda must be an array')
];

const updateMeetingValidation = [
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid scheduled date/time')
    .custom((value) => {
      if (value) {
        const scheduledDate = new Date(value);
        const now = new Date();
        if (scheduledDate <= now) {
          throw new Error('Scheduled time must be in the future');
        }
      }
      return true;
    }),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('meetingType')
    .optional()
    .isIn(['online', 'offline'])
    .withMessage('Meeting type must be online or offline'),
  body('meetingLink')
    .optional()
    .isURL()
    .withMessage('Meeting link must be a valid URL'),
  body('agenda')
    .optional()
    .isArray()
    .withMessage('Agenda must be an array'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('Invalid meeting status')
];

const meetingIdValidation = [
  param('meetingId')
    .isInt({ min: 1 })
    .withMessage('Invalid meeting ID')
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

const cancelMeetingValidation = [
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason must not exceed 500 characters')
];

const declineMeetingValidation = [
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Decline reason must not exceed 500 characters')
];

const completeMeetingValidation = [
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Completion notes must not exceed 1000 characters')
];

// Routes

// Schedule a new meeting
router.post('/',
  authenticateToken,
  scheduleMeetingValidation,
  validateRequest,
  scheduleMeeting
);

// Get user's meetings with filters
router.get('/',
  authenticateToken,
  paginationValidation,
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('Invalid status filter'),
  query('type')
    .optional()
    .isIn(['online', 'offline'])
    .withMessage('Invalid type filter'),
  validateRequest,
  getUserMeetings
);

// Get single meeting by ID
router.get('/:meetingId',
  authenticateToken,
  meetingIdValidation,
  validateRequest,
  getMeeting
);

// Update meeting (organizer only)
router.put('/:meetingId',
  authenticateToken,
  meetingIdValidation,
  updateMeetingValidation,
  validateRequest,
  updateMeeting
);

// Cancel meeting
router.put('/:meetingId/cancel',
  authenticateToken,
  meetingIdValidation,
  cancelMeetingValidation,
  validateRequest,
  cancelMeeting
);

// Accept meeting invitation (participant only)
router.put('/:meetingId/accept',
  authenticateToken,
  meetingIdValidation,
  validateRequest,
  acceptMeeting
);

// Decline meeting invitation (participant only)
router.put('/:meetingId/decline',
  authenticateToken,
  meetingIdValidation,
  declineMeetingValidation,
  validateRequest,
  declineMeeting
);

// Mark meeting as completed
router.put('/:meetingId/complete',
  authenticateToken,
  meetingIdValidation,
  completeMeetingValidation,
  validateRequest,
  completeMeeting
);

export default router;
