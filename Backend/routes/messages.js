import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import {
  sendMessage,
  getConversation,
  getUserConversations,
  markMessagesAsRead,
  deleteMessage,
  getUnreadCount,
  searchMessages
} from '../controllers/messageController.js';

const router = express.Router();

// Validation rules
const sendMessageValidation = [
  body('receiverId')
    .isInt({ min: 1 })
    .withMessage('Invalid receiver ID'),
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Message type must be text, image, or file')
];

const conversationValidation = [
  param('otherUserId')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const markAsReadValidation = [
  body('senderId')
    .isInt({ min: 1 })
    .withMessage('Invalid sender ID')
];

const messageIdValidation = [
  param('messageId')
    .isInt({ min: 1 })
    .withMessage('Invalid message ID')
];

const searchValidation = [
  query('query')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('partnerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid partner ID'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Routes

// Send a message
router.post('/',
  authenticateToken,
  sendMessage
);

// Get all conversations for current user
router.get('/conversations',
  authenticateToken,
  getUserConversations
);

// Get unread message count
router.get('/unread-count',
  authenticateToken,
  getUnreadCount
);

// Search messages
router.get('/search',
  authenticateToken,
  searchValidation,
  validateRequest,
  searchMessages
);

// Get conversation with specific user
router.get('/conversation/:otherUserId',
  authenticateToken,
  conversationValidation,
  validateRequest,
  getConversation
);

// Mark messages as read
router.put('/mark-read',
  authenticateToken,
  markAsReadValidation,
  validateRequest,
  markMessagesAsRead
);

// Delete a message
router.delete('/:messageId',
  authenticateToken,
  messageIdValidation,
  validateRequest,
  deleteMessage
);

export default router;
