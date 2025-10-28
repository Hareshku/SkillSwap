import express from 'express';
import {
  createFeedback,
  getUserFeedback,
  getFeedbackGiven,
  getFeedbackStats,
  updateFeedback,
  deleteFeedback,
  markFeedbackHelpful
} from '../controllers/feedbackController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create feedback
router.post('/', authenticateToken, createFeedback);

// Get feedback for a specific user (received)
router.get('/user/:userId', getUserFeedback);

// Get feedback given by current user
router.get('/given', authenticateToken, getFeedbackGiven);

// Get feedback statistics for a user
router.get('/stats/:userId', getFeedbackStats);

// Update feedback
router.put('/:feedbackId', authenticateToken, updateFeedback);

// Delete feedback
router.delete('/:feedbackId', authenticateToken, deleteFeedback);

// Mark feedback as helpful
router.post('/:feedbackId/helpful', authenticateToken, markFeedbackHelpful);

export default router;