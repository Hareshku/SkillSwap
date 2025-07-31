import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import {
  sendConnectionRequest,
  getConnectionStatus,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getUserConnections,
  getIncomingConnectionRequests
} from '../controllers/connectionController.js';

const router = express.Router();

// Validation rules
const sendConnectionValidation = [
  body('receiverId')
    .isInt({ min: 1 })
    .withMessage('Receiver ID must be a valid positive integer'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters')
];

const connectionIdValidation = [
  param('connectionId')
    .isInt({ min: 1 })
    .withMessage('Connection ID must be a valid positive integer')
];

const userIdValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a valid positive integer')
];

const statusValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'blocked'])
    .withMessage('Status must be one of: pending, accepted, rejected, blocked')
];

// Routes

// Send connection request
router.post('/request',
  authenticateToken,
  sendConnectionValidation,
  validateRequest,
  sendConnectionRequest
);

// Get connection status between current user and another user
router.get('/status/:userId',
  authenticateToken,
  userIdValidation,
  validateRequest,
  getConnectionStatus
);

// Accept connection request
router.put('/accept/:connectionId',
  authenticateToken,
  connectionIdValidation,
  validateRequest,
  acceptConnectionRequest
);

// Reject connection request
router.put('/reject/:connectionId',
  authenticateToken,
  connectionIdValidation,
  validateRequest,
  rejectConnectionRequest
);

// Get incoming connection requests
router.get('/incoming',
  authenticateToken,
  getIncomingConnectionRequests
);

// Get user's connections
router.get('/',
  authenticateToken,
  statusValidation,
  validateRequest,
  getUserConnections
);

export default router;
